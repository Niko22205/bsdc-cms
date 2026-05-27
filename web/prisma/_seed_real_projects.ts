import "dotenv/config"
import { PrismaClient, ProjectNewsType } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

/* Bulgarian left/right quotation marks as unicode escapes to avoid esbuild parse issues */
const lq = "„" // opening Bulgarian quote
const rq = "“" // closing Bulgarian quote

async function main() {
  console.log("Deleting existing BG project/news records...")
  await prisma.projectNewsItem.deleteMany({ where: { language: "BG" } })

  const projects = [
    {
      translationKey: "yazlata-dam-rehabilitation",
      slug: "yazlata-dam-rehabilitation",
      type: ProjectNewsType.PROJECT,
      title: `Ремонтни и рехабилитационни дейности на яз. в мст. ${lq}Язлата${rq}, с. Ясна поляна`,
      excerpt: "Язовира се намира край село Ясна поляна, Община Приморско. Предназначението му е за поливна дейност в селското стопанство. Поради амортизацията на основния изпускател се налага саниране и подмяна на тръбопровода и спирателната арматура.",
      content: "<p>Язовира се намира край село Ясна поляна, Община Приморско. Предназначението му е за поливна дейност в селското стопанство.</p><p><strong>Основно оборудване:</strong> багер, перфоратори и куртачи, инжекционна помпа за смоли, лепачка за HDPE тръби до DN300.</p><p><strong>Извършени дейности:</strong></p><ul><li>Почистване на водна шахта</li><li>Саниране на тръбопровод чрез вмъкване на нова HDPE тръба DN250</li><li>Доставка и монтаж на нова спирателна арматура</li><li>Инжекционни дейности по уплътняване около нов тръбопровод</li></ul>",
      featuredImageUrl: "/uploads/bsdc/news-yazlata-dam.jpg",
      images: ["/uploads/bsdc/news-yazlata-dam.jpg"],
      category: "Язовири",
      publishedAt: new Date("2022-12-20"),
      sortOrder: 0,
    },
    {
      translationKey: "kardzhali-dam-oi-inspection",
      slug: "kardzhali-dam-oi-inspection",
      type: ProjectNewsType.PROJECT,
      title: `Подводен оглед на решетка на ОИ и ДТИ на язовирна стена ${lq}Кърджали${rq}`,
      excerpt: `Хидровъзел ${lq}Кърджали${rq} е най-горното стъпало на каскада ${lq}Арда${rq}. Стената е снабдена с два основни изпускателя (ОИ) и допълнителен тунелен изпускател (ДТИ). За безопасната експлоатация периодично се извършват огледи на съоръженията под вода.`,
      content: `<p>Хидровъзел ${lq}Кърджали${rq} е най-горното стъпало на каскада ${lq}Арда${rq}. Стената е снабдена с два основни изпускателя (ОИ) и допълнителен тунелен изпускател (ДТИ).</p><p>За безопасната експлоатация на язовирната стена и съоръженията към нея, периодично се извършват огледи на съоръженията под вода, включително огледи на новоизградени конструкции.</p><p>Решетката на входа на ляв ОИ е приета и влиза в експлоатация през декември 2017 г. BSDC извърши пълна ROV инспекция с HD видео документиране.</p>`,
      featuredImageUrl: "/uploads/bsdc/news-kardzhali-oi.jpg",
      images: ["/uploads/bsdc/news-kardzhali-oi.jpg"],
      category: "ROV инспекции",
      publishedAt: new Date("2022-12-04"),
      sortOrder: 1,
    },
    {
      translationKey: "teshal-devin-oi-inspection",
      slug: "teshal-devin-oi-inspection",
      type: ProjectNewsType.PROJECT,
      title: `Подводен оглед на ОИ на язовир ${lq}Тешал${rq} и водовземане за ГНД на ВЕЦ ${lq}Девин${rq}`,
      excerpt: `Язовир ${lq}Доспат${rq} и язовир ${lq}Тешал${rq} са най-горните стъпала от каскада ${lq}Доспат-Въча${rq}. На съоръженията под вода периодично, най-малко веднъж на 5 години, се извършва оглед от водолази.`,
      content: `<p>Язовир ${lq}Доспат${rq} и язовир ${lq}Тешал${rq} са най-горните стъпала от каскада ${lq}Доспат-Въча${rq}. Съгласно изискванията на Наредбата, на съоръженията под вода периодично, най-малко веднъж на 5 години, се извършва оглед от водолази.</p><p>Последен такъв оглед е правен през 2015 г. BSDC извърши пълна подводна инспекция с HD видео документиране на входните решетки и тръбния тракт.</p>`,
      featuredImageUrl: "/uploads/bsdc/news-teshal-devin.jpg",
      images: ["/uploads/bsdc/news-teshal-devin.jpg"],
      category: "ROV инспекции",
      publishedAt: new Date("2022-10-30"),
      sortOrder: 2,
    },
    {
      translationKey: "peshtera-vodozvemna-kula",
      slug: "peshtera-vodozvemna-kula",
      type: ProjectNewsType.PROJECT,
      title: `Подводен оглед на водовземна кула за ВЕЦ ${lq}Пещера${rq}`,
      excerpt: `Водовземната кула за ВЕЦ ${lq}Пещера${rq} е разположена на десния скат на езерото на 150 м от оста на язовирна стена ${lq}Батак${rq}. Изградена е над входната част на основното водовземане.`,
      content: `<p>Водовземната кула за ВЕЦ ${lq}Пещера${rq} е разположена на десния скат на езерото на 150 м от оста на язовирна стена ${lq}Батак${rq}. Изградена е над входната част на основното водовземане.</p><p>Самото водовземане представлява водоприемник. На отвора има подвижна решетка, а затворният орган е плоска метална табла. През 2016 г. е извършен ремонт на компрометирани участъци. Поради режима на работа е необходима проверка на текущото състояние.</p>`,
      featuredImageUrl: "/uploads/bsdc/news-peshtera-kula.jpg",
      images: ["/uploads/bsdc/news-peshtera-kula.jpg"],
      category: "ROV инспекции",
      publishedAt: new Date("2022-10-23"),
      sortOrder: 3,
    },
    {
      translationKey: "galata-platform-diving",
      slug: "galata-platform-diving",
      type: ProjectNewsType.PROJECT,
      title: `Разхлабване на болтови връзки и монтаж на нова скоба на газова платформа ${lq}ГАЛАТА${rq}`,
      excerpt: `Газодобивната платформа ${lq}Галата${rq} е тринога офшорна конструкция на около 12 мили изток-североизток от Паша дере. Произведена е през 2003 г. в Кораборемонтния завод ${lq}Флотски арсенал${rq}, Варна.`,
      content: `<p>Газодобивната платформа ${lq}Галата${rq} е тринога офшорна конструкция на около 12 мили изток-североизток от Паша дере. Произведена е от италианската фирма Projeco.</p><ul><li>Водолазна услуга по разхлабване на болтови връзки на подводните скоби от 30" Raiser</li><li>Монтаж на нова скоба &mdash; прикрепяне на 14" conduit към 30" Raiser</li><li>Почистване на нанос около подводна скоба и монтаж на нова скоба</li></ul>`,
      featuredImageUrl: "/uploads/bsdc/news-galata-platform.jpg",
      images: ["/uploads/bsdc/news-galata-platform.jpg"],
      category: "Офшорни операции",
      publishedAt: new Date("2022-12-15"),
      sortOrder: 4,
    },
    {
      translationKey: "studen-kladenets-inspection",
      slug: "studen-kladenets-inspection",
      type: ProjectNewsType.PROJECT,
      title: `Подводен оглед на съоръжения на яз. ${lq}Студен кладенец${rq}`,
      excerpt: `Язовир ${lq}Студен кладенец${rq} е вторият по ред в каскадата ${lq}Арда${rq}. Стената разполага с два основни изпускателя. За безопасното техническо стопанисване периодично се извършват подводни огледи.`,
      content: `<p>Язовир ${lq}Студен кладенец${rq} е вторият по ред в каскадата ${lq}Арда${rq}. Стената разполага с два основни изпускателя &mdash; ляв и десен.</p><p>За безопасното техническо стопанисване периодично се извършват подводни огледи. Елементите, неподлежащи на инспекция извън вода, включват входни решетки, ремонтни затвори и стоманени тръбопроводи.</p>`,
      featuredImageUrl: "/uploads/bsdc/news-studen-kladenets.jpg",
      images: ["/uploads/bsdc/news-studen-kladenets.jpg"],
      category: "ROV инспекции",
      publishedAt: new Date("2022-09-12"),
      sortOrder: 5,
    },
    {
      translationKey: "valnolom-varna-repair",
      slug: "valnolom-varna-repair",
      type: ProjectNewsType.PROJECT,
      title: "Ремонтно-възстановителни и укрепителни работи по Вълнолом Варна - II етап",
      excerpt: "Вълноломът във Варна се състои от две части - източен (Приморски) и южен, заедно оформящи входа на пристанището. Изграждането му започва септември 1896 г.",
      content: "<p>Вълноломът във Варна се състои от две части &mdash;източен или Приморски (до Морска гара) и южен, заедно оформящи входа на пристанището.</p><p><strong>Основно оборудване:</strong></p><ul><li>KIRBY MORGAN SUPERLITE 27 HELMET</li><li>Водолазна пъпна връв AMRONINTL</li><li>Подводна ТВ и видео NOVASUB BULLET-Sony</li><li>Хидрографско оборудване</li></ul><p>Вторият етап обхвана ремонтно-възстановителни и укрепителни работи по подводната конструкция с пълна фото и видео документация.</p>",
      featuredImageUrl: "/uploads/bsdc/news-valnolom-varna.jpg",
      images: ["/uploads/bsdc/news-valnolom-varna.jpg"],
      category: "Хидротехническо строителство",
      publishedAt: new Date("2022-06-01"),
      sortOrder: 6,
    },
    {
      translationKey: "nova-lokaciya-bulport",
      slug: "nova-lokaciya-bulport",
      type: ProjectNewsType.PROJECT,
      title: "Нова локация на производствена и офис база",
      excerpt: `Фирма ${lq}Черноморски Водолазен Център${rq} ООД изгради нова производствена и офис сграда на територията на пристанищен комплекс ${lq}Булпорт Логистик${rq}.`,
      content: `<p>Фирма ${lq}Черноморски Водолазен Център${rq} ООД изгради нова производствена и офис сграда на територията на пристанищен комплекс ${lq}Булпорт Логистик${rq}.</p><p>Новата база разполага с модерно оборудване, складови помещения за водолазно снаряжение, ROV системи и хидрографска апаратура, и офис пространство за административна дейност.</p><p><em>В света на тишината, говорят действията!</em></p>`,
      featuredImageUrl: "/uploads/bsdc/news-nova-lokaciya.jpg",
      images: ["/uploads/bsdc/news-nova-lokaciya.jpg"],
      category: "Новини",
      publishedAt: new Date("2022-05-31"),
      sortOrder: 7,
    },
    {
      translationKey: "alex-stamboliyski-oi-inspection",
      slug: "alex-stamboliyski-oi-inspection",
      type: ProjectNewsType.PROJECT,
      title: `Подводен оглед на ОИ на язовир ${lq}Александър Стамболийски${rq}`,
      excerpt: `Язовир ${lq}Александър Стамболийски${rq} е изграден на река Росица, ляв приток на река Янтра. Стената е на 12 км от гр. Сухиндол. За безопасното стопанисване периодично се извършват подводни огледи.`,
      content: `<p>Язовир ${lq}Александър Стамболийски${rq} е изграден на река Росица, ляв приток на река Янтра. Стената е на 12 км от гр. Сухиндол.</p><p>Съоръженията, неподлежащи на инспекция извън вода, включват елементи на основния изпускател: входни решетки, ремонтни затвори и аварийни затворни елементи.</p><p>Използвани ROV системи (SEABOTIX), водолазни шлемове, подводни камери и комуникационни системи.</p>`,
      featuredImageUrl: "/uploads/bsdc/news-alex-stamboliyski-oi.jpg",
      images: ["/uploads/bsdc/news-alex-stamboliyski-oi.jpg"],
      category: "ROV инспекции",
      publishedAt: new Date("2022-06-01"),
      sortOrder: 8,
    },
    {
      translationKey: "golyam-beglik-shaft-repair",
      slug: "golyam-beglik-shaft-repair",
      type: ProjectNewsType.PROJECT,
      title: `Ремонт на свод на входна шахта и подмяна на метални решетки на язовир ${lq}Голям Беглик${rq}`,
      excerpt: `Язовирна стена ${lq}Г. Беглик${rq} е изградена на р. Крива в местността Камен проход, на 300 м преди сливането с р. Беглишка. Предназначението е да изравни водите от водносилов път БВП.`,
      content: `<p>Язовирна стена ${lq}Г. Беглик${rq} е изградена на р. Крива в местността Камен проход, на 300 м преди сливането с р. Беглишка. Предназначението е да изравни водите от водносилов път БВП.</p><p>Язовирната стена е проектирана и изпълнена като тип каменнозидана от едри риолитови блокове. По нея минава пътят между гр. Батак и гр. Доспат.</p><p>Извършени: ремонт на свод на входна шахта на десен основен изпускател и подмяна на метални решетки при входни шахти.</p>`,
      featuredImageUrl: "/uploads/bsdc/news-golyam-beglik.jpg",
      images: ["/uploads/bsdc/news-golyam-beglik.jpg"],
      category: "Ремонти и поддръжка",
      publishedAt: new Date("2022-05-15"),
      sortOrder: 9,
    },
  ]

  for (const p of projects) {
    await prisma.projectNewsItem.create({
      data: {
        language: "BG",
        translationKey: p.translationKey,
        slug: p.slug,
        type: p.type,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        featuredImageUrl: p.featuredImageUrl,
        images: p.images,
        category: p.category,
        publishedAt: p.publishedAt,
        sortOrder: p.sortOrder,
        published: true,
      },
    })
    console.log("  created:", p.slug)
  }

  console.log(`\nDone — ${projects.length} records inserted.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
