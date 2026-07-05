"use client"

/* RestroPulse — Instagram content generator.
   One free-text box -> 3 post variants (caption + hashtags + image with
   offer-text overlay). Prefill via /content?ctx=<restaurant context>. */

import { useEffect, useRef, useState } from "react"

type Variant = {
  concept?: string
  image?: { prompt?: string; negative_prompt?: string; aspect_ratio?: string }
  caption?: string
  hashtags?: string[]
  alt_text?: string
  overlay_text?: string | null
  suggested_post_time?: string
}

type Trends = {
  trending_ideas?: { title: string; why_it_works: string; starter_brief: string }[]
  trending_hashtags?: string[]
  audio_vibes?: { vibe: string; use_for: string }[]
  festival_hooks?: { festival: string; when: string; post_idea: string }[]
}

const CTX_KEY = "rp_ctx"
const loadCtx = () => { try { return localStorage.getItem(CTX_KEY) || "" } catch { return "" } }
const saveCtx = (s: string) => { try { localStorage.setItem(CTX_KEY, s) } catch {} }

async function api(body: unknown) {
  const r = await fetch("/api/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const d = await r.json()
  if (!r.ok) throw new Error(d.error || r.statusText)
  return d
}

export default function ContentPage() {
  const [quick, setQuick] = useState("")
  const [status, setStatus] = useState("")
  const [err, setErr] = useState("")
  const [variants, setVariants] = useState<Variant[]>([])
  const [selIdx, setSelIdx] = useState(-1)
  const [fb, setFb] = useState("")
  const [showOverlay, setShowOverlay] = useState(true)
  const [trends, setTrends] = useState<Trends | null>(null)
  const [busy, setBusy] = useState(false)

  const imagesRef = useRef<Record<number, string>>({})
  const lastPayloadRef = useRef<any>(null)
  const curUrlRef = useRef<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Prefill from ?ctx= (e.g. linked from a competitor report) or saved context
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const ctx = p.get("ctx")
    if (ctx) { setQuick(ctx); saveCtx(ctx) }
    else if (loadCtx()) setQuick(loadCtx())
  }, [])

  const sel = selIdx >= 0 ? variants[selIdx] : null

  function drawPost(url: string, plan: Variant | null) {
    curUrlRef.current = url
    const img = new Image()
    img.onload = () => {
      const cv = canvasRef.current
      if (!cv) return
      cv.width = img.naturalWidth; cv.height = img.naturalHeight
      const ctx = cv.getContext("2d")!
      ctx.drawImage(img, 0, 0)
      const ov = plan?.overlay_text
      if (ov && typeof ov === "string" && ov !== "null" && showOverlay) {
        const W = cv.width, H = cv.height
        const g = ctx.createLinearGradient(0, H * 0.70, 0, H)
        g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.78)")
        ctx.fillStyle = g; ctx.fillRect(0, H * 0.70, W, H * 0.30)
        const t = ov.toUpperCase()
        let size = Math.floor(W * 0.078)
        const setFont = () => (ctx.font = `800 ${size}px -apple-system, "Segoe UI", Roboto, Arial, sans-serif`)
        setFont()
        while (ctx.measureText(t).width > W * 0.9 && size > 14) { size -= 2; setFont() }
        ctx.textAlign = "center"
        ctx.shadowColor = "rgba(0,0,0,0.65)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 2
        ctx.fillStyle = "#fff"
        ctx.fillText(t, W / 2, H * 0.93)
        ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
      }
    }
    img.src = "/api/content?proxy=" + encodeURIComponent(url)
  }

  useEffect(() => { if (curUrlRef.current) drawPost(curUrlRef.current, sel) },
    [showOverlay]) // eslint-disable-line react-hooks/exhaustive-deps

  async function selectVariant(i: number, list?: Variant[]) {
    const vars = list || variants
    const p = vars[i]
    setSelIdx(i); setErr("")
    if (imagesRef.current[i]) { drawPost(imagesRef.current[i], p); return }
    try {
      setStatus("Generating image…")
      const d = await api({
        action: "image", model: "schnell",
        prompt: p.image?.prompt || "",
        aspect_ratio: p.image?.aspect_ratio || "4:5",
      })
      imagesRef.current[i] = d.url
      drawPost(d.url, p)
      setStatus("")
    } catch (e: any) { setStatus(""); setErr("Image error: " + e.message) }
  }

  async function generate(payload: any) {
    setErr(""); setBusy(true); setStatus("Writing 3 options…")
    try {
      lastPayloadRef.current = payload
      const d = await api({ action: "plan", payload })
      imagesRef.current = {}
      setVariants(d.variants); setSelIdx(-1)
      setStatus("")
      await selectVariant(0, d.variants)
    } catch (e: any) { setStatus(""); setErr(e.message) }
    setBusy(false)
  }

  function onGenerate() {
    if (!quick.trim()) { setErr("Type something first — e.g. 'fun weekend post for my biryani place in Gurugram'"); return }
    const prev = loadCtx()
    const payload: any = { brief_text: quick.trim() }
    if (prev && prev !== quick.trim()) payload.known_context = prev
    saveCtx(quick.trim())
    generate(payload)
  }

  function onAuto() {
    const ctx = quick.trim() || loadCtx()
    if (!ctx) { setErr("Tell me about your restaurant once first — after that, this button needs zero typing."); return }
    saveCtx(ctx)
    generate({ brief_text: "Restaurant context from earlier: " + ctx, auto: true })
  }

  async function onImageOnly() {
    const t = quick.trim() || loadCtx()
    if (!t) { setErr("Describe the image first — e.g. 'steaming biryani in a copper handi, warm light'"); return }
    if (quick.trim()) saveCtx(quick.trim())
    setErr(""); setBusy(true)
    try {
      setStatus("Understanding your words…")
      const prev = loadCtx()
      const spec = await api({ action: "compile", text: t, context: prev !== t ? prev : undefined })
      setStatus("Creating image…")
      const d = await api({ action: "image", model: "schnell", prompt: spec.prompt, aspect_ratio: spec.aspect_ratio || "4:5" })
      setVariants([]); setSelIdx(-1)
      drawPost(d.url, null)
      setStatus("")
    } catch (e: any) { setStatus(""); setErr(e.message) }
    setBusy(false)
  }

  async function onTrends() {
    setErr(""); setBusy(true); setStatus("Fetching ideas…")
    try {
      const d = await api({ action: "trends", context: quick.trim() || loadCtx() })
      setTrends(d); setStatus("")
    } catch (e: any) { setStatus(""); setErr(e.message) }
    setBusy(false)
  }

  function onRefine() {
    if (!sel) { setErr("Generate a post first."); return }
    if (!fb.trim()) return
    const payload = { ...lastPayloadRef.current, previous_plan: sel, feedback: fb.trim() }
    setFb("")
    generate(payload)
  }

  function download() {
    canvasRef.current?.toBlob((b) => {
      if (!b) return
      const a = document.createElement("a")
      a.href = URL.createObjectURL(b)
      a.download = "restropulse-post.jpg"
      a.click()
    }, "image/jpeg", 0.92)
  }

  function copyCaption() {
    if (!sel) return
    navigator.clipboard.writeText((sel.caption || "") + "\n.\n.\n" + (sel.hashtags || []).join(" "))
  }

  const box = "w-full rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-sm text-neutral-100 placeholder-neutral-500"
  const btn = "rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
  const ghost = `${btn} bg-neutral-800 text-neutral-200`

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 text-neutral-100">
      <h1 className="text-center text-2xl font-bold">
        Restro<span className="text-orange-500">Pulse</span> — Post Generator
      </h1>
      <p className="mb-6 mt-2 text-center text-sm text-neutral-400">
        Describe your post in your own words — get 3 ready-to-publish Instagram posts.
      </p>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
        <textarea
          className={`${box} min-h-[110px]`}
          value={quick}
          onChange={(e) => setQuick(e.target.value)}
          placeholder="e.g. I run Biryani Blues in Gurugram, Hyderabadi place. Fun Hinglish post for our Chicken Dum Biryani — 30% off this weekend, ₹349. Image: steaming handi, top-down."
        />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button className={`${btn} bg-gradient-to-r from-orange-600 to-amber-500 text-white`} disabled={busy} onClick={onGenerate}>
            Generate posts
          </button>
          <button className={ghost} disabled={busy} onClick={onAuto}>⚡ Surprise me (auto)</button>
          <button className={ghost} disabled={busy} onClick={onImageOnly}>🖼 Create image only</button>
          <button className={ghost} disabled={busy} onClick={onTrends}>🔥 Trending ideas</button>
        </div>
        {status && <p className="mt-3 text-sm text-neutral-400">{status}</p>}
        {err && <p className="mt-3 whitespace-pre-wrap text-sm text-red-400">{err}</p>}

        {trends && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">Post ideas — click to use</p>
            {(trends.trending_ideas || []).map((i, k) => (
              <button key={k} className="block w-full rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-left hover:border-orange-500"
                onClick={() => setQuick((loadCtx() ? loadCtx() + ". " : "") + i.starter_brief)}>
                <span className="block text-sm font-semibold">{i.title}</span>
                <span className="text-xs text-neutral-400">{i.why_it_works}</span>
              </button>
            ))}
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">Upcoming festivals</p>
            {(trends.festival_hooks || []).map((f, k) => (
              <button key={k} className="block w-full rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-left hover:border-orange-500"
                onClick={() => setQuick((loadCtx() ? loadCtx() + ". " : "") + f.festival + " post: " + f.post_idea)}>
                <span className="block text-sm font-semibold">{f.festival} · {f.when}</span>
                <span className="text-xs text-neutral-400">{f.post_idea}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {(variants.length > 0 || curUrlRef.current) && (
        <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          {variants.length > 0 && (
            <>
              <h2 className="mb-3 text-sm font-semibold text-amber-400">Pick an option</h2>
              <div className="space-y-2">
                {variants.map((p, i) => (
                  <button key={i}
                    className={`block w-full rounded-lg border p-3 text-left ${i === selIdx ? "border-orange-500" : "border-neutral-800"} bg-neutral-900`}
                    onClick={() => selectVariant(i)}>
                    <span className="block text-sm font-semibold">Option {i + 1} · {p.concept}</span>
                    <span className="text-xs text-neutral-400">{(p.caption || "").split("\n")[0].slice(0, 90)}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          <canvas ref={canvasRef} className="mt-4 w-full rounded-xl border border-neutral-800" />
          <label className="mt-3 flex items-center gap-2 text-sm text-neutral-400">
            <input type="checkbox" checked={showOverlay} onChange={(e) => setShowOverlay(e.target.checked)} />
            Show offer text on image
          </label>
          <button className={`${ghost} mt-2 w-full`} onClick={download}>Download image</button>

          {sel && (
            <>
              <p className="mt-3 text-xs text-neutral-500">Concept: {sel.concept}</p>
              <div className="mt-2 whitespace-pre-wrap rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-sm">{sel.caption}</div>
              <p className="mt-2 break-words text-xs text-sky-400">{(sel.hashtags || []).join(" ")}</p>
              {sel.suggested_post_time && <p className="mt-1 text-xs text-neutral-500">Best time to post: {sel.suggested_post_time}</p>}
              <button className={`${ghost} mt-2 w-full`} onClick={copyCaption}>Copy caption + hashtags</button>

              <p className="mb-1 mt-4 text-xs text-neutral-400">Want changes? Just say it</p>
              <textarea className={`${box} min-h-[56px]`} value={fb} onChange={(e) => setFb(e.target.value)}
                placeholder="e.g. make it shorter, more emojis, change image to close-up with steam" />
              <button className={`${ghost} mt-2 w-full`} disabled={busy} onClick={onRefine}>Update post</button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
