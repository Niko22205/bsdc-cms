export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { Language } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { Navbar } from "../_sections/Navbar"
import PageExperience from "@/components/PageExperience"

const VALID_LANGS = ["bg", "en"] as const
export type Lang = (typeof VALID_LANGS)[number]

async function fetchData(dbLang: Language) {
  const [home, about, services, certificates, partners, settings, projects] =
    await Promise.all([
      prisma.homeContent.findUnique({ where: { language: dbLang } }),
      prisma.aboutContent.findUnique({ where: { language: dbLang } }),
      prisma.service.findMany({
        where: { language: dbLang, published: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.certificate.findMany({
        where: { language: dbLang, published: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.partner.findMany({
        where: { published: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.siteSetting.findFirst(),
      prisma.projectNewsItem.findMany({
        where: { language: dbLang, published: true },
        orderBy: { sortOrder: "asc" },
      }),
    ])
  return { home, about, services, certificates, partners, settings, projects }
}

type PageData = Awaited<ReturnType<typeof fetchData>>

export default async function LangPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!VALID_LANGS.includes(lang as Lang)) notFound()

  const dbLang = lang.toUpperCase() as Language

  let pageData: PageData

  if (dbLang === Language.EN) {
    const [en, bg] = await Promise.all([fetchData(Language.EN), fetchData(Language.BG)])
    pageData = {
      home: en.home ?? bg.home,
      about: en.about ?? bg.about,
      services: en.services.length > 0 ? en.services : bg.services,
      certificates: en.certificates.length > 0 ? en.certificates : bg.certificates,
      partners: bg.partners,
      settings: bg.settings,
      projects: en.projects.length > 0 ? en.projects : bg.projects,
    }
  } else {
    pageData = await fetchData(Language.BG)
  }

  const { home, about, services, certificates, partners, settings, projects } = pageData

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
