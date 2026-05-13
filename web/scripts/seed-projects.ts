import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })
dotenv.config({ path: ".env" })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const projects = [
  {
    translationKey: 'nova-lokaciya-baza',
    sortOrder: 0,
    title: `Нова локация на производствена и офис база`,
    slug: 'nova-lokaciya-na-proizvodstvena-i-ofis-baza',
    excerpt: `Черноморски Водолазен Център ООД построи нова производствена и офис сграда в комплекса Булпорт Логистик, Варна.`,
    content: `<p>Компанията Черноморски Водолазен Център ООД построи нова производствена и офис сграда в комплекса Булпорт Логистик. От новата база компанията продължава да предоставя водолазни услуги, поддръжка на пристанища и плавателни съдове, ROV услуги, батиметрия и хидрография, управление на язовири и водолазни курсове.</p>`,
    category: 'Новини',
    publishedAt: new Date('2022-05-31'),
  },
  {
    translationKey: 'vylnolom-varna-ii-etap',
    sortOrder: 1,
    title: `Ремонтно-възстановителни и укрепителни работи по Вълнолом Варна - II етап`,
    slug: 'remontno-vazstanovitelni-raboti-valnolom-varna',
    excerpt: `Подводни и надводни ремонтно-укрепителни работи по Вълнолом Варна - монтаж на телени клетки, геотекстил и тетраподи с тегла 4, 8 и 10 тона.`,
    content: `<p>Вълноломът на пристанище Варна се състои от две части - източен (Приморски) и южен, образувайки входа на пристанището. Построен между септември 1896 и август 1901 година.</p>
<p>Извършени дейности:</p>
<ul>
  <li>Монтаж на телени клетки и полагане на геотекстил</li>
  <li>Монтаж на тетраподи с тегла 4, 8 и 10 тона</li>
  <li>Преместване на съществуващи конструкции</li>
  <li>Подводно профилиране</li>
</ul>
<p>Използвано оборудване: водолазен шлем KIRBY MORGAN SUPERLITE 27, подводна видеокамера и водолазни станции.</p>`,
    category: 'Проекти',
    publishedAt: new Date('2022-03-01'),
  },
  {
    translationKey: 'podvoden-ogled-oi-tsankov-kamak',
    sortOrder: 2,
    title: `Подводен оглед на основен изпускател на язовир Цанков камък, ЯР Въча`,
    slug: 'podvoden-ogled-oi-yazovir-tsankov-kamak',
    excerpt: `Техническа инспекция на подводните съоръжения на язовир Цанков камък - третото стъпало на енергийната каскада Доспат-Въча, на 25 км от гр. Девин.`,
    content: `<p>Язовир Цанков камък е третото стъпало на енергийната каскада Доспат-Въча и се намира на 25 км от град Девин.</p>
<p>Извършени дейности:</p>
<ul>
  <li>Подводен оглед на решетки на основния изпускател</li>
  <li>Оглед и оценка на наносите пред основния изпускател</li>
  <li>Оглед на входящата решетка и ремонтния затвор</li>
  <li>Изготвяне на доклад с видеоматериал</li>
</ul>
<p>Използвано оборудване: ROV системи SEABOTIX и бензинов генератор HONDA.</p>`,
    category: 'Проекти',
    publishedAt: null,
  },
  {
    translationKey: 'podvoden-ogled-oi-krichim',
    sortOrder: 3,
    title: `Подводен оглед на основен изпускател на язовир Кричим, ЯР Въча`,
    slug: 'podvoden-ogled-oi-yazovir-krichim',
    excerpt: `Подводна инспекция на язовир Кричим - най-долното стъпало на енергийната каскада Доспат-Въча, на 7 км от гр. Кричим.`,
    content: `<p>Язовир Кричим е най-долното стъпало на енергийната каскада Доспат-Въча и се намира на 7 км от гр. Кричим.</p>
<p>Извършени дейности:</p>
<ul>
  <li>Подводен оглед на решетки</li>
  <li>Подводен оглед на стоманобетонова конструкция</li>
  <li>Изготвяне на доклад с видеодокументация</li>
</ul>
<p>Използвано оборудване: ROV устройства SEABOTIX и бензинов генератор Honda. Целта е осигуряване на безопасна техническа експлоатация на язовирната стена.</p>`,
    category: 'Проекти',
    publishedAt: null,
  },
  {
    translationKey: 'podvoden-ogled-oi-aleksandar-stamboliyski',
    sortOrder: 4,
    title: `Подводен оглед на ОИ на язовир Александър Стамболийски`,
    slug: 'podvoden-ogled-oi-yazovir-aleksandar-stamboliyski',
    excerpt: `Инспекция на подводните съоръжения на язовир Александър Стамболийски на река Росица, 12 км от гр. Сухиндол.`,
    content: `<p>Язовир Александър Стамболийски е на река Росица, ляв приток на река Янтра, на 12 км от гр. Сухиндол.</p>
<p>Извършени дейности:</p>
<ul>
  <li>Оглед на входящи решетки</li>
  <li>Оценка на наноси пред основния изпускател</li>
  <li>Инспекция на бетонни конструкции, камери и затвори</li>
  <li>Изготвяне на доклад с видеодокументация</li>
</ul>
<p>Използвано оборудване: ROV апарати SEABOTIX, водолазни костюми и подводни видеокамери.</p>`,
    category: 'Проекти',
    publishedAt: new Date('2021-10-05'),
  },
  {
    translationKey: 'remont-svod-shahta-golyam-beglik',
    sortOrder: 5,
    title: `Ремонт на свод на входна шахта и подмяна на метални решетки на яз. Голям Беглик`,
    slug: 'remont-svod-vhodna-shahta-yazovir-golyam-beglik',
    excerpt: `Ремонт и подмяна на метални решетки при входни шахти на основните изпускатели на язовир Голям Беглик - обект от водноенергийната система Баташки водносилов път.`,
    content: `<p>Язовир Голям Беглик е на река Крива и е част от водноенергийната система Баташки водносилов път.</p>
<p>Извършени дейности:</p>
<ul>
  <li>Водолазен оглед и почистване на наноси при входни шахти</li>
  <li>Възстановяване на геометрията по свода</li>
  <li>Демонтаж и монтаж на нови хоризонтални метални решетки</li>
  <li>Подводен оглед на новомонтираните съоръжения</li>
</ul>
<p>Използвано оборудване: два ROV апарата, професионална водолазна екипировка и подводна телевизионна система.</p>`,
    category: 'Проекти',
    publishedAt: null,
  },
  {
    translationKey: 'pochistvane-montaj-resheta-lukovit',
    sortOrder: 6,
    title: `Почистване на наноси и монтаж на предпазна решетка пред ОИ на яз. Луковит`,
    slug: 'pochistvane-nanosi-montazh-resheta-yazovir-lukovit',
    excerpt: `Подводни работи на хидровъзел Луковит по река Златна Панега - почистване на основния изпускател DN 1400 и монтаж на защитна решетка.`,
    content: `<p>Хидровъзел Луковит е на река Златна Панега. Проектът обхваща серия от подводни дейности по основния изпускател (тръба DN 1400).</p>
<p>Извършени дейности:</p>
<ul>
  <li>Почистване на наноси и отломи от основния изпускател</li>
  <li>Премахване на залепени смоли и налепи</li>
  <li>Оглед и заснемане на размери</li>
  <li>Проектиране и монтаж на защитна решетка на входа на основния изпускател</li>
</ul>
<p>Използвано оборудване: ROV устройства, водолазни костюми SUPERLITE 27 и подводна видеокамера.</p>`,
    category: 'Проекти',
    publishedAt: null,
  },
  {
    translationKey: 'podvoden-ogled-vodovzemna-kula-vec-peshtera',
    sortOrder: 7,
    title: `Подводен оглед на водовземна кула за ВЕЦ Пещера`,
    slug: 'podvoden-ogled-vodovzemna-kula-vec-peshtera',
    excerpt: `Инспекция на водовземната кула за ВЕЦ Пещера, на десния скат на езерото на яз. Батак, на 150 м от оста на язовирната стена.`,
    content: `<p>Водовземната кула за ВЕЦ Пещера е на десния скат на езерото на яз. Батак, на 150 м от оста на язовирната стена. Конструкцията включва водоприемник с подвижна решетка и затворен орган - метална табла Вегитал.</p>
<p>Извършени дейности:</p>
<ul>
  <li>Почистване на релсовия път</li>
  <li>Оглед на конструкцията под вода</li>
  <li>Спускане и проверка на металната табла</li>
  <li>Изготвяне на технически доклад с видеодокументация</li>
</ul>
<p>Последен ремонт на повредени части: 2016 г. Използвано оборудване: ROV системи и водолазни костюми.</p>`,
    category: 'Проекти',
    publishedAt: new Date('2016-01-01'),
  },
  {
    translationKey: 'podvoden-ogled-yazovir-studen-kladenets',
    sortOrder: 8,
    title: `Подводен оглед на съоръжения - яз. Студен кладенец`,
    slug: 'podvoden-ogled-saoruzheniya-yazovir-studen-kladenets',
    excerpt: `Подводна инспекция на язовир Студен кладенец - второто стъпало на каскада Арда. Прегледани са два главни изпускателя (ляв и десен) с техните съоръжения.`,
    content: `<p>Язовир Студен кладенец е второто стъпало на каскада Арда.</p>
<p>Извършени дейности:</p>
<ul>
  <li>Оглед на входящи решетки на левия и десния изпускатели</li>
  <li>Проверка на подвижността на вратите</li>
  <li>Заснемане на профили на отложения преди и след решетките</li>
  <li>Изследване на контурите на дросел клапата</li>
  <li>Видеозаснемане и изготвяне на доклад</li>
</ul>
<p>Използвано оборудване: ROV системи SEABOTIX, водолазен костюм KIRBY MORGAN SUPERLITE 27 и подводни камери.</p>`,
    category: 'Проекти',
    publishedAt: new Date('2022-09-12'),
  },
  {
    translationKey: 'razhlabvane-boltove-gp-galata',
    sortOrder: 9,
    title: `Разхлабване на болтовите връзки на ГП Галата`,
    slug: 'razhlabvane-boltovi-vruzki-gp-galata',
    excerpt: `Офшорни подводни работи на газодобивна платформа Галата - тринога конструкция на около 12 мили изток-североизток от Паша дере.`,
    content: `<p>Газодобивна платформа Галата е тринога офшорна конструкция, на около 12 мили изток-североизток от Паша дере.</p>
<p>Извършени дейности:</p>
<ul>
  <li>Разхлабване на болтови връзки на подводни скоби</li>
  <li>Монтаж на нова скоба</li>
  <li>Почистване на наноси и налепи</li>
  <li>Прикрепяне на 14" conduit към 30" Raiser</li>
</ul>
<p>Използвано оборудване: водолазен шлем Kirby Morgan Superlite 27, водолазни системи Amron, подводна ТВ камера, хидробластер и система за подводно рязане.</p>`,
    category: 'Проекти',
    publishedAt: null,
  },
  {
    translationKey: 'podvoden-ogled-yazovir-teshal',
    sortOrder: 10,
    title: `Подводен оглед на ОИ на язовир Тешал и водовземане за ГНД на ВЕЦ Девин`,
    slug: 'podvoden-ogled-oi-yazovir-teshal',
    excerpt: `Инспекция на съоръженията на язовири Доспат и Тешал - най-горните стъпала на каскадата, с подводен оглед на основни изпускатели и водовземна кула.`,
    content: `<p>Язовири Доспат и Тешал са най-горните стъпала от каскадата и подлежат на периодични подводни прегледи. Последен преглед: 2015 г.</p>
<p>Извършени дейности:</p>
<ul>
  <li>Инспекция на входящи решетки</li>
  <li>Наносни профили пред и след решетките</li>
  <li>Инспекция на стоманобетонни конструкции на кули</li>
  <li>Преглед на ремонтни и работни затвори</li>
  <li>Видеодокументация и изготвяне на доклад</li>
</ul>
<p>Използвано оборудване: ROV системи SEABOTIX LBV200S2 и LBV300-5, водолазни каски KIRBY MORGAN SUPERLITE 27 и видеонаблюдение.</p>`,
    category: 'Проекти',
    publishedAt: new Date('2015-01-01'),
  },
  {
    translationKey: 'podvoden-ogled-oi-ivaylovgrad',
    sortOrder: 11,
    title: `Подводен оглед на ОИ на язовирна стена Ивайловград`,
    slug: 'podvoden-ogled-oi-yazovir-ivaylovgrad',
    excerpt: `Подводна инспекция на язовир Ивайловград - последното съоръжение от каскада Арда, на 10 км северно от гр. Ивайловград.`,
    content: `<p>Язовир Ивайловград е последното съоръжение от каскада Арда и се намира 10 км северно от гр. Ивайловград. Служи за производство на електроенергия.</p>
<p>Извършени дейности:</p>
<ul>
  <li>Инспекция на метални решетки и тръбопроводи</li>
  <li>Преглед на ремонтни и работни затвори</li>
  <li>Проверка на уплътнителни контури</li>
  <li>Видеодокументация и изготвяне на доклад</li>
</ul>
<p>Използвано оборудване: ROV устройства SEABOTIX и генератор HONDA.</p>`,
    category: 'Проекти',
    publishedAt: null,
  },
  {
    translationKey: 'remont-yazovir-yasna-polyana',
    sortOrder: 12,
    title: `Ремонтни и рехабилитационни дейности на яз. в мст. Язлата, с. Ясна поляна`,
    slug: 'remont-yazovir-yasna-polyana',
    excerpt: `Рехабилитация на напоителен язовир край с. Ясна поляна - подмяна на основен изпускател, саниране на тръбопровода и монтаж на нова спирателна арматура.`,
    content: `<p>Язовирът служи за напояване в земеделието. Поради износване на основния изпускател, тръбопровода и спирателната арматура, те подлежат на реновация.</p>
<p>Извършени дейности:</p>
<ul>
  <li>Почистване на водна и кранова шахта</li>
  <li>Саниране на тръбопровод чрез вмъкване на нова HDPE тръба DN250</li>
  <li>Доставка и монтаж на спирателна арматура</li>
  <li>Инжекционни работи по уплътняване</li>
</ul>
<p>Използвано оборудване: багер, перфоратори, инжекционна помпа за смоли и лепачка за HDPE тръби до DN300.</p>`,
    category: 'Проекти',
    publishedAt: null,
  },
  {
    translationKey: 'podvoden-ogled-oi-dti-kardzhali',
    sortOrder: 13,
    title: `Подводен оглед на ОИ и ДТИ на язовирна стена Кърджали`,
    slug: 'podvoden-ogled-oi-dti-yazovir-kardzhali',
    excerpt: `Инспекция на основен изпускател и допълнителен тунелен изпускател на яз. Кърджали - най-горното стъпало на каскада Арда.`,
    content: `<p>Язовир Кърджали е най-горното стъпало на каскада Арда. Оборудван е с два основни изпускателя (ляв и десен) и един допълнителен тунелен изпускател.</p>
<p>Извършени дейности:</p>
<ul>
  <li>Инспекция на левия и десния основни изпускатели</li>
  <li>Инспекция на допълнителния тунелен изпускател</li>
  <li>Видеодокументация и изготвяне на доклад с видеорезюме</li>
</ul>
<p>Използвано оборудване: ROV устройства SEABOTIX, бензинов генератор, лодка и понтон.</p>`,
    category: 'Проекти',
    publishedAt: new Date('2017-12-01'),
  },
]

const CANONICAL_KEYS = new Set(projects.map((p) => p.translationKey))

async function main() {
  const stale = await prisma.projectNewsItem.findMany({
    where: { language: 'BG' },
    select: { id: true, translationKey: true, title: true },
  })
  const toDelete = stale.filter((s) => !CANONICAL_KEYS.has(s.translationKey))
  if (toDelete.length) {
    console.log('Removing stale project items:')
    for (const s of toDelete) {
      await prisma.projectNewsItem.delete({ where: { id: s.id } })
      console.log(`  x ${s.title} (${s.translationKey})`)
    }
  }

  console.log('\nSeeding projects...')

  for (const proj of projects) {
    const result = await prisma.projectNewsItem.upsert({
      where: {
        language_translationKey: { language: 'BG', translationKey: proj.translationKey },
      },
      update: {
        title: proj.title,
        slug: proj.slug,
        excerpt: proj.excerpt,
        content: proj.content,
        category: proj.category,
        publishedAt: proj.publishedAt,
        sortOrder: proj.sortOrder,
        published: true,
        type: 'PROJECT',
      },
      create: {
        language: 'BG',
        translationKey: proj.translationKey,
        type: 'PROJECT',
        title: proj.title,
        slug: proj.slug,
        excerpt: proj.excerpt,
        content: proj.content,
        category: proj.category,
        publishedAt: proj.publishedAt,
        sortOrder: proj.sortOrder,
        published: true,
      },
    })
    console.log(`  + [${result.sortOrder}] ${result.title}`)
  }

  console.log('\nVerification:')
  const all = await prisma.projectNewsItem.findMany({
    where: { language: 'BG', published: true },
    orderBy: { sortOrder: 'asc' },
    select: { sortOrder: true, translationKey: true, title: true },
  })
  all.forEach((p) => console.log(`  ${p.sortOrder}. ${p.title}`))

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
