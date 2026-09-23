import "server-only";
import { z } from "zod";

const parseList = (value = ""): string[] =>
  Array.from(new Set(value.split(",").map((item) => item.trim()).filter(Boolean)));

// Server-only credentials. Never use NEXT_PUBLIC_ variables for API secrets.
export const GEMINI_API_KEYS: string[] = parseList(
  [process.env.GEMINI_API_KEYS, process.env.GEMINI_API_KEY].filter(Boolean).join(",")
);

const configuredModels = parseList(process.env.GEMINI_MODELS);

export const GEMINI_MODELS: string[] = configuredModels.length
  ? configuredModels
  : [
      "gemini-3.6-flash",
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-flash-latest",
    ];

const messagesSchema = z.array(z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().refine((value) => value.trim().length > 0),
})).min(1);

export type GeminiMessage = z.infer<typeof messagesSchema>[number];

export interface GeminiOptions {
  messages: GeminiMessage[];
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  /** Total time budget across all key/model attempts. */
  timeoutMs?: number;
  signal?: AbortSignal;
}

export class GeminiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "GeminiError";
  }
}

interface GeminiPayload {
  error?: {
    message?: string;
    details?: { reason?: string }[];
  };
  promptFeedback?: { blockReason?: string };
  candidates?: {
    finishReason?: string;
    content?: { parts?: { text?: string; thought?: boolean }[] };
  }[];
}

let nextKeyIndex = 0;

/** Generate an assistant message, preserving model priority and rotating keys. */
export async function generateGeminiResponse({
  messages,
  systemInstruction,
  temperature,
  maxOutputTokens,
  timeoutMs = 45_000,
  signal,
}: GeminiOptions): Promise<{ role: "assistant"; content: string }> {
  const parsed = messagesSchema.safeParse(messages);
  if (!parsed.success || parsed.data[parsed.data.length - 1].role !== "user") {
    throw new GeminiError("Provide non-empty chat messages ending with a user message.", 400);
  }
  if (!GEMINI_API_KEYS.length) {
    throw new GeminiError("Gemini API keys are not configured.", 503);
  }
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new GeminiError("The generation timeout must be a positive number.", 400);
  }

  const start = nextKeyIndex++ % GEMINI_API_KEYS.length;
  const keys = [...GEMINI_API_KEYS.slice(start), ...GEMINI_API_KEYS.slice(0, start)];
  const invalidKeys = new Set<string>();
  const deadline = Date.now() + timeoutMs;
  const body = JSON.stringify({
    contents: parsed.data.map(({ role, content }) => ({
      role: role === "assistant" ? "model" : "user",
      parts: [{ text: content }],
    })),
    ...(systemInstruction && { systemInstruction: { parts: [{ text: systemInstruction }] } }),
    generationConfig: { temperature, maxOutputTokens },
  });
  let lastError = new GeminiError("Gemini is currently unavailable. Please try again later.", 503);

  for (const model of GEMINI_MODELS) {
    for (const apiKey of keys) {
      if (signal?.aborted) {
        throw new GeminiError("Generation was cancelled.", 499);
      }
      if (invalidKeys.has(apiKey)) continue;
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        throw new GeminiError("Generation timed out. Please try again.", 504);
      }

      const controller = new AbortController();
      const abort = () => controller.abort();
      signal?.addEventListener("abort", abort, { once: true });
      const timer = setTimeout(abort, Math.min(15_000, remaining));

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
            body,
            cache: "no-store",
            signal: controller.signal,
          }
        );
        const data: GeminiPayload = await response.json().catch((error: unknown) => {
          if (controller.signal.aborted) throw error;
          return {};
        });

        if (!response.ok) {
          const invalidKey = response.status === 401 ||
            data.error?.details?.some(({ reason }) => /API_KEY_(INVALID|EXPIRED)/.test(reason ?? "")) ||
            /API key not valid|API key expired/i.test(data.error?.message ?? "");
          if (invalidKey) invalidKeys.add(apiKey);

          // Try each key/model once for credential, quota, availability, or server failures.
          if (invalidKey || [403, 404, 429].includes(response.status) || response.status >= 500) {
            lastError = response.status === 429
              ? new GeminiError("AI generation is busy. Please try again shortly.", 429)
              : new GeminiError("Gemini is currently unavailable. Please try again later.", 503);
            continue;
          }
          // Never expose provider error bodies: they can contain credential details.
          throw new GeminiError("Gemini could not process this request.", 400);
        }

        const candidate = data.candidates?.[0];
        if (data.promptFeedback?.blockReason ||
          (candidate?.finishReason && !["STOP", "MAX_TOKENS"].includes(candidate.finishReason))) {
          throw new GeminiError("Gemini could not generate a response to this prompt.", 422);
        }
        const content = candidate?.content?.parts
          ?.filter((part) => !part.thought && typeof part.text === "string")
          .map((part) => part.text).join("");
        if (!content?.trim()) {
          throw new GeminiError("Gemini returned an empty response. Please try again.", 502);
        }
        return { role: "assistant", content };
      } catch (error) {
        if (signal?.aborted) {
          throw new GeminiError("Generation was cancelled.", 499);
        }
        if (error instanceof GeminiError) throw error;
        lastError = controller.signal.aborted
          ? new GeminiError("Generation timed out. Please try again.", 504)
          : new GeminiError("Could not reach Gemini. Please try again later.", 503);
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener("abort", abort);
      }
    }
  }
  throw lastError;
}

/** Convenience helper for a single prompt in server components or API routes. */
export async function generateGeminiText(
  prompt: string,
  options: Omit<GeminiOptions, "messages"> = {}
): Promise<string> {
  const response = await generateGeminiResponse({
    ...options,
    messages: [{ role: "user", content: prompt }],
  });
  return response.content;
}
