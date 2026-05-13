import { PrismaClient } from "./src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

db.media.findMany({ select: { url: true, filename: true }, orderBy: { createdAt: "desc" }, take: 20 })
  .then(r => { console.log("COUNT:", r.length); console.log(JSON.stringify(r, null, 2)) })
  .catch(e => console.error("ERROR:", e.message))
  .finally(() => db.$disconnect())
