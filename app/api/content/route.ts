import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import {
  SYSTEM_PROMPT, COMPILER_PROMPT, TRENDS_PROMPT,
  buildUserPrompt, compileDirection,
} from "@/lib/contentPrompts"

export const maxDuration = 300

const TEXT_MODEL = "claude-haiku-4-5"
const REPLICATE = "https://api.replicate.com/v1"
const IMG_MODELS: Record<string, string> = {
  schnell: "black-forest-labs/flux-schnell",
  pro: "black-forest-labs/flux-1.1-pro",
}

/* Robust LLM-JSON parse: fences, raw newlines in strings, truncation */
function parseLlmJson(text: string): any {
  const m = text.match(/\{[\s\S]*\}/)
  if (!m) throw new Error("AI returned no JSON — please try again.")
  let out = "", inStr = false, esc = false
  for (const ch of m[0]) {
    if (inStr) {
      if (esc) { esc = false; out += ch; continue }
      if (ch === "\\") { esc = true; out += ch; continue }
      if (ch === '"') { inStr = false; out += ch; continue }
      if (ch === "\n") { out += "\\n"; continue }
      if (ch === "\r") { out += "\\r"; continue }
      if (ch === "\t") { out += "\\t"; continue }
      out += ch
    } else {
      if (ch === '"') inStr = true
      out += ch
    }
  }
  return JSON.parse(out)
}

async function runClaude(system: string, prompt: string, maxTokens: number) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  let lastErr: unknown
  // One retry: malformed-JSON outputs are nondeterministic and rare —
  // a second sample almost always parses.
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await client.messages.create({
      model: TEXT_MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: prompt }],
    })
    const text = res.content.find((b) => b.type === "text")?.text ?? "{}"
    try {
      return parseLlmJson(text)
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr
}

async function runImage(model: string, prompt: string, aspectRatio: string): Promise<string> {
  const token = process.env.REPLICATE_API_TOKEN
  if (!token) throw new Error("Image service not configured — set REPLICATE_API_TOKEN.")
  const r = await fetch(`${REPLICATE}/models/${model}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "wait=58",
    },
    body: JSON.stringify({ input: { prompt, aspect_ratio: aspectRatio, output_format: "jpg" } }),
  })
  const d: any = await r.json()
  if (!r.ok) throw new Error(d.detail || d.title || `Image generation failed (${r.status})`)
  const out = d.output
  const url = Array.isArray(out) ? out[0] : out
  if (!url) throw new Error(d.error || "Image generation returned no result — try again.")
  return String(url)
}

// GET /api/content?proxy=<url> — same-origin image proxy so the overlay
// canvas isn't CORS-tainted (Replicate URLs also expire; render fast)
export async function GET(req: Request) {
  const proxied = new URL(req.url).searchParams.get("proxy")
  if (!proxied) return NextResponse.json({ error: "missing proxy param" }, { status: 400 })
  try {
    const target = new URL(proxied)
    if (!target.hostname.endsWith("replicate.delivery"))
      return NextResponse.json({ error: "proxy host not allowed" }, { status: 400 })
    const r = await fetch(target)
    return new Response(await r.arrayBuffer(), {
      status: r.status,
      headers: {
        "Content-Type": r.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 502 })
  }
}

export async function POST(req: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "AI service not configured — set ANTHROPIC_API_KEY." }, { status: 503 })
    }
    const body: any = await req.json()

    if (body.action === "plan") {
      const parsed = await runClaude(SYSTEM_PROMPT, buildUserPrompt(body.payload || {}), 8000)
      const variants = parsed.variants || [parsed]
      return NextResponse.json({ variants })
    }

    if (body.action === "compile") {
      const prompt = `Restaurant owner's text: ${body.text || ""}\n`
        + (body.context ? `Saved restaurant context from earlier: ${body.context}\n` : "")
        + `${compileDirection()}\n\nReturn the JSON only.`
      const spec = await runClaude(COMPILER_PROMPT, prompt, 800)
      return NextResponse.json(spec)
    }

    if (body.action === "trends") {
      const prompt = `Restaurant context (free text, infer city/cuisine from it): ${body.context || "unknown — assume a general Indian restaurant"}\nToday's date: ${new Date().toDateString()}\n\nReturn the JSON only.`
      const trends = await runClaude(TRENDS_PROMPT, prompt, 2000)
      return NextResponse.json(trends)
    }

    if (body.action === "image") {
      const model = IMG_MODELS[body.model] || IMG_MODELS.schnell
      const url = await runImage(model, body.prompt || "", body.aspect_ratio || "4:5")
      return NextResponse.json({ url })
    }

    return NextResponse.json(
      { error: "action must be 'plan', 'compile', 'trends', or 'image'" }, { status: 400 })
  } catch (e: any) {
    if (e instanceof Anthropic.APIError) {
      const status = e.status ?? 502
      return NextResponse.json({
        error: status === 429
          ? "AI service is rate-limited — try again in a moment."
          : "AI generation failed — please try again.",
      }, { status })
    }
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
