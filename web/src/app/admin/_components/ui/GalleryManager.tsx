"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { X, GripVertical, Upload, Library, Loader2, ImageIcon } from "lucide-react"
import { MediaPickerModal } from "./MediaPickerModal"

type ImageEntry = { id: string; url: string }
let uid = 0
function makeEntry(url: string): ImageEntry {
  return { id: `img-${++uid}`, url }
}

function SortableThumb({
  entry,
  onRemove,
}: {
  entry: ImageEntry
  onRemove: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
      }}
      className="group relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-white/[0.10] bg-white/[0.06]"
    >
      <Image src={entry.url} alt="" fill unoptimized className="object-cover" />

      <button
        type="button"
        {...attributes}
        {...listeners}
        suppressHydrationWarning
        className="absolute left-1 top-1 flex h-5 w-5 cursor-grab items-center justify-center rounded bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        tabIndex={-1}
      >
        <GripVertical size={10} />
      </button>

      <button
        type="button"
        onClick={() => onRemove(entry.id)}
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        <X size={10} />
      </button>
    </div>
  )
}

type Props = {
  name: string
  defaultValue?: string[]
}

export function GalleryManager({ name, defaultValue = [] }: Props) {
  const [entries, setEntries] = useState<ImageEntry[]>(() =>
    defaultValue.map(makeEntry),
  )
  const [uploading, setUploading] = useState(false)
  const [mediaOpen, setMediaOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setEntries((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  async function uploadFile(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (!res.ok) throw new Error("Upload failed")
      const data = (await res.json()) as { url: string }
      setEntries((prev) => [...prev, makeEntry(data.url)])
    } finally {
      setUploading(false)
    }
  }

  function addFromLibrary(url: string) {
    if (!entries.some((e) => e.url === url)) {
      setEntries((prev) => [...prev, makeEntry(url)])
    }
    setMediaOpen(false)
  }

  const serialized = entries.map((e) => e.url).join("\n")

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={serialized} readOnly />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={entries.map((e) => e.id)}
          strategy={rectSortingStrategy}
        >
          <div className="flex flex-wrap gap-2">
            {entries.map((entry) => (
              <SortableThumb
                key={entry.id}
                entry={entry}
                onRemove={(id) =>
                  setEntries((prev) => prev.filter((e) => e.id !== id))
                }
              />
            ))}

            {/* Add card */}
            <div className="flex h-24 w-32 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-white/[0.08] bg-white/[0.03]">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-200 disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Upload size={11} />
                )}
                {uploading ? "…" : "Upload"}
              </button>
              <button
                type="button"
                onClick={() => setMediaOpen(true)}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-200"
              >
                <Library size={11} />
                Library
              </button>
            </div>

            {entries.length === 0 && !uploading && (
              <p className="flex items-center gap-1.5 text-xs text-slate-700">
                <ImageIcon size={12} />
                No images yet — upload or choose from library
              </p>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) uploadFile(file)
          e.target.value = ""
        }}
      />

      {mediaOpen && (
        <MediaPickerModal
          onSelect={addFromLibrary}
          onClose={() => setMediaOpen(false)}
        />
      )}
    </div>
  )
}
