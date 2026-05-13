"use client"

import { useActionState } from "react"
import Link from "next/link"
import type { PartnerFormState } from "../actions"

type PartnerFormInitial = {
  name?: string
  logoUrl?: string
  websiteUrl?: string | null
  sortOrder?: number
  published?: boolean
}

type Props = {
  action: (prev: PartnerFormState, formData: FormData) => Promise<PartnerFormState>
  initial?: PartnerFormInitial
  submitLabel: string
}

const inputCls =
  "w-full rounded-lg border border-white/[0.10] bg-white/[0.04] px-3 py-2.5 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-[#B87333]/50 focus:ring-1 focus:ring-[#B87333]/20"

const labelCls = "flex flex-col gap-1.5 text-sm font-medium text-slate-300"

export function PartnerForm({ action, initial = {}, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className={labelCls}>
        Name *
        <input name="name" type="text" defaultValue={initial.name ?? ""} className={inputCls} />
        {state.errors?.name && (
          <span className="text-xs text-red-400">{state.errors.name}</span>
        )}
      </label>

      <label className={labelCls}>
        Logo URL *
        <input
          name="logoUrl"
          type="text"
          defaultValue={initial.logoUrl ?? ""}
          placeholder="https://..."
          className={inputCls}
        />
        {state.errors?.logoUrl && (
          <span className="text-xs text-red-400">{state.errors.logoUrl}</span>
        )}
      </label>

      <label className={labelCls}>
        Website URL
        <input
          name="websiteUrl"
          type="text"
          defaultValue={initial.websiteUrl ?? ""}
          placeholder="https://..."
          className={inputCls}
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
        <Link href="/admin/partners" className="text-sm text-slate-500 transition hover:text-slate-300">
          Cancel
        </Link>
      </div>
    </form>
  )
}
