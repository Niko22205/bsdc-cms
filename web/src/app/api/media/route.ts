import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const records = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, url: true, filename: true, altText: true, mimeType: true },
  })

  return NextResponse.json(records)
}
