"use client"

import { useActionState } from "react"
import type { ServiceFormState } from "../actions"
import type { ServiceModel } from "@/generated/prisma/models/Service"

type Props = {
  action: (prev: ServiceFormState, formData: FormData) => Promise<ServiceFormState>
  initial?: Partial<ServiceModel>
  submitLabel: string
}

const inputCls =
  "rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 w-full"

export function ServiceForm({ action, initial = {}, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <div className="flex gap-4">
        <label className="flex w-28 flex-col gap-1 text-sm font-medium text-zinc-700">
          Language *
          <select
            name="language"
            defaultValue={initial.language ?? "BG"}
            className={inputCls}
          >
            <option value="BG">BG</option>
            <option value="EN">EN</option>
          </select>
          {state.errors?.language && (
            <span className="text-xs text-red-500">{state.errors.language}</span>
          )}
        </label>

        <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-zinc-700">
          Translation Key *
          <input
            name="translationKey"
            type="text"
            defaultValue={initial.translationKey ?? ""}
            placeholder="e.g. web-design"
            className={inputCls}
          />
          {state.errors?.translationKey && (
            <span className="text-xs text-red-500">{state.errors.translationKey}</span>
          )}
        </label>
      </div>

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-zinc-700">
          Title *
          <input
            name="title"
            type="text"
            defaultValue={initial.title ?? ""}
            className={inputCls}
          />
          {state.errors?.title && (
            <span className="text-xs text-red-500">{state.errors.title}</span>
          )}
        </label>

        <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-zinc-700">
          Slug *
          <input
            name="slug"
            type="text"
            defaultValue={initial.slug ?? ""}
            placeholder="e.g. web-design"
            className={inputCls}
          />
          {state.errors?.slug && (
            <span className="text-xs text-red-500">{state.errors.slug}</span>
          )}
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Short Description
        <textarea
          name="shortDescription"
          defaultValue={initial.shortDescription ?? ""}
          rows={2}
          className={`${inputCls} resize-y`}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Content
        <textarea
          name="content"
          defaultValue={initial.content ?? ""}
          rows={6}
          className={`${inputCls} resize-y`}
        />
      </label>

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-zinc-700">
          Icon URL
          <input
            name="iconUrl"
            type="text"
            defaultValue={initial.iconUrl ?? ""}
            className={inputCls}
          />
        </label>

        <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-zinc-700">
          Featured Image URL
          <input
            name="featuredImageUrl"
            type="text"
            defaultValue={initial.featuredImageUrl ?? ""}
            className={inputCls}
          />
        </label>
      </div>

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-zinc-700">
          SEO Title
          <input
            name="seoTitle"
            type="text"
            defaultValue={initial.seoTitle ?? ""}
            className={inputCls}
          />
        </label>

        <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-zinc-700">
          SEO Description
          <textarea
            name="seoDescription"
            defaultValue={initial.seoDescription ?? ""}
            rows={2}
            className={`${inputCls} resize-y`}
          />
        </label>
      </div>

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
        <a href="/admin/services" className="text-sm text-zinc-500 hover:text-zinc-700">
          Cancel
        </a>
      </div>
    </form>
  )
}
