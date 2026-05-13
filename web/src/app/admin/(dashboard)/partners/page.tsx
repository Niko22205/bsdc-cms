import { prisma } from "@/lib/prisma"
import { PageHeader } from "../../_components/ui/PageHeader"
import { EmptyState } from "../../_components/ui/EmptyState"
import { SortablePartnerTable } from "./_components/SortablePartnerTable"

export default async function PartnersPage() {
  const partners = await prisma.partner.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  })

  return (
    <div>
      <PageHeader
        title="Partners"
        description="Partner logos and links shown on the public site. Drag to reorder."
        action={{ label: "New Partner", href: "/admin/partners/new" }}
      />

      {partners.length === 0 ? (
        <EmptyState
          title="No partners yet"
          description="Add your first partner logo to display it on the site."
          action={{ label: "New Partner", href: "/admin/partners/new" }}
        />
      ) : (
        <SortablePartnerTable partners={partners} />
      )}
    </div>
  )
}
