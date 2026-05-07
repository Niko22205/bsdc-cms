import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProjectForm } from "../../_components/ProjectForm"
import { updateProjectNewsItem } from "../../actions"

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params
  const item = await prisma.projectNewsItem.findUnique({ where: { id } })
  if (!item) notFound()

  const action = updateProjectNewsItem.bind(null, item.id)

  const initial = {
    ...item,
    publishedAt: item.publishedAt ? item.publishedAt.toISOString().slice(0, 16) : null,
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-zinc-900">Edit Project / News Item</h1>
      <ProjectForm action={action} initial={initial} submitLabel="Save Changes" />
    </div>
  )
}
