"use client"

import { useActionState } from "react"
import type { MediaFormState } from "../actions"
import type { createMediaRecord } from "../actions"

type Action = typeof createMediaRecord

const MIME_OPTIONS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
]

const inputCls =
  "w-full rounded-lg border border-white/[0.10] bg-white/[0.04] px-3 py-2.5 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-[#B87333]/50 focus:ring-1 focus:ring-[#B87333]/20"

const labelCls = "text-sm font-medium text-slate-300"

type Props = {
  action: Action
}

export function MediaForm({ action }: Props) {
  const [state, formAction, pending] = useActionState<MediaFormState, FormData>(action, {})

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>
          File URL <span className="text-red-400">*</span>
        </label>
        <input name="url" type="text" placeholder="https://..." className={inputCls} />
        {state.errors?.url && (
          <p className="text-xs text-red-400">{state.errors.url}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>
          Filename <span className="text-red-400">*</span>
        </label>
        <input name="filename" type="text" placeholder="image.jpg" className={inputCls} />
        {state.errors?.filename && (
          <p className="text-xs text-red-400">{state.errors.filename}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>
          MIME Type <span className="text-red-400">*</span>
        </label>
        <select name="mimeType" className={inputCls}>
          <option value="">Select type…</option>
          {MIME_OPTIONS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        {state.errors?.mimeType && (
          <p className="text-xs text-red-400">{state.errors.mimeType}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>
          Size{" "}
          <span className="font-normal text-slate-600">(bytes, 0 if unknown)</span>
        </label>
        <input name="size" type="number" min="0" defaultValue="0" className={inputCls} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>Alt Text</label>
        <input name="altText" type="text" className={inputCls} />
      </div>

      <div className="border-t border-white/[0.06] pt-5">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#B87333] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c8833a] disabled:opacity-50"
        >
          {pending ? "Saving…" : "Register"}
        </button>
      </div>
    </form>
  )
}
