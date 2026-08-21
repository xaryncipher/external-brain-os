import { z } from "zod";
import { callGroq } from "./groq";
import { callGemini } from "./gemini";

/**
 * Unified AI caller: Groq primary (llama-3.1-8b-instant, fast) → Gemini fallback (gemini-3.6-flash)
 * Keeps both keys alive as you requested. If GROQ_API_KEY missing or 429, falls back to Gemini if its key exists.
 */
type CallOpts = { temperature?: number; maxTokens?: number; retries?: number };

export async function callAI(
  prompt: string,
  schema: z.ZodType,
  opts: CallOpts = {}
): Promise<z.infer<typeof schema>> {
  const hasGroq = !!(process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes("YOUR") && process.env.GROQ_API_KEY.trim().length > 20);
  const hasGemini = !!(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("YOUR") && !process.env.GEMINI_API_KEY.includes("AIzaYour"));

  let lastErr: unknown;

  // Try Groq first if available
  if (hasGroq) {
    try {
      return await callGroq(prompt, schema, { temperature: opts.temperature, maxTokens: opts.maxTokens });
    } catch (e: any) {
      lastErr = e;
      const msg = String(e?.message ?? e);
      // If Groq rate-limited and Gemini exists, fall back
      const isRate = msg.includes("429") || msg.includes("GROQ_429");
      if (!isRate && !msg.includes("GROQ_KEY_MISSING")) {
        // For non-rate errors, still try fallback if Gemini exists (except JSON parse which we retry via caller)
        if (hasGemini) {
          try {
            return await callGemini(prompt, schema, { temperature: opts.temperature, maxTokens: opts.maxTokens, retries: opts.retries ?? 1 });
          } catch (ge: any) {
            lastErr = ge;
          }
        }
      } else if (isRate && hasGemini) {
        try {
          return await callGemini(prompt, schema, { temperature: opts.temperature, maxTokens: opts.maxTokens, retries: opts.retries ?? 1 });
        } catch (ge: any) {
          lastErr = ge;
        }
      }
      // if both fail, throw the last error below
    }
  }

  // No Groq or Groq failed and no fallback succeeded → try Gemini directly if available
  if (hasGemini) {
    try {
      return await callGemini(prompt, schema, { temperature: opts.temperature, maxTokens: opts.maxTokens, retries: opts.retries ?? 1 });
    } catch (e: any) {
      lastErr = e;
      throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
    }
  }

  // No keys at all
  if (!hasGroq && !hasGemini) throw new Error("AI_KEY_MISSING");

  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}
