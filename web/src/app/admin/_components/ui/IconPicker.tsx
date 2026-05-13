"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { ICON_MAP, type IconName } from "@/lib/iconMap"

const ICON_NAMES = Object.keys(ICON_MAP) as IconName[]

type Props = {
  name: string
  defaultValue?: string | null
  label?: string
}

export function IconPicker({ name, defaultValue, label }: Props) {
  const [selected, setSelected] = useState<string>(defaultValue ?? "")
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  const filtered = ICON_NAMES.filter((n) =>
    n.toLowerCase().includes(query.toLowerCase()),
  )

  const SelectedIcon = selected ? ICON_MAP[selected] : null

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-sm font-medium text-zinc-700">{label}</span>
      )}

      <input type="hidden" name={name} value={selected} readOnly />

      {/* Trigger */}
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 shadow-sm">
          {SelectedIcon ? (
            <SelectedIcon size={32} />
          ) : (
            <span className="text-xs text-zinc-400">None</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-700">
            {selected || "No icon selected"}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="rounded-lg border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50"
            >
              {open ? "Close picker" : "Choose icon"}
            </button>
            {selected && (
              <button
                type="button"
                onClick={() => setSelected("")}
                className="flex items-center gap-1 text-xs font-medium text-red-500 transition hover:text-red-700"
              >
                <X size={11} />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Picker panel */}
      {open && (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
          {/* Search */}
          <div className="border-b border-zinc-100 p-2">
            <div className="relative">
              <Search
                size={12}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search icons…"
                className="w-full rounded-lg border border-zinc-200 py-1.5 pl-7 pr-3 text-xs outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid max-h-56 grid-cols-6 gap-1 overflow-y-auto p-2 sm:grid-cols-8 lg:grid-cols-10">
            {filtered.map((iconName) => {
              const Icon = ICON_MAP[iconName]
              const isActive = selected === iconName
              return (
                <button
                  key={iconName}
                  type="button"
                  title={iconName}
                  onClick={() => {
                    setSelected(iconName)
                    setOpen(false)
                    setQuery("")
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-lg p-3 transition ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  <Icon size={22} />
                  <span className="hidden text-[9px] font-medium leading-none lg:block">
                    {iconName}
                  </span>
                </button>
              )
            })}
            {filtered.length === 0 && (
              <p className="col-span-full py-4 text-center text-xs text-zinc-400">
                No icons match &quot;{query}&quot;
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
