"use client"

import { useActionState } from "react"
import Link from "next/link"
import { RichTextEditor } from "../../../_components/ui/RichTextEditor"
import { ImagePicker } from "../../../_components/ui/ImagePicker"
import { GalleryManager } from "../../../_components/ui/GalleryManager"
import { IconPicker } from "../../../_components/ui/IconPicker"
import type { ServiceFormState } from "../actions"
import type { ServiceModel } from "@/generated/prisma/models/Service"
import type { Prisma } from "@/generated/prisma/client"

type StatCard = { title: string; value: string; sub: string }

type Props = {
  action: (prev: ServiceFormState, formData: FormData) => Promise<ServiceFormState>
  initial?: Partial<ServiceModel>
  submitLabel: string
}

const inputCls =
  "w-full rounded-lg border border-white/[0.10] bg-white/[0.04] px-3 py-2.5 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-[#B87333]/50 focus:ring-1 focus:ring-[#B87333]/20"

const labelCls = "flex flex-col gap-1.5 text-sm font-medium text-slate-300"

const cardCls = "rounded-xl border border-white/[0.07] bg-white/[0.04] p-5 space-y-4"

const sectionTitle = "text-[10px] font-semibold uppercase tracking-widest text-slate-600"

export function ServiceForm({ action, initial = {}, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {})

  const existingCards = Array.isArray(initial.statCards)
    ? (initial.statCards as Prisma.JsonArray).map((c) => c as StatCard)
    : []

  return (
    <form action={formAction}>
      <div className="flex gap-6">

        {/* ── Left column: text fields ── */}
        <div className="min-w-0 flex-1 space-y-5">

          {/* Identity */}
          <div className={cardCls}>
            <p className={sectionTitle}>Идентификация</p>
            <div className="flex gap-4">
              <label className={`${labelCls} w-28`}>
                Език *
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
                  placeholder="e.g. underwater-inspection"
                  className={inputCls}
                />
                {state.errors?.translationKey && (
                  <span className="text-xs text-red-400">{state.errors.translationKey}</span>
                )}
              </label>
            </div>

            <div className="flex gap-4">
              <label className={`${labelCls} flex-1`}>
                Заглавие *
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
                Slug *
                <input
                  name="slug"
                  type="text"
                  defaultValue={initial.slug ?? ""}
                  placeholder="e.g. underwater-inspection"
                  className={inputCls}
                />
                {state.errors?.slug && (
                  <span className="text-xs text-red-400">{state.errors.slug}</span>
                )}
              </label>
            </div>

            <label className={labelCls}>
              Кратко описание
              <textarea
                name="shortDescription"
                defaultValue={initial.shortDescription ?? ""}
                rows={2}
                className={`${inputCls} resize-y`}
              />
            </label>
          </div>

          {/* Content */}
          <div className={cardCls}>
            <p className={sectionTitle}>Съдържание</p>
            <div className={labelCls}>
              <RichTextEditor
                name="content"
                defaultValue={initial.content ?? ""}
                placeholder="Опишете услугата подробно…"
              />
            </div>
          </div>

          {/* Activities */}
          <div className={cardCls}>
            <p className={sectionTitle}>Дейности (Activities)</p>
            <p className="text-xs text-slate-500">
              Всеки ред = отделна дейност. Показват се в детайл страницата на услугата.
            </p>
            <label className={labelCls}>
              <textarea
                name="activities"
                defaultValue={(initial.activities ?? []).join("\n")}
                rows={7}
                placeholder={"Подводни огледи и диагностика\nРемонти под вода — бетон, метал\nМонтаж и демонтаж на оборудване"}
                className={`${inputCls} resize-y font-mono text-xs leading-relaxed`}
              />
            </label>
          </div>

          {/* Stat Cards */}
          <div className={cardCls}>
            <p className={sectionTitle}>Статистически плочки (3 броя)</p>
            <p className="text-xs text-slate-500">
              Показват се като „факт карти" в детайл страницата — стойност + заглавие + подпис.
            </p>
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                    Плочка {i + 1}
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <label className={labelCls}>
                      Заглавие
                      <input
                        name={`stat${i}title`}
                        type="text"
                        defaultValue={existingCards[i]?.title ?? ""}
                        placeholder="Работна дълбочина"
                        className={inputCls}
                      />
                    </label>
                    <label className={labelCls}>
                      Стойност
                      <input
                        name={`stat${i}value`}
                        type="text"
                        defaultValue={existingCards[i]?.value ?? ""}
                        placeholder="50м+"
                        className={`${inputCls} font-mono`}
                      />
                    </label>
                    <label className={labelCls}>
                      Подпис
                      <input
                        name={`stat${i}sub`}
                        type="text"
                        defaultValue={existingCards[i]?.sub ?? ""}
                        placeholder="и по-дълбоко"
                        className={inputCls}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEO */}
          <div className={cardCls}>
            <p className={sectionTitle}>SEO</p>
            <div className="flex gap-4">
              <label className={`${labelCls} flex-1`}>
                SEO Title
                <input name="seoTitle" type="text" defaultValue={initial.seoTitle ?? ""} className={inputCls} />
              </label>
              <label className={`${labelCls} flex-1`}>
                SEO Description
                <textarea
                  name="seoDescription"
                  defaultValue={initial.seoDescription ?? ""}
                  rows={2}
                  className={`${inputCls} resize-y`}
                />
              </label>
            </div>
          </div>
        </div>

        {/* ── Right column: visual + publish ── */}
        <div className="w-72 shrink-0 space-y-4">

          {/* Visual style */}
          <div className={cardCls}>
            <p className={sectionTitle}>Визуален стил</p>
            <p className="text-xs text-slate-500">
              Цветовете управляват акцентите и фона в детайл изгледа.
            </p>
            <div className="flex gap-4">
              <label className={`${labelCls} flex-1`}>
                Акцентен цвят
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="accentColor"
                    defaultValue={initial.accentColor ?? "#B87333"}
                    className="h-9 w-9 flex-shrink-0 cursor-pointer rounded-lg border border-white/[0.10] bg-transparent p-0.5"
                  />
                  <span className="font-mono text-xs text-slate-400">
                    {initial.accentColor ?? "#B87333"}
                  </span>
                </div>
              </label>
              <label className={`${labelCls} flex-1`}>
                Фонов цвят
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="bgColor"
                    defaultValue={initial.bgColor ?? "#07111f"}
                    className="h-9 w-9 flex-shrink-0 cursor-pointer rounded-lg border border-white/[0.10] bg-transparent p-0.5"
                  />
                  <span className="font-mono text-xs text-slate-400">
                    {initial.bgColor ?? "#07111f"}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Icon Picker */}
          <div className={cardCls}>
            <IconPicker
              name="iconUrl"
              defaultValue={initial.iconUrl ?? ""}
              label="Икона на услугата"
            />
          </div>

          {/* Featured Image */}
          <div className={cardCls}>
            <ImagePicker
              name="featuredImageUrl"
              defaultValue={initial.featuredImageUrl}
              label="Главна снимка"
              aspectRatio="video"
            />
          </div>

          {/* Gallery */}
          <div className={cardCls}>
            <div className={labelCls}>
              <span>Галерия</span>
              <span className="text-xs font-normal text-slate-600">
                Влачи за наредба · задръж за изтриване
              </span>
              <GalleryManager
                name="images"
                defaultValue={initial.images ?? []}
              />
            </div>
          </div>

          {/* Publish */}
          <div className={cardCls}>
            <p className={sectionTitle}>Публикуване</p>

            <label className={`${labelCls} w-28`}>
              Наредба
              <input
                name="sortOrder"
                type="number"
                defaultValue={initial.sortOrder ?? 0}
                className={inputCls}
              />
            </label>

            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <input
                name="published"
                type="checkbox"
                defaultChecked={initial.published ?? false}
                className="h-4 w-4 rounded border-white/[0.20] bg-white/[0.08] accent-[#B87333]"
              />
              Публикувано
            </label>

            <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-4">
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-[#B87333] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c8833a] disabled:opacity-50"
              >
                {pending ? "Запазване…" : submitLabel}
              </button>
              <Link
                href="/admin/services"
                className="block text-center text-sm text-slate-500 transition hover:text-slate-300"
              >
                Отказ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
