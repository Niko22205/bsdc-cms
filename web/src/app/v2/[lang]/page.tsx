export const dynamic = "force-dynamic"

import { notFound }      from 'next/navigation'
import ScrollEngineV2    from '@/components/v2/ScrollEngineV2'
import { fetchPageData } from '@/lib/fetchPageData'

const VALID_LANGS = ['bg', 'en'] as const
type Lang = (typeof VALID_LANGS)[number]

export default async function V2LangPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!VALID_LANGS.includes(lang as Lang)) notFound()

  const { home, about, services, certificates, partners, settings, projects } =
    await fetchPageData(lang)

  return (
    <ScrollEngineV2
      home={home}
      about={about}
      services={services}
      certificates={certificates}
      partners={partners}
      settings={settings}
      lang={lang}
      projects={projects}
    />
  )
}
