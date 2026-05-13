"use client"

import { useTransition } from "react"
import { toggleRead } from "../actions"

type Props = {
  id: string
  read: boolean
}

export function ToggleReadButton({ id, read }: Props) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    startTransition(() => {
      toggleRead(id, !read)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="rounded-lg border border-white/[0.10] bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
    >
      {read ? "Mark as Unread" : "Mark as Read"}
    </button>
  )
}
