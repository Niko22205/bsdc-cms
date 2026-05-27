"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
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
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil, Trash2 } from "lucide-react"
import { deletePartner, reorderPartners } from "../actions"

type PartnerRow = {
  id: string
  name: string
  logoUrl: string
  websiteUrl: string | null
  sortOrder: number
  published: boolean
}

function StatusDot({ published }: { published: boolean }) {
  return published ? (
    <span className="inline-flex items-center gap-1.5">
      <span className="block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
      <span className="text-xs text-emerald-400">Live</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5">
      <span className="block h-2 w-2 rounded-full bg-amber-400" />
      <span className="text-xs text-amber-500">Draft</span>
    </span>
  )
}

function SortableRow({ partner }: { partner: PartnerRow }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: partner.id })

  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        position: isDragging ? "relative" : undefined,
        zIndex: isDragging ? 10 : undefined,
      }}
      className="hover:bg-white/[0.02]"
    >
      <td className="w-8 px-2 py-3.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          suppressHydrationWarning
          className="cursor-grab touch-none text-slate-700 transition hover:text-slate-400 focus:outline-none active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical size={15} />
        </button>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex h-9 w-16 items-center justify-center overflow-hidden rounded-md border border-white/[0.10] bg-white/[0.06]">
          <Image
            src={partner.logoUrl}
            alt={partner.name}
            width={56}
            height={28}
            unoptimized
            className="max-h-7 w-auto object-contain"
          />
        </div>
      </td>
      <td className="px-4 py-3.5 font-medium text-slate-200">{partner.name}</td>
      <td className="max-w-[200px] px-4 py-3.5">
        {partner.websiteUrl ? (
          <a
            href={partner.websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="block truncate font-mono text-xs text-slate-500 transition hover:text-[#B87333] hover:underline"
          >
            {partner.websiteUrl}
          </a>
        ) : (
          <span className="text-slate-700">—</span>
        )}
      </td>
      <td className="px-4 py-3.5 text-xs text-slate-500">{partner.sortOrder}</td>
      <td className="px-4 py-3.5">
        <StatusDot published={partner.published} />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/partners/${partner.id}/edit`}
            title="Edit"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-[#B87333]"
          >
            <Pencil size={13} />
          </Link>
          <form action={deletePartner}>
            <input type="hidden" name="id" value={partner.id} />
            <button
              type="submit"
              title="Delete"
              onClick={(e) => {
                if (!confirm("Delete this partner? This cannot be undone.")) e.preventDefault()
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition hover:bg-red-500/[0.12] hover:text-red-400"
            >
              <Trash2 size={13} />
            </button>
          </form>
        </div>
      </td>
    </tr>
  )
}

export function SortablePartnerTable({ partners: initial }: { partners: PartnerRow[] }) {
  const [partners, setPartners] = useState(initial)
  const [, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = partners.findIndex((p) => p.id === active.id)
    const newIndex = partners.findIndex((p) => p.id === over.id)
    const reordered = arrayMove(partners, oldIndex, newIndex)
    setPartners(reordered)
    startTransition(() => {
      reorderPartners(reordered.map((p, i) => ({ id: p.id, sortOrder: i + 1 })))
    })
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.04]">
        <table className="w-full text-sm">
          <thead className="border-b border-white/[0.05] bg-white/[0.02]">
            <tr>
              <th className="w-8 px-2 py-3" />
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Logo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Website</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Order</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <SortableContext items={partners.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <tbody className="divide-y divide-white/[0.04]">
              {partners.map((p) => (
                <SortableRow key={p.id} partner={p} />
              ))}
            </tbody>
          </SortableContext>
        </table>
      </div>
    </DndContext>
  )
}
