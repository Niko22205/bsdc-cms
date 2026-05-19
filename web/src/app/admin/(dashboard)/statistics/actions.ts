"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export type StatisticsFormState = {
  errors?: Record<string, string>
}

export type StatItem = { value: string; label: string }

function parseItems(raw: string): { items: StatItem[]; error?: string } {
  try {
    const parsed = JSON.parse(raw || "[]")
    if (!Array.isArray(parsed)) return { items: [], error: "Expected array" }
    return { items: parsed as StatItem[] }
  } catch {
    return { items: [], error: "Invalid JSON" }
  }
}

export async function saveStatistics(
  _prev: StatisticsFormState,
  formData: FormData,
): Promise<StatisticsFormState> {
  const heroRaw  = String(formData.get("heroStats")  ?? "").trim()
  const aboutRaw = String(formData.get("aboutStats") ?? "").trim()

  const heroResult  = parseItems(heroRaw)
  const aboutResult = parseItems(aboutRaw)

  const errors: Record<string, string> = {}
  if (heroResult.error)  errors.heroStats  = heroResult.error
  if (aboutResult.error) errors.aboutStats = aboutResult.error
  if (Object.keys(errors).length) return { errors }

  const statistics = { hero: heroResult.items, about: aboutResult.items }

  await prisma.aboutContent.upsert({
    where:  { language: "BG" },
    update: { statistics },
    create: { language: "BG", title: "За нас", content: "", statistics },
  })

  revalidatePath("/admin/statistics")
  revalidatePath("/")
  redirect("/admin/statistics")
}
