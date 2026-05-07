import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { deleteProjectNewsItem } from "./actions"
import { DeleteButton } from "./_components/DeleteButton"

export default async function ProjectsPage() {
  const items = await prisma.projectNewsItem.findMany({
    orderBy: [{ type: "asc" }, { language: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Projects / News</h1>
        <Link
          href="/admin/projects/new"
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
        >
          New Item
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">No items yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">Lang</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">Title</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">Slug</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">Category</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">Published</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.type === "PROJECT"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.type === "PROJECT" ? "Project" : "News"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">{item.language}</td>
                  <td className="px-4 py-3 font-medium text-zinc-900">{item.title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">{item.slug}</td>
                  <td className="px-4 py-3 text-zinc-500">{item.category ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.published
                          ? "bg-green-100 text-green-700"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {item.published ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/projects/${item.id}/edit`}
                        className="text-sm text-zinc-600 hover:text-zinc-900"
                      >
                        Edit
                      </Link>
                      <form action={deleteProjectNewsItem}>
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
