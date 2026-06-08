'use client'

import type { AboutContent } from '@/generated/prisma/client'

interface Props {
  data: AboutContent | null
  lang: string
}

export function AboutNode({ data, lang }: Props) {
  return (
    <div className="flex flex-col justify-center py-10">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px w-8 bg-[#4A5343]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#4A5343]">
          {lang === 'bg' ? 'За нас' : 'About'}
        </span>
      </div>
      <h2
        className="mb-4 font-light leading-[0.95] tracking-[-0.03em] text-[#1A221E]"
        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
      >
        {data?.title ?? (lang === 'bg' ? 'За нас' : 'About BSDC')}
      </h2>
      {data?.content && (
        <p className="max-w-lg text-[15px] font-light leading-[1.8] text-[#1A221E]/60">
          {String(data.content).slice(0, 180)}…
        </p>
      )}
    </div>
  )
}
