import { prisma } from "@/lib/prisma"
import { deleteProjectNewsItem } from "./actions"
import { DeleteButton } from "./_components/DeleteButton"
import { PageHeader } from "../../_components/ui/PageHeader"
import { EmptyState } from "../../_components/ui/EmptyState"
import Link from "next/link"
import { Eye, Pencil } from "lucide-react"

function TypePill({ type }: { type: string }) {
  const isProject = type === "PROJECT"
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${
        isProject
          ? "bg-blue-400/[0.10] text-blue-400 ring-blue-400/20"
          : "bg-amber-400/[0.10] text-amber-400 ring-amber-400/20"
      }`}
    >
      {isProject ? "Project" : "News"}
    </span>
  )
}

function StatusDot({ published }: { published: boolean }) {
  return published ? (
    <span className="inline-flex items-center gap-1.5">
      <span className="block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
      <span className="text-xs text-emerald-400">Published</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5">
      <span className="block h-2 w-2 rounded-full bg-amber-400" />
      <span className="text-xs text-amber-500">Draft</span>
    </span>
  )
}

export default async function ProjectsPage() {
  const items = await prisma.projectNewsItem.findMany({
    orderBy: [{ type: "asc" }, { language: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
  })

  return (
    <div>
      <PageHeader
        title="Projects / News"
        description="Manage portfolio projects and news posts."
        action={{ label: "New Item", href: "/admin/projects/new" }}
      />

      {items.length === 0 ? (
        <EmptyState
          title="No items yet"
          description="Add your first project or news post to display it on the public site."
          action={{ label: "New Item", href: "/admin/projects/new" }}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.04]">
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.05] bg-white/[0.02]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Lang</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3.5">
                    <TypePill type={item.type} />
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{item.language}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-200">{item.title}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{item.slug}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{item.category ?? "—"}</td>
                  <td className="px-4 py-3.5">
                    <StatusDot published={item.published} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/projects/${item.id}/edit`}
                        title="Edit"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-[#B87333]"
                      >
                        <Pencil size={13} />
                      </Link>
                      <Link
                        href="/bg#projects"
                        target="_blank"
                        title="View on site"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white/[0.06] hover:text-slate-300"
                      >
                        <Eye size={13} />
                      </Link>
                      <form action={deleteProjectNewsItem} className="contents">
                        <input type="hidden" name="id" value={item.id} />
                        <DeleteButton />
                      </form>
                    </div>
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
