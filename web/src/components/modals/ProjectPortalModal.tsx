"use client"

import { createPortal } from "react-dom"
import { useState, useEffect, useRef } from "react"
import type { ProjectNewsItem } from "@/generated/prisma/client"

const GALLERY_MB = [
  "mb-6","mb-16","mb-4","mb-12","mb-8","mb-20","mb-3","mb-10","mb-14","mb-5",
]

function fmtDate(d: Date | string | null | undefined, lang?: string): string {
  if (!d) return ""
  const date = typeof d === "string" ? new Date(d) : d
  return date.toLocaleDateString(lang === "bg" ? "bg-BG" : "en-GB", {
    year: "numeric", month: "long",
  })
}

export function ProjectPortalModal({
  project,
  allProjects = [],
  lang,
  onClose,
  onImageClick,
  onSwitchProject,
}: {
  project: ProjectNewsItem | null
  allProjects?: ProjectNewsItem[]
  lang?: string
  onClose: () => void
  onImageClick?: (index: number) => void
  onSwitchProject?: (project: ProjectNewsItem) => void
}) {
  const [mounted, setMounted]   = useState(false)
  const [visible, setVisible]   = useState(false)
  const scrollRef               = useRef<HTMLDivElement>(null)

  // SSR guard + rAF-delayed fade in
  useEffect(() => {
    setMounted(true)
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  // Scroll lock — both html + body required
  useEffect(() => {
    if (!project) return
    const html = document.documentElement
    const body = document.body
    const ph = html.style.overflow
    const pb = body.style.overflow
    html.style.overflow = "hidden"
    body.style.overflow = "hidden"
    return () => {
      html.style.overflow = ph
      body.style.overflow = pb
    }
  }, [project])

  // Escape → close
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", fn)
    return () => window.removeEventListener("keydown", fn)
  }, [onClose])

  // Window CAPTURE phase — swallow wheel outside canvas
  useEffect(() => {
    const kill = (e: WheelEvent) => {
      if (scrollRef.current?.contains(e.target as Node)) return
      e.preventDefault()
    }
    window.addEventListener("wheel", kill, { passive: false, capture: true })
    return () => window.removeEventListener("wheel", kill, { capture: true })
  }, [])

  // Snap to top on project switch
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
  }, [project?.id])

  if (!mounted || !project) return null

  const images      = project.images ?? []
  const year        = project.publishedAt
    ? new Date(project.publishedAt).getFullYear()
    : null
  const dateLabel   = fmtDate(project.publishedAt, lang)
  const hasSpecs    = project.equipmentUsed.length > 0 || project.activitiesDone.length > 0

  // Prev / next via allProjects index — wrap-around
  const idx         = allProjects.findIndex(p => p.id === project.id)
  const prevProject = allProjects.length > 1
    ? allProjects[(idx - 1 + allProjects.length) % allProjects.length]
    : null
  const nextProject = allProjects.length > 1
    ? allProjects[(idx + 1) % allProjects.length]
    : null

  const modal = (
    // ── Full-screen takeover ────────────────────────────────────────────────
    <div
      className="fixed inset-0 z-[500] pointer-events-auto"
      style={{
        opacity:    visible ? 1 : 0,
        transition: "opacity 420ms ease",
      }}
    >
      {/* Dim backdrop — click outside to close */}
      <div
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: "rgba(36,47,42,0.75)" }}
      />

      {/* ── Close X — z-[501] so it floats above everything ─────────────── */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-6 right-6 z-[501] flex h-10 w-10 cursor-pointer items-center justify-center pointer-events-auto"
      >
        <svg
          width="18" height="18" viewBox="0 0 18 18" fill="none"
          className="text-[#1A221E]/30 transition-colors duration-300 hover:text-[#1A221E]/80"
        >
          <line x1="1" y1="1" x2="17" y2="17" stroke="currentColor" strokeWidth="1.3"/>
          <line x1="17" y1="1" x2="1"  y2="17" stroke="currentColor" strokeWidth="1.3"/>
        </svg>
      </button>

      {/* ── Prev / Next navigation arrows — top-left ────────────────────── */}
      {(prevProject || nextProject) && (
        <div className="absolute top-6 left-6 z-[501] flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => prevProject && onSwitchProject?.(prevProject)}
            disabled={!prevProject}
            aria-label="Previous project"
            className="flex h-9 w-9 cursor-pointer items-center justify-center text-[#1A221E]/25 transition-colors duration-300 hover:text-[#1A221E]/70 disabled:opacity-20 disabled:cursor-default"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 2L4 8L10 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#1A221E]/20 select-none">
            {idx + 1} / {allProjects.length}
          </span>
          <button
            onClick={() => nextProject && onSwitchProject?.(nextProject)}
            disabled={!nextProject}
            aria-label="Next project"
            className="flex h-9 w-9 cursor-pointer items-center justify-center text-[#1A221E]/25 transition-colors duration-300 hover:text-[#1A221E]/70 disabled:opacity-20 disabled:cursor-default"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 2L12 8L6 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── Scrollable canvas ───────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        onWheel={e => e.stopPropagation()}
        className="absolute inset-0 overflow-y-scroll"
        style={{ overscrollBehavior: "contain" }}
      >

        {/* ══════════════════════════════════════════════════════════════════
            SCENE A — THE VOID
            100vh hero. Desaturated image as atmospheric ambient field.
            Title font-light anchored bottom-left. Type + date top-right.
        ══════════════════════════════════════════════════════════════════ */}
        <section style={{ position: "relative", height: "100vh", overflow: "hidden" }}>

          {/* Ambient image */}
          {project.featuredImageUrl && (
            <img
              src={project.featuredImageUrl}
              alt=""
              style={{
                position:  "absolute",
                inset:     0,
                width:     "100%",
                height:    "100%",
                objectFit: "cover",
                transform: "scale(1.05)",
                filter:    "saturate(0.22) brightness(0.55)",
              }}
            />
          )}

          {/* Cinematic depth gradient — precise multi-stop */}
          <div style={{
            position:   "absolute",
            inset:      0,
            background: "linear-gradient(to bottom, rgba(138,154,134,0.12) 0%, rgba(138,154,134,0.35) 28%, rgba(138,154,134,0.70) 58%, rgba(138,154,134,0.93) 80%, #8A9A86 100%)",
          }} />
          {/* Left atmospheric veil */}
          <div style={{
            position:   "absolute",
            inset:      0,
            background: "linear-gradient(to right, rgba(138,154,134,0.65) 0%, rgba(138,154,134,0.22) 48%, transparent 72%)",
          }} />

          {/* Top-right — project type + date */}
          <div
            className="absolute z-10 flex flex-col items-end gap-1"
            style={{ top: "1.75rem", right: "4.5rem" }}
          >
            {project.type && (
              <span className="text-[10px] uppercase tracking-[0.26em] text-[#1A221E]/20">
                {project.type === "PROJECT"
                  ? (lang === "bg" ? "Проект" : "Project")
                  : (lang === "bg" ? "Новина" : "News")}
              </span>
            )}
            {dateLabel && (
              <span className="text-[10px] tracking-[0.14em] text-[#1A221E]/15">
                {dateLabel}
              </span>
            )}
          </div>

          {/* Bottom-left — category + title */}
          <div
            className="absolute z-10"
            style={{
              bottom: "clamp(3rem, 7vh, 5.5rem)",
              left:   "clamp(2rem, 6vw, 5.5rem)",
              right:  "clamp(2rem, 6vw, 5.5rem)",
            }}
          >
            <div className="mb-4 flex items-center gap-5">
              {project.category && (
                <span className="text-[10px] uppercase tracking-[0.28em] text-[#1A221E]/30">
                  {project.category}
                </span>
              )}
              {year && (
                <span className="text-[10px] tracking-[0.16em] text-[#1A221E]/18">
                  {year}
                </span>
              )}
            </div>

            <h1
              className="font-light tracking-tight text-[#1A221E]"
              style={{
                fontSize:   "clamp(2.6rem, 5.8vw, 5.4rem)",
                lineHeight: 1.03,
                maxWidth:   "18ch",
              }}
            >
              {project.title}
            </h1>

            {project.excerpt && (
              <p
                className="mt-5 text-[13px] font-light leading-relaxed text-[#1A221E]/40"
                style={{ maxWidth: "54ch" }}
              >
                {project.excerpt}
              </p>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SCENE B — THE MONOLITH
            One fused slab. Asymmetric grid: 1fr (72%) / 360px (28%).
            Left: full HTML content via dangerouslySetInnerHTML.
            Right: compressed metadata vertical list.
            Single vertical gradient thread as divider.
        ══════════════════════════════════════════════════════════════════ */}
        <section
          style={{
            background:    "#8A9A86",
            paddingTop:    "10vh",
            paddingBottom: "10vh",
            paddingLeft:   "clamp(2rem, 6vw, 6.5rem)",
            paddingRight:  "clamp(2rem, 6vw, 6.5rem)",
          }}
        >
          <div style={{ maxWidth: "1380px", margin: "0 auto" }}>
            <div className="flex flex-col gap-16 lg:flex-row lg:gap-0">

              {/* LEFT — full content 72% */}
              <div className="lg:flex-[13] lg:pr-20">
                {project.content ? (
                  <div
                    className="project-content"
                    dangerouslySetInnerHTML={{ __html: project.content }}
                    style={{
                      color:       "rgba(26,34,30,0.70)",
                      fontSize:    "13px",
                      lineHeight:  "1.92",
                      fontWeight:  300,
                    }}
                  />
                ) : project.excerpt ? (
                  <p
                    className="font-light leading-[1.92] text-[#1A221E]/55"
                    style={{ fontSize: "13px" }}
                  >
                    {project.excerpt}
                  </p>
                ) : null}
              </div>

              {/* Vertical gradient thread — desktop only */}
              {hasSpecs && (
                <div
                  className="hidden lg:block"
                  style={{
                    width:      "1px",
                    flexShrink: 0,
                    background: "linear-gradient(to bottom, transparent 0%, rgba(26,34,30,0.08) 18%, rgba(26,34,30,0.08) 82%, transparent 100%)",
                  }}
                />
              )}

              {/* RIGHT — compressed metadata 28% */}
              {hasSpecs && (
                <div className="flex flex-col gap-10 lg:flex-[5] lg:pl-14">
                  {/* Date */}
                  {dateLabel && (
                    <div>
                      <p
                        className="mb-2 uppercase tracking-widest text-[#1A221E]/20"
                        style={{ fontSize: "13px" }}
                      >
                        {lang === "bg" ? "Дата" : "Date"}
                      </p>
                      <p className="font-light text-[#1A221E]/[0.42]" style={{ fontSize: "13px" }}>
                        {dateLabel}
                      </p>
                    </div>
                  )}

                  {/* Type */}
                  {project.type && (
                    <div>
                      <p
                        className="mb-2 uppercase tracking-widest text-[#1A221E]/20"
                        style={{ fontSize: "13px" }}
                      >
                        {lang === "bg" ? "Тип" : "Type"}
                      </p>
                      <p className="font-light text-[#1A221E]/[0.42]" style={{ fontSize: "13px" }}>
                        {project.type === "PROJECT"
                          ? (lang === "bg" ? "Проект" : "Project")
                          : (lang === "bg" ? "Новина" : "News")}
                      </p>
                    </div>
                  )}

                  {/* Category */}
                  {project.category && (
                    <div>
                      <p
                        className="mb-2 uppercase tracking-widest text-[#1A221E]/20"
                        style={{ fontSize: "13px" }}
                      >
                        {lang === "bg" ? "Категория" : "Category"}
                      </p>
                      <p className="font-light text-[#1A221E]/[0.42]" style={{ fontSize: "13px" }}>
                        {project.category}
                      </p>
                    </div>
                  )}

                  {/* Equipment */}
                  {project.equipmentUsed.length > 0 && (
                    <div>
                      <p
                        className="mb-4 uppercase tracking-widest text-[#1A221E]/20"
                        style={{ fontSize: "13px" }}
                      >
                        {lang === "bg" ? "Оборудване" : "Equipment"}
                      </p>
                      <ul className="flex flex-col gap-2.5">
                        {project.equipmentUsed.map((eq, i) => (
                          <li
                            key={i}
                            className="font-light leading-snug text-[#1A221E]/[0.42]"
                            style={{ fontSize: "13px" }}
                          >
                            {eq}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Activities */}
                  {project.activitiesDone.length > 0 && (
                    <div>
                      <p
                        className="mb-4 uppercase tracking-widest text-[#1A221E]/20"
                        style={{ fontSize: "13px" }}
                      >
                        {lang === "bg" ? "Дейности" : "Activities"}
                      </p>
                      <ul className="flex flex-col gap-2.5">
                        {project.activitiesDone.map((ac, i) => (
                          <li
                            key={i}
                            className="font-light leading-snug text-[#1A221E]/[0.42]"
                            style={{ fontSize: "13px" }}
                          >
                            {ac}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SCENE C — ARCHIVE
            CSS columns masonry. Irregular vertical rhythm via GALLERY_MB.
            Resting: desaturated, dim. Hover: bloom over 1100ms physics curve.
        ══════════════════════════════════════════════════════════════════ */}
        {images.length > 0 && (
          <section
            style={{
              background:    "#8A9A86",
              paddingLeft:   "clamp(0.75rem, 2.5vw, 3.5rem)",
              paddingRight:  "clamp(0.75rem, 2.5vw, 3.5rem)",
              paddingBottom: "4vh",
            }}
          >
            <div
              className="columns-1 sm:columns-2 lg:columns-3 gap-2.5"
              style={{ columnFill: "balance" }}
            >
              {images.map((src, i) => (
                <div
                  key={i}
                  onClick={() => onImageClick?.(i)}
                  className={`break-inside-avoid ${GALLERY_MB[i % GALLERY_MB.length]} group cursor-pointer`}
                >
                  <div className="overflow-hidden">
                    <img
                      src={src}
                      alt=""
                      style={{
                        display:    "block",
                        width:      "100%",
                        objectFit:  "cover",
                        filter:     "saturate(0.35) brightness(0.72)",
                        opacity:    0.62,
                        transform:  "scale(1)",
                        transition: [
                          "filter 1100ms cubic-bezier(0.16, 1, 0.3, 1)",
                          "opacity 1100ms cubic-bezier(0.16, 1, 0.3, 1)",
                          "transform 1100ms cubic-bezier(0.16, 1, 0.3, 1)",
                        ].join(", "),
                      }}
                      className="group-hover:[filter:saturate(1)_brightness(0.96)] group-hover:opacity-90 group-hover:[transform:scale(1.032)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            GRAVITY EXIT ZONE
            65–70vh. Next project image zoomed + grayscale at rest.
            Hover: 1100ms cubic-bezier pull — cinematic approach gravity.
        ══════════════════════════════════════════════════════════════════ */}
        {nextProject && (
          <section
            className="group relative cursor-pointer overflow-hidden"
            style={{ minHeight: "67vh" }}
            onClick={() => onSwitchProject?.(nextProject)}
          >
            {/* Next project image — gravity field */}
            {nextProject.featuredImageUrl ? (
              <img
                src={nextProject.featuredImageUrl}
                alt=""
                style={{
                  position:   "absolute",
                  inset:      0,
                  width:      "100%",
                  height:     "100%",
                  objectFit:  "cover",
                  transform:  "scale(1.12)",
                  opacity:    0.18,
                  filter:     "grayscale(1) brightness(0.7)",
                  transition: [
                    "transform 1100ms cubic-bezier(0.16, 1, 0.3, 1)",
                    "opacity 1100ms cubic-bezier(0.16, 1, 0.3, 1)",
                    "filter 1100ms cubic-bezier(0.16, 1, 0.3, 1)",
                  ].join(", "),
                }}
                className="group-hover:[transform:scale(1)] group-hover:opacity-[0.62] group-hover:[filter:grayscale(0)_brightness(0.8)]"
              />
            ) : (
              <div className="absolute inset-0" style={{ background: "#111" }} />
            )}

            {/* Veil */}
            <div
              className="absolute inset-0 transition-opacity duration-[800ms] group-hover:opacity-75"
              style={{
                background: "linear-gradient(to bottom, #8A9A86 0%, rgba(138,154,134,0.70) 28%, rgba(138,154,134,0.48) 58%, rgba(138,154,134,0.82) 100%)",
              }}
            />

            {/* Gravity label */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-8 text-center">
              <p className="mb-5 text-[10px] uppercase tracking-[0.28em] text-[#1A221E]/25 transition-colors duration-500 group-hover:text-[#1A221E]/50">
                {lang === "bg" ? "Следващ проект" : "Next Project"}
              </p>

              <h2
                className="font-light tracking-tight text-[#1A221E]/55 transition-all duration-700 group-hover:text-[#1A221E]"
                style={{
                  fontSize:   "clamp(2rem, 4.5vw, 4.2rem)",
                  lineHeight: 1.06,
                  maxWidth:   "20ch",
                }}
              >
                {nextProject.title}
              </h2>

              {nextProject.category && (
                <p
                  className="mt-3 font-light text-[#1A221E]/25 transition-colors duration-500 group-hover:text-[#1A221E]/50"
                  style={{ fontSize: "13px" }}
                >
                  {nextProject.category}
                </p>
              )}

              <div className="mt-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[#1A221E]/20 transition-all duration-500 group-hover:gap-4 group-hover:text-[#1A221E]/55">
                <span>{lang === "bg" ? "Влез" : "Enter"}</span>
                <span className="inline-block transition-transform duration-500 group-hover:translate-x-1.5">→</span>
              </div>
            </div>
          </section>
        )}

        {/* Floor rule */}
        <div style={{ height: "1px", background: "rgba(26,34,30,0.08)" }} />

      </div>{/* /scrollable canvas */}
    </div>
  )

  return createPortal(modal, document.body)
}
