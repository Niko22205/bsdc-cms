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
        "Сертифицирани индустриални водолази по стандартите на IDSA и IMCA — инспекции, заварка, ремонти и аварийни интервенции на подводни конструкции.",
      content: `<p>BSDC разполага с квалифицирани индустриални водолази, оборудвани с модерна хидравлична и хипербарна техника за всякакъв вид подводна работа. Работим по стандартите на IDSA и IMCA — от инспекции при нулева видимост до сложни аварийни интервенции с декомпресия.</p>

<p><strong>Кога се използва услугата</strong></p>
<p>Индустриалните водолазни услуги са необходими при инспекция, поддръжка и ремонт на подводни конструкции — мостови пилоти, кейове, вълноломи, тръбопроводи и хидротехнически съоръжения. Услугата е критична при аварийни ситуации: заседнали или потопени обекти, структурни повреди и течове под водата.</p>

<p><strong>Какво включва</strong></p>
<p>Подводна заварка и термично рязане (EN ISO 15614-9), монтаж и демонтаж на метални и стоманобетонни конструкции, хидравлично почистване под налягане, подводно бетониране с тремие-тръба, поставяне на уплътнения, кофражи и химично инжектиране на пукнатини.</p>

<p><strong>Типични обекти</strong></p>
<p>Пристанищна инфраструктура (кейове, пилоти, гатове), язовирни стени и изпускателни съоръжения, речни и морски мостове, подводни тръбопроводи и кабелни трасета, корпуси на плавателни съдове.</p>

<p><strong>Технически подход</strong></p>
<p>Всеки проект започва с визуална водолазна инспекция и документиране на повредите. Прилагаме стоманени решетки, катодна защита и епоксидни обмазки за дълготраен резултат. При работа в ограничени пространства или повишен риск прилагаме хипербарни процедури и план за декомпресия по таблиците на NOAA/DCIEM.</p>

<p><strong>Документация и резултат</strong></p>
<p>Инспекционен протокол с HD видео и снимки, конструктивно становище с препоръки, сертификати за изпълнени заварки при поискване. Отговаряме на запитвания в рамките на 24 часа с предварителна оценка.</p>`,
      sortOrder: 0,
      featuredImageUrl: "/uploads/bsdc/service-diving-work.jpg",
      images: ["/uploads/bsdc/service-diver-work.jpg", "/uploads/bsdc/gallery-diver-helmet.jpg", "/uploads/bsdc/gallery-diver-underwater.jpg", "/uploads/bsdc/service-repair.jpg"],
    },
    {
      translationKey: "rov-services",
      slug: "rov-services",
      title: "ROV инспекции и роботизирано обследване",
      shortDescription:
        "Дистанционно управляеми апарати LBV200 и LBV300 за HD инспекция до 300 м дълбочина — без риск за водолазен персонал.",
      content: `<p>ROV (Remotely Operated Vehicle) инспекцията позволява детайлно обследване на подводни съоръжения без риск за водолазен персонал. BSDC оперира с апарати LBV200-4 и LBV300-6 — достигащи дълбочина до 300–350 м с вградена HD камера, сонар и манипулатор.</p>

<p><strong>Кога се използва услугата</strong></p>
<p>ROV обследването е оптималният избор при дълбочини над 50 м, при токсична или силно замърсена водна среда, при видимост под 0.5 м и при ситуации с висок оперативен риск за водолаз. Използва се и за предварителна инспекция преди решение за водолазна намеса.</p>

<p><strong>Какво включва</strong></p>
<p>HD/4K видео документация с вграден DVR запис, ултразвукови измервания на корозия и дебелина на стена, лазерни системи за размери и разстояния, инспекция на тунели и тръбопроводи от 300 мм диаметър, SONAR сканиране при нулева видимост, операции с манипулатор (Work class ROV).</p>

<p><strong>Типични обекти</strong></p>
<p>Язовирни тела и шахтови изпускатели, офшорни конструкции и платформи, подводни кабели и тръбопроводи, корпуси на кораби и плавателни съдове, резервоари и водоснабдителна инфраструктура.</p>

<p><strong>Технически подход</strong></p>
<p>ROV пилотите на BSDC са сертифицирани оператори. Данните се записват в реално време с USBL акустично позициониране за точно локализиране на дефектите. При необходимост интегрираме страничен (Side-Scan) SONAR за сканиране при нулева видимост. Докладите включват GPS координати на всеки намерен дефект.</p>

<p><strong>Документация и резултат</strong></p>
<p>Пълен видеозапис на инспекцията, анотирани снимки с маркирани дефекти и координати, технически доклад с оценка на риска и приоритизирани препоръки за ремонт. Осигурете документирана инспекция без риск — свържете се с нас за оценка на обекта.</p>`,
      sortOrder: 1,
      featuredImageUrl: "/uploads/bsdc/service-rov-lbv200.jpg",
      images: ["/uploads/bsdc/service-rov-lbv300.jpg", "/uploads/bsdc/service-rov-t7.jpg", "/uploads/bsdc/gallery-water-dive.jpg"],
    },
    {
      translationKey: "bathymetry-hydrography",
      slug: "bathymetry-hydrography",
      title: "Батиметрия, хидрография и сонарни обследвания",
      shortDescription:
        "Прецизни батиметрични сурвеи с RTK GNSS и многолъчеви ехолоти — цифрови модели на дъното по стандарт IHO S-44 за язовири, пристанища и реки.",
      content: `<p>Прецизните батиметрични и хидрографски изследвания на BSDC предоставят детайлни цифрови модели на дъното, отговарящи на стандарт IHO S-44 (Order 1a/Special). Работим с еднолъчеви и многолъчеви ехолоти, интегрирани с RTK GNSS позициониране с точност ±2 см.</p>

<p><strong>Кога се използва услугата</strong></p>
<p>Батиметрията е необходима при проектиране на хидротехнически съоръжения, мониторинг на наносни отложения в язовири, оценка на ерозия на речни и морски дъна, хидравлични изчисления при мостово строителство и преди всяка водолазна или ROV операция в непознат обект.</p>

<p><strong>Какво включва</strong></p>
<p>Еднолъчева и многолъчева батиметрия с покритие до 95% от площта, Side-Scan сонар за детайлна текстура на дъното, суб-боттом профилиране за геоложки разрез, RTK/GNSS позициониране, хидрографски нивелир за контрол на водното ниво, обработка в HYPACK / QPS QINSy.</p>

<p><strong>Типични обекти</strong></p>
<p>Язовири (мониторинг на утайки и полезен обем), пристанища и навигационни фарватери, реки и деривационни канали, крайбрежна зона и морска акватория, зони около мостови пилоти и кейове.</p>

<p><strong>Технически подход</strong></p>
<p>Сурвеят се планира по линейни профили с минимум 50% застъпване за пълно покритие. Данните се обработват в HYPACK или QPS QINSy — индустриален стандарт в хидрографията. При мониторингов сурвей генерираме Change Detection модел спрямо предходното измерване за количествена оценка на утайките или ерозията.</p>

<p><strong>Документация и резултат</strong></p>
<p>Батиметрична карта в DWG/DXF и GeoTIFF, TIN цифров модел на дъното, таблица с обеми и площи, технически доклад с интерпретация. Получете точен цифров модел на вашия водоем — свържете се за конкретна оферта.</p>`,
      sortOrder: 2,
      featuredImageUrl: "/uploads/bsdc/service-bathymetry-scan.jpg",
      images: ["/uploads/bsdc/service-bathymetry-data-01.jpg", "/uploads/bsdc/service-bathymetry-data-02.jpg", "/uploads/bsdc/service-bathymetry-data-03.jpg", "/uploads/bsdc/service-bathymetry-data-04.jpg"],
    },
    {
      translationKey: "micro-dam-operation",
      slug: "micro-dam-operation",
      title: "Оператор на язовири и съоръженията към тях",
      shortDescription:
        "Лицензирани хидроспециалисти за законосъобразна експлоатация на язовири по чл. 138 от Закона за водите — мониторинг, поддръжка и аварийни протоколи.",
      content: `<p>Съгласно чл. 138, ал. 2 от Закона за водите, собствениците на язовири са длъжни да осигурят технически правоспособен оператор за поддръжка и безопасна експлоатация. BSDC предоставя тази услуга с лицензирани хидроспециалисти за всеки клас язовир.</p>

<p><strong>Кога се използва услугата</strong></p>
<p>Всеки собственик или управляващ орган на язовир е задължен по закон да осигури квалифициран оператор. Услугата е критична след изменения в хидрологичните условия, след ремонтни дейности и при наближаване на паводъчни периоди. Неосигуряването на оператор е административно нарушение.</p>

<p><strong>Какво включва</strong></p>
<p>Текущ мониторинг на техническото и хидрологично състояние, ежеседмични и извънредни инспекции, управление на шахтови и основни изпускатели, поддръжка на пиезометрична и автоматизирана КИС (Контролно-информационна система), координация с МОСВ и кризисни структури при аварийни ситуации.</p>

<p><strong>Типични обекти</strong></p>
<p>Малки и средни язовири (II–IV клас), микроязовири за напояване, водовземни съоръжения на ВЕЦ, регулационни прагове и деривационни канали, ПСОВ с утаечни вани.</p>

<p><strong>Технически подход</strong></p>
<p>BSDC използва цифрова КИС за реално наблюдение на нивото, дебита и структурното поведение на тялото на язовира. При отклонения изпращаме незабавни уведомления до собственика и компетентните органи. Поддържаме актуален Аварийно-предупредителен план (EAP) за всеки обект съгласно изискванията на ДАМТН.</p>

<p><strong>Документация и резултат</strong></p>
<p>Месечни и годишни технически доклади, Книга на язовира (дневник), протоколи от инспекции, уведомления при отклонения и пълна кореспонденция с МОСВ. Осигурете законосъобразна и безопасна експлоатация — свържете се с нас за договор за операторство.</p>`,
      sortOrder: 3,
      featuredImageUrl: "/uploads/bsdc/project-dam-barrier.jpg",
      images: ["/uploads/bsdc/gallery-sdam.jpg", "/uploads/bsdc/project-yazlata-a.jpg", "/uploads/bsdc/project-gnd-survey.jpg"],
    },
    {
      translationKey: "port-vessel-dam-repairs",
      slug: "port-vessel-dam-repairs",
      title: "Хидротехническо строителство и сухи СМР",
      shortDescription:
        "Интегрирано хидротехническо строителство и ремонтно-възстановителни работи — от подводно бетониране и катодна защита до рехабилитация на язовирни стени и пристанищна инфраструктура.",
      content: `<p>BSDC изпълнява хидротехническо строителство и ремонтно-възстановителни работи на подводни и надводни хидравлични съоръжения. Комбинираме водолазни и строителни компетенции за интегрирано изпълнение — един изпълнител, пълна отговорност.</p>

<p><strong>Кога се използва услугата</strong></p>
<p>Хидротехническото строителство е необходимо при рехабилитация на язовирни стени и изпускателни шахти, ремонт на кейове и пристанищни пилоти, укрепване на речни брегове, изграждане или реновиране на регулационни прагове и дренажна инфраструктура.</p>

<p><strong>Какво включва</strong></p>
<p>Подводно и надводно бетониране (тремие, помпа), ремонт и укрепване на стоманобетонни конструкции, монтаж на метални затворни органи и решетки, хидроизолация и епоксидни обмазки, земно-копни работи около хидравлични съоръжения, изграждане на дренажи и ретензионни диги.</p>

<p><strong>Типични обекти</strong></p>
<p>Язовирни тела и преливни съоръжения, пристанищни кейове и вълноломи, мостови опори в речно корито, водовземни кули и шахти, ВЕЦ конструкции и подпорни стени.</p>

<p><strong>Технически подход</strong></p>
<p>Работата започва с геотехническо и водолазно обследване за оценка на щетите. Подводното бетониране се изпълнява с тремие-тръба и вибратор по БДС EN 13670. Металните конструкции се предпазват с катодна протекция и горещо поцинковане. При работа около активни водоснабдителни съоръжения осигуряваме план за спиране на водата с предварителна нотификация на институциите.</p>

<p><strong>Документация и резултат</strong></p>
<p>Конструктивни проекти (при изискване), протоколи от изпитания на бетон, AS-BUILT документация, сертификати за материали и изпълнени заварки, Акт Образец 19 за приемане на СМР. Изпратете запитване за оценка на вашия обект — отговаряме в рамките на 24 часа.</p>`,
      sortOrder: 4,
      featuredImageUrl: "/uploads/bsdc/service-repair.jpg",
      images: ["/uploads/bsdc/project-repair-works-a.jpg", "/uploads/bsdc/project-shaft-repair.jpg", "/uploads/bsdc/project-sooruzheniya-a.jpg"],
    },
    {
      translationKey: "diving-courses",
      slug: "diving-courses",
      title: "Водолазни курсове NAUI / CMAS",
      shortDescription:
        "Акредитирано водолазно обучение по системите NAUI и CMAS — от пробно гмуркане (от 90 €) до инструкторски програми, на Черно море и в закрити басейни.",
      content: `<p>BSDC е акредитиран обучителен партньор на NAUI (National Association of Underwater Instructors) и CMAS (Confédération Mondiale des Activités Subaquatiques). Предлагаме пълна гама курсове — от пробно гмуркане до инструкторски програми — на Черно море и в закрити басейни.</p>

<p><strong>Кога се използва услугата</strong></p>
<p>Подходящо за начинаещи, търсещи безопасно въведение в подводния свят, за опитни водолази, желаещи международна сертификация, и за организации, изискващи корпоративно обучение или преквалификация на водолазен персонал по NAUI/CMAS стандарти.</p>

<p><strong>Какво включва</strong></p>
<p>Try Dive (пробно гмуркане) от 90 €, Open Water Diver NAUI — 4 дни теория + басейн + 4 открити гмуркания, Advanced Open Water Diver, Rescue Diver, Divemaster, инструкторски курс NAUI IDC. По CMAS: ★1, ★★2 и ★★★3 нива. Цени за пълни курсове от 300 до 1 200 €. Всички нива включват теоретична, практическа и водна подготовка.</p>

<p><strong>Типични обекти</strong></p>
<p>Гмуркания в Черно море (Созопол, Приморско, Кабо Еле), обучения в закрит 25-метров басейн, специализирани технически гмуркания в сладководни обекти — язовири, кариери, потопени обекти.</p>

<p><strong>Технически подход</strong></p>
<p>Малки групи (макс. 4 студента на инструктор) за максимален контрол на безопасността. Оборудването е собствено на BSDC — поддържано по EN 250 за регулатори и EN 13949 за BCD. Всички инструктори са с активна NAUI Instructor сертификация и валидна CPR/First Aid квалификация.</p>

<p><strong>Документация и резултат</strong></p>
<p>Международно признат сертификат NAUI или CMAS, логбук с верифицирани гмуркания, достъп до NAUI/CMAS дигитален портал за електронна карта. Сертификатите са валидни за цял живот. Запазете своето място — групите са с ограничен брой участници.</p>`,
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
