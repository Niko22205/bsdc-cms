"use client"

import { signOut } from "next-auth/react"

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-300"
    >
      Sign out
    </button>
  )
}
