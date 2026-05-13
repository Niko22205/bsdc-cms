import { prisma } from "@/lib/prisma"
import { deleteMedia } from "./actions"
import { MediaGrid } from "./_components/MediaGrid"
import { MediaUploadButton } from "./_components/MediaUploadButton"
import { EmptyState } from "../../_components/ui/EmptyState"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function MediaPage() {
  const records = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Media</h1>
          <p className="mt-1 text-sm text-slate-500">
            Images, videos, and documents used across the site.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <MediaUploadButton />
          <Link
            href="/admin/media/new"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            <Plus size={14} />
            Register URL
          </Link>
        </div>
      </div>

      {records.length === 0 ? (
        <EmptyState
          title="No media records yet"
          description="Upload a file or register an external URL to add media."
        />
      ) : (
        <MediaGrid records={records} deleteAction={deleteMedia} />
      )}
    </div>
  )
}
