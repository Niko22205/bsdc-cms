"use client"

import { useEffect, useRef } from "react"

type Props = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ open, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      className="m-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl p-0 bg-[#0d1f33] text-white shadow-2xl backdrop:bg-black/70"
    >
      {children}
    </dialog>
  )
}
