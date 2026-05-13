import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LogoutButton } from "./LogoutButton"

export async function Topbar() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email ?? ""
  const initials = email.slice(0, 2).toUpperCase()

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-end gap-3 border-b border-white/[0.06] bg-[#0a0f1e] px-6">
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
          style={{ background: "rgba(184,115,51,0.18)", color: "#B87333" }}
        >
          {initials}
        </div>
        <span className="text-sm text-slate-500">{email}</span>
      </div>
      <LogoutButton />
    </header>
  )
}
