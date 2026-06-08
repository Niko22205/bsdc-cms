'use client'

import type { Service, Certificate } from '@/generated/prisma/client'

interface Props {
  data:         Service[]
  certificates: Certificate[]
  lang:         string
}

export function ServicesNode({ data, lang }: Props) {
  return (
    <div className="flex flex-col justify-center py-10">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px w-8 bg-[#4A5343]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#4A5343]">
          {lang === 'bg' ? 'Услуги' : 'Services'}
        </span>
      </div>
      <h2
        className="mb-6 font-light leading-[0.95] tracking-[-0.03em] text-[#1A221E]"
        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
      >
        {lang === 'bg' ? 'Нашите услуги' : 'Our Services'}
      </h2>
      <div className="flex flex-col gap-2">
        {data.slice(0, 5).map(svc => (
          <div key={svc.id} className="flex items-center gap-3">
            <div className="h-px w-4 bg-[#4A5343]/40" />
            <span className="text-[15px] font-light text-[#1A221E]/70">{svc.title}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
