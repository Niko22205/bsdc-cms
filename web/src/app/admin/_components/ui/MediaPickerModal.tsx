"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { X, Search, ImageIcon, Loader2 } from "lucide-react"

type MediaRecord = {
  id: string
  url: string
  filename: string
  altText: string | null
  mimeType: string
}

type Props = {
  onSelect: (url: string) => void
  onClose: () => void
}

export function MediaPickerModal({ onSelect, onClose }: Props) {
  const [records, setRecords] = useState<MediaRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  useEffect(() => {
    fetch("/api/media")
      .then((r) => r.json())
      .then((data: MediaRecord[]) => {
        setRecords(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = records.filter((r) => {
    const q = query.toLowerCase()
    return (
      r.filename.toLowerCase().includes(q) ||
      (r.altText ?? "").toLowerCase().includes(q)
    )
  })

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[80vh]">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-zinc-900">Media Library</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X size={15} />
          </button>
        </div>

        {/* Search */}
        <div className="shrink-0 border-b border-zinc-100 px-4 py-3">
          <div className="relative">
            <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by filename…"
              className="w-full rounded-lg border border-zinc-200 py-2 pl-8 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
            />
          </div>
        </div>

        {/* Grid — flex-1 + min-h-0 allows overflow-y to engage inside a flex column */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-zinc-400">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-zinc-400">
              <ImageIcon size={28} />
              <p className="text-sm">
                {records.length === 0
                  ? "No images in library yet. Upload files to get started."
                  : "No results for your search."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-6">
              {filtered.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onSelect(r.url)}
                  title={r.altText ?? r.filename}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 transition hover:border-indigo-400 hover:ring-2 hover:ring-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <Image
                    src={r.url}
                    alt={r.altText ?? r.filename}
                    fill
                    unoptimized
                    className="object-cover transition group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="truncate text-[9px] font-medium text-white">
                      {r.filename}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-zinc-100 px-5 py-3">
          <p className="text-xs text-zinc-400">
            {records.length} file{records.length !== 1 ? "s" : ""} in library.
            Upload new files via the{" "}
            <a
              href="/admin/media"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 underline-offset-2 hover:underline"
            >
              Media Manager
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
