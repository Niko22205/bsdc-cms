import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { EmptyState } from "../../_components/ui/EmptyState"
import { Badge } from "../../_components/ui/Badge"

export default async function SubmissionsPage() {
  const submissions = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
  })

  const unreadCount = submissions.filter((s) => !s.read).length

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Submissions</h1>
          <p className="mt-1 text-sm text-slate-500">Contact form messages from visitors.</p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="amber">{unreadCount} unread</Badge>
        )}
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          title="No submissions yet"
          description="Contact form messages from visitors will appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.04]">
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.05] bg-white/[0.02]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {submissions.map((s) => (
                <tr
                  key={s.id}
                  className={`hover:bg-white/[0.02] ${!s.read ? "bg-[#B87333]/[0.04]" : ""}`}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      {!s.read && (
                        <span
                          className="block h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: "#B87333" }}
                        />
                      )}
                      <span className={s.read ? "text-slate-300" : "font-semibold text-white"}>
                        {s.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">{s.email}</td>
                  <td className="px-4 py-3.5 text-slate-500">{s.inquiryType ?? "—"}</td>
                  <td className="px-4 py-3.5 text-slate-500">
                    {s.createdAt.toISOString().slice(0, 10)}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={s.read ? "zinc" : "amber"}>
                      {s.read ? "Read" : "Unread"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/admin/submissions/${s.id}`}
                      className="text-sm font-medium transition"
                      style={{ color: "#B87333" }}
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
