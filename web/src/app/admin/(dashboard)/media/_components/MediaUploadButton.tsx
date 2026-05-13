"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, Check, AlertCircle, Loader2 } from "lucide-react"

export function MediaUploadButton() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle")
  const router = useRouter()

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus("uploading")
    const form = new FormData()
    form.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form })
      if (!res.ok) throw new Error("Upload failed")
      setStatus("done")
      router.refresh()
      setTimeout(() => setStatus("idle"), 2200)
    } catch {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 2500)
    }
    e.target.value = ""
  }

  const isDone = status === "done"
  const isError = status === "error"
  const isUploading = status === "uploading"

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*,.pdf,.svg"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60"
        style={{
          background: isDone ? "#059669" : isError ? "#dc2626" : "#B87333",
        }}
      >
        {isUploading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : isDone ? (
          <Check size={15} />
        ) : isError ? (
          <AlertCircle size={15} />
        ) : (
          <Upload size={15} />
        )}
        {isUploading ? "Uploading…" : isDone ? "Uploaded!" : isError ? "Failed" : "Upload File"}
      </button>
    </>
  )
}
