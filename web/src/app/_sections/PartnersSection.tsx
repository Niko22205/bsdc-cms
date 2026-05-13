import Image from "next/image"
import type { Partner } from "@/generated/prisma/client"

type Props = {
  partners: Partner[]
}

export function PartnersSection({ partners }: Props) {
  if (partners.length === 0) return null

  const doubled = [...partners, ...partners]

  return (
    <section id="partners" className="scroll-mt-20 bg-[#040c18] py-20">
      <div className="mx-auto mb-12 max-w-6xl px-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-sky-500">
          Партньори
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Работим с най-добрите
        </h2>
      </div>

      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#040c18] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#040c18] to-transparent" />

        <div className="animate-bsdc-ticker flex gap-16 py-4">
          {doubled.map((p, i) => {
            const inner = p.logoUrl ? (
              <Image
                src={p.logoUrl}
                alt={p.name}
                width={140}
                height={56}
                unoptimized
                className="h-12 w-auto max-w-[140px] object-contain brightness-0 invert opacity-40 transition duration-300 hover:opacity-90"
              />
            ) : (
              <span className="text-sm font-medium text-slate-500 transition hover:text-slate-300">
                {p.name}
              </span>
            )

            return p.websiteUrl ? (
              <a
                key={`${p.id}-${i}`}
                href={p.websiteUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="shrink-0"
              >
                {inner}
              </a>
            ) : (
              <div key={`${p.id}-${i}`} className="shrink-0">
                {inner}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
