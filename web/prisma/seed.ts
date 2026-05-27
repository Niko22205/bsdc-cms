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
  // -----------------------------------------------------------------------
  console.log("Seeding site settings…")
  const settingsData = {
    companyName: "Черноморски Водолазен Център ООД",
    address: 'Пристанищен комплекс „Булпорт Логистик", Варна 9009',
    phones: [
      "+359 52 603433",
      "+359 52 603432",
      "+359 899 980 995",
      "+359 899 993 312",
      "+359 896 722 205",
    ],
    email: "office@bsdc.bg",
    workingHours: "08:00 – 17:00, Пон – Пет · 24/7 при аварии",
    footerText: "В света на тишината, говорят действията!",
    defaultSeoTitle: "BSDC | Черноморски Водолазен Център",
    defaultSeoDescription:
      "Специализирана компания в областта на подводното строителство, водолазните инспекции и ремонти от 2001 г. Индустриални водолазни услуги, ROV инспекции, батиметрия, поддръжка на язовири и водолазни курсове.",
  }
  const existingSettings = await prisma.siteSetting.findFirst()
  if (existingSettings) {
    await prisma.siteSetting.update({ where: { id: existingSettings.id }, data: settingsData })
  } else {
    await prisma.siteSetting.create({ data: settingsData })
  }

  // -----------------------------------------------------------------------
  // Home Content — BG
  // -----------------------------------------------------------------------
  console.log("Seeding home content (BG)…")
  await prisma.homeContent.upsert({
    where: { language: "BG" },
    update: {
      headline: "Черноморски Водолазен Център",
      subheadline: "Намирането на трайно решение е нашата крайна цел!",
      eyebrow: "ПОДВОДНИ ТЕХНОЛОГИИ · ОТ 2001",
      ctaLabel: "Нашите услуги",
      ctaTarget: "#services",
      ctaSecondaryLabel: "Свържете се с нас",
      ctaSecondaryTarget: "#contact",
    },
    create: {
      language: "BG",
      headline: "Черноморски Водолазен Център",
      subheadline: "Намирането на трайно решение е нашата крайна цел!",
      eyebrow: "ПОДВОДНИ ТЕХНОЛОГИИ · ОТ 2001",
      ctaLabel: "Нашите услуги",
      ctaTarget: "#services",
      ctaSecondaryLabel: "Свържете се с нас",
      ctaSecondaryTarget: "#contact",
      heroImageUrl: "/uploads/bsdc/hero-diver-helmet.jpg",
    },
  })
  await prisma.homeContent.updateMany({
    where: { language: "BG", heroImageUrl: null },
    data: { heroImageUrl: "/uploads/bsdc/hero-diver-helmet.jpg" },
  })

  // -----------------------------------------------------------------------
  // About Content — BG
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
      {
        title: "Над 20 години специализиран опит",
        desc: "От 2001 г. работим изключително в подводната индустрия — не сме строителна фирма, която понякога прави водолазни работи.",
      },
      {
        title: "Комплексен подход — един екип за всичко",
        desc: "Водолази, ROV оператори, хидрографи и строители работят заедно — клиентът има един контакт за целия проект.",
      },
      {
        title: "ROV и сонарни обследвания",
        desc: "Дистанционни инспекции с HD видео документиране за труднодостъпни, опасни или дълбоки зони — без риск за персонал.",
      },
      {
        title: "Денонощна аварийна готовност",
        desc: "Авариите не чакат работно време. Реагираме 24/7 при извънредни ситуации по цялата страна.",
      },
      {
        title: "Документирано изпълнение",
        desc: "Всяка задача завършва с видео и фото протокол, технически констатации и ясни препоръки — пълна проследимост.",
      },
      {
        title: "Сертифицирано качество",
        desc: "Работим по ISO 45001 и система за управление на качеството — стандарти, признати от водещите индустриални клиенти.",
      },
    ],
  }

  const aboutTimeline = {
    label: "История",
    items: [
      {
        year: "2001",
        label: "Основаване",
        desc: "Черноморски Водолазен Център е основан от двама опитни водолази с мисията да предоставя надеждни подводни услуги на индустриални клиенти.",
      },
      {
        year: null,
        label: "Водолазни курсове",
        desc: "Развитие на любителско водолазно обучение по системите NAUI и CMAS, пробни гмуркания и формиране на инструкторски екип.",
      },
      {
        year: null,
        label: "Индустриални операции",
        desc: "Разширяване към подводни ремонти, монтажи, почистване, аварийни дейности и работа по хидротехнически съоръжения.",
      },
      {
        year: null,
        label: "ROV и хидрография",
        desc: "Въвеждане на ROV системи (LBV-200, LBV-300) и батиметрична апаратура за дистанционни инспекции и картиране на дъното.",
      },
      {
        year: null,
        label: "Язовири и ВЕЦ",
        desc: "Специализация в поддръжка и инспекция на язовири, изпускателни съоръжения и водовземания за ВЕЦ по цялата страна.",
      },
      {
        year: null,
        label: "ISO сертификация",
        desc: "Получаване на ISO 45001 за управление на здравето и безопасността при работа и система за управление на качеството.",
      },
    ],
  }

  const aboutStatistics = {
    hero: [
      { label: "Основана", value: "2001" },
      { label: "Проекта", value: "300+" },
      { label: "Опит", value: "20+ г." },
    ],
    about: [
      { label: "Клиенти", value: "80+" },
      { label: "Услуги", value: "6" },
      { label: "24/7", value: "Готовност" },
    ],
  }

  await prisma.aboutContent.upsert({
    where: { language: "BG" },
    update: {
      title: "За нас",
      subtitle: "Черноморски Водолазен Център",
      content: aboutContent,
      whyUs: aboutWhyUs,
      timeline: aboutTimeline,
      statistics: aboutStatistics,
    },
    create: {
      language: "BG",
      title: "За нас",
      subtitle: "Черноморски Водолазен Център",
      content: aboutContent,
      imageUrl: "/uploads/bsdc/about-diving-suit-historic.jpg",
      statistics: aboutStatistics,
      whyUs: aboutWhyUs,
      timeline: aboutTimeline,
    },
  })
  await prisma.aboutContent.updateMany({
    where: { language: "BG", imageUrl: null },
    data: { imageUrl: "/uploads/bsdc/about-diving-suit-historic.jpg" },
  })

  // -----------------------------------------------------------------------
  // Services — BG
  // -----------------------------------------------------------------------
  console.log("Seeding services (BG)…")

  await prisma.service.deleteMany({
    where: {
      language: "BG",
      translationKey: {
        in: ["industrial-diving", "rov-inspection", "bathymetry", "dam-operator", "hydrotechnical-construction"],
      },
    },
  })

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
      images: [
        "/uploads/bsdc/service-diver-work.jpg",
        "/uploads/bsdc/gallery-diver-helmet.jpg",
        "/uploads/bsdc/gallery-diver-underwater.jpg",
      ],
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
      featuredImageUrl: "/uploads/bsdc/service-rov-lbv200.jpg",
      images: [
        "/uploads/bsdc/service-rov-lbv300.jpg",
        "/uploads/bsdc/project-kardzhali-a.jpg",
        "/uploads/bsdc/project-kardzhali-b.jpg",
      ],
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
      images: [
        "/uploads/bsdc/service-bathymetry-data-01.jpg",
        "/uploads/bsdc/service-bathymetry-data-02.jpg",
        "/uploads/bsdc/service-bathymetry-data-03.jpg",
        "/uploads/bsdc/service-bathymetry-data-04.jpg",
      ],
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
      images: [
        "/uploads/bsdc/project-yazlata-a.jpg",
        "/uploads/bsdc/project-lake-reservoir.jpg",
        "/uploads/bsdc/gallery-sdam.jpg",
      ],
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
      images: [
        "/uploads/bsdc/project-repair-works-a.jpg",
        "/uploads/bsdc/project-shaft-repair.jpg",
        "/uploads/bsdc/project-sooruzheniya-a.jpg",
      ],
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
      images: [
        "/uploads/bsdc/gallery-dive-wreck.jpg",
        "/uploads/bsdc/gallery-diver-underwater.jpg",
        "/uploads/bsdc/gallery-water-dive.jpg",
      ],
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
  // Projects / News — BG
  // -----------------------------------------------------------------------
  console.log("Seeding projects (BG)…")

  const projects = [
    {
      translationKey: "yazlata-dam-rehabilitation-2022",
      slug: "yazlata-dam-rehabilitation-2022",
      title: 'Рехабилитация на изпускателните съоръжения на язовир „Язлата"',
      excerpt:
        'Язовирът се намира в близост до с. Ясна Поляна, Община Приморско, и се използва за напояване на земеделски земи. Проектът обхваща рехабилитация на основните изпускателни съоръжения.',
      content: `<p>Язовир „Язлата" е земнонасипна язовирна стена, намираща се в близост до с. Ясна Поляна, Община Приморско. Язовирът се използва основно за напояване на земеделски земи в региона.</p>

<p><strong>Обхват на изпълнените дейности:</strong></p>
<ul>
<li>Водолазна инспекция на основния и аварийния изпускател — видео документиране на техническото им състояние</li>
<li>Почистване на входните решетки и отводнителните отвори от наноси и растителност</li>
<li>Проверка на уплътненията и стоманените елементи на входните затвори</li>
<li>Ремонт на корозирали фланцови връзки по тръбния тракт</li>
<li>Изготвяне на технически доклад с констатации, фотопротокол и препоръки</li>
</ul>

<p>Всички дейности са изпълнени при пълен воден стоеж — без изпразване на язовира. Операциите са документирани с HD видео запис, позиционирани с GPS координати и предадени на собственика с технически доклад.</p>`,
      publishedAt: new Date("2022-12-10"),
      sortOrder: 0,
      featuredImageUrl: "/uploads/bsdc/project-yazlata-a.jpg",
      images: ["/uploads/bsdc/project-yazlata-b.jpg"],
      category: "Хидротехническо строителство",
    },
    {
      translationKey: "kardzhali-dam-rov-inspection-2022",
      slug: "kardzhali-dam-rov-inspection-2022",
      title: 'ROV инспекция на изпускателите на язовир „Кърджали"',
      excerpt:
        'Хидроенергийният комплекс „Кърджали" е горното стъпало на каскадата „Арда". Стената на язовира разполага с два основни тунелни изпускателя, подложени на подводна инспекция.',
      content: `<p>Язовир „Кърджали" е бетонна гравитачна стена на р. Арда, горното стъпало на хидроенергийната каскада „Арда". Стената е с височина 67 м и съдържа два основни тунелни изпускателя с диаметър 2,80 м.</p>

<p><strong>Изпълнени дейности:</strong></p>
<ul>
<li>ROV инспекция с LBV-300 на входните решетки и входните участъци на двата тунелни изпускателя</li>
<li>Видео документиране на техническото състояние на решетките, рамките и бетонните повърхности</li>
<li>Идентификация на корозия, биообрастване и механични увреждания</li>
<li>GPS позициониране и дълбочинен профил на всяка зона на обследване</li>
<li>Технически доклад с анотирани кадри, оценка на рисковете и препоръки за следващи действия</li>
</ul>

<p>Операцията е извършена при нормален воден стоеж без прекъсване на работата на ВЕЦ. Получените данни са използвани за планиране на последващите ремонтни дейности по решетките.</p>`,
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
      content: `<p>Язовир „Тешел" е част от хидроенергийната каскада Доспат–Въча. Водовземането за ВЕЦ „Девин" се осъществява чрез стоманен тръбопровод с диаметър 1,60 м, заустен в тялото на язовирната стена.</p>

<p><strong>Изпълнени дейности:</strong></p>
<ul>
<li>Водолазна инспекция на входното съоръжение на водовземателния тръбопровод за ВЕЦ „Девин"</li>
<li>ROV обследване на основния изпускател — входна рамка, решетки и начален участък на тунела</li>
<li>Документиране на биообрастване, корозия и механично увреждане по стоманените елементи</li>
<li>Измерване на дебелини на стоманата в зони с видима корозия</li>
<li>Изготвяне на технически доклад с констатации и препоръки за ремонт</li>
</ul>

<p>Инспекцията е проведена при нисък воден стоеж в края на октомври, което позволи достъп до зони, нормално недостъпни при по-висок стоеж. Резултатите са предоставени на оператора на каскадата за планиране на профилактичната поддръжка.</p>`,
      publishedAt: new Date("2022-10-30"),
      sortOrder: 2,
      featuredImageUrl: "/uploads/bsdc/project-teshal-a.jpg",
      images: ["/uploads/bsdc/project-teshal-b.jpg"],
      category: "ROV инспекции",
    },
    {
      translationKey: "peshtera-hec-intake-inspection-2022",
      slug: "peshtera-hec-intake-inspection-2022",
      title: 'ROV инспекция на водовземателна кула на ВЕЦ „Пещера"',
      excerpt:
        'Водовземателната кула се намира на 150 метра от оста на язовирната стена, в дясното поле на водохранилището, над входа на основния водопроводен тунел.',
      content: `<p>Водовземателната кула на ВЕЦ „Пещера" е ажурна стоманобетонна конструкция, positioned на 150 м от оста на язовирната стена. Кулата осигурява регулируем воден прием към водопроводния тунел за ВЕЦ „Пещера".</p>

<p><strong>Изпълнени дейности:</strong></p>
<ul>
<li>ROV инспекция на цялото тяло на кулата — от дъното до нивото на нормален воден стоеж</li>
<li>Обследване на входните прозорци, решетки и затворни механизми на всяко ниво</li>
<li>Документиране на пукнатини, ерозия и загуба на бетон по повърхността на кулата</li>
<li>Проверка на стоманената армировка в зони с оголен бетон</li>
<li>Фотографиране и анотиране на всички установени дефекти с GPS позиция и дълбочина</li>
</ul>

<p>Инспекцията е извършена в два работни дни. Резултатите включват пълен видеозапис, анотирани снимки на всеки дефект и технически доклад с оценка на конструктивната цялост и приоритизирани препоръки за ремонт.</p>`,
      publishedAt: new Date("2022-10-23"),
      sortOrder: 3,
      featuredImageUrl: "/uploads/bsdc/project-peshtera-a.jpg",
      images: ["/uploads/bsdc/project-peshtera-b.jpg"],
      category: "ROV инспекции",
    },
    {
      translationKey: "gnd-bathymetric-survey",
      slug: "gnd-bathymetric-survey",
      title: "Батиметрично обследване на язовир за нуждите на ГНД",
      excerpt:
        "Пълно батиметрично картиране на водохранилище с многолъчев сонар — изготвяне на 3D модел на дъното и обемна оценка на наносните отложения.",
      content: `<p>В рамките на проекта е извършено пълно батиметрично картиране на водохранилище с площ над 2 км². Целта на обследването е оценка на обема на наносните отложения и остатъчния полезен обем.</p>

<p><strong>Използвана апаратура и методология:</strong></p>
<ul>
<li>Многолъчев ехолот с честота 200/400 кHz — 100% зонално покритие без пропуски</li>
<li>GPS/GNSS позициониране с точност под 5 см хоризонтално</li>
<li>Корекция на водното ниво в реално време (RTK)</li>
<li>Обработка в лицензиран хидрографски софтуер</li>
</ul>

<p><strong>Изходни продукти:</strong></p>
<ul>
<li>Батиметрична карта в мащаб 1:2000 — DXF и PDF формат</li>
<li>Цифров модел на релефа (DEM) с резолюция 0,5 × 0,5 м</li>
<li>Таблица с обеми по хоризонти и зони</li>
<li>Сравнение с предишно измерване — количествена оценка на отлаганията</li>
</ul>`,
      publishedAt: new Date("2022-05-31"),
      sortOrder: 4,
      featuredImageUrl: "/uploads/bsdc/project-gnd-survey.jpg",
      images: [
        "/uploads/bsdc/service-bathymetry-data-01.jpg",
        "/uploads/bsdc/service-bathymetry-data-02.jpg",
      ],
      category: "Батиметрия",
    },
    {
      translationKey: "lukovit-hec-inspection",
      slug: "lukovit-hec-inspection",
      title: "Подводна инспекция на водовземателно съоръжение — ВЕЦ Луковит",
      excerpt:
        "Водолазна и ROV инспекция на водовземателното съоръжение и входния тракт на водопроводния тунел на малка ВЕЦ.",
      content: `<p>Обектът е малка водноелектрическа централа с деривационна схема. Водовземането е чрез груба решетка на деривационния канал и входно съоръжение на напорния тунел.</p>

<p><strong>Изпълнени дейности:</strong></p>
<ul>
<li>Водолазна инспекция на входното съоръжение — решетки, рамки, затворни органи</li>
<li>ROV обследване на входния участък на напорния тунел (недостъпен за водолаз)</li>
<li>Почистване на решетките от наноси и растителност</li>
<li>Проверка на уплътненията и стоманените конструкции за корозия</li>
<li>Технически доклад с констатации и препоръки</li>
</ul>

<p>Инспекцията е проведена в рамките на планирана профилактична поддръжка преди зимния период. Данните са предоставени на оператора за планиране на следващия ремонтен цикъл.</p>`,
      publishedAt: new Date("2022-04-30"),
      sortOrder: 5,
      featuredImageUrl: "/uploads/bsdc/project-lukovit-hec.jpg",
      images: ["/uploads/bsdc/project-dam-barrier.jpg"],
      category: "Индустриални водолазни услуги",
    },
    {
      translationKey: "alex-stamboliyski-port-works",
      slug: "alex-stamboliyski-port-works",
      title: "Подводни ремонтни работи — пристанище Александър Стамболийски",
      excerpt:
        "Ремонтно-възстановителни работи по подводната конструкция на кей в пристанище Александър Стамболийски — инспекция и бетониране на увредени зони.",
      content: `<p>Обектът е кейова стена в пристанище Александър Стамболийски. В резултат на дългогодишна експлоатация по подводната бетонна конструкция са установени зони с оголена армировка и загуба на бетон.</p>

<p><strong>Изпълнени дейности:</strong></p>
<ul>
<li>Водолазна инспекция на цялата подводна конструкция — детайлно заснемане на щетите</li>
<li>Очукване на разнишен бетон и почистване на армировката от корозия</li>
<li>Нанасяне на антикорозионна защита по оголената армировка</li>
<li>Подводно бетониране на увредените зони с водоустойчива смес</li>
<li>Монтаж на опалубка за формиране на ремонтираните участъци</li>
<li>Технически доклад с фотодокументация и протоколи от изпитания</li>
</ul>

<p>Всички ремонтни работи са изпълнени под вода, без прекъсване на работата на пристанището. Бетонните смеси са избрани съобразно изискванията за работа в морска среда.</p>`,
      publishedAt: new Date("2022-05-31"),
      sortOrder: 6,
      featuredImageUrl: "/uploads/bsdc/project-alex-stamboliyski.jpg",
      images: [
        "/uploads/bsdc/project-repair-works-a.jpg",
        "/uploads/bsdc/project-shaft-repair.jpg",
      ],
      category: "Хидротехническо строителство",
    },
  ]

  for (const p of projects) {
    await prisma.projectNewsItem.upsert({
      where: { language_translationKey: { language: "BG", translationKey: p.translationKey } },
      update: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
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
        content: p.content,
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
  // Partners
  // -----------------------------------------------------------------------
  console.log("Seeding partners…")

  const partners = [
    { name: "ЕнергоПро",           logoUrl: "/uploads/bsdc/partner-energopro.png",  websiteUrl: "https://www.energo-pro.bg",        sortOrder: 0 },
    { name: "TUV Nord Bulgaria",    logoUrl: "/uploads/bsdc/partner-tuv-nord.png",   websiteUrl: "https://www.tuv-nord.com",          sortOrder: 1 },
    { name: "БНАПД",                logoUrl: "/uploads/bsdc/partner-bnapd.png",      websiteUrl: null,                                sortOrder: 2 },
    { name: "NAVET / БКР",          logoUrl: "/uploads/bsdc/partner-bkr.png",        websiteUrl: "https://www.navet.government.bg",   sortOrder: 3 },
    { name: "Amron International",  logoUrl: "/uploads/bsdc/partner-amron.png",      websiteUrl: "https://www.amronintl.com",         sortOrder: 4 },
    { name: "Dräger / Dezeeman",    logoUrl: "/uploads/bsdc/partner-dezeeman.png",   websiteUrl: null,                                sortOrder: 5 },
    { name: "DCN",                  logoUrl: "/uploads/bsdc/partner-dcn.png",        websiteUrl: null,                                sortOrder: 6 },
    { name: "ECM",                  logoUrl: "/uploads/bsdc/partner-ecm.png",        websiteUrl: null,                                sortOrder: 7 },
    { name: "NovaSub",              logoUrl: "/uploads/bsdc/partner-novasub.png",    websiteUrl: null,                                sortOrder: 8 },
    { name: "Oh Miro",              logoUrl: "/uploads/bsdc/partner-oh-miro.png",    websiteUrl: null,                                sortOrder: 9 },
    { name: "Risk Engineering",     logoUrl: "/uploads/bsdc/partner-risk.png",       websiteUrl: null,                                sortOrder: 10 },
  ]

  for (const p of partners) {
    const existing = await prisma.partner.findFirst({ where: { logoUrl: p.logoUrl } })
    if (existing) {
      await prisma.partner.update({
        where: { id: existing.id },
        data: { name: p.name, websiteUrl: p.websiteUrl, sortOrder: p.sortOrder, published: true },
      })
    } else {
      await prisma.partner.create({ data: { ...p, published: true } })
    }
  }

  // -----------------------------------------------------------------------
  // Certificates
  // -----------------------------------------------------------------------
  console.log("Seeding certificates…")

  const certificates = [
    {
      translationKey: "iso-45001",
      title: "ISO 45001:2018 — Управление на здравето и безопасността",
      issuer: "TUV Nord Bulgaria",
      description:
        "Сертификат за система за управление на здравето и безопасността при работа по международния стандарт ISO 45001:2018. Обхваща всички водолазни, ROV и строителни дейности.",
      imageUrl: "/uploads/bsdc/cert-bsdc-45001.jpg",
      sortOrder: 0,
    },
    {
      translationKey: "iso-9001-qm",
      title: "Система за управление на качеството",
      issuer: "TUV Nord Bulgaria",
      description:
        "Сертифицирана система за управление на качеството, обхващаща планирането, изпълнението и документирането на всички предлагани услуги.",
      imageUrl: "/uploads/bsdc/cert-bsdc-qm.jpg",
      sortOrder: 1,
    },
    {
      translationKey: "cert-um",
      title: "Удостоверение за водолазна дейност",
      issuer: "ДАМТН / БНАПД",
      description:
        "Официално удостоверение за право на извършване на професионална водолазна дейност, издадено от компетентния орган.",
      imageUrl: "/uploads/bsdc/cert-bsdc-um.jpg",
      sortOrder: 2,
    },
    {
      translationKey: "cert-bkr",
      title: "Регистрация в БКР — Национален водолазен регистър",
      issuer: "НАПОО / БКР",
      description:
        "Регистрация в Националния квалификационен регистър за водолазна дейност към НАПОО, потвърждаваща квалификацията на водолазния персонал.",
      imageUrl: "/uploads/bsdc/cert-bkr-doc.jpg",
      sortOrder: 3,
    },
    {
      translationKey: "cert-bnapd",
      title: "Членство в БНАПД",
      issuer: "Българска национална асоциация на професионалните водолази",
      description:
        "Активен член на БНАПД — националната организация за стандарти и добри практики в професионалната водолазна дейност в България.",
      imageUrl: "/uploads/bsdc/cert-bnapd-doc.jpg",
      sortOrder: 4,
    },
    {
      translationKey: "cert-ksb",
      title: "КСБ — Камара на строителите в България",
      issuer: "Камара на строителите в България",
      description:
        "Вписване в Централния професионален регистър на строителя към КСБ за изпълнение на хидротехнически строителни работи.",
      imageUrl: "/uploads/bsdc/cert-ksb.jpg",
      sortOrder: 5,
    },
  ]

  for (const c of certificates) {
    await prisma.certificate.upsert({
      where: { language_translationKey: { language: "BG", translationKey: c.translationKey } },
      update: {
        title: c.title,
        issuer: c.issuer,
        description: c.description,
        imageUrl: c.imageUrl,
        sortOrder: c.sortOrder,
        published: true,
      },
      create: {
        language: "BG",
        translationKey: c.translationKey,
        title: c.title,
        issuer: c.issuer,
        description: c.description,
        imageUrl: c.imageUrl,
        sortOrder: c.sortOrder,
        published: true,
      },
    })
  }

  console.log("Seed complete.")
}

main()
  .catch((e) => {
    console.error("Seed error:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
