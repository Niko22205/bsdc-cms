import Image from "next/image"
import type { AboutContent, Certificate } from "@/generated/prisma/client"
import { ScrollReveal } from "@/app/_components/ScrollReveal"

type Props = {
  about: AboutContent | null
  certificates: Certificate[]
}

type Stat = { label: string; value: string }

function parseStats(raw: unknown): Stat[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (s): s is Stat =>
      typeof s === "object" &&
      s !== null &&
      typeof (s as Record<string, unknown>).label === "string" &&
      typeof (s as Record<string, unknown>).value === "string",
  )
}

export function AboutSection({ about, certificates }: Props) {
  if (!about) return null

  const stats = parseStats(about.statistics)

  return (
    <section id="about" className="scroll-mt-20 bg-[#07111f] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-[1fr_400px] lg:items-start">
          <div>
            <ScrollReveal>
              <div>
                {about.subtitle && (
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-sky-500">
                    {about.subtitle}
                  </p>
                )}
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {about.title}
                </h2>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={2}>
              <p className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-slate-400">
                {about.content}
              </p>
            </ScrollReveal>
            {stats.length > 0 && (
              <ScrollReveal delay={3}>
                <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {stats.map((s, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-white/10 bg-white/5 p-4"
                    >
                      <p className="text-3xl font-bold text-white">{s.value}</p>
                      <p className="mt-1 text-xs uppercase tracking-widest text-slate-400">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            )}
          </div>

          {about.imageUrl && (
            <ScrollReveal delay={2} className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src={about.imageUrl}
                  alt={about.title}
                  width={600}
                  height={500}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              </div>
            </ScrollReveal>
          )}
        </div>

        {certificates.length > 0 && (
          <div className="mt-20 border-t border-white/10 pt-16">
            <ScrollReveal>
              <h3 className="text-xl font-bold tracking-tight text-white">
                Сертификати и удостоверения
              </h3>
            </ScrollReveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {certificates.map((c, i) => (
                <ScrollReveal key={c.id} delay={((i % 3) + 1) as 1 | 2 | 3 | 4}>
                  <div className="group rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-sky-500/30 hover:bg-white/10">
                    <p className="text-sm font-semibold text-white">{c.title}</p>
                    {c.issuer && (
                      <p className="mt-1 text-xs text-slate-400">{c.issuer}</p>
                    )}
                    {c.issueDate && (
                      <p className="mt-0.5 text-xs text-slate-600">
                        {c.issueDate.toISOString().slice(0, 7)}
                      </p>
                    )}
                    {c.fileUrl && (
                      <a
                        href={c.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-xs font-medium text-sky-500 transition hover:text-sky-400"
                      >
                        Виж сертификат →
                      </a>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
