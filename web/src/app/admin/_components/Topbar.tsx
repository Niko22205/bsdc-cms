import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LogoutButton } from "./LogoutButton"

export async function Topbar() {
  const session = await getServerSession(authOptions)

  return (
    <header className="flex h-14 items-center justify-end gap-4 border-b border-zinc-200 bg-white px-6">
      <span className="text-sm text-zinc-500">{session?.user?.email}</span>
      <LogoutButton />
    </header>
  )
}
