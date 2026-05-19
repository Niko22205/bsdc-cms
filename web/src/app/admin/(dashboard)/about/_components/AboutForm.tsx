"use client"

import { useActionState, useState } from "react"
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
  whyUs?: unknown
  timeline?: unknown
}

type Props = {
  language: "BG" | "EN"
  action: Action
  initial?: AboutFormInitial
}

type WhyUsItem   = { title: string; desc: string }
type TimelineItem = { year: string; label: string; desc: string }

const inputCls =
  "w-full rounded-lg border border-white/[0.10] bg-white/[0.04] px-3 py-2.5 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-[#B87333]/50 focus:ring-1 focus:ring-[#B87333]/20"

const labelCls = "flex flex-col gap-1.5 text-sm font-medium text-slate-300"

const cardCls =
  "relative rounded-lg border border-white/[0.08] bg-white/[0.03] p-4 flex flex-col gap-3"

function initWhyUs(raw: unknown): WhyUsItem[] {
  if (!raw) return []
  const val =
    typeof raw === "string"
      ? (() => { try { return JSON.parse(raw) } catch { return null } })()
      : raw
  if (Array.isArray(val)) return val as WhyUsItem[]
  if (val && typeof val === "object" && Array.isArray((val as Record<string, unknown>).items))
    return (val as { items: WhyUsItem[] }).items
  return []
}

function initTimeline(raw: unknown): TimelineItem[] {
  if (!raw) return []
  const val =
    typeof raw === "string"
      ? (() => { try { return JSON.parse(raw) } catch { return null } })()
      : raw
  if (Array.isArray(val)) return val as TimelineItem[]
  if (val && typeof val === "object" && Array.isArray((val as Record<string, unknown>).items))
    return (val as { items: TimelineItem[] }).items
  return []
}

export function AboutForm({ language, action, initial = {} }: Props) {
  const [state, formAction, pending] = useActionState<AboutFormState, FormData>(action, {})

  const [whyUsItems, setWhyUsItems] = useState<WhyUsItem[]>(() =>
    initWhyUs(initial.whyUs),
  )
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>(() =>
    initTimeline(initial.timeline),
  )

  function updateWhyUs(i: number, field: keyof WhyUsItem, val: string) {
    setWhyUsItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item))
  }
  function removeWhyUs(i: number) {
    setWhyUsItems((prev) => prev.filter((_, idx) => idx !== i))
  }
  function addWhyUs() {
    setWhyUsItems((prev) => [...prev, { title: "", desc: "" }])
  }

  function updateTimeline(i: number, field: keyof TimelineItem, val: string) {
    setTimelineItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item))
  }
  function removeTimeline(i: number) {
    setTimelineItems((prev) => prev.filter((_, idx) => idx !== i))
  }
  function addTimeline() {
    setTimelineItems((prev) => [...prev, { year: "", label: "", desc: "" }])
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="language" value={language} />
      {/* Serialised JSON for server action */}
      <input type="hidden" name="whyUs"    value={JSON.stringify(whyUsItems)} />
      <input type="hidden" name="timeline" value={JSON.stringify(timelineItems)} />

      {/* ── Title / Subtitle ─────────────────────────────────────────────── */}
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

      {/* ── Content ──────────────────────────────────────────────────────── */}
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

      {/* ── Why Us ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className={labelCls}>Защо да ни изберете — Why Us Items</span>
          {state.errors?.whyUs && (
            <span className="text-xs text-red-400">{state.errors.whyUs}</span>
          )}
        </div>

        {whyUsItems.length === 0 && (
          <p className="rounded-lg border border-dashed border-white/[0.08] py-4 text-center text-xs text-slate-600">
            Няма добавени причини
          </p>
        )}

        {whyUsItems.map((item, i) => (
          <div key={i} className={cardCls}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">#{i + 1}</span>
              <button
                type="button"
                onClick={() => removeWhyUs(i)}
                className="text-xs text-red-400 transition hover:text-red-300"
              >
                Премахни
              </button>
            </div>
            <label className={labelCls}>
              Заглавие
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateWhyUs(i, "title", e.target.value)}
                placeholder="напр. Специализиран екип"
                className={inputCls}
              />
            </label>
            <label className={labelCls}>
              Описание
              <textarea
                rows={2}
                value={item.desc}
                onChange={(e) => updateWhyUs(i, "desc", e.target.value)}
                placeholder="Кратко описание…"
                className={`${inputCls} resize-y`}
              />
            </label>
          </div>
        ))}

        <button
          type="button"
          onClick={addWhyUs}
          className="self-start rounded-lg border border-dashed border-[#B87333]/40 px-4 py-2 text-xs text-[#B87333] transition hover:border-[#B87333]/70 hover:bg-[#B87333]/[0.06]"
        >
          + Добави причина
        </button>
      </div>

      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className={labelCls}>Развитие — Timeline</span>
          {state.errors?.timeline && (
            <span className="text-xs text-red-400">{state.errors.timeline}</span>
          )}
        </div>

        {timelineItems.length === 0 && (
          <p className="rounded-lg border border-dashed border-white/[0.08] py-4 text-center text-xs text-slate-600">
            Няма добавени събития
          </p>
        )}

        {timelineItems.map((item, i) => (
          <div key={i} className={cardCls}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">#{i + 1}</span>
              <button
                type="button"
                onClick={() => removeTimeline(i)}
                className="text-xs text-red-400 transition hover:text-red-300"
              >
                Премахни
              </button>
            </div>
            <div className="flex gap-3">
              <label className={`${labelCls} w-28 flex-shrink-0`}>
                Година
                <input
                  type="text"
                  value={item.year}
                  onChange={(e) => updateTimeline(i, "year", e.target.value)}
                  placeholder="2001"
                  className={inputCls}
                />
              </label>
              <label className={`${labelCls} flex-1`}>
                Заглавие
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => updateTimeline(i, "label", e.target.value)}
                  placeholder="напр. Начало"
                  className={inputCls}
                />
              </label>
            </div>
            <label className={labelCls}>
              Описание
              <textarea
                rows={2}
                value={item.desc}
                onChange={(e) => updateTimeline(i, "desc", e.target.value)}
                placeholder="Кратко описание на събитието…"
                className={`${inputCls} resize-y`}
              />
            </label>
          </div>
        ))}

        <button
          type="button"
          onClick={addTimeline}
          className="self-start rounded-lg border border-dashed border-[#B87333]/40 px-4 py-2 text-xs text-[#B87333] transition hover:border-[#B87333]/70 hover:bg-[#B87333]/[0.06]"
        >
          + Добави събитие
        </button>
      </div>

      {/* ── Submit ───────────────────────────────────────────────────────── */}
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
