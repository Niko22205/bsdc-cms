import "dotenv/config"
import bcrypt from "bcryptjs"
import { PrismaClient, UserRole, ProjectNewsType, Prisma } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // -----------------------------------------------------------------------
  // Admin user
  // -----------------------------------------------------------------------
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.error("Seed failed: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env")
    process.exit(1)
  }

  console.log("Seeding admin user…")
  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashed, role: UserRole.ADMIN },
    create: { email, password: hashed, role: UserRole.ADMIN },
  })
  console.log(`Admin ready: ${user.email}`)

  // -----------------------------------------------------------------------
  // Site Settings
  // Source: https://www.bsdc.bg/contact/
  // -----------------------------------------------------------------------
  console.log("Seeding site settings…")
  const settingsData = {
    companyName: "Черноморски Водолазен Център ООД",
    // Address from contact page. Full street address not listed on site — TODO: add when confirmed.
    address: 'Пристанищен комплекс "Булпорт Логистик"',
    phones: [
      "+359 52 603433",
      "+359 52 603432",
      "+359 899 980 995",
      "+359 899 993 312",
      "+359 896 722 205",
    ],
    email: "office@bsdc.bg",
    // TODO: add actual Facebook and YouTube profile URLs once confirmed
    footerText: "В света на тишината, говорят действията!",
    defaultSeoTitle: "BSDC | Черноморски Водолазен Център",
    defaultSeoDescription:
      "Специализирана компания в областта на подводното строителство, водолазните инспекции и ремонти от 2001 г.",
  }
  const existingSettings = await prisma.siteSetting.findFirst()
  if (existingSettings) {
    await prisma.siteSetting.update({ where: { id: existingSettings.id }, data: settingsData })
  } else {
    await prisma.siteSetting.create({ data: settingsData })
  }

  // -----------------------------------------------------------------------
  // Home Content — BG
  // Source: derived from company headline and motto across bsdc.bg
  // -----------------------------------------------------------------------
  console.log("Seeding home content (BG)…")
  await prisma.homeContent.upsert({
    where: { language: "BG" },
    update: {
      headline: "Черноморски Водолазен Център",
      subheadline: "Намирането на трайно решение е нашата крайна цел!",
      ctaLabel: "Нашите услуги",
      ctaTarget: "#services",
      // heroImageUrl intentionally omitted — never blank a CMS-set image via seed
    },
    create: {
      language: "BG",
      headline: "Черноморски Водолазен Център",
      subheadline: "Намирането на трайно решение е нашата крайна цел!",
      ctaLabel: "Нашите услуги",
      ctaTarget: "#services",
      heroImageUrl: "/uploads/bsdc/hero-diver-helmet.jpg",
    },
  })
  // Restore hero image only if currently null (never overwrite a CMS-set value)
  await prisma.homeContent.updateMany({
    where: { language: "BG", heroImageUrl: null },
    data: { heroImageUrl: "/uploads/bsdc/hero-diver-helmet.jpg" },
  })

  // -----------------------------------------------------------------------
  // About Content — BG
  // Source: https://www.bsdc.bg/about/
  // -----------------------------------------------------------------------
  console.log("Seeding about content (BG)…")
  await prisma.aboutContent.upsert({
    where: { language: "BG" },
    update: {
      title: "За нас",
      subtitle: "Висококачествени решения",
      content: [
        "Черноморски Водолазен Център ООД е специализирана компания в областта на подводното строителство, ремонти и инспекции, работеща от 2001 г.",
        "Предлагаме широк спектър от услуги: подводно строителство и ремонти, водолазни и ROV инспекции, аварийно-спасителни операции, поддръжка на пристанища и плавателни съдове.",
        "Работим с доказан професионализъм, планиране и дисциплина в управленско, оперативно и административно направление.",
        "Предимствата ни: високо качество, гарантирана работа, операции по целия свят, консултации и достъпни цени.",
      ].join("\n\n"),
      // imageUrl intentionally omitted — never blank a CMS-set image via seed
      statistics: Prisma.DbNull,
    },
    create: {
      language: "BG",
      title: "За нас",
      subtitle: "Висококачествени решения",
      content: [
        "Черноморски Водолазен Център ООД е специализирана компания в областта на подводното строителство, ремонти и инспекции, работеща от 2001 г.",
        "Предлагаме широк спектър от услуги: подводно строителство и ремонти, водолазни и ROV инспекции, аварийно-спасителни операции, поддръжка на пристанища и плавателни съдове.",
        "Работим с доказан професионализъм, планиране и дисциплина в управленско, оперативно и административно направление.",
        "Предимствата ни: високо качество, гарантирана работа, операции по целия свят, консултации и достъпни цени.",
      ].join("\n\n"),
      imageUrl: "/uploads/bsdc/about-diving-suit-historic.jpg",
      statistics: Prisma.DbNull,
    },
  })
  // Restore about image only if currently null (never overwrite a CMS-set value)
  await prisma.aboutContent.updateMany({
    where: { language: "BG", imageUrl: null },
    data: { imageUrl: "/uploads/bsdc/about-diving-suit-historic.jpg" },
  })

  // -----------------------------------------------------------------------
  // Services — BG
  // Source: https://www.bsdc.bg/service/
  // -----------------------------------------------------------------------
  console.log("Seeding services (BG)…")

  // Delete the 5 empty duplicate records created by a previous wrong-key seed run.
  // These have no content/images and were created with wrong translationKeys.
  // The 6 original records (with images) are kept and renamed below.
  await prisma.service.deleteMany({
    where: {
      language: "BG",
      translationKey: { in: ["industrial-diving", "rov-inspection", "bathymetry", "dam-operator", "hydrotechnical-construction"] },
    },
  })

  // Final professional service names — updating original records by their stable translationKeys.
  // sortOrder reordered to match SERVICE_META layout indices in PageExperience.tsx:
  //   0 → industrial diving, 1 → ROV, 2 → bathymetry, 3 → dam ops, 4 → hydrotechnical, 5 → courses
  const services = [
    {
      translationKey: "diving-services",
      slug: "diving-services",
      title: "Индустриални водолазни услуги",
      shortDescription:
        "Квалифицирани и мотивирани водолази, оборудвани със специализирана съвременна техника за комплексна подводна дейност.",
      sortOrder: 0,
      featuredImageUrl: "/uploads/bsdc/service-diving-work.jpg",
      images: ["/uploads/bsdc/service-diver-work.jpg", "/uploads/bsdc/gallery-diver-helmet.jpg", "/uploads/bsdc/gallery-diver-underwater.jpg", "/uploads/bsdc/service-repair.jpg"],
    },
    {
      translationKey: "rov-services",
      slug: "rov-services",
      title: "ROV инспекции и роботизирано обследване",
      shortDescription:
        "Специализирани услуги с дистанционно управляеми подводни апарати (ROV) с инспекционна апаратура.",
      sortOrder: 1,
      featuredImageUrl: "/uploads/bsdc/service-rov-lbv200.jpg",
      images: ["/uploads/bsdc/service-rov-lbv300.jpg", "/uploads/bsdc/service-rov-t7.jpg", "/uploads/bsdc/gallery-water-dive.jpg"],
    },
    {
      translationKey: "bathymetry-hydrography",
      slug: "bathymetry-hydrography",
      title: "Батиметрия, хидрография и сонарни обследвания",
      shortDescription:
        "Прецизни батиметрични замервания и хидрографски изследвания с детайлни модели за мониторинг на ерозията.",
      sortOrder: 2,
      featuredImageUrl: "/uploads/bsdc/service-bathymetry-scan.jpg",
      images: ["/uploads/bsdc/service-bathymetry-data-01.jpg", "/uploads/bsdc/service-bathymetry-data-02.jpg", "/uploads/bsdc/service-bathymetry-data-03.jpg", "/uploads/bsdc/service-bathymetry-data-04.jpg"],
    },
    {
      translationKey: "micro-dam-operation",
      slug: "micro-dam-operation",
      title: "Оператор на язовири и съоръженията към тях",
      shortDescription:
        "Технически екип, ръководен от квалифициран хидроспециалист, за поддръжка и обслужване на язовири и хидротехнически съоръжения.",
      sortOrder: 3,
      featuredImageUrl: "/uploads/bsdc/project-dam-barrier.jpg",
      images: ["/uploads/bsdc/gallery-sdam.jpg", "/uploads/bsdc/project-yazlata-a.jpg", "/uploads/bsdc/project-gnd-survey.jpg"],
    },
    {
      translationKey: "port-vessel-dam-repairs",
      slug: "port-vessel-dam-repairs",
      title: "Хидротехническо строителство и сухи СМР",
      shortDescription:
        "Хидротехническите съоръжения изискват редовна поддръжка поради постоянното им излагане на природни и климатични условия.",
      sortOrder: 4,
      featuredImageUrl: "/uploads/bsdc/service-repair.jpg",
      images: ["/uploads/bsdc/project-repair-works-a.jpg", "/uploads/bsdc/project-shaft-repair.jpg", "/uploads/bsdc/project-sooruzheniya-a.jpg"],
    },
    {
      translationKey: "diving-courses",
      slug: "diving-courses",
      title: "Водолазни курсове NAUI / CMAS",
      shortDescription:
        "Водолазно обучение по системите NAUI и CMAS, включително пробни водолазни изживявания.",
      sortOrder: 5,
      featuredImageUrl: "/uploads/bsdc/service-courses-scuba.jpg",
      images: ["/uploads/bsdc/gallery-water-dive.jpg", "/uploads/bsdc/gallery-dive-wreck.jpg", "/uploads/bsdc/gallery-diver-underwater.jpg"],
    },
  ]

  for (const s of services) {
    await prisma.service.upsert({
      where: { language_translationKey: { language: "BG", translationKey: s.translationKey } },
      update: {
        slug: s.slug,
        title: s.title,
        shortDescription: s.shortDescription,
        sortOrder: s.sortOrder,
        published: true,
        featuredImageUrl: s.featuredImageUrl,
        images: s.images,
      },
      create: {
        language: "BG",
        translationKey: s.translationKey,
        slug: s.slug,
        title: s.title,
        shortDescription: s.shortDescription,
        sortOrder: s.sortOrder,
        published: true,
        featuredImageUrl: s.featuredImageUrl,
        images: s.images,
      },
    })
  }

  // -----------------------------------------------------------------------
  // Projects — BG
  // Source: https://www.bsdc.bg/news/
  // All four items were published on the live site with confirmed dates.
  // -----------------------------------------------------------------------
  console.log("Seeding projects (BG)…")
  const projects: Array<{
    translationKey: string
    slug: string
    title: string
    excerpt: string
    publishedAt: Date
    sortOrder: number
    featuredImageUrl: string
    images: string[]
    category: string
  }> = [
    {
      translationKey: "yazlata-dam-rehabilitation-2022",
      slug: "yazlata-dam-rehabilitation-2022",
      title: 'Дейности по рехабилитация на язовир „Язлата" при с. Ясна Поляна',
      excerpt:
        'Язовирът се намира в близост до с. Ясна Поляна, Община Приморско, и се използва за напояване на земеделски земи. Проектът обхваща рехабилитация на основните изпускателни съоръжения.',
      publishedAt: new Date("2022-12-10"),
      sortOrder: 0,
      featuredImageUrl: "/uploads/bsdc/project-yazlata-a.jpg",
      images: ["/uploads/bsdc/project-yazlata-b.jpg"],
      category: "Хидротехническо строителство",
    },
    {
      translationKey: "kardzhali-dam-rov-inspection-2022",
      slug: "kardzhali-dam-rov-inspection-2022",
      title: 'Подводна инспекция на решетките на изпускателите на язовир „Кърджали"',
      excerpt:
        'Хидроенергийният комплекс „Кърджали" е горното стъпало на каскадата „Арда". Стената на язовира разполага с два основни тунелни изпускателя, подложени на подводна инспекция.',
      publishedAt: new Date("2022-12-04"),
      sortOrder: 1,
      featuredImageUrl: "/uploads/bsdc/project-kardzhali-a.jpg",
      images: ["/uploads/bsdc/project-kardzhali-b.jpg"],
      category: "ROV инспекции",
    },
    {
      translationKey: "teshal-dam-devin-inspection-2022",
      slug: "teshal-dam-devin-inspection-2022",
      title: 'Подводна инспекция на язовир „Тешел" и водовземането за ВЕЦ „Девин"',
      excerpt:
        'Язовирите „Доспат" и „Тешел" са горните стъпала на каскадата Доспат–Въча. Извършена е подводна инспекция на основния изпускател и водовземателното съоръжение за ВЕЦ „Девин".',
      publishedAt: new Date("2022-10-30"),
      sortOrder: 2,
      featuredImageUrl: "/uploads/bsdc/project-teshal-a.jpg",
      images: ["/uploads/bsdc/project-teshal-b.jpg"],
      category: "ROV инспекции",
    },
    {
      translationKey: "peshtera-hec-intake-inspection-2022",
      slug: "peshtera-hec-intake-inspection-2022",
      title: 'Подводна инспекция на водовземателна кула на ВЕЦ „Пещера"',
      excerpt:
        'Водовземателната кула се намира на 150 метра от оста на язовирната стена, в дясното поле на водохранилището, над входа на основния водопроводен тунел.',
      publishedAt: new Date("2022-10-23"),
      sortOrder: 3,
      featuredImageUrl: "/uploads/bsdc/project-peshtera-a.jpg",
      images: ["/uploads/bsdc/project-peshtera-b.jpg"],
      category: "ROV инспекции",
    },
  ]

  for (const p of projects) {
    await prisma.projectNewsItem.upsert({
      where: { language_translationKey: { language: "BG", translationKey: p.translationKey } },
      update: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        type: ProjectNewsType.PROJECT,
        publishedAt: p.publishedAt,
        sortOrder: p.sortOrder,
        published: true,
        featuredImageUrl: p.featuredImageUrl,
        images: p.images,
        category: p.category,
      },
      create: {
        language: "BG",
        translationKey: p.translationKey,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        type: ProjectNewsType.PROJECT,
        publishedAt: p.publishedAt,
        sortOrder: p.sortOrder,
        published: true,
        featuredImageUrl: p.featuredImageUrl,
        images: p.images,
        category: p.category,
      },
    })
  }

  // -----------------------------------------------------------------------
  // Certificates
  // The bsdc.bg/about/ page references QM, UM, and environmental management
  // certifications but does not list titles, issuing bodies, or dates.
  // TODO: obtain certificate names, issuer, and dates from the company,
  //       then add them here via prisma.certificate.upsert({
  //         where: { language_translationKey: { language: "BG", translationKey: "..." } },
  //         ...
  //       })
  // Certificates render as a subsection of About on the public frontend.
  // -----------------------------------------------------------------------

  console.log("Seed complete.")
}

main()
  .catch((e) => {
    console.error("Seed error:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
