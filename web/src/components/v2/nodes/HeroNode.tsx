'use client'

import type { HomeContent, SiteSetting } from '@/generated/prisma/client'

interface Props {
  data:     HomeContent | null
  settings: SiteSetting | null
  lang:     string
}

export function HeroNode({ data, settings, lang }: Props) {
  return (
    <div className="absolute inset-0 flex flex-col justify-end px-10 pb-16 md:px-16 md:pb-20">

      {/* Eyebrow */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px w-8 bg-[#4A5343]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#4A5343]">
          {settings?.companyName ?? 'BSDC'}
        </span>
      </div>

      {/* Main headline */}
      <h1
        className="mb-6 font-light leading-[0.95] tracking-[-0.03em] text-[#1A221E]"
        style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)' }}
      >
        {data?.headline ?? (lang === 'bg' ? 'Подводни технологии' : 'Underwater technologies')}
      </h1>

      {/* Sub */}
      {data?.subheadline && (
        <p className="mb-10 max-w-xl text-[15px] font-light leading-[1.8] text-[#1A221E]/60">
          {data.subheadline}
        </p>
      )}

      {/* Scroll cue */}
      <div className="flex items-center gap-3 text-[#4A5343]/50">
        <div className="h-px w-12 bg-[#4A5343]/30" />
        <span className="font-mono text-[9px] uppercase tracking-[0.4em]">
          {lang === 'bg' ? 'Превъртете надолу' : 'Scroll to explore'}
        </span>
      </div>

    </div>
  )
}
