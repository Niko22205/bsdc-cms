"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"
import { Language } from "@/generated/prisma/enums"

export type AboutFormState = {
  errors?: Record<string, string>
}

type JsonFieldResult = {
  value: typeof Prisma.DbNull | ReturnType<typeof JSON.parse>
  error?: string
}

function parseJsonField(raw: string | null): JsonFieldResult {
  if (!raw) return { value: Prisma.DbNull }
  try {
    return { value: JSON.parse(raw) as ReturnType<typeof JSON.parse> }
  } catch {
    return { value: Prisma.DbNull, error: "Invalid JSON" }
  }
}

function parseForm(formData: FormData) {
  const statisticsRaw = String(formData.get("statistics") ?? "").trim() || null
  const whyUsRaw      = String(formData.get("whyUs")      ?? "").trim() || null
  const timelineRaw   = String(formData.get("timeline")   ?? "").trim() || null

  const stats    = parseJsonField(statisticsRaw)
  const whyUs    = parseJsonField(whyUsRaw)
  const timeline = parseJsonField(timelineRaw)

  return {
    language:       (formData.get("language") as string) as Language,
    title:          String(formData.get("title")    ?? "").trim(),
    subtitle:       String(formData.get("subtitle") ?? "").trim() || null,
    content:        String(formData.get("content")  ?? "").trim(),
    imageUrl:       String(formData.get("imageUrl") ?? "").trim() || null,
    statistics:     stats.value,
    whyUs:          whyUs.value,
    timeline:       timeline.value,
    statisticsError: stats.error,
    whyUsError:      whyUs.error,
    timelineError:   timeline.error,
  }
}

function validate(data: ReturnType<typeof parseForm>): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!["BG", "EN"].includes(data.language)) errors.language = "Invalid language"
  if (!data.title)   errors.title   = "Required"
  if (!data.content) errors.content = "Required"
  if (data.statisticsError) errors.statistics = data.statisticsError
  if (data.whyUsError)      errors.whyUs      = data.whyUsError
  if (data.timelineError)   errors.timeline   = data.timelineError
  return errors
}

export async function saveAboutContent(
  _prev: AboutFormState,
  formData: FormData,
): Promise<AboutFormState> {
  const data   = parseForm(formData)
  const errors = validate(data)
  if (Object.keys(errors).length) return { errors }

  const fields = {
    title:      data.title,
    subtitle:   data.subtitle,
    content:    data.content,
    imageUrl:   data.imageUrl,
    statistics: data.statistics,
    whyUs:      data.whyUs,
    timeline:   data.timeline,
  }

  await prisma.aboutContent.upsert({
    where:  { language: data.language },
    update: fields,
    create: { language: data.language, ...fields },
  })

  revalidatePath("/admin/about")
  redirect("/admin/about")
}
