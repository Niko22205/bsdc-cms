/**
 * Shared CMS data fetch for all public frontend routes.
 *
 * Used by both:
 *   /[lang]   — main site (PageExperience)
 *   /v2/[lang] — spatial frontend (ScrollEngineV2)
 *
 * Single source of truth — no duplication of queries or models.
 */

import { Language } from '@/generated/prisma/client'
import { prisma }   from '@/lib/prisma'

async function fetchByLang(dbLang: Language) {
  const [home, about, services, certificates, partners, settings, projects] =
    await Promise.all([
      prisma.homeContent.findUnique({ where: { language: dbLang } }),
      prisma.aboutContent.findUnique({ where: { language: dbLang } }),
      prisma.service.findMany({
        where:   { language: dbLang, published: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.certificate.findMany({
        where:   { language: dbLang, published: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.partner.findMany({
        where:   { published: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.siteSetting.findFirst(),
      prisma.projectNewsItem.findMany({
        where:   { language: dbLang, published: true },
        orderBy: { sortOrder: 'asc' },
      }),
    ])
  return { home, about, services, certificates, partners, settings, projects }
}

export type PageData = Awaited<ReturnType<typeof fetchByLang>>

/**
 * Fetch all page data for a given lang string ('bg' | 'en').
 * EN falls back to BG for any unpopulated fields.
 */
export async function fetchPageData(lang: string): Promise<PageData> {
  if (lang.toUpperCase() === Language.EN) {
    const [en, bg] = await Promise.all([
      fetchByLang(Language.EN),
      fetchByLang(Language.BG),
    ])
    return {
      home:         en.home         ?? bg.home,
      about:        en.about        ?? bg.about,
      services:     en.services.length     > 0 ? en.services     : bg.services,
      certificates: en.certificates.length > 0 ? en.certificates : bg.certificates,
      partners:     bg.partners,
      settings:     bg.settings,
      projects:     en.projects.length     > 0 ? en.projects     : bg.projects,
    }
  }
  return fetchByLang(Language.BG)
}
