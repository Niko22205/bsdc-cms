import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"

const GALLERY_MARGINS = ["mb-6","mb-16","mb-4","mb-12","mb-8","mb-20","mb-3","mb-10","mb-14","mb-5"]

function extractNarrative(raw: string | null | undefined): string[] {
  if (!raw) return []
  const stop = ["Основно използвано оборудване:", "Извършени дейности:"]
  let cut = raw.length
  for (const m of stop) { const pos = raw.indexOf(m); if (pos >= 0 && pos < cut) cut = pos }
  return raw.slice(0, cut)
    .replace(/<\/p>/gi, "\n\n").replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|h[1-6]|ul|ol|li|blockquote)>/gi, "\n").replace(/<[^>]+>/g, "")
    .replace(/&mdash;/g, "—").replace(/&ndash;/g, "–").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "").replace(/&[a-z]+;/gi, "")
    .replace(/\n{3,}/g, "\n\n").trim()
    .split("\n\n").map(s => s.trim()).filter(Boolean)
}

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const project = await prisma.projectNewsItem.findUnique({ where: { id } })
  if (!project) return {}
  return {
    title: project.seoTitle ?? project.title,
    description: project.seoDescription ?? project.excerpt ?? undefined,
    openGraph: project.featuredImageUrl ? { images: [project.featuredImageUrl] } : undefined,
  }
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params
  console.log("[project page] params.id:", id)
  const project = await prisma.projectNewsItem.findUnique({ where: { id } })
  if (!project || !project.published) notFound()

  const nextProject =
    (await prisma.projectNewsItem.findFirst({
      where: { published: true, sortOrder: { gt: project.sortOrder } },
      orderBy: { sortOrder: "asc" },
    })) ??
    (await prisma.projectNewsItem.findFirst({
      where: { published: true, id: { not: project.id } },
      orderBy: { sortOrder: "asc" },
    }))

  const narrative = extractNarrative(project.content)
  const images = project.images ?? []
  const year = project.publishedAt
    ? new Date(project.publishedAt).getFullYear()
    : null

  return (
    <main className="min-h-screen bg-[#040507] text-white">

      {/* ── HERO VOID ── full viewport, image as ambient field */}
      <section className="relative h-screen w-full overflow-hidden">
        {project.featuredImageUrl ? (
          <img
            src={project.featuredImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40 saturate-[0.3] brightness-75 scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-[#040507]" />
        )}

        {/* deep gradient veil — lower half */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#040507] via-[#04050780] to-transparent" />
        {/* side fade */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#04050760] via-transparent to-transparent" />

        {/* back nav */}
        <div className="absolute top-8 left-8 z-10">
          <Link
            href="/#projects"
            className="group flex items-center gap-2.5 text-[10px] uppercase tracking-[0.2em] text-white/40 transition-colors duration-500 hover:text-white/80"
          >
            <span className="inline-block transition-transform duration-500 group-hover:-translate-x-1">←</span>
            All Projects
          </Link>
        </div>

        {/* hero text — anchored to lower-left */}
        <div className="absolute bottom-16 left-8 right-8 md:left-16 md:right-auto md:max-w-2xl z-10">
          {project.category && (
            <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-white/35">
              {project.category}{year ? <span className="ml-4 text-white/25">{year}</span> : null}
            </p>
          )}
          <h1 className="text-[clamp(2.4rem,6vw,5rem)] font-light leading-[1.05] tracking-tight text-white">
            {project.title}
          </h1>
          {project.excerpt && (
            <p className="mt-5 max-w-lg text-base font-light leading-relaxed text-white/50">
              {project.excerpt}
            </p>
          )}
        </div>
      </section>

      {/* ── SPATIAL STORY FLOW ── */}
      <section className="relative px-8 py-32 md:px-16 lg:px-24">

        {/* narrative paragraphs — large, breathing */}
        {narrative.length > 0 && (
          <div className="mx-auto max-w-2xl">
            {narrative.map((para, i) => (
              <p
                key={i}
                className={`text-base font-light leading-[1.85] text-white/60 ${i > 0 ? "mt-8" : ""}`}
              >
                {para}
              </p>
            ))}
          </div>
        )}

        {/* data strip — equipment + activities */}
        {(project.equipmentUsed.length > 0 || project.activitiesDone.length > 0) && (
          <div className="mt-24 flex flex-col gap-16 md:flex-row md:gap-24 max-w-4xl mx-auto border-t border-white/[0.06] pt-16">
            {project.equipmentUsed.length > 0 && (
              <div className="flex-1">
                <p className="mb-6 text-[10px] uppercase tracking-[0.2em] text-white/25">
                  Equipment
                </p>
                <ul className="flex flex-col gap-2">
                  {project.equipmentUsed.map((eq, i) => (
                    <li key={i} className="text-sm font-light text-white/50">
                      {eq}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {project.activitiesDone.length > 0 && (
              <div className="flex-1">
                <p className="mb-6 text-[10px] uppercase tracking-[0.2em] text-white/25">
                  Activities
                </p>
                <ul className="flex flex-col gap-2">
                  {project.activitiesDone.map((ac, i) => (
                    <li key={i} className="text-sm font-light text-white/50">
                      {ac}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── IMAGE DENSITY FIELD ── irregular masonry, full bleed */}
      {images.length > 0 && (
        <section className="px-4 pb-8 md:px-8">
          <div
            className="columns-1 sm:columns-2 lg:columns-3 gap-3"
            style={{ columnFill: "balance" }}
          >
            {images.map((src, i) => (
              <div
                key={i}
                className={`break-inside-avoid ${GALLERY_MARGINS[i % GALLERY_MARGINS.length]} group`}
              >
                <div className="overflow-hidden">
                  <img
                    src={src}
                    alt=""
                    className="w-full object-cover saturate-[0.45] brightness-[0.78] opacity-70
                               transition-all duration-700
                               group-hover:saturate-100 group-hover:brightness-95 group-hover:opacity-100
                               group-hover:scale-[1.03]"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── GRAVITY EXIT ZONE ── next project, full width pull */}
      {nextProject && (
        <section className="relative mt-8 overflow-hidden">
          <Link href={`/projects/${nextProject.id}`} className="group block">

            {/* ambient background from next project */}
            {nextProject.featuredImageUrl ? (
              <img
                src={nextProject.featuredImageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-30 saturate-[0.2] brightness-50
                           scale-[1.09] transition-transform duration-[1400ms]
                           group-hover:scale-100"
              />
            ) : (
              <div className="absolute inset-0 bg-zinc-900" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#040507] via-[#04050790] to-[#040507b0]" />

            <div className="relative z-10 flex min-h-[55vh] flex-col items-center justify-center px-8 py-24 text-center">
              <p className="mb-6 text-[10px] uppercase tracking-[0.25em] text-white/30 transition-colors duration-500 group-hover:text-white/50">
                Next Project
              </p>
              <h2 className="text-[clamp(1.8rem,4.5vw,3.8rem)] font-light leading-tight tracking-tight text-white/70
                             transition-all duration-700
                             group-hover:text-white">
                {nextProject.title}
              </h2>
              {nextProject.category && (
                <p className="mt-4 text-sm font-light text-white/30 transition-colors duration-500 group-hover:text-white/50">
                  {nextProject.category}
                </p>
              )}
              <div className="mt-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/25
                              transition-all duration-500 group-hover:gap-4 group-hover:text-white/60">
                <span>Enter</span>
                <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* floor margin */}
      <div className="h-px bg-white/[0.04]" />
    </main>
  )
}
