"use client"

import { Trash2 } from "lucide-react"

export function DeleteButton() {
  return (
    <button
      type="submit"
      title="Delete"
      onClick={(e) => {
        if (!confirm("Delete this item? This cannot be undone.")) e.preventDefault()
      }}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition hover:bg-red-500/[0.12] hover:text-red-400"
    >
      <Trash2 size={13} />
    </button>
  )
}
