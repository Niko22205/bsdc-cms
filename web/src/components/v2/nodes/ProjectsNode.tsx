'use client'

import type { ProjectNewsItem } from '@/generated/prisma/client'

interface Props {
  data: ProjectNewsItem[]
  lang: string
}

export function ProjectsNode({ data, lang }: Props) {
  return (
    <div className="flex flex-col justify-center py-10">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px w-8 bg-[#4A5343]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#4A5343]">
          {lang === 'bg' ? 'Проекти' : 'Projects'}
        </span>
      </div>
      <h2
        className="mb-6 font-light leading-[0.95] tracking-[-0.03em] text-[#1A221E]"
        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
      >
        {lang === 'bg' ? `${data.length} проекта` : `${data.length} projects`}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {data.slice(0, 4).map(p => (
          <div key={p.id} className="border-l-2 border-[#4A5343]/20 pl-3">
            <p className="text-[13px] font-light leading-tight text-[#1A221E]/70">{p.title}</p>
            {p.location && (
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#4A5343]/50">{p.location}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
