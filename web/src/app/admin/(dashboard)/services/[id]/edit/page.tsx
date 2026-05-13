import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "../../../../_components/ui/PageHeader"
import { ServiceForm } from "../../_components/ServiceForm"
import { updateService } from "../../actions"

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditServicePage({ params }: Props) {
  const { id } = await params
  const service = await prisma.service.findUnique({ where: { id } })
  if (!service) notFound()

  const action = updateService.bind(null, service.id)

  return (
    <div>
      <PageHeader title="Edit Service" description={service.title} />
      <ServiceForm action={action} initial={service} submitLabel="Save Changes" />
    </div>
  )
}
