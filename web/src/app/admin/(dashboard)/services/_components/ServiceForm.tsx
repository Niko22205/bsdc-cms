"use client"

import { useActionState } from "react"
import Link from "next/link"
import { RichTextEditor } from "../../../_components/ui/RichTextEditor"
import { ImagePicker } from "../../../_components/ui/ImagePicker"
import { GalleryManager } from "../../../_components/ui/GalleryManager"
import { IconPicker } from "../../../_components/ui/IconPicker"
import type { ServiceFormState } from "../actions"
import type { ServiceModel } from "@/generated/prisma/models/Service"

type Props = {
  action: (prev: ServiceFormState, formData: FormData) => Promise<ServiceFormState>
  initial?: Partial<ServiceModel>
  submitLabel: string
}

const inputCls =
  "w-full rounded-lg border border-white/[0.10] bg-white/[0.04] px-3 py-2.5 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-[#B87333]/50 focus:ring-1 focus:ring-[#B87333]/20"

const labelCls = "flex flex-col gap-1.5 text-sm font-medium text-slate-300"

const cardCls = "rounded-xl border border-white/[0.07] bg-white/[0.04] p-5 space-y-4"

export function ServiceForm({ action, initial = {}, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form action={formAction}>
      <div className="flex gap-6">

        {/* ── Left column: text fields ── */}
        <div className="min-w-0 flex-1 space-y-5">
          <div className={cardCls}>
            {/* Language + Translation Key */}
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
                  placeholder="e.g. underwater-inspection"
                  className={inputCls}
                />
                {state.errors?.translationKey && (
                  <span className="text-xs text-red-400">{state.errors.translationKey}</span>
                )}
              </label>
            </div>

            {/* Title + Slug */}
            <div className="flex gap-4">
              <label className={`${labelCls} flex-1`}>
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

            {/* Short Description */}
            <label className={labelCls}>
              Short Description
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
            <div className={labelCls}>
              <span>Content</span>
              <RichTextEditor
                name="content"
                defaultValue={initial.content ?? ""}
                placeholder="Describe this service in detail…"
              />
            </div>
          </div>

          {/* SEO */}
          <div className={cardCls}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">SEO</p>
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

        {/* ── Right column: visual assets + publish ── */}
        <div className="w-72 shrink-0 space-y-4">

          {/* Icon Picker */}
          <div className={cardCls}>
            <IconPicker
              name="iconUrl"
              defaultValue={initial.iconUrl ?? ""}
              label="Service Icon"
            />
          </div>

          {/* Featured Image */}
          <div className={cardCls}>
            <ImagePicker
              name="featuredImageUrl"
              defaultValue={initial.featuredImageUrl}
              label="Featured Image"
              aspectRatio="video"
            />
          </div>

          {/* Gallery */}
          <div className={cardCls}>
            <div className={labelCls}>
              <span>Gallery</span>
              <span className="text-xs font-normal text-slate-600">
                Drag to reorder · hover to remove
              </span>
              <GalleryManager
                name="images"
                defaultValue={initial.images ?? []}
              />
            </div>
          </div>

          {/* Publish settings */}
          <div className={cardCls}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Publish</p>

            <label className={`${labelCls} w-28`}>
              Sort Order
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
              Published
            </label>

            <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-4">
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-[#B87333] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c8833a] disabled:opacity-50"
              >
                {pending ? "Saving…" : submitLabel}
              </button>
              <Link
                href="/admin/services"
                className="block text-center text-sm text-slate-500 transition hover:text-slate-300"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
