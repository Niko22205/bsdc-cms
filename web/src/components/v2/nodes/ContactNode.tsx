'use client'

import type { SiteSetting, Partner } from '@/generated/prisma/client'

interface Props {
  settings: SiteSetting | null
  partners: Partner[]
  lang:     string
}

export function ContactNode({ settings, lang }: Props) {
  return (
    <div className="flex flex-col justify-center py-10">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px w-8 bg-[#4A5343]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#4A5343]">
          {lang === 'bg' ? 'Контакти' : 'Contact'}
        </span>
      </div>
      <h2
        className="mb-6 font-light leading-[0.95] tracking-[-0.03em] text-[#1A221E]"
        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
      >
        {settings?.companyName ?? 'BSDC'}
      </h2>
      <div className="flex flex-col gap-2 text-[15px] font-light text-[#1A221E]/60">
        {settings?.address  && <span>{settings.address}</span>}
        {settings?.email    && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
        {settings?.phones?.[0] && <a href={`tel:${settings.phones[0].replace(/\s/g,'')}`}>{settings.phones[0]}</a>}
      </div>
    </div>
  )
}
