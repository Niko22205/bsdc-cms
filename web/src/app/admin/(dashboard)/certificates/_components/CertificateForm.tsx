"use client"

import { useActionState } from "react"
import Link from "next/link"
import type { CertificateFormState } from "../actions"

type CertificateFormInitial = {
  language?: string
  translationKey?: string
  title?: string
  issuer?: string | null
  issueDate?: string | null
  fileUrl?: string | null
  imageUrl?: string | null
  description?: string | null
  sortOrder?: number
  published?: boolean
}

type Props = {
  action: (prev: CertificateFormState, formData: FormData) => Promise<CertificateFormState>
  initial?: CertificateFormInitial
  submitLabel: string
}

const inputCls =
  "w-full rounded-lg border border-white/[0.10] bg-white/[0.04] px-3 py-2.5 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-[#B87333]/50 focus:ring-1 focus:ring-[#B87333]/20"

const labelCls = "flex flex-col gap-1.5 text-sm font-medium text-slate-300"

export function CertificateForm({ action, initial = {}, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex gap-4">
        <label className={`${labelCls} w-28`}>
          Language *
          <select name="language" defaultValue={initial.language ?? "BG"} className={inputCls}>
            <option value="BG">BG</option>
            <option value="EN">EN</option>
          </select>
          {state.errors?.language && (
            <span className="text-xs text-red-400">{state.errors.language}</span>
          )}
        </label>

        <label className={`${labelCls} flex-1`}>
          Translation Key *
          <input
            name="translationKey"
            type="text"
            defaultValue={initial.translationKey ?? ""}
            placeholder="e.g. iso-9001"
            className={inputCls}
          />
          {state.errors?.translationKey && (
            <span className="text-xs text-red-400">{state.errors.translationKey}</span>
          )}
        </label>
      </div>

      <label className={labelCls}>
        Title *
        <input
          name="title"
          type="text"
          defaultValue={initial.title ?? ""}
          className={inputCls}
        />
        {state.errors?.title && (
          <span className="text-xs text-red-400">{state.errors.title}</span>
        )}
      </label>

      <div className="flex gap-4">
        <label className={`${labelCls} flex-1`}>
          Issuer
          <input
            name="issuer"
            type="text"
            defaultValue={initial.issuer ?? ""}
            placeholder="e.g. ISO International"
            className={inputCls}
          />
        </label>

        <label className={`${labelCls} w-44`}>
          Issue Date
          <input
            name="issueDate"
            type="date"
            defaultValue={initial.issueDate ?? ""}
            className={inputCls}
          />
        </label>
      </div>

      <div className="flex gap-4">
        <label className={`${labelCls} flex-1`}>
          File URL
          <input
            name="fileUrl"
            type="text"
            defaultValue={initial.fileUrl ?? ""}
            placeholder="https://... (PDF or document)"
            className={inputCls}
          />
        </label>

        <label className={`${labelCls} flex-1`}>
          Image URL
          <input
            name="imageUrl"
            type="text"
            defaultValue={initial.imageUrl ?? ""}
            placeholder="https://... (certificate image)"
            className={inputCls}
          />
        </label>
      </div>

      <label className={labelCls}>
        Description
        <textarea
          name="description"
          defaultValue={initial.description ?? ""}
          rows={3}
          className={`${inputCls} resize-y`}
        />
      </label>

      <div className="flex items-end gap-6">
        <label className={`${labelCls} w-28`}>
          Sort Order
          <input
            name="sortOrder"
            type="number"
            defaultValue={initial.sortOrder ?? 0}
            className={inputCls}
          />
        </label>

        <label className="flex items-center gap-2 pb-2 text-sm font-medium text-slate-300">
          <input
            name="published"
            type="checkbox"
            defaultChecked={initial.published ?? false}
            className="h-4 w-4 rounded border-white/[0.20] bg-white/[0.08] accent-[#B87333]"
          />
          Published
        </label>
      </div>

      <div className="flex items-center gap-4 border-t border-white/[0.06] pt-5">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#B87333] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c8833a] disabled:opacity-50"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link href="/admin/certificates" className="text-sm text-slate-500 transition hover:text-slate-300">
          Cancel
        </Link>
      </div>
    </form>
  )
}
