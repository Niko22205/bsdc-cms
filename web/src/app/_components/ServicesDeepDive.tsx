"use client"

import { useState } from "react"
import Image from "next/image"
import { ICON_MAP } from "@/lib/iconMap"

export type ServiceDeepDiveItem = {
  id: string
  title: string
  shortDescription: string | null
  content: string | null
  featuredImageUrl: string | null
  images: string[]
  iconUrl?: string | null
}

// ── Orbit geometry ───────────────────────────────────────────────────────────
const ORBIT_RX = 235 // horizontal radius (px)
const ORBIT_RY = 125 // vertical radius (px)

// ── Pre-defined bubble positions for CSS underwater atmosphere ───────────────
const BUBBLES: Array<{ left: string; w: number; delay: number; dur: number }> = [
  { left: "6%",  w: 2, delay: 0,  dur: 10 },
  { left: "12%", w: 4, delay: 3,  dur: 14 },
  { left: "19%", w: 2, delay: 7,  dur: 11 },
  { left: "27%", w: 3, delay: 1,  dur: 13 },
  { left: "34%", w: 5, delay: 5,  dur: 16 },
  { left: "43%", w: 2, delay: 2,  dur: 10 },
  { left: "50%", w: 4, delay: 8,  dur: 12 },
  { left: "58%", w: 2, delay: 4,  dur: 9  },
  { left: "65%", w: 3, delay: 6,  dur: 14 },
  { left: "73%", w: 5, delay: 1,  dur: 13 },
  { left: "80%", w: 2, delay: 9,  dur: 11 },
  { left: "87%", w: 4, delay: 3,  dur: 15 },
  { left: "93%", w: 2, delay: 7,  dur: 10 },
]

// ── Service icon: uses stored Lucide icon name, falls back to inline SVGs ────
function ServiceIcon({ iconName, index }: { iconName?: string | null; index: number }) {
  if (iconName) {
    const LucideIcon = ICON_MAP[iconName]
    if (LucideIcon) return <LucideIcon width={22} height={22} />
  }

  // Fallback inline SVGs
  const p: React.SVGProps<SVGSVGElement> = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    width: 22,
    height: 22,
  }
  switch (index % 6) {
    case 0:
      return (
        <svg {...p}>
          <path d="M12 2c-1 2-4 5-4 9 0 5 4 8 4 8s4-3 4-8c0-4-3-7-4-9z" />
          <circle cx="12" cy="11" r="2" />
        </svg>
      )
    case 1:
      return (
        <svg {...p}>
          <rect x="3" y="7" width="13" height="10" rx="2" />
          <path d="M16 11l5-3v8l-5-3" />
        </svg>
      )
    case 2:
      return (
        <svg {...p}>
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
        </svg>
      )
    case 3:
      return (
        <svg {...p}>
          <path d="M2 12c1.5-2 3-3 5-3s3.5 3 5 3 3.5-3 5-3" />
          <path d="M2 17c1.5-2 3-3 5-3s3.5 3 5 3 3.5-3 5-3" strokeOpacity=".4" />
        </svg>
      )
    case 4:
      return (
        <svg {...p}>
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v13" />
          <path d="M5 10a7 7 0 0014 0" />
          <path d="M5 10H2M22 10h-3" />
        </svg>
      )
    default:
      return (
        <svg {...p}>
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      )
  }
}

// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  services: ServiceDeepDiveItem[]
}

export function ServicesDeepDive({ services }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [panelOpen, setPanelOpen] = useState(false)
  const [galleryImg, setGalleryImg] = useState<string | null>(null)

  if (services.length === 0) return null

  const active = services[activeIndex]

  // ── Panel gallery ──────────────────────────────────────────────────────────
  const panelAllImgs = [
    ...(active.featuredImageUrl ? [active.featuredImageUrl] : []),
    ...active.images.filter((u) => u !== active.featuredImageUrl),
  ]
  const panelCurrentImg = galleryImg ?? panelAllImgs[0] ?? null

  // ── Navigation ─────────────────────────────────────────────────────────────
  const prev = () => {
    setActiveIndex((i) => (i - 1 + services.length) % services.length)
    setGalleryImg(null)
  }
  const next = () => {
    setActiveIndex((i) => (i + 1) % services.length)
    setGalleryImg(null)
  }
  const openPanel = () => {
    setGalleryImg(null)
    setPanelOpen(true)
  }
  const closePanel = () => setPanelOpen(false)

  // ── Orbit positions ────────────────────────────────────────────────────────
  const orbitItems = services.map((s, i) => {
    const angleDeg = (i * 360) / services.length - 90
    const rad = (angleDeg * Math.PI) / 180
    return {
      ...s,
      idx: i,
      x: Math.round(Math.cos(rad) * ORBIT_RX),
      y: Math.round(Math.sin(rad) * ORBIT_RY),
    }
  })

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#010509]">
      {/* ── BACKGROUND ────────────────────────────────────────────────────── */}

      {/* Deep-sea radial gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 150% 80% at 50% -5%, #0c2242 0%, #040c18 38%, #010509 72%)",
        }}
      />

      {/* Soft radial spotlight at center */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "700px",
          height: "700px",
          background:
            "radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 65%)",
          animation: "bsdc-glow-breathe 5s ease-in-out infinite",
        }}
      />

      {/* Left/right fog edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(8,20,40,0.55) 0%, transparent 28%, transparent 72%, rgba(8,20,40,0.55) 100%)",
        }}
      />

      {/* Bubbles */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {BUBBLES.map((b, i) => (
          <span
            key={i}
            className="absolute bottom-0 rounded-full bg-sky-400/25"
            style={{
              left: b.left,
              width: `${b.w}px`,
              height: `${b.w}px`,
              animation: `bsdc-bubble-rise ${b.dur}s ${b.delay}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* ── MAIN SCENE ──────────────────────────────────────────────────── */}
      <div className="relative z-10 flex min-h-screen flex-col">

        {/* Section label */}
        <div className="mx-auto w-full max-w-6xl px-6 pt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500/70">
            BSDC · Подводни услуги
          </p>
        </div>

        {/* ── DESKTOP scene ────────────────────────────────────────── */}
        <div className="mx-auto hidden w-full flex-1 max-w-6xl items-center gap-10 px-6 lg:flex">

          {/* LEFT: editorial text + active service info */}
          <div className="w-72 shrink-0 self-center">
            <h2 className="text-5xl font-bold leading-[1.05] tracking-tight text-white">
              The<br />Deep<br />Dive
            </h2>
            <p className="mt-4 text-sm font-medium leading-snug text-sky-400">
              Интерактивно представяне<br />на нашите подводни услуги
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              BSDC предоставя специализирани подводни услуги — инспекции,
              ремонти, ROV операции, хидрографски проучвания и водолазни курсове,
              с над 20 години опит в промишления водолазен сектор.
            </p>

            {/* Active service card */}
            <div key={`desk-${active.id}`} className="mt-8 animate-bsdc-fade-in">
              <p className="text-xs font-bold tabular-nums tracking-[0.2em] text-sky-500/80">
                {String(activeIndex + 1).padStart(2, "0")}&thinsp;/&thinsp;
                {String(services.length).padStart(2, "0")}
              </p>
              <p className="mt-2 text-xl font-bold leading-tight text-white">
                {active.title}
              </p>
              {active.shortDescription && (
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-400">
                  {active.shortDescription}
                </p>
              )}
              <button
                onClick={openPanel}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-sky-500/35 bg-sky-600/15 px-5 py-2 text-xs font-semibold text-sky-400 transition hover:border-sky-500/60 hover:bg-sky-600/25 hover:text-sky-300"
              >
                Виж услугата
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M1 7h12M7 1l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* CENTER: orbit + helmet ──────────────────────────────── */}
          <div className="flex flex-1 items-center justify-center">
            <div className="relative" style={{ width: "660px", height: "420px" }}>

              {/* Ellipse guide rings */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-500/[0.06]"
                style={{ width: "510px", height: "280px" }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-500/[0.04]"
                style={{ width: "430px", height: "222px" }}
              />

              {/* Orbit service buttons */}
              {orbitItems.map((item) => {
                const isActive = item.idx === activeIndex
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveIndex(item.idx)
                      setGalleryImg(null)
                    }}
                    style={{
                      position: "absolute",
                      left: `calc(50% + ${item.x}px)`,
                      top: `calc(50% + ${item.y}px)`,
                      transform: "translate(-50%, -50%)",
                      width: "116px",
                    }}
                    className={[
                      "flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-center transition-all duration-300",
                      isActive
                        ? "animate-bsdc-orbit-active border-sky-500/50 bg-sky-900/25 text-white"
                        : "border-white/[0.07] bg-black/20 text-slate-500 hover:border-white/15 hover:bg-black/30 hover:text-slate-300",
                    ].join(" ")}
                  >
                    <span
                      className={`transition-colors duration-300 ${isActive ? "text-sky-400" : "text-slate-600"}`}
                    >
                      <ServiceIcon iconName={item.iconUrl} index={item.idx} />
                    </span>
                    <span className="block text-[10px] leading-tight">{item.title}</span>
                  </button>
                )
              })}

              {/* Radial glow pulsing behind helmet */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: "300px",
                  height: "300px",
                  background:
                    "radial-gradient(circle, rgba(14,165,233,0.11) 0%, transparent 68%)",
                  animation: "bsdc-glow-breathe 4s ease-in-out infinite",
                }}
              />

              {/* Helmet focal image */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ animation: "bsdc-helmet-float 7s ease-in-out infinite" }}
              >
                <div
                  className="relative overflow-hidden rounded-2xl"
                  style={{
                    width: "192px",
                    height: "248px",
                    filter:
                      "drop-shadow(0 0 28px rgba(14,165,233,0.22)) drop-shadow(0 8px 20px rgba(0,0,0,0.7))",
                  }}
                >
                  <Image
                    src="/uploads/bsdc/gallery-diver-helmet.jpg"
                    alt="BSDC водолазно оборудване"
                    fill
                    unoptimized
                    priority
                    className="object-cover"
                    style={{
                      filter: "brightness(0.82) contrast(1.18) saturate(0.75)",
                    }}
                  />
                  {/* Vignette */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 38%, transparent 35%, rgba(1,5,9,0.55) 100%)",
                    }}
                  />
                  {/* Top edge glow line */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-px"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(14,165,233,0.4), transparent)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom arrow nav — desktop */}
        <div className="mx-auto hidden w-full max-w-6xl items-center justify-end gap-4 px-6 pb-10 lg:flex">
          <button
            onClick={prev}
            aria-label="Предишна услуга"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-500 transition hover:border-white/20 hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M10 4L6 8l4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <span className="text-xs font-bold tabular-nums tracking-widest text-slate-600">
            {String(activeIndex + 1).padStart(2, "0")}&thinsp;/&thinsp;
            {String(services.length).padStart(2, "0")}
          </span>
          <button
            onClick={next}
            aria-label="Следваща услуга"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-500 transition hover:border-white/20 hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M6 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* ── MOBILE layout ──────────────────────────────────────── */}
        <div className="flex flex-col px-6 py-12 lg:hidden">
          {/* Mobile editorial header */}
          <div>
            <h2 className="text-4xl font-bold leading-tight text-white">
              The Deep Dive
            </h2>
            <p className="mt-2 text-sm text-sky-400">
              Интерактивно представяне на нашите подводни услуги
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              BSDC предоставя специализирани подводни услуги — инспекции, ремонти,
              ROV операции и водолазни курсове.
            </p>
          </div>

          {/* Mobile helmet */}
          <div className="mt-8 flex justify-center">
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{
                width: "160px",
                height: "210px",
                animation: "bsdc-helmet-float 7s ease-in-out infinite",
                filter:
                  "drop-shadow(0 0 20px rgba(14,165,233,0.18)) drop-shadow(0 4px 16px rgba(0,0,0,0.6))",
              }}
            >
              <Image
                src="/uploads/bsdc/gallery-diver-helmet.jpg"
                alt="BSDC"
                fill
                unoptimized
                className="object-cover"
                style={{ filter: "brightness(0.82) contrast(1.18) saturate(0.75)" }}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-2xl"
                style={{
                  background:
                    "radial-gradient(circle at 50% 38%, transparent 35%, rgba(1,5,9,0.5) 100%)",
                }}
              />
            </div>
          </div>

          {/* Mobile service buttons */}
          <div className="mt-8 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {services.map((s, i) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveIndex(i)
                  setGalleryImg(null)
                }}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  i === activeIndex
                    ? "bg-sky-600 text-white"
                    : "border border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <span className="opacity-50">{String(i + 1).padStart(2, "0")}</span>{" "}
                {s.title}
              </button>
            ))}
          </div>

          {/* Mobile active service */}
          <div key={`mob-${active.id}`} className="mt-6 animate-bsdc-fade-in">
            <p className="text-lg font-bold text-white">{active.title}</p>
            {active.shortDescription && (
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {active.shortDescription}
              </p>
            )}
            <button
              onClick={openPanel}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-sky-500/35 bg-sky-600/15 px-5 py-2 text-xs font-semibold text-sky-400"
            >
              Виж услугата →
            </button>
          </div>
        </div>
      </div>

      {/* ── INFO PANEL ──────────────────────────────────────────────────── */}
      {panelOpen && (
        <div
          className="animate-bsdc-panel-in absolute inset-0 z-50 overflow-y-auto"
          style={{
            background: "rgba(1,5,9,0.97)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Scanline texture overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(14,165,233,0.025) 2px, rgba(14,165,233,0.025) 4px)",
              opacity: 0.6,
            }}
          />

          {/* Top accent bar */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(14,165,233,0.5) 30%, rgba(14,165,233,0.8) 50%, rgba(14,165,233,0.5) 70%, transparent 100%)",
            }}
          />

          {/* Panel body */}
          <div className="relative mx-auto w-full max-w-5xl px-6 py-8 lg:py-12">

            {/* Panel topbar: breadcrumb + close */}
            <div className="mb-8 flex items-center justify-between border-b border-sky-500/10 pb-5">
              <div className="flex items-center gap-3">
                <span className="block h-px w-8 bg-sky-500/50" />
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-sky-500">
                  Услуга&nbsp;{String(activeIndex + 1).padStart(2, "0")}
                </span>
              </div>
              <button
                onClick={closePanel}
                className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-xs font-semibold text-slate-400 transition hover:border-white/20 hover:text-white"
              >
                ← Назад
              </button>
            </div>

            {/* Content grid */}
            <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">

              {/* Left: image + gallery thumbnails */}
              <div className="flex flex-col gap-4">
                {panelCurrentImg && (
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/5">
                    <Image
                      key={panelCurrentImg}
                      src={panelCurrentImg}
                      alt={active.title}
                      fill
                      unoptimized
                      className="object-cover animate-bsdc-fade-in"
                    />
                    {/* Corner bracket marks */}
                    <div
                      aria-hidden="true"
                      className="absolute left-3 top-3 h-5 w-5 border-l border-t border-sky-500/30"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute bottom-3 right-3 h-5 w-5 border-b border-r border-sky-500/30"
                    />
                  </div>
                )}

                {/* Gallery thumbnails */}
                {panelAllImgs.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {panelAllImgs.map((url, ti) => (
                      <button
                        key={`${url}-${ti}`}
                        onClick={() => setGalleryImg(url)}
                        className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-all duration-200 ${
                          url === panelCurrentImg
                            ? "opacity-100 ring-2 ring-sky-500 ring-offset-2 ring-offset-[#010509]"
                            : "opacity-35 hover:opacity-65"
                        }`}
                      >
                        <Image src={url} alt="" fill unoptimized className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* No image state */}
                {!panelCurrentImg && (
                  <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-white/5 text-slate-600">
                    <span className="text-sm">Няма изображение</span>
                  </div>
                )}
              </div>

              {/* Right: text content */}
              <div className="flex flex-col">
                <h2 className="text-3xl font-bold text-white lg:text-4xl">{active.title}</h2>
                {active.shortDescription && (
                  <p className="mt-4 text-base leading-relaxed text-sky-200">
                    {active.shortDescription}
                  </p>
                )}
                {active.content && (
                  <div
                    className="mt-5 text-sm leading-relaxed text-slate-400 [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-widest [&_h3]:text-sky-400 [&_li]:mb-1.5 [&_li]:text-slate-400 [&_p]:mb-3 [&_p]:text-slate-400 [&_strong]:font-semibold [&_strong]:text-slate-200 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1"
                    dangerouslySetInnerHTML={{ __html: active.content }}
                  />
                )}

                {/*
                  TODO: Related projects require CMS support / service-project relation.
                  Currently Service and ProjectNewsItem are independent models with no
                  foreign key. A `serviceTranslationKey String?` field on ProjectNewsItem
                  (plus a migration) would enable filtering projects by service here.
                */}
              </div>
            </div>

            {/* Panel bottom nav */}
            <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-6">
              <button
                onClick={() => { prev(); }}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-white"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M9 1L3 7l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Предишна
              </button>
              <span className="text-xs font-bold tabular-nums tracking-widest text-slate-600">
                {String(activeIndex + 1).padStart(2, "0")}&thinsp;/&thinsp;
                {String(services.length).padStart(2, "0")}
              </span>
              <button
                onClick={() => { next(); }}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-white"
              >
                Следваща
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M5 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
