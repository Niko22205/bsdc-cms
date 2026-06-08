"use client"

import React from "react"
import { Shield, Waves, Scan, ClipboardCheck, Layers, Building2, Award } from "lucide-react"
import type { AboutContent, Certificate } from "@/generated/prisma/client"
import TreasureMap from "@/components/about/TreasureMap"

interface WhyUsItem    { title: string; desc?: string }
interface TimelineItem { year: string | null; label: string; desc: string }

interface SceneAboutProps {
  aboutRef:       React.RefObject<HTMLDivElement | null>
  aboutScrollRef: React.RefObject<HTMLDivElement | null>
  about:          AboutContent | null
  aboutStats:     { value: string; label: string }[]
  whyUsSection:   { label: string }
  whyUsItems:     WhyUsItem[]
  timelineSection: { label: string }
  timelineItems:  TimelineItem[]
  certificates:   Certificate[]
  lang:           string
}

const WHY_US_ICONS = [Shield, Waves, Scan, ClipboardCheck, Layers, Building2]

export const SceneAbout = ({
  aboutRef, aboutScrollRef,
  about, aboutStats,
  whyUsSection, whyUsItems,
  timelineSection, timelineItems,
  certificates,
}: SceneAboutProps) => {
  return (
    <div ref={aboutRef} className="absolute inset-0" style={{ willChange: "opacity, transform" }}>
      <div className="absolute inset-0 flex bg-[#8A9A86]">

        {/* LEFT — scrollable content panel */}
        <div
          ref={aboutScrollRef}
          className="flex h-full w-full flex-col overflow-y-auto md:w-[48%]"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex flex-col justify-center px-8 py-12 md:px-11">

            {/* Eyebrow */}
            <div className="about-eyebrow mb-4 flex items-center gap-3">
              <div className="h-px w-8 bg-[#4A5343]" />
              <span className="text-[11px] uppercase tracking-[0.3em] text-[#1A221E]">
                {about?.subtitle ?? "BSDC"}
              </span>
            </div>

            {/* Title */}
            <h2 className="about-title mb-5 text-3xl font-light leading-tight text-[#1A221E] md:text-[2.2rem]">
              {about?.title ?? "За нас"}
            </h2>

            {/* Story text */}
            <div
              className="about-text mb-5 text-[13px] leading-relaxed text-[#1A221E]/70"
              dangerouslySetInnerHTML={{
                __html: (about?.content ?? "").replace(/\n\n+/g, "<br><br>"),
              }}
            />

            {/* Stats — about-specific only (20+, 50+, 24/7 — hero shows 2001/300м/6+) */}
            {aboutStats.length > 0 && (
              <div className="about-stats mb-6 grid grid-cols-3 gap-2">
                {aboutStats.map((stat, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center rounded border border-[#1A221E]/[0.15] bg-[#8A9A86]/[0.04] px-2 py-2.5 text-center"
                  >
                    <div
                      data-stat-value={stat.value}
                      className="text-lg font-light text-[#1A221E] md:text-xl"
                    >
                      {stat.value}
                    </div>
                    <div className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-[#1A221E]/50">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Why Us — 2-col icon list */}
            {whyUsItems.length > 0 && (
              <div className="mb-5">
                <div className="mb-2.5 flex items-center gap-2">
                  <div className="h-px w-5 bg-[#4A5343]" />
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#1A221E]">
                    {whyUsSection.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  {whyUsItems.map((item, i) => {
                    const Icon = WHY_US_ICONS[i % WHY_US_ICONS.length]
                    return (
                      <div key={i} className="flex items-start gap-2">
                        <Icon size={13} className="mt-[2px] flex-shrink-0 text-[#1A221E]" />
                        <span className="text-[12px] leading-snug text-[#1A221E]/70">{item.title}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Certificates — document cards */}
            {certificates.length > 0 && (
              <div className="mb-5">
                <div className="mb-2.5 flex items-center gap-2">
                  <div className="h-px w-5 bg-[#4A5343]" />
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#1A221E]">
                    Сертификати
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {certificates.slice(0, 6).map((cert) => (
                    <div
                      key={cert.id}
                      className="relative border border-[#1A221E]/20 bg-[#8A9A86]/[0.04] px-3 py-2.5"
                    >
                      {/* Corner fold accent */}
                      <div
                        className="pointer-events-none absolute right-0 top-0 h-0 w-0"
                        style={{
                          borderStyle: "solid",
                          borderWidth: "0 10px 10px 0",
                          borderColor: "transparent rgba(26,34,30,0.20) transparent transparent",
                        }}
                      />
                      <div className="mb-1 flex items-start gap-1.5">
                        <Award size={11} className="mt-[1px] flex-shrink-0 text-[#1A221E]" />
                        <span className="text-[11px] font-light leading-tight text-[#1A221E]">
                          {cert.title}
                        </span>
                      </div>
                      {cert.issuer && (
                        <div className="pl-[19px] text-[10px] leading-snug text-[#1A221E]/50">
                          {cert.issuer}
                        </div>
                      )}
                      {cert.issueDate && (
                        <div className="mt-1 pl-[19px] text-[9px] uppercase tracking-widest text-[#1A221E]/50">
                          {new Date(cert.issueDate).getFullYear()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile-only timeline list (map hidden on mobile) */}
            {timelineItems.length > 0 && (
              <div className="mt-2 md:hidden">
                <div className="mb-2.5 flex items-center gap-2">
                  <div className="h-px w-5 bg-[#4A5343]" />
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#1A221E]">
                    {timelineSection.label}
                  </span>
                </div>
                <ul className="space-y-3 border-l border-[#1A221E]/20 pl-4">
                  {timelineItems.map((item, i) => (
                    <li key={i} className="relative">
                      <div className="absolute -left-[17px] top-1.5 h-2.5 w-2.5 rounded-full border border-[#1A221E] bg-[#8A9A86]/20" />
                      {item.year && (
                        <div className="text-[10px] font-light uppercase tracking-widest text-[#1A221E]">
                          {item.year}
                        </div>
                      )}
                      <div className="text-[12px] font-light text-[#1A221E]">{item.label}</div>
                      <div className="text-[11px] leading-snug text-[#1A221E]/50">{item.desc}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT — expedition map (desktop only) */}
        <div className="about-image relative hidden h-full overflow-hidden md:block md:w-[52%]">
          {/* Solid dark base */}
          <div className="absolute inset-0 bg-[#8A9A86]" />

          {/* Fine engineering grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(26,34,30,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(26,34,30,0.06) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Gradient overlay: bleed into left panel */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#8A9A86] via-[#8A9A86]/30 to-transparent" />

          {/* Expedition map SVG overlay */}
          {timelineItems.length > 0 && (
            <TreasureMap items={timelineItems} />
          )}

          {/* Section label — bottom-right corner */}
          <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2">
            <div className="h-px w-5 bg-[#4A5343]/50" />
            <span className="text-[9px] uppercase tracking-[0.35em] text-[#8A9A86]/60">
              {timelineSection.label}
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
