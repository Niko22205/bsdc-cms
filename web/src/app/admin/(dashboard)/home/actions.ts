"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { Language } from "@/generated/prisma/enums"

export type HomeFormState = {
  errors?: Record<string, string>
}

function parseForm(formData: FormData) {
  return {
    language: (formData.get("language") as string) as Language,
    headline: String(formData.get("headline") ?? "").trim(),
    subheadline: String(formData.get("subheadline") ?? "").trim() || null,
    eyebrow: String(formData.get("eyebrow") ?? "").trim() || null,
    ctaLabel: String(formData.get("ctaLabel") ?? "").trim() || null,
    ctaTarget: String(formData.get("ctaTarget") ?? "").trim() || null,
    ctaSecondaryLabel: String(formData.get("ctaSecondaryLabel") ?? "").trim() || null,
    ctaSecondaryTarget: String(formData.get("ctaSecondaryTarget") ?? "").trim() || null,
    heroImageUrl: String(formData.get("heroImageUrl") ?? "").trim() || null,
  }
}

function validate(data: ReturnType<typeof parseForm>): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!["BG", "EN"].includes(data.language)) errors.language = "Invalid language"
  if (!data.headline) errors.headline = "Required"
  return errors
}

export async function saveHomeContent(
  _prev: HomeFormState,
  formData: FormData,
): Promise<HomeFormState> {
  const data = parseForm(formData)
  const errors = validate(data)
  if (Object.keys(errors).length) return { errors }

  const { language, ...fields } = data

  await prisma.homeContent.upsert({
    where: { language },
    update: fields,
    create: { language, ...fields },
  })

  revalidatePath("/admin/home")
  redirect("/admin/home")
}
