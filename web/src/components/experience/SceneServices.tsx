"use client"

import React from "react"
import type { Service } from "@/generated/prisma/client"

// ── Service meta helpers (mirrored from PageExperience for renderServiceDetail) ─

type StatCard = { title: string; value: string; sub: string }

interface ServiceMeta {
  accent: string
  bg: string
  activities: string[]
  cards: StatCard[]
}

const SERVICE_META_FALLBACK: ServiceMeta[] = [
  { accent: "#4A5343", bg: "#8A9A86", activities: [], cards: [] },
  { accent: "#4A5343", bg: "#8A9A86", activities: [], cards: [] },
  { accent: "#4A5343", bg: "#8A9A86", activities: [], cards: [] },
  { accent: "#4A5343", bg: "#8A9A86", activities: [], cards: [] },
  { accent: "#4A5343", bg: "#8A9A86", activities: [], cards: [] },
  { accent: "#4A5343", bg: "#8A9A86", activities: [], cards: [] },
]

function resolveServiceMeta(svc: Service, svcIdx: number): ServiceMeta {
  const fallback = SERVICE_META_FALLBACK[svcIdx] ?? SERVICE_META_FALLBACK[0]
  const cards = Array.isArray(svc.statCards) && (svc.statCards as unknown[]).length > 0
    ? (svc.statCards as StatCard[])
    : fallback.cards
  return {
    accent:     svc.accentColor ?? fallback.accent,
    bg:         svc.bgColor     ?? fallback.bg,
    activities: (svc.activities?.length ?? 0) > 0 ? svc.activities : fallback.activities,
    cards,
  }
}

// ─────────────────────────────────────────────────────────────────────────────

interface SceneServicesProps {
  servicesRef:   React.RefObject<HTMLDivElement | null>
  innerGroupRef: React.RefObject<HTMLDivElement | null>
  services:      Service[]
  activeIdx:     number
  activeIdxRef:  React.MutableRefObject<number>
  scrollPos:     number
  scrollPosRef:  React.MutableRefObject<number>
  scrollVelRef:  React.MutableRefObject<number>
  rafIdRef:      React.MutableRefObject<number | null>
  lang:          string
  setActiveService: (s: Service | null) => void
  setActiveIdx:     (n: number) => void
  setScrollPos:     (n: number) => void
  setExpandedAct:   (a: number | null) => void
}

export const SceneServices = ({
  servicesRef, innerGroupRef,
  services, activeIdx, activeIdxRef,
  scrollPos, scrollPosRef, scrollVelRef, rafIdRef,
  lang, setActiveService, setActiveIdx, setScrollPos,
  setExpandedAct,
}: SceneServicesProps) => {
  return (
    <div ref={servicesRef} className="absolute inset-0" style={{ willChange: "opacity, transform" }}>

      {/* Atmospheric base */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "#8A9A86" }} />
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 90% 80% at 35% 55%, rgba(36,47,42,0.3) 0%, transparent 65%)" }} />
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 140% 140% at 50% 50%, transparent 30%, rgba(36,47,42,0.45) 100%)" }} />

      {/* Layout */}
      <div className="absolute inset-0 flex flex-col md:flex-row">

        {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
        <div className="services-menu relative z-10 flex w-full flex-shrink-0 flex-col justify-center overflow-hidden px-7 py-6 md:w-[42%] md:px-14 md:py-0">
          {/* Panel gradient */}
          <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to right, rgba(138,154,134,0.98) 0%, rgba(138,154,134,0.90) 75%, rgba(138,154,134,0.50) 100%)" }} />
          {/* Left copper rule */}
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-px" style={{ background: "linear-gradient(to bottom, transparent 5%, rgba(74,83,67,0.5) 35%, rgba(74,83,67,0.7) 50%, rgba(74,83,67,0.5) 65%, transparent 95%)" }} />

          <div className="relative z-10 flex flex-col justify-center">

            {/* Eyebrow */}
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px w-8 bg-[#4A5343]" />
              <span className="text-[9px] uppercase tracking-[0.45em] text-[#4A5343]">
                {lang === "bg" ? "BSDC · ОПЕРАЦИИ" : "BSDC · OPERATIONS"}
              </span>
            </div>

            {/* Counter */}
            <div className="svc-counter mb-2 font-mono text-[11px] tracking-[0.22em] text-[#1A221E]/30">
              {String(activeIdx + 1).padStart(2, "0")}
              <span className="mx-2 text-[#1A221E]/15">/</span>
              {String(services.length).padStart(2, "0")}
            </div>

            {/* Animated text block */}
            <div className="svc-text-block">
              <h2 className="mb-4 text-[1.85rem] font-light leading-[1.05] tracking-tight text-[#1A221E] md:text-[2.3rem]">
                {services[activeIdx]?.title ?? ""}
              </h2>

              {services[activeIdx]?.shortDescription && (
                <p className="mb-5 line-clamp-3 text-[13px] leading-relaxed text-[#1A221E]/55">
                  {services[activeIdx].shortDescription}
                </p>
              )}

              {/* Activity chips */}
              {(services[activeIdx]?.activities?.length ?? 0) > 0 && (
                <div className="mb-5 flex flex-wrap gap-1.5">
                  {services[activeIdx].activities.slice(0, 4).map((act, j) => (
                    <span
                      key={j}
                      className="border border-[#1A221E]/[0.08] bg-[#1A221E]/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.09em] text-[#1A221E]/55"
                    >
                      {act}
                    </span>
                  ))}
                </div>
              )}

              {/* Technical metadata */}
              {Array.isArray(services[activeIdx]?.statCards) && (services[activeIdx].statCards as StatCard[]).length > 0 && (
                <div className="mb-7 grid grid-cols-3 gap-2">
                  {(services[activeIdx].statCards as StatCard[]).map((card, j) => (
                    <div
                      key={j}
                      className="bg-white/[0.025] p-3"
                      style={{
                        borderLeft: `2px solid ${(services[activeIdx]?.accentColor ?? "#8A9A86")}38`,
                        borderBottom: "1px solid rgba(26,34,30,0.08)",
                      }}
                    >
                      <div className="mb-0.5 text-[9px] uppercase tracking-[0.2em] text-[#1A221E]/20">{card.title}</div>
                      <div className="text-base font-light leading-none text-[#1A221E]">{card.value}</div>
                      <div className="text-[10px] leading-snug text-[#1A221E]/40">{card.sub}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation row */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={activeIdx === 0}
                onClick={() => { if (activeIdx > 0) { const n = activeIdx - 1; activeIdxRef.current = n; setActiveIdx(n) } }}
                className="flex h-9 w-9 items-center justify-center border border-[#1A221E]/10 text-[#1A221E]/40 transition-all hover:border-[#1A221E]/25 hover:text-[#1A221E] disabled:cursor-not-allowed disabled:opacity-20"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M8.5 2.5L4 6.5l4.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="flex items-center gap-1.5">
                {services.map((_, j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => { activeIdxRef.current = j; setActiveIdx(j) }}
                    className="h-0.5 transition-all duration-300"
                    style={{
                      width: j === activeIdx ? "28px" : "8px",
                      background: j === activeIdx
                        ? (services[activeIdx]?.accentColor ?? "#4A5343")
                        : "rgba(26,34,30,0.18)",
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                disabled={activeIdx === services.length - 1}
                onClick={() => { if (activeIdx < services.length - 1) { const n = activeIdx + 1; activeIdxRef.current = n; setActiveIdx(n) } }}
                className="flex h-9 w-9 items-center justify-center border border-[#1A221E]/10 text-[#1A221E]/40 transition-all hover:border-[#1A221E]/25 hover:text-[#1A221E] disabled:cursor-not-allowed disabled:opacity-20"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M4.5 2.5L9 6.5l-4.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => services[activeIdx] && setActiveService(services[activeIdx])}
                className="ml-1 flex items-center gap-2 border border-[#1A221E]/12 bg-[#1A221E]/[0.04] px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-[#1A221E]/75 transition-all hover:border-[#1A221E]/25 hover:bg-[#1A221E]/[0.07] hover:text-[#1A221E]"
              >
                {lang === "bg" ? "Детайли" : "Details"}
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M1.5 5.5h8M6.5 2l3 3.5-3 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Compact service list — desktop only */}
            <div className="mt-6 hidden flex-col border-t border-[#1A221E]/[0.05] pt-4 md:flex">
              {services.map((svc, i) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => { activeIdxRef.current = i; setActiveIdx(i) }}
                  className={`flex items-center gap-3 py-1.5 text-left transition-colors ${i === activeIdx ? "text-[#1A221E]" : "text-[#1A221E]/30 hover:text-[#1A221E]/55"}`}
                >
                  <div
                    className="h-px flex-shrink-0 transition-all duration-300"
                    style={{
                      width: i === activeIdx ? "22px" : "9px",
                      background: i === activeIdx
                        ? (svc.accentColor ?? "#4A5343")
                        : "rgba(26,34,30,0.12)",
                    }}
                  />
                  <span className="text-[10px] uppercase tracking-[0.1em] leading-snug">{svc.title}</span>
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* ── RIGHT PANEL — vertical spiral staircase / tornado ────────── */}
        <div
          className="relative min-h-[55vw] flex-1 md:min-h-0"
          style={{
            perspective: "1200px",
            perspectiveOrigin: "50% 50%",
            overflow: "hidden",
          }}
          onMouseMove={(e) => {
            if (!innerGroupRef.current) return
            const rect = e.currentTarget.getBoundingClientRect()
            const x = (e.clientX - rect.left - rect.width / 2) / rect.width
            const y = (e.clientY - rect.top - rect.height / 2) / rect.height
            innerGroupRef.current.style.transform =
              `translateX(-50%) translateY(-50%) rotateY(${x * 7}deg) rotateX(${-y * 5}deg)`
          }}
          onMouseLeave={() => {
            if (!innerGroupRef.current) return
            innerGroupRef.current.style.transform =
              "translateX(-50%) translateY(-50%) rotateY(0deg) rotateX(0deg)"
          }}
        >
          {/* Atmospheric gradient */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 80% 90% at 55% 50%, rgba(36,47,42,0.2) 0%, rgba(36,47,42,0.5) 100%)" }}
          />

          {/* Top/bottom fade — softens the spiral ends */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32" style={{ background: "linear-gradient(to bottom, rgba(138,154,134,0.9) 0%, transparent 100%)" }} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32" style={{ background: "linear-gradient(to top, rgba(138,154,134,0.9) 0%, transparent 100%)" }} />

          {/* 3D pivot — zero-size anchor at viewport center */}
          <div
            ref={innerGroupRef}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "0",
              height: "0",
              transformStyle: "preserve-3d",
              transform: "translateX(-50%) translateY(-50%)",
              transition: "transform 0.3s ease",
            }}
          >
            {services.map((svc, i) => {
              // Float slot from continuous scrollPos — no snapping, no wrapping
              const slot    = i - scrollPos
              const absSlot = Math.abs(slot)

              // Cylinder geometry clamped to visible range (sin/cos would cycle for |slot|>3)
              const ANGLE_DEG = 42
              const R         = 580
              const eff       = Math.max(-2.5, Math.min(2.5, slot))
              const theta     = eff * ANGLE_DEG * (Math.PI / 180)
              const translateX = R * Math.sin(theta)
              const translateZ = R * (Math.cos(theta) - 1)
              // Vertical: large step so all visible cards fill the panel height
              const translateY = slot * 195
              const rotateY    = -eff * ANGLE_DEG

              const scale      = absSlot > 2 ? 0.3 : Math.max(0.55, 1 - absSlot * 0.10)
              const opacity    = absSlot > 2 ? 0 : Math.max(0.22, 1 - absSlot * 0.20)
              // Proximity to center (1 = exact center, 0 = 0.5+ slots away) — drives glow/border
              const proximity  = Math.max(0, 1 - absSlot * 2)
              const meta    = resolveServiceMeta(svc, i)
              const imgSrc  = svc.featuredImageUrl ?? svc.images?.[0] ?? null

              return (
                <div
                  key={svc.id}
                  style={{
                    position: "absolute",
                    width: "420px",
                    height: "268px",
                    marginLeft: "-210px",
                    marginTop: "-134px",
                    transform: `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                    opacity,
                    zIndex: 10 - absSlot,
                    backfaceVisibility: "hidden",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "opacity 0.25s ease, filter 0.25s ease",
                    filter: `grayscale(${(1 - proximity) * 22}%) brightness(${Math.max(0.5, 0.5 + proximity * 0.5)})`,
                    borderRadius: "3px",
                  }}
                  onClick={() => {
                    if (proximity > 0.85) {
                      setActiveService(svc); setExpandedAct(null)
                    } else {
                      // Animate to clicked card via RAF
                      scrollVelRef.current = 0
                      const target = i
                      const animateTo = () => {
                        const diff = target - scrollPosRef.current
                        if (Math.abs(diff) < 0.01) {
                          scrollPosRef.current = target
                          setScrollPos(target)
                          activeIdxRef.current = target
                          setActiveIdx(target)
                          rafIdRef.current = null
                          return
                        }
                        scrollPosRef.current += diff * 0.18
                        const rounded = Math.round(scrollPosRef.current)
                        if (rounded !== activeIdxRef.current) {
                          activeIdxRef.current = rounded
                          setActiveIdx(rounded)
                        }
                        setScrollPos(scrollPosRef.current)
                        rafIdRef.current = requestAnimationFrame(animateTo)
                      }
                      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
                      rafIdRef.current = requestAnimationFrame(animateTo)
                    }
                  }}
                >
                  {/* Image */}
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt=""
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(145deg, ${meta.bg} 0%, #8A9A86 100%)` }} />
                  )}

                  {/* Gradient overlay — lightens toward center */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `linear-gradient(to top, rgba(0,0,0,${0.88 - proximity * 0.06}) 0%, rgba(0,0,0,${0.35 - proximity * 0.27}) 100%)`,
                    }}
                  />

                  {/* Card label — fades in as card approaches center */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: proximity > 0.3 ? "18px 22px" : "12px 16px", opacity: proximity > 0.01 ? 1 : 0.6 }}>
                    {proximity > 0.3 && (
                      <div
                        style={{
                          fontFamily: "monospace",
                          fontSize: "10px",
                          fontWeight: 300,
                          letterSpacing: "0.3em",
                          color: meta.accent,
                          marginBottom: "6px",
                          textTransform: "uppercase",
                          opacity: proximity,
                        }}
                      >
                        {String(i + 1).padStart(2, "0")} — {lang === "bg" ? "АКТИВНА ОПЕРАЦИЯ" : "ACTIVE OPERATION"}
                      </div>
                    )}
                    <div style={{ color: "#1A221E", fontWeight: 300, fontSize: proximity > 0.3 ? "1.15rem" : "0.78rem", lineHeight: 1.2, marginBottom: proximity > 0.3 ? "10px" : 0 }}>
                      {svc.title}
                    </div>
                    {proximity > 0.3 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          color: meta.accent,
                          fontSize: "10px",
                          fontWeight: 300,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          opacity: proximity,
                        }}
                      >
                        {lang === "bg" ? "Виж услугата" : "View service"}
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                          <path d="M1.5 5.5h8M6.5 2l3 3.5-3 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Copper border — fades in with proximity */}
                  {proximity > 0.05 && (
                    <div style={{ position: "absolute", inset: 0, border: `1px solid rgba(74,83,67,${proximity * 0.6})`, pointerEvents: "none" }} />
                  )}

                  {/* HUD corner brackets — fade in with proximity */}
                  {proximity > 0.2 && (
                    <>
                      <div style={{ position: "absolute", top: 10, left: 10, width: 16, height: 16, borderTop: `2px solid ${meta.accent}`, borderLeft: `2px solid ${meta.accent}`, opacity: proximity, pointerEvents: "none" }} />
                      <div style={{ position: "absolute", top: 10, right: 10, width: 16, height: 16, borderTop: `2px solid ${meta.accent}`, borderRight: `2px solid ${meta.accent}`, opacity: proximity, pointerEvents: "none" }} />
                      <div style={{ position: "absolute", bottom: 10, left: 10, width: 16, height: 16, borderBottom: `2px solid ${meta.accent}`, borderLeft: `2px solid ${meta.accent}`, opacity: proximity, pointerEvents: "none" }} />
                      <div style={{ position: "absolute", bottom: 10, right: 10, width: 16, height: 16, borderBottom: `2px solid ${meta.accent}`, borderRight: `2px solid ${meta.accent}`, opacity: proximity, pointerEvents: "none" }} />
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {/* HUD labels */}
          <div className="pointer-events-none absolute right-7 top-7 flex items-center gap-2">
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: services[activeIdx]?.accentColor ?? "#4A5343",
                boxShadow: `0 0 7px ${services[activeIdx]?.accentColor ?? "#4A5343"}`,
              }}
            />
            <span className="font-mono text-[8px] uppercase tracking-[0.35em] text-[#1A221E]/20">
              MISSION CONTROL
            </span>
          </div>
          <div className="pointer-events-none absolute bottom-7 right-7 font-mono text-[8px] uppercase tracking-[0.28em] text-[#1A221E]/15">
            {lang === "bg" ? "BSDC — ПОДВОДНИ ОПЕРАЦИИ" : "BSDC — UNDERWATER OPS"}
          </div>
        </div>

      </div>
    </div>
  )
}
