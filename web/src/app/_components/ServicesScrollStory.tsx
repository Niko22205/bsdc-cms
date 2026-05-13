"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"

export type ServiceStoryItem = {
  id: string
  title: string
  shortDescription: string | null
  content: string | null
  featuredImageUrl: string | null
  images: string[]
}

type Props = {
  services: ServiceStoryItem[]
}

export function ServicesScrollStory({ services }: Props) {
  const [activeId, setActiveId] = useState(services[0]?.id ?? "")

  // Per-service active image (starts from featuredImageUrl)
  const [activeImages, setActiveImages] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    services.forEach((s) => {
      if (s.featuredImageUrl) map[s.id] = s.featuredImageUrl
    })
    return map
  })

  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Track which panel is in the center of the viewport
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    services.forEach((s) => {
      const el = panelRefs.current[s.id]
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(s.id)
        },
        { threshold: 0.4 },
      )
      observer.observe(el)
      observers.push(observer)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [services])

  const scrollToPanel = useCallback((id: string) => {
    panelRefs.current[id]?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const swapImage = useCallback((serviceId: string, url: string) => {
    setActiveImages((prev) => ({ ...prev, [serviceId]: url }))
  }, [])

  return (
    <div className="flex">
      {/* ── Sticky numbered navigator — desktop only ── */}
      <aside className="hidden lg:block w-16 shrink-0">
        <div className="sticky top-[calc(50vh-120px)] flex flex-col gap-7 pl-3">
          {services.map((s, i) => (
            <button
              key={s.id}
              onClick={() => scrollToPanel(s.id)}
              className={`group flex items-center gap-2 transition-all duration-300 ${
                s.id === activeId ? "translate-x-0.5" : ""
              }`}
            >
              <span
                className={`text-xs font-bold tabular-nums leading-none transition-colors duration-300 ${
                  s.id === activeId
                    ? "text-white"
                    : "text-slate-600 group-hover:text-slate-400"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {/* tick line */}
              <span
                className={`block h-px transition-all duration-300 ${
                  s.id === activeId
                    ? "w-6 bg-sky-500"
                    : "w-3 bg-slate-700 group-hover:bg-slate-500"
                }`}
              />
            </button>
          ))}
        </div>
      </aside>

      {/* ── Service panels ── */}
      <div className="min-w-0 flex-1">
        {/* Mobile horizontal tab strip */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-4 pt-2 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {services.map((s, i) => (
            <button
              key={s.id}
              onClick={() => scrollToPanel(s.id)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                s.id === activeId
                  ? "bg-sky-600 text-white"
                  : "border border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
              }`}
            >
              <span className="opacity-60">{String(i + 1).padStart(2, "0")}</span>{" "}
              {s.title}
            </button>
          ))}
        </div>

        {services.map((s, i) => {
          const currentImg = activeImages[s.id] ?? s.featuredImageUrl
          // Deduplicate: featured first, then additional images
          const allImgs = [
            ...(s.featuredImageUrl ? [s.featuredImageUrl] : []),
            ...s.images.filter((u) => u !== s.featuredImageUrl),
          ]

          return (
            <div
              key={s.id}
              ref={(el) => {
                panelRefs.current[s.id] = el
              }}
              className={`grid min-h-screen border-t border-white/5 first:border-t-0 ${
                currentImg ? "lg:grid-cols-[1fr_45%]" : ""
              }`}
            >
              {/* Content column */}
              <div className="flex flex-col justify-center px-6 py-20 lg:px-12 lg:py-28">
                {/* Counter */}
                <span className="mb-6 block text-xs font-bold tabular-nums tracking-[0.2em] text-sky-500">
                  {String(i + 1).padStart(2, "0")} /{" "}
                  {String(services.length).padStart(2, "0")}
                </span>

                {/* Title */}
                <h3 className="text-4xl font-bold leading-tight tracking-tight text-white lg:text-5xl xl:text-6xl">
                  {s.title}
                </h3>

                {/* Short description */}
                {s.shortDescription && (
                  <p className="mt-5 max-w-md text-base leading-relaxed text-sky-200">
                    {s.shortDescription}
                  </p>
                )}

                {/* Rich HTML content */}
                {s.content && (
                  <div
                    className="mt-6 max-w-lg text-sm leading-relaxed text-slate-400 [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-widest [&_h3]:text-sky-400 [&_li]:mb-1.5 [&_li]:text-slate-400 [&_p]:mb-3 [&_p]:text-slate-400 [&_strong]:font-semibold [&_strong]:text-slate-200 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1"
                    dangerouslySetInnerHTML={{ __html: s.content }}
                  />
                )}

                {/* Gallery thumbnail strip */}
                {allImgs.length > 1 && (
                  <div className="mt-8 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {allImgs.map((url, ti) => (
                      <button
                        key={`${s.id}-${ti}`}
                        onClick={() => swapImage(s.id, url)}
                        className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-all duration-200 ${
                          url === currentImg
                            ? "opacity-100 ring-2 ring-sky-500 ring-offset-2 ring-offset-[#040c18]"
                            : "opacity-40 hover:opacity-70"
                        }`}
                      >
                        <Image
                          src={url}
                          alt=""
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Image column — full panel height, mobile: fixed height above content */}
              {currentImg ? (
                <div className="relative order-first h-72 overflow-hidden lg:order-last lg:h-auto">
                  <Image
                    key={currentImg}
                    src={currentImg}
                    alt={s.title}
                    fill
                    unoptimized
                    priority={i === 0}
                    className="object-cover animate-bsdc-fade-in"
                  />
                  {/* Left-edge vignette on desktop to blend with content */}
                  <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-[#040c18]/50 to-transparent lg:block" />
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
