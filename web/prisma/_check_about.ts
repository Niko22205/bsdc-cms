import "dotenv/config"
import { prisma } from "../src/lib/prisma"

async function main() {
  const row = await prisma.aboutContent.findUnique({ where: { language: "BG" } })
  const whyUs = row?.whyUs as any
  const tl    = row?.timeline as any
  const stats = row?.statistics as any

  if (whyUs?.items) console.log("whyUs.items count:", whyUs.items.length, "| first:", JSON.stringify(whyUs.items[0]))
  else if (Array.isArray(whyUs)) console.log("whyUs array count:", whyUs.length)
  else console.log("whyUs:", JSON.stringify(whyUs)?.slice(0, 200))

  if (tl?.items)          console.log("timeline.items count:", tl.items.length)
  else if (Array.isArray(tl)) console.log("timeline array count:", tl.length)
  else console.log("timeline:", JSON.stringify(tl)?.slice(0, 100))

  if (Array.isArray(stats)) console.log("statistics count:", stats.length, "| first:", JSON.stringify(stats[0]))
  else console.log("statistics:", JSON.stringify(stats)?.slice(0, 100))

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
