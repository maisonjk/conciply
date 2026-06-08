import OpenAI from "openai";

let _client: OpenAI | null = null;
export function getOpenAI(): OpenAI {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
}

// MODEL is kept for backwards-compat; the API route uses tier-based config
export const MODEL = process.env.OPENAI_MODEL || "gpt-4o";
