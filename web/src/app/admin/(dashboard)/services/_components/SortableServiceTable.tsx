"use client"

import { useState, useTransition } from "react"
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
import { GripVertical, Pencil, Eye, Trash2 } from "lucide-react"
import { deleteService, reorderServices } from "../actions"

type ServiceRow = {
  id: string
  language: string
  title: string
  slug: string
  translationKey: string
  sortOrder: number
  published: boolean
}

function DeleteForm({ id }: { id: string }) {
  return (
    <form action={deleteService}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        title="Delete"
        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition hover:bg-red-500/[0.12] hover:text-red-400"
      >
        <Trash2 size={13} />
      </button>
    </form>
  )
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

function SortableRow({ service }: { service: ServiceRow }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: service.id })

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
          className="cursor-grab touch-none text-slate-700 transition hover:text-slate-400 focus:outline-none active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical size={15} />
        </button>
      </td>
      <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{service.language}</td>
      <td className="px-4 py-3.5 font-medium text-slate-200">{service.title}</td>
      <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{service.slug}</td>
      <td className="px-4 py-3.5 font-mono text-xs text-slate-600">{service.translationKey}</td>
      <td className="px-4 py-3.5 text-xs text-slate-500">{service.sortOrder}</td>
      <td className="px-4 py-3.5">
        <StatusDot published={service.published} />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/services/${service.id}/edit`}
            title="Edit"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-[#B87333]"
          >
            <Pencil size={13} />
          </Link>
          <Link
            href="/bg#services"
            target="_blank"
            title="View on site"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white/[0.06] hover:text-slate-300"
          >
            <Eye size={13} />
          </Link>
          <DeleteForm id={service.id} />
        </div>
      </td>
    </tr>
  )
}

export function SortableServiceTable({ services: initial }: { services: ServiceRow[] }) {
  const [services, setServices] = useState(initial)
  const [, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = services.findIndex((s) => s.id === active.id)
    const newIndex = services.findIndex((s) => s.id === over.id)
    const reordered = arrayMove(services, oldIndex, newIndex)
    setServices(reordered)
    startTransition(() => {
      reorderServices(reordered.map((s, i) => ({ id: s.id, sortOrder: i + 1 })))
    })
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.04]">
        <table className="w-full text-sm">
          <thead className="border-b border-white/[0.05] bg-white/[0.02]">
            <tr>
              <th className="w-8 px-2 py-3" />
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Lang</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Key</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Order</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <SortableContext items={services.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <tbody className="divide-y divide-white/[0.04]">
              {services.map((s) => (
                <SortableRow key={s.id} service={s} />
              ))}
            </tbody>
          </SortableContext>
        </table>
      </div>
    </DndContext>
  )
}
