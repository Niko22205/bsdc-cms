import { prisma } from "@/lib/prisma"
import { PageHeader } from "../../_components/ui/PageHeader"
import { EmptyState } from "../../_components/ui/EmptyState"
import { SortableServiceTable } from "./_components/SortableServiceTable"

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: [{ language: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
  })

  return (
    <div>
      <PageHeader
        title="Services"
        description="Manage service listings shown on the public site. Drag to reorder."
        action={{ label: "New Service", href: "/admin/services/new" }}
      />

      {services.length === 0 ? (
        <EmptyState
          title="No services yet"
          description="Add your first service to display it on the public site."
          action={{ label: "New Service", href: "/admin/services/new" }}
        />
      ) : (
        <SortableServiceTable services={services} />
      )}
    </div>
  )
}
