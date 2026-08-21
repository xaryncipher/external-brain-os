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

  // Try Groq first if available — with 1.5s backoff on 429 before Gemini fallback (avoids burst 4×40 hitting 30 RPM)
  if (hasGroq) {
    try {
      return await callGroq(prompt, schema, { temperature: opts.temperature, maxTokens: opts.maxTokens });
    } catch (e: any) {
      lastErr = e;
      const msg = String(e?.message ?? e);
      const isRate = msg.includes("429") || msg.includes("GROQ_429");
      if (isRate) {
        // Wait 1.5s and retry Groq once (often burst window clears)
        await new Promise((r) => setTimeout(r, 1500));
        try {
          return await callGroq(prompt, schema, { temperature: opts.temperature, maxTokens: opts.maxTokens });
        } catch (re: any) {
          lastErr = re;
        }
      }
      // After Groq retry (or if non-rate error), fall back to Gemini if available
      const stillRate = String((lastErr as any)?.message ?? lastErr).includes("429");
      const isNotKeyMissing = !String((lastErr as any)?.message ?? lastErr).includes("GROQ_KEY_MISSING");
      if (isNotKeyMissing && hasGemini) {
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
