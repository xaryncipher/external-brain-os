import { z } from "zod";

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

export function safeJsonParse(text: string) {
  const s = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/m, "")
    .trim();
  // Gemini sometimes returns extra prose before JSON — try to extract first { ... }
  if (s.startsWith("{") || s.startsWith("[")) return JSON.parse(s);
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return JSON.parse(s.slice(start, end + 1));
  }
  return JSON.parse(s);
}

type CallOpts = { temperature?: number; maxTokens?: number; retries?: number };

export async function callGemini(
  prompt: string,
  schema: z.ZodType,
  opts: CallOpts = {}
): Promise<z.infer<typeof schema>> {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.includes("YOUR") || key.includes("AIzaYour")) {
    throw new Error("GEMINI_KEY_MISSING");
  }

  const temperature = opts.temperature ?? 0.3;
  const maxTokens = opts.maxTokens ?? 1500;
  const retries = opts.retries ?? 1;

  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const url = `${GEMINI_BASE}/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        // 429 rate-limit → retry
        if (res.status === 429 && attempt < retries) {
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
          lastErr = new Error(`429 ${body}`);
          continue;
        }
        if (res.status >= 500 && attempt < retries) {
          await new Promise((r) => setTimeout(r, 800));
          lastErr = new Error(`${res.status} ${body}`);
          continue;
        }
        throw new Error(`GEMINI_${res.status}: ${body.slice(0, 400)}`);
      }

      const json = await res.json();
      const text: string | undefined =
        json?.candidates?.[0]?.content?.parts?.[0]?.text ||
        json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ||
        "";

      if (!text) throw new Error("EMPTY_RESPONSE");

      const parsed = safeJsonParse(text);
      const validated = schema.parse(parsed);
      return validated;
    } catch (e) {
      lastErr = e;
      // Zod validation failure → don't retry blindly, but try once with a repair hint if first attempt
      if (e instanceof z.ZodError && attempt < retries) {
        // will retry the whole call once
        continue;
      }
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 600));
        continue;
      }
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

// Cache for breakdown (title -> response) 1 hour in-memory (serverless may not persist but helps within request batch)
const breakdownCache = new Map<string, { data: any; ts: number }>();
export function getBreakdownCache(title: string) {
  const hit = breakdownCache.get(title.toLowerCase().trim());
  if (hit && Date.now() - hit.ts < 60 * 60 * 1000) return hit.data;
  return null;
}
export function setBreakdownCache(title: string, data: any) {
  breakdownCache.set(title.toLowerCase().trim(), { data, ts: Date.now() });
  // prune if grows too large
  if (breakdownCache.size > 50) {
    const first = breakdownCache.keys().next().value as string;
    breakdownCache.delete(first);
  }
}
