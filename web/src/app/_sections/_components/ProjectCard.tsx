"use client"

import { useState } from "react"
import Image from "next/image"
import { Modal } from "@/app/_components/Modal"

export type ProjectItem = {
  id: string
  title: string
  type: "PROJECT" | "NEWS"
  excerpt: string | null
  content: string | null
  featuredImageUrl: string | null
  images: string[]
  category: string | null
  publishedAt: string | null
}

export function ProjectCard({ project: p }: { project: ProjectItem }) {
  const [open, setOpen] = useState(false)
  const hasDetail = !!(p.excerpt || p.content || p.images.length > 0)

  return (
    <>
      <article
        className={`group overflow-hidden rounded-2xl border border-white/10 bg-[#0d1f33] transition duration-300 hover:border-sky-500/30 hover:shadow-lg hover:shadow-sky-900/20${
          hasDetail ? " cursor-pointer" : ""
        }`}
        onClick={hasDetail ? () => setOpen(true) : undefined}
        role={hasDetail ? "button" : undefined}
        tabIndex={hasDetail ? 0 : undefined}
        onKeyDown={
          hasDetail
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") setOpen(true)
              }
            : undefined
        }
      >
        {p.featuredImageUrl && (
          <div className="overflow-hidden">
            <Image
              src={p.featuredImageUrl}
              alt={p.title}
              width={400}
              height={224}
              unoptimized
              className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-sky-900/40 px-2.5 py-0.5 text-xs font-medium text-sky-400">
              {p.type === "PROJECT" ? "Проект" : "Новина"}
            </span>
            {p.publishedAt && (
              <span className="text-xs text-slate-500">{p.publishedAt}</span>
            )}
          </div>
          <h3 className="mt-3 text-base font-semibold text-white">{p.title}</h3>
          {p.excerpt && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-400">
              {p.excerpt}
            </p>
          )}
          {hasDetail && (
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-sky-500 transition group-hover:text-sky-400">
              Прочети повече
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M1 7h12M7 1l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </div>
      </article>

      <Modal open={open} onClose={() => setOpen(false)}>
        {p.featuredImageUrl && (
          <div className="relative">
            <Image
              src={p.featuredImageUrl}
              alt={p.title}
              width={800}
              height={400}
              unoptimized
              className="h-64 w-full object-cover"
            />
            <button
              onClick={() => setOpen(false)}
              aria-label="Затвори"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
            >
              ×
            </button>
          </div>
        )}
        <div className="p-6">
          {!p.featuredImageUrl && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setOpen(false)}
                aria-label="Затвори"
                className="text-slate-400 transition hover:text-white"
              >
                ×
              </button>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-sky-900/40 px-2.5 py-0.5 text-xs font-medium text-sky-400">
              {p.type === "PROJECT" ? "Проект" : "Новина"}
            </span>
            {p.category && (
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                {p.category}
              </span>
            )}
            {p.publishedAt && (
              <span className="text-xs text-slate-500">{p.publishedAt}</span>
            )}
          </div>
          <h2 className="mt-3 text-xl font-bold text-white">{p.title}</h2>
          {p.excerpt && !p.content && (
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{p.excerpt}</p>
          )}
          {p.content && (
            <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-400">
              {p.content}
            </div>
          )}
          {p.images.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              {p.images.map((img, i) => (
                <Image
                  key={i}
                  src={img}
                  alt={`${p.title} ${i + 1}`}
                  width={300}
                  height={200}
                  unoptimized
                  className="h-40 w-full rounded-lg object-cover"
                />
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}
