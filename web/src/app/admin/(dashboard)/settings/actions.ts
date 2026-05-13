"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"

export type SettingsFormState = {
  errors?: Record<string, string>
}

function parseForm(formData: FormData) {
  const phonesRaw = String(formData.get("phones") ?? "").trim()
  const phones = phonesRaw
    ? phonesRaw.split("\n").map((p) => p.trim()).filter(Boolean)
    : []

  const socialLinksRaw = String(formData.get("socialLinks") ?? "").trim() || null
  let socialLinks: unknown = undefined
  let socialLinksError: string | undefined
  if (socialLinksRaw) {
    try {
      socialLinks = JSON.parse(socialLinksRaw)
    } catch {
      socialLinksError = "Invalid JSON"
    }
  }

  return {
    companyName: String(formData.get("companyName") ?? "").trim(),
    logoUrl: String(formData.get("logoUrl") ?? "").trim() || null,
    address: String(formData.get("address") ?? "").trim() || null,
    phones,
    email: String(formData.get("email") ?? "").trim() || null,
    workingHours: String(formData.get("workingHours") ?? "").trim() || null,
    googleMapsEmbed: String(formData.get("googleMapsEmbed") ?? "").trim() || null,
    socialLinks: socialLinks ?? Prisma.DbNull,
    footerText: String(formData.get("footerText") ?? "").trim() || null,
    defaultSeoTitle: String(formData.get("defaultSeoTitle") ?? "").trim() || null,
    defaultSeoDescription: String(formData.get("defaultSeoDescription") ?? "").trim() || null,
    socialLinksError,
  }
}

function validate(data: ReturnType<typeof parseForm>): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!data.companyName) errors.companyName = "Required"
  if (data.socialLinksError) errors.socialLinks = data.socialLinksError
  return errors
}

export async function saveSettings(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const data = parseForm(formData)
  const errors = validate(data)
  if (Object.keys(errors).length) return { errors }

  const fields = {
    companyName: data.companyName,
    logoUrl: data.logoUrl,
    address: data.address,
    phones: data.phones,
    email: data.email,
    workingHours: data.workingHours,
    googleMapsEmbed: data.googleMapsEmbed,
    socialLinks: data.socialLinks,
    footerText: data.footerText,
    defaultSeoTitle: data.defaultSeoTitle,
    defaultSeoDescription: data.defaultSeoDescription,
  }

  const existing = await prisma.siteSetting.findFirst()
  if (existing) {
    await prisma.siteSetting.update({ where: { id: existing.id }, data: fields })
  } else {
    await prisma.siteSetting.create({ data: fields })
  }

  revalidatePath("/admin/settings")
  redirect("/admin/settings")
}
