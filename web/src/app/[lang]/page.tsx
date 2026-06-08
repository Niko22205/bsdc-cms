export const dynamic = "force-dynamic"

import { notFound }       from "next/navigation"
import { Navbar }         from "../_sections/Navbar"
import PageExperience     from "@/components/PageExperience"
import { fetchPageData }  from "@/lib/fetchPageData"

const VALID_LANGS = ["bg", "en"] as const
export type Lang = (typeof VALID_LANGS)[number]

export default async function LangPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!VALID_LANGS.includes(lang as Lang)) notFound()

  const { home, about, services, certificates, partners, settings, projects } =
    await fetchPageData(lang)

  return (
    <>
      <Navbar settings={settings} lang={lang as Lang} />
      <PageExperience
        home={home}
        about={about}
        services={services}
        certificates={certificates}
        partners={partners}
        settings={settings}
        lang={lang as Lang}
        projects={projects}
      />
    </>
  )
}
