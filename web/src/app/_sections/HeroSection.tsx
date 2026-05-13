"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import type { HomeContent } from "@/generated/prisma/client"

type Props = {
  home: HomeContent | null
}

export function HeroSection({ home }: Props) {
  const imgWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (imgWrapRef.current) imgWrapRef.current.style.willChange = "transform"
  }, [])

  if (!home) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#020617] px-6">
        <p className="text-slate-400">Добре дошли</p>
      </section>
    )
  }

  const words = home.headline.split(" ")

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#020617] text-white">
      <style>{`
        @keyframes kenburns {
          0%   { transform: scale(1.0) translateX(0px); }
          100% { transform: scale(1.12) translateX(-30px); }
        }
        @keyframes slideUp {
          from { transform: translateY(105%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      {/* Background image with Ken Burns */}
      {home.heroImageUrl && (
        <div className="absolute inset-0 overflow-hidden">
          <div
            ref={imgWrapRef}
            className="absolute inset-0"
            style={{ animation: "kenburns 12s ease-in-out infinite alternate" }}
          >
            <Image
              src={home.heroImageUrl}
              alt={home.headline}
              fill
              priority
              unoptimized
              className="object-cover"
            />
          </div>
          {/* Bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent" />
          {/* Left gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/90 via-[#020617]/40 to-transparent" />
          {/* Top gradient */}
          <div className="absolute left-0 right-0 top-0 h-40 bg-gradient-to-b from-[#020617]/60 to-transparent" />
        </div>
      )}

      {/* Grain texture */}
      <div className="absolute inset-0 z-[1] bg-[url('/noise.png')] opacity-[0.03]" />

      {/* Main content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center pl-16 md:pl-24">
        <div className="w-full max-w-5xl">
          {/* Copper accent line */}
          <div className="mb-8 h-16 w-[2px] bg-[#B87333]" />

          {/* Eyebrow */}
          <p className="animate-bsdc-fade-up bsdc-d1 mb-6 text-[11px] uppercase tracking-[0.35em] text-[#B87333]">
            Подводни технологии — от 2001
          </p>

          {/* H1 — word-by-word slide up */}
          <h1 className="mb-8 text-6xl font-black leading-[0.85] tracking-[-0.02em] text-white md:text-8xl">
            {words.map((word, i) => (
              <span key={i} className="mr-[0.22em] inline-block overflow-hidden">
                <span
                  className="inline-block"
                  style={{
                    animation: "slideUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
                    animationDelay: `${0.25 + i * 0.1}s`,
                  }}
                >
                  {word}
                </span>
              </span>
            ))}
          </h1>

          {/* Subheadline */}
          {home.subheadline && (
            <p className="animate-bsdc-fade-up bsdc-d3 mb-10 max-w-xs text-sm leading-relaxed tracking-wide text-slate-400">
              {home.subheadline}
            </p>
          )}

          {/* CTAs */}
          {home.ctaLabel && home.ctaTarget && (
            <div className="animate-bsdc-fade-up bsdc-d4 flex flex-wrap gap-4">
              <a
                href={home.ctaTarget}
                className="inline-flex items-center rounded-none bg-[#B87333] px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-[#a0622b]"
              >
                {home.ctaLabel}
              </a>
              <a
                href="#about"
                className="inline-flex items-center rounded-none border border-white/20 px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-white/70 transition-all duration-300 hover:border-white/40 hover:text-white"
              >
                За нас
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
        <span className="text-[9px] uppercase tracking-[0.3em] text-slate-500">Scroll</span>
        <div className="h-12 w-px animate-pulse bg-gradient-to-b from-[#B87333] to-transparent" />
      </div>

      {/* Stats strip */}
      <div className="animate-bsdc-fade-in bsdc-d5 absolute bottom-0 left-0 right-0 z-10 border-t border-white/[0.06] bg-[#020617]/40 backdrop-blur-sm">
        <div className="grid grid-cols-3">
          {[
            { value: "2001", label: "Основана" },
            { value: "300м", label: "Макс. дълбочина" },
            { value: "6+", label: "Вида услуги" },
          ].map((s) => (
            <div key={s.value} className="border-r border-white/[0.08] py-6 text-center last:border-r-0">
              <p className="text-3xl font-black text-white">{s.value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
