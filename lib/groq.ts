import { z } from "zod";

const GROQ_BASE = "https://api.groq.com/openai/v1";
// 2026-08-21: llama-3.1-8b-instant 404 for new free accounts. Tested live with user's gsk_... key:
// openai/gpt-oss-20b 200 in 0.09s with json_mode (also allam-2-7b works). Use gpt-oss-20b as primary.
const GROQ_MODEL = "openai/gpt-oss-20b";

export function groqSafeJsonParse(text: string) {
  const s = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/m, "").trim();
  if (s.startsWith("{") || s.startsWith("[")) return JSON.parse(s);
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) return JSON.parse(s.slice(start, end + 1));
  return JSON.parse(s);
}

type CallOpts = { temperature?: number; maxTokens?: number };

export async function callGroq(
  prompt: string,
  schema: z.ZodType,
  opts: CallOpts = {}
): Promise<z.infer<typeof schema>> {
  const key = process.env.GROQ_API_KEY;
  if (!key || key.includes("YOUR") || key.includes("gsk_Your") || key.trim().length < 20) {
    throw new Error("GROQ_KEY_MISSING");
  }

  const temperature = opts.temperature ?? 0.3;
  const maxTokens = opts.maxTokens ?? 1500;

  // Groq OpenAI-compatible: system + user, JSON mode
  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are a helpful assistant that returns ONLY valid JSON. No prose, no markdown fences." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) throw new Error(`GROQ_429 ${body.slice(0, 400)}`);
    throw new Error(`GROQ_${res.status} ${body.slice(0, 400)}`);
  }

  const json = await res.json();
  const text: string | undefined = json?.choices?.[0]?.message?.content ?? json?.choices?.[0]?.text ?? "";

  if (!text) throw new Error("GROQ_EMPTY_RESPONSE");

  const parsed = groqSafeJsonParse(text);
  return schema.parse(parsed);
}
