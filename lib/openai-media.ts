import "server-only";
import OpenAI from "openai";
import { z } from "zod";

import { getOpenAIClient, OpenAIConfigurationError } from "@/lib/openai";
import {
  AUDIO_FORMATS,
  AUDIO_INPUT_MAX_LENGTH,
  AUDIO_INSTRUCTIONS_MAX_LENGTH,
  AUDIO_SPEEDS,
  AUDIO_VOICES,
  IMAGE_PROMPT_MAX_LENGTH,
  IMAGE_QUALITIES,
  IMAGE_SIZES,
} from "@/lib/media-options";

const values = <T extends string>(options: readonly { value: T }[]): [T, ...T[]] =>
  options.map(({ value }) => value) as [T, ...T[]];

const imageSchema = z.object({
  prompt: z.string().trim().min(1).max(IMAGE_PROMPT_MAX_LENGTH),
  size: z.enum(values(IMAGE_SIZES)).default("1024x1024"),
  quality: z.enum(values(IMAGE_QUALITIES)).default("medium"),
}).strict();

const audioSchema = z.object({
  input: z.string().trim().min(1).max(AUDIO_INPUT_MAX_LENGTH),
  voice: z.enum(values(AUDIO_VOICES)).default("marin"),
  format: z.enum(values(AUDIO_FORMATS)).default("mp3"),
  speed: z.number().refine((value) => AUDIO_SPEEDS.some((option) => option.value === value)).default(1),
  instructions: z.string().trim().max(AUDIO_INSTRUCTIONS_MAX_LENGTH).optional(),
}).strict();

type MediaKind = "image" | "audio";
const MAX_BODY_BYTES = 32 * 1024;
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_AUDIO_BYTES = 32 * 1024 * 1024;
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

class MediaError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly retryAfter?: number,
  ) {
    super(message);
    this.name = "MediaError";
  }
}

const cancelled = () => new MediaError("Generation was cancelled.", 499, "cancelled");

// These inexpensive guards are local to this running process, not durable quotas.
const budgets: Record<MediaKind, { active: number; starts: number[]; concurrent: number; perMinute: number }> = {
  image: { active: 0, starts: [], concurrent: 2, perMinute: 8 },
  audio: { active: 0, starts: [], concurrent: 4, perMinute: 20 },
};

function acquireSlot(kind: MediaKind): () => void {
  const budget = budgets[kind];
  const now = Date.now();
  budget.starts = budget.starts.filter((start) => start > now - 60_000);
  if (budget.active >= budget.concurrent) {
    throw new MediaError("Generation is busy. Please try again in a few seconds.", 429, "generation_busy", 5);
  }
  if (budget.starts.length >= budget.perMinute) {
    const retryAfter = Math.max(1, Math.ceil((budget.starts[0] + 60_000 - now) / 1000));
    throw new MediaError("Too many generation requests. Please wait a minute and try again.", 429, "rate_limited", retryAfter);
  }
  budget.starts.push(now);
  budget.active++;
  return () => { budget.active--; };
}

async function readJSON(request: Request): Promise<unknown> {
  if (request.signal.aborted) throw cancelled();
  const origin = request.headers.get("origin");
  if (origin !== null) {
    let sameOrigin = false;
    try {
      const requestURL = new URL(request.url);
      // Next can normalize loopback URLs or use its internal hostname behind a proxy.
      // The incoming Host identifies the destination used by the browser.
      const host = request.headers.get("host") || requestURL.host;
      const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim();
      const protocol = forwardedProtocol === "https" || forwardedProtocol === "http"
        ? `${forwardedProtocol}:` : requestURL.protocol;
      const destination = new URL(`${protocol}//${host}`);
      sameOrigin = !destination.username && !destination.password &&
        destination.pathname === "/" && !destination.search && !destination.hash &&
        origin === destination.origin;
    } catch {
      sameOrigin = false;
    }
    if (!sameOrigin) {
      throw new MediaError("Generation requests must come from this website.", 403, "origin_not_allowed");
    }
  }
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new MediaError("Send the request as application/json.", 415, "unsupported_content_type");
  }
  const length = request.headers.get("content-length");
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > MAX_BODY_BYTES)) {
    throw new MediaError("The request is too large. Shorten the input and try again.", 413, "body_too_large");
  }
  if (!request.body) throw new MediaError("Provide a JSON request body.", 400, "invalid_json");

  const reader = request.body.getReader();
  const abort = () => { void reader.cancel().catch(() => {}); };
  request.signal.addEventListener("abort", abort, { once: true });
  let bytes = 0;
  let text = "";
  const decoder = new TextDecoder("utf-8", { fatal: true });
  try {
    while (true) {
      if (request.signal.aborted) throw cancelled();
      const { done, value } = await reader.read();
      if (request.signal.aborted) throw cancelled();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        abort();
        throw new MediaError("The request is too large. Shorten the input and try again.", 413, "body_too_large");
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return JSON.parse(text);
  } catch (error) {
    if (request.signal.aborted) throw cancelled();
    if (error instanceof MediaError) throw error;
    throw new MediaError("The request body must contain valid JSON.", 400, "invalid_json");
  } finally {
    request.signal.removeEventListener("abort", abort);
    reader.releaseLock();
  }
}

async function withinDeadline<T>(
  signal: AbortSignal,
  timeoutMs: number,
  generate: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  if (signal.aborted) throw cancelled();
  const controller = new AbortController();
  let interruption: MediaError | undefined;
  let onAbort = () => {};
  let timer: ReturnType<typeof setTimeout> | undefined;
  const abortPromise = new Promise<never>((_, reject) => {
    onAbort = () => {
      interruption = cancelled();
      controller.abort();
      reject(interruption);
    };
    signal.addEventListener("abort", onAbort, { once: true });
    timer = setTimeout(() => {
      interruption = new MediaError("Generation timed out. Please try again.", 504, "generation_timeout");
      controller.abort();
      reject(interruption);
    }, timeoutMs);
  });
  try {
    return await Promise.race([generate(controller.signal), abortPromise]);
  } catch (error) {
    throw interruption ?? error;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", onAbort);
  }
}

async function generateImage(input: z.infer<typeof imageSchema>, signal: AbortSignal): Promise<Response> {
  return withinDeadline(signal, 120_000, async (generationSignal) => {
    const result = await getOpenAIClient().images.generate({
      model: process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-2.5-flare",
      prompt: input.prompt,
      size: input.size,
      quality: input.quality,
      output_format: "png",
      n: 1,
    }, { signal: generationSignal, timeout: 120_000, maxRetries: 0 });
    const encoded = result.data?.[0]?.b64_json;
    if (!encoded || encoded.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
      throw new MediaError("OpenAI returned no usable image. Please try again.", 502, "invalid_provider_response");
    }
    const bytes = Buffer.from(encoded, "base64");
    if (bytes.length > MAX_IMAGE_BYTES || !bytes.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
      throw new MediaError("OpenAI returned no usable PNG image. Please try again.", 502, "invalid_provider_response");
    }
    return binaryResponse(new Uint8Array(bytes), "image/png", "dune-image.png");
  });
}

async function generateAudio(input: z.infer<typeof audioSchema>, signal: AbortSignal): Promise<Response> {
  return withinDeadline(signal, 60_000, async (generationSignal) => {
    const result = await getOpenAIClient().audio.speech.create({
      model: process.env.OPENAI_AUDIO_MODEL?.trim() || "gpt-4o-mini-tts",
      input: input.input,
      voice: input.voice,
      response_format: input.format,
      speed: input.speed,
      ...(input.instructions && { instructions: input.instructions }),
    }, { signal: generationSignal, timeout: 60_000, maxRetries: 0 });
    const bytes = await readAudio(result, input.format, generationSignal);
    return binaryResponse(bytes, input.format === "wav" ? "audio/wav" : "audio/mpeg", `dune-audio.${input.format}`);
  });
}

async function readAudio(response: Response, format: "mp3" | "wav", signal: AbortSignal): Promise<Uint8Array> {
  const invalidAudio = () => new MediaError("OpenAI returned no usable audio. Please try again.", 502, "invalid_provider_response");
  if (!response.body) throw invalidAudio();
  const reader = response.body.getReader();
  const abort = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener("abort", abort, { once: true });
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    if (Number(response.headers.get("content-length")) > MAX_AUDIO_BYTES) {
      abort();
      throw invalidAudio();
    }
    while (true) {
      if (signal.aborted) {
        abort();
        throw cancelled();
      }
      const { done, value } = await reader.read();
      if (signal.aborted) throw cancelled();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_AUDIO_BYTES) {
        abort();
        throw invalidAudio();
      }
      chunks.push(value);
    }
  } finally {
    signal.removeEventListener("abort", abort);
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const startsWith = (text: string, start = 0) =>
    Array.from(text).every((character, index) => bytes[start + index] === character.charCodeAt(0));
  const valid = format === "wav"
    ? length >= 12 && startsWith("RIFF") && startsWith("WAVE", 8)
    : (length >= 10 && startsWith("ID3")) || (length >= 4 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
  if (!valid) throw invalidAudio();
  return bytes;
}

function binaryResponse(bytes: ArrayBuffer | Uint8Array, contentType: string, filename: string): Response {
  return new Response(bytes, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function publicError(error: unknown): MediaError {
  if (error instanceof MediaError) return error;
  if (error instanceof OpenAIConfigurationError) {
    return new MediaError(error.message, 503, "not_configured");
  }
  if (error instanceof OpenAI.APIUserAbortError) return cancelled();
  if (error instanceof OpenAI.APIConnectionTimeoutError) {
    return new MediaError("Generation timed out. Please try again.", 504, "generation_timeout");
  }
  if (error instanceof OpenAI.APIError) {
    const code = error.code || error.type || "";
    if (["content_policy_violation", "safety_violation", "moderation_blocked"].includes(code)) {
      return new MediaError("OpenAI could not generate this content. Revise the input and try again.", 422, "content_policy");
    }
    if (["insufficient_quota", "billing_hard_limit_reached", "billing_not_active"].includes(code)) {
      return new MediaError("OpenAI credits or the billing limit have been reached. Check the project's billing settings.", 503, "quota_exceeded");
    }
    if (error.status === 401) {
      return new MediaError("OpenAI credentials were rejected. Update OPENAI_API_KEY on the server.", 503, "provider_auth");
    }
    if (error.status === 403 || error.status === 404 || code === "model_not_found") {
      return new MediaError("This OpenAI project cannot access the selected model. Check model access and organization verification.", 503, "model_access");
    }
    if (error.status === 429) {
      return new MediaError("OpenAI is receiving too many requests. Please try again shortly.", 429, "provider_rate_limit", 30);
    }
    if (error.status === 400 || error.status === 422) {
      return new MediaError("OpenAI could not process these settings. Adjust the input and try again.", 422, "provider_rejected");
    }
    if (!error.status || error.status >= 500) {
      return new MediaError("OpenAI is temporarily unavailable. Please try again later.", 503, "provider_unavailable");
    }
  }
  // Provider messages can contain credentials or request details. Never forward them.
  return new MediaError("Generation failed. Please try again later.", 502, "generation_failed");
}

export async function handleMediaRequest(request: Request, kind: MediaKind): Promise<Response> {
  try {
    const body = await readJSON(request);
    const parsed = kind === "image" ? imageSchema.safeParse(body) : audioSchema.safeParse(body);
    if (!parsed.success) {
      throw new MediaError(
        kind === "image"
          ? `Provide an image prompt of 1–${IMAGE_PROMPT_MAX_LENGTH} characters and choose a supported size and quality.`
          : `Provide speech text of 1–${AUDIO_INPUT_MAX_LENGTH} characters, supported audio settings, and instructions up to ${AUDIO_INSTRUCTIONS_MAX_LENGTH} characters.`,
        400,
        "invalid_input",
      );
    }
    if (request.signal.aborted) throw cancelled();
    const release = acquireSlot(kind);
    try {
      return kind === "image"
        ? await generateImage(parsed.data as z.infer<typeof imageSchema>, request.signal)
        : await generateAudio(parsed.data as z.infer<typeof audioSchema>, request.signal);
    } finally {
      release();
    }
  } catch (error) {
    const failure = request.signal.aborted ? cancelled() : publicError(error);
    return Response.json({ error: failure.message, code: failure.code }, {
      status: failure.status,
      headers: {
        "Cache-Control": "no-store",
        ...(failure.retryAfter && { "Retry-After": String(failure.retryAfter) }),
      },
    });
  }
}
