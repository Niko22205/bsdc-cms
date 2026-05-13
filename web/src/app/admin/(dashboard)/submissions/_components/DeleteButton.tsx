"use client"

import { Trash2 } from "lucide-react"

export function DeleteButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm("Delete this submission? This cannot be undone.")) e.preventDefault()
      }}
      className="flex items-center gap-2 rounded-lg border border-red-500/[0.20] px-3 py-1.5 text-sm font-medium text-red-500/80 transition hover:border-red-500/40 hover:bg-red-500/[0.08] hover:text-red-400"
    >
      <Trash2 size={13} />
      Delete
    </button>
  )
}
