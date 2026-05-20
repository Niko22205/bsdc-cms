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
    "Черноморски Водолазен Център ООД е специализирана компания в областта на подводното строителство, ремонти и технически инспекции, основана през 2001 г. от двама опитни водолази с над 20 години практически опит.",
    "Предлагаме пълен спектър от услуги: подводно строителство и ремонти, индустриални водолазни и ROV инспекции, батиметрия и хидрография, аварийно-спасителни операции, поддръжка на пристанища, плавателни съдове и язовири, обучение по системите NAUI и CMAS.",
    "Работим по обекти в пристанища, кейове, мостове, дамби, ВЕЦ, язовирни стени и нефтено-газова инфраструктура — с ясна техническа документация и пълна отчетност за всяка изпълнена задача.",
    "Сред клиентите ни са ЕнергоПро, Агенция Пристанищна администрация, НЕК ЕАД, TUV Nord и редица морски и индустриални организации. Ценим безупречната репутация и неизменно даваме малко повече от очакваното.",
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
      accentColor: "#B87333",
      bgColor: "#07111f",
      activities: [
        "Подводни огледи и диагностика на конструкции",
        "Ремонти под вода — бетон, метал, хидроизолация",
        "Монтаж и демонтаж на подводно оборудване",
        "Аварийни операции при нулева видимост",
        "Подводно бетониране и укрепване",
        "Видео и фото документация в реално време",
      ],
      statCards: [
        { title: "Работна дълбочина", value: "50м+", sub: "и по-дълбоко" },
        { title: "Реакция", value: "24ч", sub: "аварийна готовност" },
        { title: "Стандарт", value: "ISO", sub: "45001 · QM" },
      ],
      shortDescription:
        "Квалифицирани водолази за подводни огледи, ремонти, монтаж и аварийни операции на хидротехнически и пристанищни съоръжения.",
      content: `<p>Там, където строителната техника спира — нашите водолази продължават. От 2001 г. изпълняваме подводни индустриални задачи по хидротехнически обекти, пристанища и аварийни ситуации, изискващи незабавна реакция.</p>

<p><strong>Извикайте ни при:</strong></p>
<ul>
<li>Авария с неизвестен характер под водата — диагностика и незабавна намеса</li>
<li>Спешен подводен оглед на конструкция след инцидент или наводнение</li>
<li>Монтаж или демонтаж на оборудване без изпразване на съоръжението</li>
<li>Подводен ремонт на конструкции, тръбопроводи или затворни органи</li>
<li>Почистване на решетки, решетъчни камери и водовземни отвори</li>
</ul>

<p>Стандартна работна дълбочина до 50 м; при специализирани операции работим и по-дълбоко по индивидуален план за безопасност. Водолазният наряд включва водолаз, осигуряващ и ръководител на работите. Оборудвани сме за работа при нулева видимост, силни течения и стеснени пространства. Аварийна готовност <strong>24 часа, 7 дни в седмицата</strong>.</p>

<p>Работили сме по пристанища, корпуси на плавателни съдове, язовирни стени и изпускатели, мостове, ВЕЦ, тръбопроводи и кабелна инфраструктура. Всяка задача приключва с видео и снимков протокол, технически констатации и ясни препоръки за следващи действия.</p>`,
      sortOrder: 0,
      featuredImageUrl: "/uploads/bsdc/service-diving-work.jpg",
      images: ["/uploads/bsdc/service-diver-work.jpg", "/uploads/bsdc/gallery-diver-helmet.jpg", "/uploads/bsdc/gallery-diver-underwater.jpg"],
    },
    {
      translationKey: "rov-services",
      slug: "rov-services",
      title: "ROV инспекции и роботизирано обследване",
      accentColor: "#00c8e8",
      bgColor: "#040e1a",
      activities: [
        "HD видео инспекция на потопени конструкции",
        "Обследване на тръбопроводи, кабели и кейове",
        "Инспекция при нулева видимост и голяма дълбочина",
        "Картиране на труднодостъпни подводни зони",
        "Детектиране и документиране на дефекти",
        "Технически доклади с GPS координати",
      ],
      statCards: [
        { title: "Макс. дълбочина", value: "200м", sub: "LBV-200 / LBV-300" },
        { title: "Камера", value: "HD", sub: "видео в реално време" },
        { title: "Точност", value: "±2см", sub: "позициониране" },
      ],
      shortDescription:
        "ROV инспекции на подводни съоръжения с HD видео и GPS документиране — без риск за водолазен персонал.",
      content: `<p>ROV инспекцията дава пълен зрителен контрол на подводни съоръжения — без да изпращаме водолаз. Нашите апарати работят при различни условия на видимост и дълбочина, с HD видео в реално време.</p>

<p><strong>Системи в експлоатация:</strong></p>
<ul>
<li><strong>LBV-200</strong> — лек маневрен апарат за тесни конструкции, шахти и труднодостъпни пространства</li>
<li><strong>LBV-300</strong> — стандартна работна платформа с широкоъгълна камера и мощно осветление за по-дълбоки инспекции</li>
</ul>

<p>Видеопотокът се записва в пълно качество и се маркира с GPS координати, времеви печат и дълбочина в реално време. Операторите управляват апаратите дистанционно от плавателния съд — <strong>без риск за персонал</strong>, дори при нулева видимост или опасни условия.</p>

<p>ROV е особено ценен преди водолазна операция — за преценка дали изобщо е нужна намеса, и за документиране на дефекти в труднодостъпни места: тунелни изпускатели, шахти, кабелни трасета, решетъчни камери. Резултатът е технически доклад с видеозапис, анотирани снимки и препоръки за ремонт или по-нататъшни действия.</p>`,
      sortOrder: 1,
      featuredImageUrl: "/uploads/bsdc/project-kardzhali-b.jpg",
      images: ["/uploads/bsdc/service-rov-lbv200.jpg", "/uploads/bsdc/service-rov-lbv300.jpg", "/uploads/bsdc/project-kardzhali-a.jpg"],
    },
    {
      translationKey: "bathymetry-hydrography",
      slug: "bathymetry-hydrography",
      title: "Батиметрия, хидрография и сонарни обследвания",
      accentColor: "#38bdf8",
      bgColor: "#040c18",
      activities: [
        "Батиметрично картиране на дъното",
        "Многолъчев сонар — пълно зонално покритие",
        "Хидрографски проучвания по БДС/ISO",
        "Мониторинг на наносни отложения и обеми",
        "Цифрови 3D модели на дъното (DEM)",
        "Сертифицирани хидрографски доклади",
      ],
      statCards: [
        { title: "Точност", value: "±5см", sub: "вертикална" },
        { title: "Покритие", value: "100%", sub: "зонално" },
        { title: "Формат", value: "DXF/PDF", sub: "изходни данни" },
      ],
      shortDescription:
        "Батиметрични измервания и сонарни обследвания за цифрови модели и карти на дъното на язовири, реки и морска акватория.",
      content: `<p>Батиметричното измерване превръща водното дъно от непознат терен в точен цифров модел. Данните се използват за проектиране, мониторинг на наноси, оценка на обеми и сравнителен анализ при повторни измервателни кампании.</p>

<p><strong>Методология:</strong></p>
<p>Измерванията се извършват с ехолотна апаратура и многолъчев сонар от плавателен съд. Точност на вертикалното позициониране — до <strong>±5 cm</strong>. Хоризонтално покритие — <strong>100%</strong> от зоната без пропуски. Позициониране с GPS/GNSS, корекция на водното ниво в реално време. Обработката и изготвянето на продуктите се извършва с лицензиран хидрографски софтуер.</p>

<p><strong>Какво получавате в края:</strong></p>
<ul>
<li>Батиметрична карта на дъното в DXF / PDF / AutoCAD формат</li>
<li>Цифров модел на релефа (DEM / DTM) с избрана резолюция</li>
<li>Таблица с обеми и площи по зони и коти</li>
<li>Технически доклад с интерпретация на данните и методология</li>
<li>Сравнителен анализ при повторни измервания — количествена оценка на промените</li>
</ul>

<p>Изследванията са по методиките на БДС и ISO за хидрографски измервания. Покриваме язовири, реки, пристанищни акватории, крайбрежна зона и открито море. Периодичният мониторинг е особено ценен за язовири — позволява точна оценка на заглинявeне и оставащ полезен обем.</p>`,
      sortOrder: 2,
      featuredImageUrl: "/uploads/bsdc/service-bathymetry-scan.jpg",
      images: ["/uploads/bsdc/service-bathymetry-data-01.jpg", "/uploads/bsdc/service-bathymetry-data-02.jpg", "/uploads/bsdc/service-bathymetry-data-03.jpg", "/uploads/bsdc/service-bathymetry-data-04.jpg"],
    },
    {
      translationKey: "micro-dam-operation",
      slug: "micro-dam-operation",
      title: "Оператор на язовири и съоръженията към тях",
      accentColor: "#B87333",
      bgColor: "#0c0e14",
      activities: [
        "Ежедневен обход и визуален мониторинг",
        "Контрол на водоизпускателните органи",
        "Превантивна поддръжка и текущи ремонти",
        "Технически дневник и регулаторни отчети",
        "Аварийни действия — денонощна готовност",
        "Координация с ДАМТН и водно стопанство",
      ],
      statCards: [
        { title: "Покритие", value: "Цяла BG", sub: "всички язовири" },
        { title: "Обход", value: "Ежедн.", sub: "при необходимост" },
        { title: "Реакция", value: "24/7", sub: "при инцидент" },
      ],
      shortDescription:
        "Договорно техническо обслужване и поддръжка на язовири и хидротехнически съоръжения — 24/7 готовност.",
      content: `<p>Законодателството задължава собствениците на язовири да осигурят квалифицирана техническа поддръжка. BSDC поема тази отговорност изцяло — от ежедневния обход до денонощното аварийно дежурство, на обекти в цяла България.</p>

<p><strong>Договорното обслужване включва:</strong></p>
<ul>
<li>Ежедневен обход и визуален мониторинг на тялото, основата и съоръженията</li>
<li>Управление и контрол на водоизпускателните органи — основен и авариен изпускател</li>
<li>Профилактични проверки на механизми, уплътнения и подвижни елементи</li>
<li>Текущи ремонти и отстраняване на констатирани неизправности</li>
<li>Водене на технически дневник и цялата регулаторна документация</li>
<li>Координация с ДАМТН, воден синдикат и Агенция „Води"</li>
<li>Денонощна готовност при инцидент или опасен хидрологичен режим</li>
<li>Подводни огледи и ROV инспекции на изпускателни съоръжения при необходимост</li>
</ul>

<p>Обслужваме язовири и хидротехнически съоръжения в цяла България — напоителни, питейни, ВЕЦ и промишлени. Всяко посещение се документира с протокол и снимков материал — пълна проследимост за собственика и регулатора.</p>`,
      sortOrder: 3,
      featuredImageUrl: "/uploads/bsdc/project-dam-barrier.jpg",
      images: ["/uploads/bsdc/gallery-sdam.jpg", "/uploads/bsdc/project-yazlata-a.jpg", "/uploads/bsdc/project-lake-reservoir.jpg"],
    },
    {
      translationKey: "port-vessel-dam-repairs",
      slug: "port-vessel-dam-repairs",
      title: "Хидротехническо строителство и сухи СМР",
      accentColor: "#9ca3af",
      bgColor: "#0a0b0d",
      activities: [
        "Ремонт и укрепване на бетонни съоръжения",
        "Подводно бетониране с водоустойчиви смеси",
        "Монтаж на стоманени конструкции и шпунтове",
        "Хидроизолация на стени, дъна и шахти",
        "Укрепване на свлачища и брегозащитни работи",
        "Сухи СМР — кейове, диги, водовземни кули",
      ],
      statCards: [
        { title: "Работна дълб.", value: "50м", sub: "под вода" },
        { title: "Методи", value: "Мокри+Сухи", sub: "СМР" },
        { title: "Документация", value: "Пълна", sub: "строит. досие" },
      ],
      shortDescription:
        "Строителни и ремонтно-възстановителни работи по хидротехнически съоръжения — под вода и на сухо, с един екип.",
      content: `<p>Когато конструкцията е наводнена или под вода — ремонтът не чака. Изпълняваме строителни работи едновременно под вода и на сухо, на едно и също съоръжение, с един екип, без нужда от пресушаване.</p>

<p><strong>Процес на изпълнение:</strong></p>
<ol>
<li><strong>Оглед и диагностика</strong> — водолазна или ROV инспекция, детайлно заснемане на щетите и дефектите</li>
<li><strong>Технически проект</strong> — избор на решение, материали и технология, съгласуване с клиента</li>
<li><strong>Изпълнение</strong> — подводни и надводни СМР с технически контрол на всеки етап и фотодокументиране</li>
<li><strong>Приемателен протокол</strong> — строителна документация, протоколи от изпитания и пълно фотодосие</li>
</ol>

<p>Работим с водоустойчиви бетонни смеси за подводно бетониране, конструктивна стомана, шпунтове, хидроизолационни системи и специализирани ремонтни материали за влажна среда. Нямаме нужда от пресушаване — ремонтираме директно под вода.</p>

<p>Типични обекти: язовирни стени и изпускатели, пристанищни кейове и вълноломи, мостови опори и подпорни стени, водовземни кули и шахти, брегозащитни съоръжения.</p>`,
      sortOrder: 4,
      featuredImageUrl: "/uploads/bsdc/service-repair.jpg",
      images: ["/uploads/bsdc/project-repair-works-a.jpg", "/uploads/bsdc/project-shaft-repair.jpg", "/uploads/bsdc/project-sooruzheniya-a.jpg"],
    },
    {
      translationKey: "diving-courses",
      slug: "diving-courses",
      title: "Водолазни курсове NAUI / CMAS",
      accentColor: "#60a5fa",
      bgColor: "#061020",
      activities: [
        "Пробно гмуркане за начинаещи — Черно море",
        "Open Water Diver — NAUI & CMAS ★",
        "Advanced Open Water — NAUI & CMAS ★★",
        "Rescue Diver и First Aid",
        "Специализирани курсове — нощно, wreck, deep",
        "Теоретична и практическа подготовка в басейн",
      ],
      statCards: [
        { title: "NAUI", value: "OW→DM", sub: "пълна прогресия" },
        { title: "CMAS", value: "★→★★★", sub: "международен стандарт" },
        { title: "Група", value: "≤ 4", sub: "студента/инструктор" },
      ],
      shortDescription:
        "Любителско водолазно обучение по NAUI и CMAS — от пробно гмуркане на Черно море до инструкторска сертификация.",
      content: `<p>Черно море е на крачка. Единственото, от което имате нужда — е да скочите. Останалото е наша грижа.</p>

<p>Обучаваме водолази по програмите на <strong>NAUI</strong> и <strong>CMAS</strong> — двете най-признати международни организации. Малки групи — <strong>до 4 студента на инструктор</strong> — за максимална безопасност и индивидуален подход.</p>

<p><strong>Пътят на водолаза:</strong></p>
<ul>
<li><strong>Пробно гмуркане</strong> — почувствайте подводния свят без ангажимент, в плитка вода с инструктор</li>
<li><strong>Open Water Diver / CMAS ★</strong> — вашата първа самостоятелна сертификация; теория, басейн и открита вода</li>
<li><strong>Advanced Open Water / CMAS ★★</strong> — нощно гмуркане, подводна навигация, по-голяма дълбочина</li>
<li><strong>Rescue Diver</strong> — управление на извънредни ситуации, спасяване и първа помощ</li>
<li><strong>Специализации</strong> — wreck diving, deep diving, подводна фотография, пещерно гмуркане</li>
<li><strong>Divemaster</strong> — асистент на инструктор, ръководство на групи</li>
</ul>

<p>Обучението включва теоретична подготовка, практически упражнения в закрит басейн и сесии на открита вода на Черно море. Цялото оборудване се осигурява от нас за времето на курса. Завършвате с <strong>международно признат сертификат</strong> по NAUI или CMAS и логбук с верифицирани гмуркания — признат навсякъде по света.</p>`,
      sortOrder: 5,
      featuredImageUrl: "/uploads/bsdc/service-courses-scuba.jpg",
      images: ["/uploads/bsdc/gallery-dive-wreck.jpg", "/uploads/bsdc/gallery-diver-underwater.jpg", "/uploads/bsdc/gallery-water-dive.jpg"],
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
        accentColor: s.accentColor,
        bgColor: s.bgColor,
        activities: s.activities,
        statCards: s.statCards,
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
        accentColor: s.accentColor,
        bgColor: s.bgColor,
        activities: s.activities,
        statCards: s.statCards,
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
