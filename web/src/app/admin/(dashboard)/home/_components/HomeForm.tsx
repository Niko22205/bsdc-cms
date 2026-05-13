"use client"

import { useActionState } from "react"
import { ImagePicker } from "../../../_components/ui/ImagePicker"
import type { HomeFormState } from "../actions"
import type { saveHomeContent } from "../actions"

type Action = typeof saveHomeContent

type HomeFormInitial = {
  headline?: string
  subheadline?: string | null
  eyebrow?: string | null
  ctaLabel?: string | null
  ctaTarget?: string | null
  ctaSecondaryLabel?: string | null
  ctaSecondaryTarget?: string | null
  heroImageUrl?: string | null
}

type Props = {
  language: "BG" | "EN"
  action: Action
  initial?: HomeFormInitial
}

const inputCls =
  "w-full rounded-lg border border-white/[0.10] bg-white/[0.04] px-3 py-2.5 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-[#B87333]/50 focus:ring-1 focus:ring-[#B87333]/20"

const labelCls = "flex flex-col gap-1.5 text-sm font-medium text-slate-300"

export function HomeForm({ language, action, initial = {} }: Props) {
  const [state, formAction, pending] = useActionState<HomeFormState, FormData>(action, {})

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="language" value={language} />

      <label className={labelCls}>
        Headline <span className="font-normal text-red-400">*</span>
        <input
          name="headline"
          type="text"
          defaultValue={initial.headline ?? ""}
          className={inputCls}
        />
        {state.errors?.headline && (
          <span className="text-xs text-red-400">{state.errors.headline}</span>
        )}
      </label>

      <label className={labelCls}>
        Subheadline
        <input
          name="subheadline"
          type="text"
          defaultValue={initial.subheadline ?? ""}
          className={inputCls}
        />
      </label>

      <label className={labelCls}>
        Eyebrow текст
        <input
          name="eyebrow"
          type="text"
          defaultValue={initial.eyebrow ?? ""}
          placeholder="ПОДВОДНИ ТЕХНОЛОГИИ — ОТ 2001"
          className={inputCls}
        />
      </label>

      <div className="flex gap-4">
        <label className={`${labelCls} flex-1`}>
          CTA Label
          <input
            name="ctaLabel"
            type="text"
            defaultValue={initial.ctaLabel ?? ""}
            className={inputCls}
          />
        </label>

        <label className={`${labelCls} flex-1`}>
          CTA Target URL
          <input
            name="ctaTarget"
            type="text"
            defaultValue={initial.ctaTarget ?? ""}
            placeholder="https://..."
            className={inputCls}
          />
        </label>
      </div>

      <div className="flex gap-4">
        <label className={`${labelCls} flex-1`}>
          Втори CTA бутон — текст
          <input
            name="ctaSecondaryLabel"
            type="text"
            defaultValue={initial.ctaSecondaryLabel ?? ""}
            placeholder="За нас"
            className={inputCls}
          />
        </label>

        <label className={`${labelCls} flex-1`}>
          Втори CTA бутон — линк
          <input
            name="ctaSecondaryTarget"
            type="text"
            defaultValue={initial.ctaSecondaryTarget ?? ""}
            placeholder="#about"
            className={inputCls}
          />
        </label>
      </div>

      <div className={labelCls}>
        Hero Image
        <span className="text-xs font-normal text-slate-600">
          Currently one image is displayed. A slider will be supported here in a future update.
        </span>
        <ImagePicker
          name="heroImageUrl"
          defaultValue={initial.heroImageUrl}
          aspectRatio="video"
        />
      </div>

      <div className="border-t border-white/[0.06] pt-5">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#B87333] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c8833a] disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  )
}
