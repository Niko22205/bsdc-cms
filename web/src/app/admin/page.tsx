import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LogoutButton } from "./_components/LogoutButton"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) redirect("/admin/login")

  return (
    <main className="flex min-h-screen flex-col bg-zinc-50 p-8">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-6">
        <h1 className="text-2xl font-semibold text-zinc-900">BSDC Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">{session.user.email}</span>
          <LogoutButton />
        </div>
      </div>
    </main>
  )
}
