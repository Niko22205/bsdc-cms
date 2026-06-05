"use client"

import React from "react"
import type { HomeContent } from "@/generated/prisma/client"

interface SceneHeroProps {
  active: boolean
  data: HomeContent | null
  lang: string
  heroRef: React.RefObject<HTMLDivElement | null>
}

export const SceneHero = ({ data, lang, heroRef }: SceneHeroProps) => {
  const eyebrowText =
    lang === "bg"
      ? "ПОДВОДНИ ТЕХНОЛОГИИ — ОТ 2001"
      : "UNDERWATER TECHNOLOGIES — SINCE 2001"

  const headline =
    data?.headline ??
    (lang === "bg" ? "Черноморски\nВодолазен Център" : "Black Sea\nDiving Center")

  const subheadline =
    data?.subheadline ??
    (lang === "bg"
      ? "Намирането на трайно решение е нашата крайна цел!"
      : "Finding a lasting solution is our ultimate goal!")

  return (
    <div ref={heroRef} className="absolute inset-0" style={{ willChange: "opacity, transform" }}>

      {/* ── Engineering wireframe background ───────────────────────────── */}
      <div className="hero-bg-wrapper absolute inset-0 w-full h-full overflow-hidden" style={{ background: "#8A9A86" }}>
        {/* Fine grid layer */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(26,34,30,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(26,34,30,0.06) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Major grid layer */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(26,34,30,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(26,34,30,0.10) 1px, transparent 1px)",
            backgroundSize: "200px 200px",
          }}
        />
        {/* SVG wireframe geometry */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.15, pointerEvents: "none" }}
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1440 900"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="720" cy="450" r="320" fill="none" stroke="#4A5343" strokeWidth="0.5" strokeDasharray="6 10" />
          <circle cx="720" cy="450" r="520" fill="none" stroke="#4A5343" strokeWidth="0.5" strokeDasharray="4 14" />
          <line x1="0" y1="900" x2="1440" y2="0" stroke="#4A5343" strokeWidth="0.4" strokeDasharray="8 16" />
          <line x1="0" y1="600" x2="900" y2="0" stroke="#4A5343" strokeWidth="0.3" strokeDasharray="5 20" />
          <line x1="600" y1="900" x2="1440" y2="200" stroke="#4A5343" strokeWidth="0.3" strokeDasharray="5 20" />
          <rect x="580" y="310" width="280" height="280" fill="none" stroke="#4A5343" strokeWidth="0.4" strokeDasharray="3 8" />
          <line x1="720" y1="0" x2="720" y2="900" stroke="#4A5343" strokeWidth="0.25" strokeDasharray="2 18" />
          <line x1="0" y1="450" x2="1440" y2="450" stroke="#4A5343" strokeWidth="0.25" strokeDasharray="2 18" />
        </svg>
        {/* Radial vignette to focus center */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 60% 60% at 50% 50%, transparent 30%, rgba(36,47,42,0.4) 100%)",
          }}
        />
      </div>

      {/* ── Light Control Layer 1 — diagonal vignette ───────────────────── */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top right, #8A9A86 0%, rgba(138,154,134,0.50) 45%, transparent 100%)",
          opacity: 0.7,
        }}
      />

      {/* ── Light Control Layer 2 — left edge shadow ────────────────────── */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(36,47,42,0.25) 0%, transparent 55%)",
        }}
      />

      {/* ── Center Anchor — TextArcEffect + BSDC wordmark ───────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
        {/* SVG arc eyebrow */}
        <div className="hero-eyebrow" style={{ width: 320, height: 100, position: "relative" }}>
          <svg
            viewBox="0 0 200 100"
            style={{ width: 320, height: 160, overflow: "visible", pointerEvents: "none", position: "absolute", top: 0, left: 0 }}
          >
            <defs>
              <path id="textArc" d="M 20,80 A 80,80 0 0,1 180,80" fill="transparent" />
            </defs>
            <text style={{ fontSize: "7px", fill: "#4A5343", letterSpacing: "0.45em" }}>
              <textPath href="#textArc" startOffset="50%" textAnchor="middle">
                {eyebrowText}
              </textPath>
            </text>
          </svg>
        </div>

        {/* BSDC wordmark */}
        <div className="hero-headline" style={{ marginTop: "-16px" }}>
          <span
            className="font-serif font-light uppercase"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              color: "#1A221E",
              letterSpacing: "0.1em",
            }}
          >
            BSDC
          </span>
        </div>
      </div>

      {/* ── Bottom-Left Anchor — main headline + sub ────────────────────── */}
      <div
        className="absolute z-20 flex flex-col items-start"
        style={{ bottom: "6rem", left: "clamp(3rem, 6vw, 6rem)", maxWidth: 600 }}
      >
        <h1
          className="hero-word font-serif font-light whitespace-pre-line"
          style={{
            fontSize: "clamp(2.2rem, 5vw, 4.2rem)",
            color: "#1A221E",
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
          }}
        >
          {headline}
        </h1>
        <p
          className="hero-sub font-sans font-light"
          style={{
            fontSize: 14,
            color: "rgba(26,34,30,0.65)",
            lineHeight: 1.75,
            marginTop: "1.5rem",
            maxWidth: 360,
          }}
        >
          {subheadline}
        </p>
      </div>

      {/* ── GSAP CTA anchor (no visual) ─────────────────────────────────── */}
      <div className="hero-cta" />

      {/* ── Bottom-Right Anchor — scroll indicator ──────────────────────── */}
      <div
        className="absolute z-20 flex flex-col items-center"
        style={{ bottom: "6rem", right: "clamp(3rem, 6vw, 6rem)", gap: "1rem" }}
      >
        <span
          className="font-mono uppercase"
          style={{ fontSize: 9, letterSpacing: "0.3em", color: "#4A5343" }}
        >
          SCROLL
        </span>
        <div
          className="animate-pulse"
          style={{ width: 1, height: 48, background: "rgba(74,83,67,0.5)" }}
        />
      </div>

    </div>
  )
}
