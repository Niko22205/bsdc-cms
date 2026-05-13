import { writeFile, mkdir } from "fs/promises"
import { join, extname, basename } from "path"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
])

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const file = formData.get("file") as File | null
  if (!file || !file.size) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "File type not supported" }, { status: 400 })
  }

  const ext = extname(file.name).toLowerCase() || ".jpg"
  const rawBase = basename(file.name, ext)
  const safeBase = rawBase.replace(/[^a-zA-Z0-9\-_]/g, "_").slice(0, 60)
  const filename = `${Date.now()}-${safeBase}${ext}`

  const uploadDir = join(process.cwd(), "public", "uploads", "bsdc")
  await mkdir(uploadDir, { recursive: true })

  const bytes = await file.arrayBuffer()
  await writeFile(join(uploadDir, filename), Buffer.from(bytes))

  const url = `/uploads/bsdc/${filename}`

  await prisma.media.create({
    data: {
      filename,
      url,
      mimeType: file.type,
      size: file.size,
      altText: null,
    },
  })

  return NextResponse.json({ url })
}
