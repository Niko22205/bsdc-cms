import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { deletePartner } from "./actions"
import { DeleteButton } from "./_components/DeleteButton"

export default async function PartnersPage() {
  const partners = await prisma.partner.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Partners</h1>
        <Link
          href="/admin/partners/new"
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
        >
          New Partner
        </Link>
      </div>

      {partners.length === 0 ? (
        <p className="text-sm text-zinc-500">No partners yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">Logo URL</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">Website</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">Order</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">Published</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {partners.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium text-zinc-900">{p.name}</td>
                  <td className="max-w-xs px-4 py-3">
                    <span className="block truncate font-mono text-xs text-zinc-500">
                      {p.logoUrl}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.websiteUrl ? (
                      <span className="block truncate font-mono text-xs text-zinc-500">
                        {p.websiteUrl}
                      </span>
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{p.sortOrder}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.published
                          ? "bg-green-100 text-green-700"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {p.published ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/partners/${p.id}/edit`}
                        className="text-sm text-zinc-600 hover:text-zinc-900"
                      >
                        Edit
                      </Link>
                      <form action={deletePartner}>
                        <input type="hidden" name="id" value={p.id} />
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
