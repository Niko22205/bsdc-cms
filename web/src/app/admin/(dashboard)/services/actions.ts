"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { Language } from "@/generated/prisma/enums"

export type ServiceFormState = {
  errors?: Record<string, string>
}

function parseForm(formData: FormData) {
  return {
    language: (formData.get("language") as string) as Language,
    translationKey: String(formData.get("translationKey") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    shortDescription: String(formData.get("shortDescription") ?? "").trim() || null,
    content: String(formData.get("content") ?? "").trim() || null,
    iconUrl: String(formData.get("iconUrl") ?? "").trim() || null,
    featuredImageUrl: String(formData.get("featuredImageUrl") ?? "").trim() || null,
    seoTitle: String(formData.get("seoTitle") ?? "").trim() || null,
    seoDescription: String(formData.get("seoDescription") ?? "").trim() || null,
    sortOrder: Number(formData.get("sortOrder")) || 0,
    published: formData.get("published") === "on",
  }
}

function validate(data: ReturnType<typeof parseForm>): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!["BG", "EN"].includes(data.language)) errors.language = "Required"
  if (!data.title) errors.title = "Required"
  if (!data.slug) errors.slug = "Required"
  if (!data.translationKey) errors.translationKey = "Required"
  return errors
}

function isUniqueViolation(e: unknown): boolean {
  return e instanceof Error && e.message.includes("Unique constraint")
}

export async function createService(
  _prev: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const data = parseForm(formData)
  const errors = validate(data)
  if (Object.keys(errors).length) return { errors }

  try {
    await prisma.service.create({ data })
  } catch (e) {
    if (isUniqueViolation(e)) {
      return { errors: { slug: "A service with this language + slug already exists" } }
    }
    throw e
  }

  revalidatePath("/admin/services")
  redirect("/admin/services")
}

export async function updateService(
  id: string,
  _prev: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const data = parseForm(formData)
  const errors = validate(data)
  if (Object.keys(errors).length) return { errors }

  try {
    await prisma.service.update({ where: { id }, data })
  } catch (e) {
    if (isUniqueViolation(e)) {
      return { errors: { slug: "A service with this language + slug already exists" } }
    }
    throw e
  }

  revalidatePath("/admin/services")
  redirect("/admin/services")
}

export async function deleteService(formData: FormData) {
  const id = formData.get("id") as string
  await prisma.service.delete({ where: { id } })
  revalidatePath("/admin/services")
  redirect("/admin/services")
}
