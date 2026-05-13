import type { ProjectNewsItem } from "@/generated/prisma/client"
import { ProjectCard, type ProjectItem } from "./_components/ProjectCard"
import { ScrollReveal } from "@/app/_components/ScrollReveal"

type Props = {
  projects: ProjectNewsItem[]
}

export function ProjectsSection({ projects }: Props) {
  if (projects.length === 0) return null

  const items: ProjectItem[] = projects.map((p) => ({
    id: p.id,
    title: p.title,
    type: p.type as "PROJECT" | "NEWS",
    excerpt: p.excerpt,
    content: p.content,
    featuredImageUrl: p.featuredImageUrl,
    images: p.images,
    category: p.category,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString().slice(0, 10) : null,
  }))

  return (
    <section id="projects" className="scroll-mt-20 bg-[#07111f] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-sky-500">
              Проекти & Новини
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Последни проекти
            </h2>
          </div>
        </ScrollReveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => (
            <ScrollReveal key={p.id} delay={((i % 3) + 1) as 1 | 2 | 3 | 4}>
              <ProjectCard project={p} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
