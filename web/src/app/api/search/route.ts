import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json([], { status: 401 })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim() ?? ""
  if (q.length < 2) return NextResponse.json([])

  const [services, projects] = await Promise.all([
    prisma.service.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      select: { id: true, title: true },
      take: 5,
    }),
    prisma.projectNewsItem.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      select: { id: true, title: true },
      take: 5,
    }),
  ])

  return NextResponse.json([
    ...services.map((s) => ({
      id: s.id,
      title: s.title,
      type: "service",
      href: `/admin/services/${s.id}/edit`,
    })),
    ...projects.map((p) => ({
      id: p.id,
      title: p.title,
      type: "project",
      href: `/admin/projects/${p.id}/edit`,
    })),
  ])
}
