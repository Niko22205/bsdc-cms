"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"
import { Language } from "@/generated/prisma/enums"

export type AboutFormState = {
  errors?: Record<string, string>
}

function parseForm(formData: FormData) {
  const statisticsRaw = String(formData.get("statistics") ?? "").trim() || null
  let statistics: unknown = undefined
  let statisticsError: string | undefined
  if (statisticsRaw) {
    try {
      statistics = JSON.parse(statisticsRaw)
    } catch {
      statisticsError = "Invalid JSON"
    }
  }

  return {
    language: (formData.get("language") as string) as Language,
    title: String(formData.get("title") ?? "").trim(),
    subtitle: String(formData.get("subtitle") ?? "").trim() || null,
    content: String(formData.get("content") ?? "").trim(),
    imageUrl: String(formData.get("imageUrl") ?? "").trim() || null,
    statistics: statistics ?? Prisma.DbNull,
    statisticsError,
  }
}

function validate(
  data: ReturnType<typeof parseForm>,
): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!["BG", "EN"].includes(data.language)) errors.language = "Invalid language"
  if (!data.title) errors.title = "Required"
  if (!data.content) errors.content = "Required"
  if (data.statisticsError) errors.statistics = data.statisticsError
  return errors
}

export async function saveAboutContent(
  _prev: AboutFormState,
  formData: FormData,
): Promise<AboutFormState> {
  const data = parseForm(formData)
  const errors = validate(data)
  if (Object.keys(errors).length) return { errors }

  const fields = {
    title: data.title,
    subtitle: data.subtitle,
    content: data.content,
    imageUrl: data.imageUrl,
    statistics: data.statistics,
  }

  await prisma.aboutContent.upsert({
    where: { language: data.language },
    update: fields,
    create: { language: data.language, ...fields },
  })

  revalidatePath("/admin/about")
  redirect("/admin/about")
}
