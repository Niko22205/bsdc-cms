import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { deleteSubmission } from "../actions"
import { DeleteButton } from "../_components/DeleteButton"
import { ToggleReadButton } from "../_components/ToggleReadButton"
import { Badge } from "../../../_components/ui/Badge"

type Props = {
  params: Promise<{ id: string }>
}

export default async function SubmissionDetailPage({ params }: Props) {
  const { id } = await params
  const submission = await prisma.contactSubmission.findUnique({ where: { id } })
  if (!submission) notFound()

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/submissions"
          className="flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-200"
        >
          ← Back
        </Link>
        <div className="h-4 w-px bg-white/[0.10]" />
        <h1 className="text-xl font-bold tracking-tight text-white">
          Message from {submission.name}
        </h1>
        <Badge variant={submission.read ? "zinc" : "amber"}>
          {submission.read ? "Read" : "Unread"}
        </Badge>
      </div>

      {/* Detail card */}
      <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.04]">
        <dl className="divide-y divide-white/[0.04]">
          <Row label="Name" value={submission.name} />
          <Row label="Email" value={submission.email} />
          <Row label="Phone" value={submission.phone ?? "—"} />
          <Row label="Inquiry" value={submission.inquiryType ?? "—"} />
          <Row label="Source" value={submission.source ?? "—"} />
          <Row
            label="Date"
            value={submission.createdAt.toISOString().slice(0, 16).replace("T", " ")}
          />
          <div className="px-6 py-4">
            <dt className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Message
            </dt>
            <dd className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
              {submission.message}
            </dd>
          </div>
        </dl>
      </div>

      {/* Actions */}
      <div className="mt-5 flex items-center gap-3">
        <ToggleReadButton id={submission.id} read={submission.read} />
        <form action={deleteSubmission}>
          <input type="hidden" name="id" value={submission.id} />
          <DeleteButton />
        </form>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline px-6 py-3.5">
      <dt className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </dt>
      <dd className="text-sm text-slate-300">{value}</dd>
    </div>
  )
}
