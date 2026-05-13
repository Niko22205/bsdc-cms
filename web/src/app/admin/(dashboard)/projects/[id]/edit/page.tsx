import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "../../../../_components/ui/PageHeader"
import { ProjectDocumentEditor } from "../../_components/ProjectDocumentEditor"
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
      <PageHeader title="Edit Project / News Item" description={item.title} />
      <ProjectDocumentEditor action={action} initial={initial} submitLabel="Save Changes" />
    </div>
  )
}
