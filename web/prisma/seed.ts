import "dotenv/config"
import bcrypt from "bcryptjs"
import { PrismaClient, UserRole } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.error("Seed failed: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env")
    process.exit(1)
  }

  console.log(`Seeding admin user: ${email}`)

  const hashed = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashed,
      role: UserRole.ADMIN,
    },
    create: {
      email,
      password: hashed,
      role: UserRole.ADMIN,
    },
  })

  console.log(`Done. Admin user ready: ${user.email} (role: ${user.role})`)
}

main()
  .catch((e) => {
    console.error("Seed error:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
