"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Upload, Library, X, Loader2 } from "lucide-react"
import { MediaPickerModal } from "./MediaPickerModal"

type Props = {
  name: string
  defaultValue?: string | null
  label?: string
  aspectRatio?: "video" | "square" | "portrait"
}

export function ImagePicker({
  name,
  defaultValue,
  label,
  aspectRatio = "video",
}: Props) {
  const [url, setUrl] = useState(defaultValue ?? "")
  const [uploading, setUploading] = useState(false)
  const [mediaOpen, setMediaOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (!res.ok) throw new Error("Upload failed")
      const data = (await res.json()) as { url: string }
      setUrl(data.url)
    } finally {
      setUploading(false)
    }
  }

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "portrait"
        ? "aspect-[3/4]"
        : "aspect-video"

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-sm font-medium text-slate-300">{label}</span>
      )}

      <input type="hidden" name={name} value={url} readOnly />

      {url ? (
        <div className="overflow-hidden rounded-xl border border-white/[0.10] bg-white/[0.04]">
          <div className={`relative w-full ${aspectClass} max-h-64`}>
            <Image
              src={url}
              alt="Preview"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
          <div className="flex items-center gap-2 border-t border-white/[0.06] px-3 py-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-white/[0.08] hover:text-slate-200 disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Upload size={12} />
              )}
              {uploading ? "Uploading…" : "Replace"}
            </button>
            <button
              type="button"
              onClick={() => setMediaOpen(true)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-white/[0.08] hover:text-slate-200"
            >
              <Library size={12} />
              Browse Library
            </button>
            <button
              type="button"
              onClick={() => setUrl("")}
              className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500/70 transition hover:bg-red-500/[0.10] hover:text-red-400"
            >
              <X size={12} />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/[0.08] bg-white/[0.03] py-8 transition hover:border-white/[0.12]">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 shadow-sm transition hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Upload size={15} />
            )}
            {uploading ? "Uploading…" : "Upload Image"}
          </button>
          <button
            type="button"
            onClick={() => setMediaOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-300"
          >
            <Library size={13} />
            Browse Media Library
          </button>
          <p className="text-xs text-slate-700">
            JPEG, PNG, WebP, GIF, SVG — max 10 MB
          </p>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) uploadFile(file)
          e.target.value = ""
        }}
      />

      {mediaOpen && (
        <MediaPickerModal
          onSelect={(selected) => {
            setUrl(selected)
            setMediaOpen(false)
          }}
          onClose={() => setMediaOpen(false)}
        />
      )}
    </div>
  )
}
