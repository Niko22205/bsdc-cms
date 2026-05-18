"use client"

import { useActionState } from "react"
import { RichTextEditor } from "../../../_components/ui/RichTextEditor"
import { ImagePicker } from "../../../_components/ui/ImagePicker"
import type { AboutFormState } from "../actions"
import type { saveAboutContent } from "../actions"

type Action = typeof saveAboutContent

type AboutFormInitial = {
  title?: string
  subtitle?: string | null
  content?: string
  imageUrl?: string | null
  statistics?: unknown
  whyUs?: unknown
  timeline?: unknown
}

type Props = {
  language: "BG" | "EN"
  action: Action
  initial?: AboutFormInitial
}

const inputCls =
  "w-full rounded-lg border border-white/[0.10] bg-white/[0.04] px-3 py-2.5 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-[#B87333]/50 focus:ring-1 focus:ring-[#B87333]/20"

const labelCls = "flex flex-col gap-1.5 text-sm font-medium text-slate-300"

function jsonDefault(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") return value
  return JSON.stringify(value, null, 2)
}

const WHY_US_EXAMPLE = `{"label":"Защо да ни изберете","items":[{"title":"Специализиран екип","desc":"Опит в подводни огледи и ремонти."}]}`
const TIMELINE_EXAMPLE = `{"label":"Развитие","items":[{"year":"2001","label":"Начало","desc":"Старт на дейността."},{"year":null,"label":"Курсове","desc":"Обучения по NAUI / CMAS."}]}`
const STATS_EXAMPLE = `[{"label":"Основана","value":"2001"},{"label":"Вида услуги","value":"6+"}]`

export function AboutForm({ language, action, initial = {} }: Props) {
  const [state, formAction, pending] = useActionState<AboutFormState, FormData>(action, {})

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="language" value={language} />

      <div className="flex gap-4">
        <label className={`${labelCls} flex-1`}>
          Title <span className="font-normal text-red-400">*</span>
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

        <label className={`${labelCls} flex-1`}>
          Subtitle
          <input
            name="subtitle"
            type="text"
            defaultValue={initial.subtitle ?? ""}
            className={inputCls}
          />
        </label>
      </div>

      <div className={labelCls}>
        Content <span className="font-normal text-red-400">*</span>
        <RichTextEditor
          name="content"
          defaultValue={initial.content ?? ""}
          placeholder="Write about the company…"
        />
        {state.errors?.content && (
          <span className="text-xs text-red-400">{state.errors.content}</span>
        )}
      </div>

      <ImagePicker
        name="imageUrl"
        defaultValue={initial.imageUrl}
        label="Section Image"
        aspectRatio="portrait"
      />

      {/* ── JSON fields ──────────────────────────────────────────────────── */}

      <label className={labelCls}>
        Защо да ни изберете — Why Us Items
        <span className="text-xs font-normal text-slate-500">
          JSON array — {WHY_US_EXAMPLE}
        </span>
        <textarea
          name="whyUs"
          rows={5}
          defaultValue={jsonDefault(initial.whyUs)}
          placeholder={WHY_US_EXAMPLE}
          className={`${inputCls} resize-y font-mono text-xs`}
        />
        {state.errors?.whyUs && (
          <span className="text-xs text-red-400">{state.errors.whyUs}</span>
        )}
      </label>

      <label className={labelCls}>
        Развитие — Timeline Items
        <span className="text-xs font-normal text-slate-500">
          JSON array — {TIMELINE_EXAMPLE}
        </span>
        <textarea
          name="timeline"
          rows={7}
          defaultValue={jsonDefault(initial.timeline)}
          placeholder={TIMELINE_EXAMPLE}
          className={`${inputCls} resize-y font-mono text-xs`}
        />
        {state.errors?.timeline && (
          <span className="text-xs text-red-400">{state.errors.timeline}</span>
        )}
      </label>

      <label className={labelCls}>
        Statistics
        <span className="text-xs font-normal text-slate-500">
          JSON array — {STATS_EXAMPLE}
        </span>
        <textarea
          name="statistics"
          rows={4}
          defaultValue={jsonDefault(initial.statistics)}
          placeholder={STATS_EXAMPLE}
          className={`${inputCls} resize-y font-mono text-xs`}
        />
        {state.errors?.statistics && (
          <span className="text-xs text-red-400">{state.errors.statistics}</span>
        )}
      </label>

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
