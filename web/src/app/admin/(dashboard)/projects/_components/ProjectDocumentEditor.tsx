"use client"

import { useRef, useState, useActionState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, X } from "lucide-react"
import { RichTextEditor } from "../../../_components/ui/RichTextEditor"
import { ImagePicker } from "../../../_components/ui/ImagePicker"
import { GalleryManager } from "../../../_components/ui/GalleryManager"
import { Badge } from "../../../_components/ui/Badge"
import type { ProjectFormState } from "../actions"

type ProjectFormInitial = {
  language?: string
  type?: string
  translationKey?: string
  title?: string
  slug?: string
  excerpt?: string | null
  content?: string | null
  featuredImageUrl?: string | null
  images?: string[]
  category?: string | null
  publishedAt?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  sortOrder?: number
  published?: boolean
}

type Props = {
  action: (prev: ProjectFormState, formData: FormData) => Promise<ProjectFormState>
  initial?: ProjectFormInitial
  submitLabel: string
}

type PreviewData = {
  title: string
  type: string
  category: string
  publishedAt: string
  excerpt: string
  content: string
  featuredImageUrl: string
  published: boolean
}

const inputCls =
  "w-full rounded-lg border border-white/[0.10] bg-white/[0.04] px-3 py-2.5 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-[#B87333]/50 focus:ring-1 focus:ring-[#B87333]/20"

const labelCls = "flex flex-col gap-1.5 text-sm font-medium text-slate-300"

const cardCls = "rounded-xl border border-white/[0.07] bg-white/[0.04] p-5"

export function ProjectDocumentEditor({ action, initial = {}, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {})
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  function openPreview() {
    if (!formRef.current) return
    const f = formRef.current
    const val = (name: string) =>
      (
        f.elements.namedItem(name) as
          | HTMLInputElement
          | HTMLTextAreaElement
          | HTMLSelectElement
          | null
      )?.value ?? ""
    const checked = (name: string) =>
      (f.elements.namedItem(name) as HTMLInputElement | null)?.checked ?? false

    setPreviewData({
      title: val("title"),
      type: val("type"),
      category: val("category"),
      publishedAt: val("publishedAt"),
      excerpt: val("excerpt"),
      content: val("content"),
      featuredImageUrl: val("featuredImageUrl"),
      published: checked("published"),
    })
    dialogRef.current?.showModal()
  }

  function closePreview() {
    dialogRef.current?.close()
    setPreviewData(null)
  }

  return (
    <>
      <form ref={formRef} action={formAction}>
        <div className="flex gap-6">
          {/* ── Main content column ── */}
          <div className="min-w-0 flex-1 space-y-5">
            <div className={`${cardCls} space-y-6`}>
              {/* Title */}
              <div className="border-b border-white/[0.06] pb-5">
                <input
                  name="title"
                  type="text"
                  defaultValue={initial.title ?? ""}
                  placeholder="Title"
                  className="w-full border-0 bg-transparent text-2xl font-bold leading-tight text-white outline-none placeholder:text-slate-700 focus:ring-0"
                />
                {state.errors?.title && (
                  <p className="mt-1 text-xs text-red-400">{state.errors.title}</p>
                )}
              </div>

              {/* Excerpt */}
              <div className={labelCls}>
                Excerpt
                <span className="text-xs font-normal text-slate-600">
                  Short summary shown in listings and cards
                </span>
                <textarea
                  name="excerpt"
                  defaultValue={initial.excerpt ?? ""}
                  rows={2}
                  placeholder="Brief description of this item…"
                  className={`${inputCls} resize-y`}
                />
              </div>

              {/* Featured image */}
              <ImagePicker
                name="featuredImageUrl"
                defaultValue={initial.featuredImageUrl}
                label="Featured Image"
                aspectRatio="video"
              />

              {/* Content */}
              <div className={labelCls}>
                Content
                <RichTextEditor
                  name="content"
                  defaultValue={initial.content ?? ""}
                  placeholder="Write the full article, project description, or news post…"
                />
              </div>

              {/* Gallery */}
              <div className={labelCls}>
                Gallery
                <span className="text-xs font-normal text-slate-600">
                  Drag to reorder · hover to remove
                </span>
                <GalleryManager
                  name="images"
                  defaultValue={initial.images ?? []}
                />
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="w-64 shrink-0 space-y-4">
            {/* Publish card */}
            <div className={`${cardCls} space-y-4`}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                  Status
                </p>
                {initial.published ? (
                  <Badge variant="green">Live</Badge>
                ) : (
                  <Badge variant="zinc">Draft</Badge>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <input
                  name="published"
                  type="checkbox"
                  defaultChecked={initial.published ?? false}
                  className="h-4 w-4 rounded border-white/[0.20] bg-white/[0.08] accent-[#B87333]"
                />
                Mark as published
              </label>

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-lg bg-[#B87333] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c8833a] disabled:opacity-50"
                >
                  {pending ? "Saving…" : submitLabel}
                </button>
                <button
                  type="button"
                  onClick={openPreview}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                >
                  <Eye size={14} />
                  Preview
                </button>
                <Link
                  href="/admin/projects"
                  className="block text-center text-sm text-slate-500 transition hover:text-slate-300"
                >
                  Cancel
                </Link>
              </div>
            </div>

            {/* Metadata card */}
            <div className={`${cardCls} space-y-4`}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                Metadata
              </p>
              <div className="flex gap-2">
                <label className={`${labelCls} w-[72px]`}>
                  Lang
                  <select
                    name="language"
                    defaultValue={initial.language ?? "BG"}
                    className={inputCls}
                  >
                    <option value="BG">BG</option>
                    <option value="EN">EN</option>
                  </select>
                  {state.errors?.language && (
                    <span className="text-xs text-red-400">{state.errors.language}</span>
                  )}
                </label>
                <label className={`${labelCls} flex-1`}>
                  Type
                  <select
                    name="type"
                    defaultValue={initial.type ?? "PROJECT"}
                    className={inputCls}
                  >
                    <option value="PROJECT">Project</option>
                    <option value="NEWS">News</option>
                  </select>
                  {state.errors?.type && (
                    <span className="text-xs text-red-400">{state.errors.type}</span>
                  )}
                </label>
              </div>

              <label className={labelCls}>
                Slug *
                <input
                  name="slug"
                  type="text"
                  defaultValue={initial.slug ?? ""}
                  placeholder="e.g. office-renovation"
                  className={inputCls}
                />
                {state.errors?.slug && (
                  <span className="text-xs text-red-400">{state.errors.slug}</span>
                )}
              </label>

              <label className={labelCls}>
                Translation Key *
                <input
                  name="translationKey"
                  type="text"
                  defaultValue={initial.translationKey ?? ""}
                  placeholder="e.g. office-renovation"
                  className={inputCls}
                />
                {state.errors?.translationKey && (
                  <span className="text-xs text-red-400">{state.errors.translationKey}</span>
                )}
              </label>

              <label className={labelCls}>
                Category
                <input
                  name="category"
                  type="text"
                  defaultValue={initial.category ?? ""}
                  placeholder="e.g. Commercial"
                  className={inputCls}
                />
              </label>

              <label className={labelCls}>
                Published At
                <input
                  name="publishedAt"
                  type="datetime-local"
                  defaultValue={initial.publishedAt ?? ""}
                  className={inputCls}
                />
              </label>

              <label className={labelCls}>
                Sort Order
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={initial.sortOrder ?? 0}
                  className={inputCls}
                />
              </label>
            </div>

            {/* SEO card */}
            <div className={`${cardCls} space-y-4`}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                SEO
              </p>
              <label className={labelCls}>
                SEO Title
                <input
                  name="seoTitle"
                  type="text"
                  defaultValue={initial.seoTitle ?? ""}
                  className={inputCls}
                />
              </label>
              <label className={labelCls}>
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
      </form>

      {/* ── Preview dialog ── */}
      <dialog
        ref={dialogRef}
        className="w-full max-w-3xl rounded-2xl border-0 bg-[#0c1524] p-0 shadow-2xl backdrop:bg-black/70"
        onClick={(e) => {
          if (e.target === dialogRef.current) closePreview()
        }}
      >
        {previewData && (
          <div className="flex flex-col">
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Preview</span>
                <Badge variant={previewData.published ? "green" : "zinc"}>
                  {previewData.published ? "Published" : "Draft"}
                </Badge>
                <Badge variant={previewData.type === "PROJECT" ? "blue" : "amber"}>
                  {previewData.type === "PROJECT" ? "Project" : "News"}
                </Badge>
              </div>
              <button
                type="button"
                onClick={closePreview}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/[0.08] hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[72vh] overflow-y-auto p-6">
              {previewData.featuredImageUrl && (
                <div className="mb-6 overflow-hidden rounded-xl">
                  <Image
                    src={previewData.featuredImageUrl}
                    alt={previewData.title || "Preview"}
                    width={720}
                    height={400}
                    unoptimized
                    className="h-56 w-full object-cover"
                  />
                </div>
              )}

              {(previewData.category || previewData.publishedAt) && (
                <div className="mb-3 flex items-center gap-3 text-xs text-slate-500">
                  {previewData.category && <span>{previewData.category}</span>}
                  {previewData.category && previewData.publishedAt && (
                    <span className="text-slate-700">·</span>
                  )}
                  {previewData.publishedAt && (
                    <span>{previewData.publishedAt.slice(0, 10)}</span>
                  )}
                </div>
              )}

              <h1 className="mb-4 text-2xl font-bold leading-tight text-white">
                {previewData.title || (
                  <span className="italic text-slate-600">No title</span>
                )}
              </h1>

              {previewData.excerpt && (
                <p className="mb-5 border-l-2 border-white/[0.10] pl-4 text-base leading-relaxed text-slate-300">
                  {previewData.excerpt}
                </p>
              )}

              {previewData.content ? (
                <div
                  className="prose prose-sm prose-invert max-w-none text-slate-300 prose-headings:text-white prose-a:text-[#B87333]"
                  dangerouslySetInnerHTML={{ __html: previewData.content }}
                />
              ) : (
                <p className="text-sm italic text-slate-600">No content yet.</p>
              )}
            </div>

            <div className="shrink-0 border-t border-white/[0.06] px-6 py-3">
              <p className="text-xs text-slate-600">
                This preview reflects the current form state. Save to make changes permanent.
              </p>
            </div>
          </div>
        )}
      </dialog>
    </>
  )
}
