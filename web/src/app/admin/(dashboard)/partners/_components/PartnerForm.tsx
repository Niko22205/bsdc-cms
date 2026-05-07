"use client"

import { useActionState } from "react"
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
  "rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 w-full"

export function PartnerForm({ action, initial = {}, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Name *
        <input
          name="name"
          type="text"
          defaultValue={initial.name ?? ""}
          className={inputCls}
        />
        {state.errors?.name && (
          <span className="text-xs text-red-500">{state.errors.name}</span>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Logo URL *
        <input
          name="logoUrl"
          type="text"
          defaultValue={initial.logoUrl ?? ""}
          placeholder="https://..."
          className={inputCls}
        />
        {state.errors?.logoUrl && (
          <span className="text-xs text-red-500">{state.errors.logoUrl}</span>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
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
        <label className="flex w-28 flex-col gap-1 text-sm font-medium text-zinc-700">
          Sort Order
          <input
            name="sortOrder"
            type="number"
            defaultValue={initial.sortOrder ?? 0}
            className={inputCls}
          />
        </label>

        <label className="flex items-center gap-2 pb-2 text-sm font-medium text-zinc-700">
          <input
            name="published"
            type="checkbox"
            defaultChecked={initial.published ?? false}
            className="h-4 w-4 rounded border-zinc-300"
          />
          Published
        </label>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <a href="/admin/partners" className="text-sm text-zinc-500 hover:text-zinc-700">
          Cancel
        </a>
      </div>
    </form>
  )
}
