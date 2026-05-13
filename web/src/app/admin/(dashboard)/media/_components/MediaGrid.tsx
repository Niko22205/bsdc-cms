"use client"

import { useState } from "react"
import Image from "next/image"
import { Copy, Check, Trash2, FileIcon } from "lucide-react"

type MediaRecord = {
  id: string
  url: string
  filename: string
  mimeType: string
  altText: string | null
}

type Props = {
  records: MediaRecord[]
  deleteAction: (formData: FormData) => void
}

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy URL"
      className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-white/[0.08] hover:text-slate-200"
    >
      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
    </button>
  )
}

export function MediaGrid({ records, deleteAction }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {records.map((m) => (
        <div
          key={m.id}
          className="group relative overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.04] transition hover:border-white/[0.12] hover:bg-white/[0.06]"
        >
          {/* Thumbnail */}
          <a href={m.url} target="_blank" rel="noreferrer" className="block">
            {m.mimeType.startsWith("image/") ? (
              <div className="relative h-36 w-full bg-white/[0.03]">
                <Image
                  src={m.url}
                  alt={m.altText ?? m.filename}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-36 w-full items-center justify-center bg-white/[0.03]">
                <FileIcon size={32} className="text-slate-700" />
              </div>
            )}
          </a>

          {/* Info */}
          <div className="px-3 py-2.5">
            <p
              className="truncate text-xs font-medium text-slate-300"
              title={m.filename}
            >
              {m.filename}
            </p>
            {m.altText && (
              <p className="mt-0.5 truncate text-xs text-slate-500" title={m.altText}>
                {m.altText}
              </p>
            )}
          </div>

          {/* Actions row */}
          <div className="flex items-center justify-between border-t border-white/[0.05] px-2.5 py-1.5">
            <CopyButton url={m.url} />
            <form action={deleteAction}>
              <input type="hidden" name="id" value={m.id} />
              <button
                type="submit"
                title="Delete"
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition hover:bg-red-500/[0.12] hover:text-red-400"
              >
                <Trash2 size={13} />
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  )
}
