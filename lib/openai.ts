import "server-only";
import OpenAI from "openai";

let client: OpenAI | undefined;

export class OpenAIConfigurationError extends Error {
  constructor() {
    super("OpenAI generation is not configured. Add OPENAI_API_KEY on the server.");
    this.name = "OpenAIConfigurationError";
  }
}

/** Create the server client only when a request needs it, so builds need no key. */
export function getOpenAIClient(): OpenAI {
  if (client) return client;
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new OpenAIConfigurationError();

  client = new OpenAI({ apiKey, maxRetries: 0, timeout: 120_000 });
  return client;
}
