import type { Service } from "@/generated/prisma/client"
import {
  ServicesDeepDive,
  type ServiceDeepDiveItem,
} from "@/app/_components/ServicesDeepDive"

export function ServicesSection({ services }: { services: Service[] }) {
  if (services.length === 0) return null

  const items: ServiceDeepDiveItem[] = services.map((s) => ({
    id: s.id,
    title: s.title,
    shortDescription: s.shortDescription,
    content: s.content,
    featuredImageUrl: s.featuredImageUrl,
    images: s.images ?? [],
    iconUrl: s.iconUrl,
  }))

  return (
    <section id="services" className="scroll-mt-20">
      <ServicesDeepDive services={items} />
    </section>
  )
}
