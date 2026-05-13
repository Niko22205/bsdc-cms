import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })
dotenv.config({ path: ".env" })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const services = [
  {
    translationKey: "industrial-diving",
    sortOrder: 0,
    title: "Индустриални водолазни услуги",
    slug: "industrialni-vodolazni-uslugi",
    shortDescription:
      "Подводни СМР, инспекции, ремонти, монтажи, демонтажи, почистване, рязане, заваряване и аварийни дейности за пристанища, язовири, ВЕЦ, тръбопроводи, плавателни съдове и хидротехнически съоръжения.",
    content: `<p>Водеща компания за водолазни услуги с гмуркане с въздух или газови смеси в нефтената индустрия, пристанищната инфраструктура и язовири и ВЕЦ.</p>
<ul>
  <li>Водолазни инспекции и подводна техническа диагностика</li>
  <li>Подводни ремонти, монтажи и демонтажи</li>
  <li>Подводно рязане, къртене, пробиване и заваряване</li>
  <li>Строителство, реконструкция и ремонт на хидротехнически съоръжения</li>
  <li>Ремонт на фуги и пукнатини по бетонови повърхности</li>
  <li>Водолазни работи по нанасяне на антикорозионни покрития</li>
  <li>Полагане и укрепване на кабели под вода</li>
  <li>Почистване на решетки, корпуси, витлови групи, изпускатели и съоръжения</li>
  <li>Аварийни водолазни дейности</li>
  <li>Видео и фотодокументиране</li>
</ul>`,
  },
  {
    translationKey: "rov-inspection",
    sortOrder: 1,
    title: "ROV инспекции и роботизирано обследване",
    slug: "rov-inspektsii",
    shortDescription:
      "Дистанционно управляеми подводни инспекции с ROV за тръби, тунели, язовири, ВЕЦ, резервоари, мостове, кейове и рискови или труднодостъпни зони.",
    content: `<p>Дистанционно управлявано превозно средство до 300 м дълбочина, максимално разстояние 350 м. Разполагаме с 2 взаимозаменяеми ROV системи.</p>
<ul>
  <li>ROV огледи и инспекции в тръби и затворени пространства (от 350 мм диаметър)</li>
  <li>Tritech DST Micron сонар със странично сканиране</li>
  <li>Цветна и черно-бяла видеокамера с ниска осветеност</li>
  <li>Роботизирана ръка, GPS позиционна система, термометър и дълбокомер</li>
  <li>Локализиране на обекти, котви и изпускатели</li>
  <li>Инспекции на подводни конструкции и тръбопроводи</li>
  <li>Видео документиране</li>
  <li>Работа при условия, неподходящи за водолазен достъп</li>
</ul>`,
  },
  {
    translationKey: "bathymetry",
    sortOrder: 2,
    title: "Батиметрия, хидрография и сонарни обследвания",
    slug: "batimetriya-hidrografiya",
    shortDescription:
      "Измерване, сканиране и документиране на дъно, водни площи, язовири, пристанища, подходи, наноси и подводна инфраструктура.",
    content: `<p>За да предоставим на нашите клиенти най-доброто обслужване, разполагаме със сонари за измервания и сканиране на дъното от компании Tritech и Humminbird — световни лидери в тези системи.</p>
<ul>
  <li>Батиметрични измервания и дънни профили</li>
  <li>Сонарно сканиране</li>
  <li>Локализиране и позициониране на предаватели и потопени кораби</li>
  <li>Намиране на котви и различни предмети</li>
  <li>Инспекция на морска и язовирна инфраструктура — основни предаватели, мостове, кейове, потопени тунели, пристанищни съоръжения, тръбопроводи и водни мрежи</li>
  <li>Данни за проектиране, ремонт, почистване и технически анализ</li>
</ul>`,
  },
  {
    translationKey: "dam-operator",
    sortOrder: 3,
    title: "Оператор на язовири и съоръженията към тях",
    slug: "operator-yazoviri",
    shortDescription:
      "Техническа експлоатация, контрол, документация и поддръжка на язовирни стени и съоръженията към тях съгласно изискванията на Закона за водите.",
    content: `<p>Услугата осигурява експлоатация и техническо обследване на малки и големи язовирни стени и съоръженията към тях, съгласно Закона за водите.</p>
<ul>
  <li>Оператор на язовир</li>
  <li>Изпълнение на измервания с контролно-измервателната система (КИС)</li>
  <li>Обработка на данни от контролно-измервателни системи</li>
  <li>Индивидуална оценка на техническото състояние</li>
  <li>Изготвяне на програма за технически контрол</li>
  <li>Разработка на аварийни планове</li>
  <li>Периодични доклади и документация за състоянието</li>
</ul>`,
  },
  {
    translationKey: "hydrotechnical-construction",
    sortOrder: 4,
    title: "Хидротехническо строителство и сухи СМР",
    slug: "hidrotehnichesko-stroitelstvo",
    shortDescription:
      "Строително-монтажни и ремонтни дейности по хидротехническа, пристанищна и язовирна инфраструктура, изпълнявани над вода, на сухо или при осушени/достъпни участъци.",
    content: `<p>От самото създаване на компанията обслужваме морски и хидротехнически съоръжения — под и над вода. Специализирани в ремонти и поддръжка на пристанища, плавателни съдове и язовири.</p>
<ul>
  <li>Ремонт на кейове, пирсове, пасарелки и площадки</li>
  <li>Монтаж и ремонт на метални конструкции</li>
  <li>Подмяна на решетки, стълби, парапети и сервизни елементи</li>
  <li>Бетонови възстановявания и антикорозионна защита</li>
  <li>Подводна инспекция и ремонт на корпуси на плавателни съдове</li>
  <li>Почистване на корпус, витла и рулева групировка</li>
  <li>Поддръжка и монтаж на морски кранове</li>
  <li>Работа по водовземни кули, шахти, камери и сервизни зони</li>
  <li>Подготовка на участъци за последващи водолазни или ROV дейности</li>
</ul>`,
  },
  {
    translationKey: "diving-courses",
    sortOrder: 5,
    title: "Водолазни курсове NAUI / CMAS",
    slug: "vodolazni-kursove",
    shortDescription:
      "Любителско водолазно обучение, пробни гмуркания и сертификационни курсове по системите NAUI и CMAS.",
    content: `<p>Частна база за обучение на любители водолази. Предлагаме гмуркане с акваланг за всички нива на умения, сертификация по NAUI и CMAS, наем на оборудване и ежедневни обиколки с лодка по Черноморието.</p>
<ul>
  <li>Пробно гмуркане (Водолазно преживяване)</li>
  <li>Passport Scuba Diver</li>
  <li>Scuba Diver</li>
  <li>Master Scuba Diver</li>
  <li>NAUI и CMAS сертификационно обучение</li>
  <li>Индивидуални и групови гмуркания</li>
  <li>Гмуркания по Черноморието — Варна, Тюленово, нос Калиакра, Болата</li>
</ul>`,
  },
]

const NEW_KEYS = new Set([
  "industrial-diving",
  "rov-inspection",
  "bathymetry",
  "dam-operator",
  "hydrotechnical-construction",
  "diving-courses",
])

async function main() {
  // Remove any BG services not in our canonical set
  const stale = await prisma.service.findMany({
    where: { language: "BG" },
    select: { id: true, translationKey: true, title: true },
  })
  const toDelete = stale.filter((s) => !NEW_KEYS.has(s.translationKey))
  if (toDelete.length) {
    console.log("Removing stale services:")
    for (const s of toDelete) {
      await prisma.service.delete({ where: { id: s.id } })
      console.log(`  ✗ ${s.title} (${s.translationKey})`)
    }
  }

  console.log("\nSeeding services…")

  for (const svc of services) {
    const result = await prisma.service.upsert({
      where: { language_translationKey: { language: "BG", translationKey: svc.translationKey } },
      update: {
        title: svc.title,
        slug: svc.slug,
        shortDescription: svc.shortDescription,
        content: svc.content,
        sortOrder: svc.sortOrder,
        published: true,
      },
      create: {
        language: "BG",
        translationKey: svc.translationKey,
        title: svc.title,
        slug: svc.slug,
        shortDescription: svc.shortDescription,
        content: svc.content,
        sortOrder: svc.sortOrder,
        published: true,
      },
    })
    console.log(`  ✓ [${result.sortOrder}] ${result.title}`)
  }

  console.log("\nVerification:")
  const all = await prisma.service.findMany({
    where: { language: "BG", published: true },
    orderBy: { sortOrder: "asc" },
    select: { sortOrder: true, translationKey: true, title: true, slug: true },
  })
  all.forEach((s) => console.log(`  ${s.sortOrder}. ${s.title} (${s.slug})`))

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
