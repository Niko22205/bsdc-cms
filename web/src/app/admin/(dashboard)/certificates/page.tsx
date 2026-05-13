import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { deleteCertificate } from "./actions"
import { DeleteButton } from "./_components/DeleteButton"
import { PageHeader } from "../../_components/ui/PageHeader"
import { EmptyState } from "../../_components/ui/EmptyState"
import { Pencil } from "lucide-react"

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

export default async function CertificatesPage() {
  const certificates = await prisma.certificate.findMany({
    orderBy: [{ language: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
  })

  return (
    <div>
      <PageHeader
        title="Certificates"
        description="Certifications and accreditations displayed on the public site."
        action={{ label: "New Certificate", href: "/admin/certificates/new" }}
      />

      {certificates.length === 0 ? (
        <EmptyState
          title="No certificates yet"
          description="Add your first certification to display it on the site."
          action={{ label: "New Certificate", href: "/admin/certificates/new" }}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.04]">
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.05] bg-white/[0.02]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Lang</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Issuer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Issue Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {certificates.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{c.language}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-200">{c.title}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{c.issuer ?? "—"}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">
                    {c.issueDate ? c.issueDate.toISOString().slice(0, 10) : "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusDot published={c.published} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/certificates/${c.id}/edit`}
                        title="Edit"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-[#B87333]"
                      >
                        <Pencil size={13} />
                      </Link>
                      <form action={deleteCertificate}>
                        <input type="hidden" name="id" value={c.id} />
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
