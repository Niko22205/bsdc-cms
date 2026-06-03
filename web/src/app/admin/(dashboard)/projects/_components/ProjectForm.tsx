"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { RichTextEditor } from "../../../_components/ui/RichTextEditor"
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
  equipmentUsed?: string[]
  activitiesDone?: string[]
  category?: string | null
  location?: string | null
  client?: string | null
  publishedAt?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  modalLayout?: string | null
  sortOrder?: number
  published?: boolean
}

type Props = {
  action: (prev: ProjectFormState, formData: FormData) => Promise<ProjectFormState>
  initial?: ProjectFormInitial
  submitLabel: string
}

const inputCls =
  "w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"

const labelCls = "flex flex-col gap-1.5 text-sm font-medium text-zinc-700"

export function ProjectForm({ action, initial = {}, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {})
  const [equipment, setEquipment] = useState<string[]>(initial.equipmentUsed ?? [])
  const [activities, setActivities] = useState<string[]>(initial.activitiesDone ?? [])

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
            <span className="text-xs text-red-500">{state.errors.language}</span>
          )}
        </label>

        <label className={`${labelCls} w-36`}>
          Type *
          <select name="type" defaultValue={initial.type ?? "PROJECT"} className={inputCls}>
            <option value="PROJECT">Project</option>
            <option value="NEWS">News</option>
          </select>
          {state.errors?.type && (
            <span className="text-xs text-red-500">{state.errors.type}</span>
          )}
        </label>

        <label className={`${labelCls} flex-1`}>
          Translation Key *
          <input
            name="translationKey"
            type="text"
            defaultValue={initial.translationKey ?? ""}
            placeholder="e.g. office-renovation"
            className={inputCls}
          />
          {state.errors?.translationKey && (
            <span className="text-xs text-red-500">{state.errors.translationKey}</span>
          )}
        </label>
      </div>

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
            <span className="text-xs text-red-500">{state.errors.title}</span>
          )}
        </label>

        <label className={`${labelCls} flex-1`}>
          Slug *
          <input
            name="slug"
            type="text"
            defaultValue={initial.slug ?? ""}
            placeholder="e.g. office-renovation"
            className={inputCls}
          />
          {state.errors?.slug && (
            <span className="text-xs text-red-500">{state.errors.slug}</span>
          )}
        </label>
      </div>

      <div className="flex gap-4">
        <label className={`${labelCls} flex-1`}>
          Category
          <input
            name="category"
            type="text"
            defaultValue={initial.category ?? ""}
            placeholder="e.g. Commercial"
            className={inputCls}
          />
        </label>

        <label className={`${labelCls} flex-1`}>
          Location
          <input
            name="location"
            type="text"
            defaultValue={initial.location ?? ""}
            placeholder="e.g. Sofia, Bulgaria"
            className={inputCls}
          />
        </label>

        <label className={`${labelCls} flex-1`}>
          Client
          <input
            name="client"
            type="text"
            defaultValue={initial.client ?? ""}
            placeholder="e.g. Municipality of Sofia"
            className={inputCls}
          />
        </label>
      </div>

      <div className="flex gap-4">
        <label className={`${labelCls} flex-1`}>
          Published At
          <input
            name="publishedAt"
            type="datetime-local"
            defaultValue={initial.publishedAt ?? ""}
            className={inputCls}
          />
        </label>
      </div>

      <label className={labelCls}>
        Excerpt
        <textarea
          name="excerpt"
          defaultValue={initial.excerpt ?? ""}
          rows={2}
          className={`${inputCls} resize-y`}
        />
      </label>

      <div className={labelCls}>
        Content
        <RichTextEditor
          name="content"
          defaultValue={initial.content ?? ""}
          placeholder="Write the full content for this item…"
        />
      </div>

      <label className={labelCls}>
        Featured Image URL
        <input
          name="featuredImageUrl"
          type="text"
          defaultValue={initial.featuredImageUrl ?? ""}
          className={inputCls}
        />
      </label>

      <label className={labelCls}>
        Image URLs
        <span className="text-xs font-normal text-zinc-400">One URL per line</span>
        <textarea
          name="images"
          defaultValue={(initial.images ?? []).join("\n")}
          rows={3}
          className={`${inputCls} resize-y font-mono text-xs`}
        />
      </label>

      {/* ── Equipment used ── */}
      <div className={labelCls}>
        Equipment Used
        <input type="hidden" name="equipmentUsed" value={JSON.stringify(equipment)} />
        <div className="flex flex-col gap-1.5">
          {equipment.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={e => setEquipment(eq => eq.map((v, j) => j === i ? e.target.value : v))}
                className={inputCls}
                placeholder="Equipment item…"
              />
              <button type="button" onClick={() => setEquipment(eq => eq.filter((_, j) => j !== i))}
                className="shrink-0 rounded border border-zinc-200 px-2 text-zinc-400 hover:text-red-500">✕</button>
            </div>
          ))}
          <button type="button" onClick={() => setEquipment(eq => [...eq, ""])}
            className="self-start rounded border border-dashed border-zinc-300 px-3 py-1.5 text-xs text-zinc-500 hover:border-indigo-400 hover:text-indigo-600">
            + Add Equipment
          </button>
        </div>
      </div>

      {/* ── Activities done ── */}
      <div className={labelCls}>
        Activities Done
        <input type="hidden" name="activitiesDone" value={JSON.stringify(activities)} />
        <div className="flex flex-col gap-1.5">
          {activities.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={e => setActivities(ac => ac.map((v, j) => j === i ? e.target.value : v))}
                className={inputCls}
                placeholder="Activity…"
              />
              <button type="button" onClick={() => setActivities(ac => ac.filter((_, j) => j !== i))}
                className="shrink-0 rounded border border-zinc-200 px-2 text-zinc-400 hover:text-red-500">✕</button>
            </div>
          ))}
          <button type="button" onClick={() => setActivities(ac => [...ac, ""])}
            className="self-start rounded border border-dashed border-zinc-300 px-3 py-1.5 text-xs text-zinc-500 hover:border-indigo-400 hover:text-indigo-600">
            + Add Activity
          </button>
        </div>
      </div>

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

        <label className={`${labelCls} w-52`}>
          Modal Layout
          <select name="modalLayout" defaultValue={initial.modalLayout ?? "CINEMATIC_SPLIT"} className={inputCls}>
            <option value="CINEMATIC_SPLIT">Cinematic Split</option>
            <option value="EDITORIAL_STORY">Editorial Story</option>
            <option value="MINIMAL_OVERLAY">Minimal Overlay</option>
          </select>
        </label>

        <label className="flex items-center gap-2 pb-2 text-sm font-medium text-zinc-700">
          <input
            name="published"
            type="checkbox"
            defaultChecked={initial.published ?? false}
            className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
          />
          Published
        </label>
      </div>

      <div className="flex items-center gap-4 border-t border-zinc-100 pt-5">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link href="/admin/projects" className="text-sm text-zinc-500 hover:text-zinc-700">
          Cancel
        </Link>
      </div>
    </form>
  )
}
