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

  const aboutContent = [
    "Черноморски Водолазен Център ООД е специализирана компания в областта на подводното строителство, ремонти и инспекции, работеща от 2001 г.",
    "Предлагаме широк спектър от услуги: подводно строителство и ремонти, водолазни и ROV инспекции, аварийно-спасителни операции, поддръжка на пристанища и плавателни съдове.",
    "Работим с доказан професионализъм, планиране и дисциплина в управленско, оперативно и административно направление.",
    "Предимствата ни: високо качество, гарантирана работа, операции по целия свят, консултации и достъпни цени.",
  ].join("\n\n")

  const aboutWhyUs = {
    label: "Защо да ни изберете",
    items: [
      { title: "Специализиран водолазен екип", desc: "Екип с практически опит в подводни огледи, ремонти и работа в сложни условия." },
      { title: "Опит в язовири и хидротехника", desc: "Работа по язовирни стени, изпускатели, водовземни съоръжения и хидротехническа инфраструктура." },
      { title: "ROV и сонарни обследвания", desc: "Дистанционни инспекции, видео документиране и сонарни обследвания на труднодостъпни зони." },
      { title: "Технически подход и отчетност", desc: "Планиране, документиране на констатациите и ясна информация за резултата от огледа или изпълнението." },
      { title: "Комплексни подводни дейности", desc: "Комбинация от водолазни услуги, обследвания, ремонти и поддръжка на съоръжения." },
      { title: "Работа по реална инфраструктура", desc: "Фокус върху пристанища, плавателни съдове, язовири, ВЕЦ и индустриални обекти." },
    ],
  }

  const aboutTimeline = {
    label: "Развитие",
    items: [
      { year: "2001", label: "Начало", desc: "Черноморски Водолазен Център започва дейност, свързана с водолазни услуги и работа във водна среда." },
      { year: null,   label: "Водолазни курсове", desc: "Развитие на любителско водолазно обучение и пробни гмуркания по системите NAUI / CMAS." },
      { year: null,   label: "Първи комерсиални обекти", desc: "Преминаване към подводни огледи, технически задачи и работа по инфраструктурни обекти." },
      { year: null,   label: "Индустриални водолазни услуги", desc: "Разширяване към подводни ремонти, монтажи, почистване, аварийни дейности и работа по хидротехнически съоръжения." },
      { year: null,   label: "ROV и сонарни обследвания", desc: "Въвеждане на дистанционни инспекции, видео документиране и сонарни обследвания за труднодостъпни или рискови обекти." },
      { year: null,   label: "Язовири и хидротехника", desc: "Работа по язовирни стени, изпускатели, водовземни съоръжения, ВЕЦ и друга хидротехническа инфраструктура." },
    ],
  }

  const aboutStatistics = [
    { label: "Основана",    value: "2001"  },
    { label: "Услуги",      value: "6+"    },
    { label: "Клиенти",     value: "50+"   },
    { label: "Проекта",     value: "100+"  },
    { label: "Страни",      value: "3+"    },
    { label: "Опит (г.)",   value: "20+"   },
  ]

  await prisma.aboutContent.upsert({
    where: { language: "BG" },
    update: {
      title: "За нас",
      subtitle: "Висококачествени решения",
      content: aboutContent,
      // imageUrl, statistics, whyUs, timeline intentionally omitted —
      // never overwrite CMS-managed fields via seed once they are set
    },
    create: {
      language: "BG",
      title: "За нас",
      subtitle: "Висококачествени решения",
      content: aboutContent,
      imageUrl: "/uploads/bsdc/about-diving-suit-historic.jpg",
      statistics: aboutStatistics,
      whyUs: aboutWhyUs,
      timeline: aboutTimeline,
    },
  })

  // Restore image only if currently null
  await prisma.aboutContent.updateMany({
    where: { language: "BG", imageUrl: null },
    data: { imageUrl: "/uploads/bsdc/about-diving-suit-historic.jpg" },
  })

  // Seed whyUs/timeline defaults only if currently null (preserve admin edits)
  const existingAbout = await prisma.aboutContent.findUnique({ where: { language: "BG" } })
  if (existingAbout && existingAbout.whyUs === null) {
    await prisma.aboutContent.update({ where: { language: "BG" }, data: { whyUs: aboutWhyUs } })
    console.log("  Seeded default whyUs items.")
  }
  if (existingAbout && existingAbout.timeline === null) {
    await prisma.aboutContent.update({ where: { language: "BG" }, data: { timeline: aboutTimeline } })
    console.log("  Seeded default timeline items.")
  }
  if (existingAbout && existingAbout.statistics === null) {
    await prisma.aboutContent.update({ where: { language: "BG" }, data: { statistics: aboutStatistics } })
    console.log("  Seeded default statistics.")
  }

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
        "Квалифицирани водолази за подводни огледи, ремонти, монтаж и аварийни операции на хидротехнически и пристанищни съоръжения.",
      content: `<p>BSDC изпълнява подводни индустриални дейности с квалифициран водолазен екип и специализирано оборудване. Работим на различни обекти — пристанища, язовири, мостове и подводна инфраструктура.</p>

<p><strong>Кога се използва услугата</strong></p>
<p>Услугата е подходяща при необходимост от подводен оглед, ремонт или монтаж на конструкции. Прилага се при рутинна поддръжка на хидротехнически съоръжения и при аварийни ситуации, изискващи незабавна водолазна намеса.</p>

<p><strong>Какво включва</strong></p>
<p>Подводни огледи и инспекции, ремонт и укрепване на конструкции, монтаж и демонтаж на оборудване под вода, почистване на подводни повърхности, подводно бетониране, видео и фотодокументиране на констатациите.</p>

<p><strong>Типични обекти</strong></p>
<p>Пристанища и кейове, язовирни стени и изпускателни съоръжения, мостове и подпорни конструкции, тръбопроводи и кабелна инфраструктура, корпуси на плавателни съдове.</p>

<p><strong>Технически подход</strong></p>
<p>Всяка задача започва с предварителен оглед и оценка на условията. Водолазите работят с подходящо оборудване за конкретния обект. Дейностите се документират с видео и снимки за последващ анализ.</p>

<p><strong>Документация и резултат</strong></p>
<p>Изготвяме инспекционни протоколи с видео и снимки, технически констатации и препоръки за по-нататъшни действия. Свържете се с нас за оценка на вашия обект.</p>`,
      sortOrder: 0,
      featuredImageUrl: "/uploads/bsdc/service-diving-work.jpg",
      images: ["/uploads/bsdc/service-diver-work.jpg", "/uploads/bsdc/gallery-diver-helmet.jpg", "/uploads/bsdc/gallery-diver-underwater.jpg", "/uploads/bsdc/service-repair.jpg"],
    },
    {
      translationKey: "rov-services",
      slug: "rov-services",
      title: "ROV инспекции и роботизирано обследване",
      shortDescription:
        "ROV инспекции на подводни съоръжения с видео и фотодокументиране — без риск за водолазен персонал.",
      content: `<p>BSDC извършва ROV инспекции с дистанционно управляеми подводни апарати, позволяващи обследване на съоръжения без водолазна намеса. Дейността се документира с видео и снимки в реално време.</p>

<p><strong>Кога се използва услугата</strong></p>
<p>ROV инспекцията е подходяща при обследване на труднодостъпни зони и места с ограничена видимост. Използва се и като предварителен оглед преди водолазна операция, или като самостоятелен метод за документиране на подводни съоръжения.</p>

<p><strong>Какво включва</strong></p>
<p>Видео и фотодокументиране на подводни конструкции, обследване на тръбопроводи и кабели, инспекция на труднодостъпни зони, документиране на дефекти и повреди, изготвяне на технически доклади.</p>

<p><strong>Типични обекти</strong></p>
<p>Язовирни тела и изпускателни шахти, корпуси на плавателни съдове, подводни кабели и тръбопроводи, пристанищна инфраструктура, резервоари и технически съоръжения.</p>

<p><strong>Технически подход</strong></p>
<p>ROV апаратите са оборудвани с видеокамери и осветление за работа при различни условия на видимост. Операторите управляват апаратите дистанционно и наблюдават обектите в реално време на монитор.</p>

<p><strong>Документация и резултат</strong></p>
<p>Видеозапис на цялата инспекция, снимки на констатираните дефекти, технически доклад с описание на находките и препоръки. Свържете се с нас за оценка на вашия обект.</p>`,
      sortOrder: 1,
      featuredImageUrl: "/uploads/bsdc/service-rov-lbv200.jpg",
      images: ["/uploads/bsdc/service-rov-lbv300.jpg", "/uploads/bsdc/service-rov-t7.jpg", "/uploads/bsdc/gallery-water-dive.jpg"],
    },
    {
      translationKey: "bathymetry-hydrography",
      slug: "bathymetry-hydrography",
      title: "Батиметрия, хидрография и сонарни обследвания",
      shortDescription:
        "Батиметрични измервания и сонарни обследвания за изготвяне на цифрови модели и карти на дъното на язовири, реки и морска акватория.",
      content: `<p>BSDC извършва батиметрични измервания и сонарни обследвания на язовири, реки, пристанища и морска акватория. Резултатите се представят като цифрови модели и карти на дъното.</p>

<p><strong>Кога се използва услугата</strong></p>
<p>Батиметрията е необходима при мониторинг на наносни отложения в язовири, оценка на ерозия, хидрографски изследвания за проектни нужди и предварително обследване преди водолазна или строителна дейност.</p>

<p><strong>Какво включва</strong></p>
<p>Батиметрични измервания на дъното, сонарни обследвания, хидрографски изследвания, изготвяне на цифрови модели и карти, мониторинг на промените в дъното при повторни измервания.</p>

<p><strong>Типични обекти</strong></p>
<p>Язовири, реки и канали, пристанища и фарватери, крайбрежна зона, зони около хидротехнически съоръжения.</p>

<p><strong>Технически подход</strong></p>
<p>Измерванията се извършват от плавателен съд с ехолотна и сонарна апаратура. Данните се обработват и представят в подходящи формати за последващо проектиране или анализ.</p>

<p><strong>Документация и резултат</strong></p>
<p>Батиметрична карта, цифров модел на дъното, таблица с обеми и площи, технически доклад с интерпретация. Свържете се с нас за оферта.</p>`,
      sortOrder: 2,
      featuredImageUrl: "/uploads/bsdc/service-bathymetry-scan.jpg",
      images: ["/uploads/bsdc/service-bathymetry-data-01.jpg", "/uploads/bsdc/service-bathymetry-data-02.jpg", "/uploads/bsdc/service-bathymetry-data-03.jpg", "/uploads/bsdc/service-bathymetry-data-04.jpg"],
    },
    {
      translationKey: "micro-dam-operation",
      slug: "micro-dam-operation",
      title: "Оператор на язовири и съоръженията към тях",
      shortDescription:
        "Техническо обслужване и поддръжка на язовири и хидротехнически съоръжения от квалифициран екип.",
      content: `<p>BSDC предоставя услуги по техническо обслужване и поддръжка на язовири и хидротехнически съоръжения. Дейността се извършва от технически екип с необходимата квалификация и опит.</p>

<p><strong>Кога се използва услугата</strong></p>
<p>Техническото обслужване е необходимо за поддържане на язовирните съоръжения в изправно и безопасно техническо състояние. Законовите изисквания задължават собствениците да осигурят редовен технически контрол и поддръжка на своите обекти.</p>

<p><strong>Какво включва</strong></p>
<p>Редовен мониторинг на техническото и хидрологичното състояние, контрол и управление на водоизпускателните органи, профилактика и текущи ремонти, изготвяне на технически отчети и документация, действия при аварийни ситуации.</p>

<p><strong>Типични обекти</strong></p>
<p>Малки и средни язовири, микроязовири за напояване, водовземни съоръжения, регулационни прагове и деривационни канали.</p>

<p><strong>Технически подход</strong></p>
<p>Извършваме редовни инспекции на съоръженията и наблюдаваме техническото им състояние. При отклонения уведомяваме собственика и предприемаме необходимите мерки. Поддържаме актуална документация за всеки обект.</p>

<p><strong>Документация и резултат</strong></p>
<p>Технически доклади и протоколи от инспекции, дневник на язовира, уведомления при отклонения. Свържете се с нас за договор за обслужване.</p>`,
      sortOrder: 3,
      featuredImageUrl: "/uploads/bsdc/project-dam-barrier.jpg",
      images: ["/uploads/bsdc/gallery-sdam.jpg", "/uploads/bsdc/project-yazlata-a.jpg", "/uploads/bsdc/project-gnd-survey.jpg"],
    },
    {
      translationKey: "port-vessel-dam-repairs",
      slug: "port-vessel-dam-repairs",
      title: "Хидротехническо строителство и сухи СМР",
      shortDescription:
        "Строително-монтажни и ремонтно-възстановителни работи на хидротехнически и подводни съоръжения.",
      content: `<p>BSDC изпълнява строително-монтажни и ремонтно-възстановителни работи на хидротехнически и подводни съоръжения. Комбинираме водолазни и строителни дейности за пълно изпълнение на проектите.</p>

<p><strong>Кога се използва услугата</strong></p>
<p>Хидротехническото строителство е необходимо при рехабилитация на съоръжения, ремонт на конструктивни повреди, укрепване на застрашена инфраструктура и изграждане на нови елементи към съществуващи хидротехнически обекти.</p>

<p><strong>Какво включва</strong></p>
<p>Ремонт и укрепване на бетонни и стоманобетонни конструкции, подводно и надводно бетониране, монтаж на метални конструкции и затворни органи, хидроизолация, земно-копни работи около хидравлични съоръжения.</p>

<p><strong>Типични обекти</strong></p>
<p>Язовирни стени и изпускателни съоръжения, пристанищни кейове и вълноломи, мостови опори, водовземни кули и шахти, подпорни стени.</p>

<p><strong>Технически подход</strong></p>
<p>Работата започва с оглед и оценка на повредите. Използваме подходящи материали и технологии за конкретния обект. Изпълнението се документира и контролира на всеки етап.</p>

<p><strong>Документация и резултат</strong></p>
<p>Строителна документация, протоколи от изпитания, технически доклади за изпълнените дейности. Свържете се с нас за оценка на вашия обект.</p>`,
      sortOrder: 4,
      featuredImageUrl: "/uploads/bsdc/service-repair.jpg",
      images: ["/uploads/bsdc/project-repair-works-a.jpg", "/uploads/bsdc/project-shaft-repair.jpg", "/uploads/bsdc/project-sooruzheniya-a.jpg"],
    },
    {
      translationKey: "diving-courses",
      slug: "diving-courses",
      title: "Водолазни курсове NAUI / CMAS",
      shortDescription:
        "Любителско водолазно обучение по системите NAUI и CMAS, включително пробни водолазни изживявания.",
      content: `<p>BSDC предлага любителско водолазно обучение по системите NAUI и CMAS — от пробни гмуркания до курсове за напреднали. Обучението се провежда на открита вода и в закрит басейн.</p>

<p><strong>Кога се използва услугата</strong></p>
<p>Подходящо за всеки, който иска да се запознае с подводния свят или да получи международно призната водолазна сертификация. Предлагаме обучение за всички нива — от пълни начинаещи до опитни водолази.</p>

<p><strong>Какво включва</strong></p>
<p>Пробни водолазни изживявания, начални курсове по NAUI и CMAS, курсове за напреднали, обучение на открита вода, теоретична и практическа подготовка.</p>

<p><strong>Типични обекти</strong></p>
<p>Черно море, закрити басейни, сладководни обекти подходящи за водолазно обучение.</p>

<p><strong>Технически подход</strong></p>
<p>Обучението се провежда от квалифицирани инструктори по NAUI и CMAS програми. Групите са с ограничен брой участници за максимална безопасност. Оборудването се осигурява от BSDC за времето на обучението.</p>

<p><strong>Документация и резултат</strong></p>
<p>Международно признати сертификати по NAUI или CMAS, логбук с верифицирани гмуркания. Свържете се с нас за програма и налични дати.</p>`,
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
        content: s.content,
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
        content: s.content,
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
