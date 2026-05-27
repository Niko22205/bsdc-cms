import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // All services
  const svcs = await prisma.service.findMany({ orderBy: [{ language: "asc" }, { sortOrder: "asc" }] })
  console.log(`\n=== SERVICES (${svcs.length} total) ===`)
  for (const s of svcs) {
    console.log(
      `[${s.language}] id=${s.id.slice(0,8)} key=${s.translationKey} | accent=${s.accentColor ?? "NULL"} | acts=${s.activities.length} | cards=${Array.isArray(s.statCards) ? (s.statCards as unknown[]).length : "NULL"}`
    )
  }

  // About content
  const about = await prisma.aboutContent.findFirst({ where: { language: "BG" } })
  console.log("\n=== ABOUT statistics ===")
  console.log(JSON.stringify(about?.statistics, null, 2)?.slice(0, 600))

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
