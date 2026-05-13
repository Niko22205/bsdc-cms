"use client"

import { useState } from "react"
import Image from "next/image"

export type ServiceTab = {
  id: string
  title: string
  shortDescription: string | null
  content: string | null
  featuredImageUrl: string | null
  images: string[]
}

export function ServicesTabs({ services }: { services: ServiceTab[] }) {
  const [activeId, setActiveId] = useState(services[0]?.id ?? "")
  const active = services.find((s) => s.id === activeId) ?? services[0]
  if (!active) return null

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {services.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveId(s.id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
              s.id === activeId
                ? "bg-sky-600 text-white shadow"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Detail panel */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-12">
        {active.featuredImageUrl && (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
            <Image
              src={active.featuredImageUrl}
              alt={active.title}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        )}

        <div className={!active.featuredImageUrl ? "lg:col-span-2" : ""}>
          <h3 className="text-2xl font-bold text-white">{active.title}</h3>
          {active.shortDescription && (
            <p className="mt-3 text-base leading-relaxed text-sky-200">
              {active.shortDescription}
            </p>
          )}
          {active.content && (
            <div
              className="mt-5 text-sm leading-relaxed text-slate-300 [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-widest [&_h3]:text-sky-400 [&_li]:mb-1 [&_li]:text-slate-300 [&_p]:mb-3 [&_p]:text-slate-300 [&_strong]:font-semibold [&_strong]:text-slate-100 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-0.5"
              dangerouslySetInnerHTML={{ __html: active.content }}
            />
          )}
        </div>
      </div>

      {/* Gallery strip */}
      {active.images.length > 0 && (
        <div className="mt-8 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {active.images.map((url, i) => (
            <div
              key={i}
              className="relative h-24 w-36 shrink-0 overflow-hidden rounded-xl border border-slate-700"
            >
              <Image src={url} alt="" fill unoptimized className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
