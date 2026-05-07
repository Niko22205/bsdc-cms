"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { Language, ProjectNewsType } from "@/generated/prisma/enums"

export type ProjectFormState = {
  errors?: Record<string, string>
}

function parseForm(formData: FormData) {
  const pubAt = String(formData.get("publishedAt") ?? "").trim()
  return {
    language: (formData.get("language") as string) as Language,
    type: (formData.get("type") as string) as ProjectNewsType,
    translationKey: String(formData.get("translationKey") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim() || null,
    content: String(formData.get("content") ?? "").trim() || null,
    featuredImageUrl: String(formData.get("featuredImageUrl") ?? "").trim() || null,
    images: String(formData.get("images") ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    category: String(formData.get("category") ?? "").trim() || null,
    publishedAt: pubAt ? new Date(pubAt) : null,
    seoTitle: String(formData.get("seoTitle") ?? "").trim() || null,
    seoDescription: String(formData.get("seoDescription") ?? "").trim() || null,
    sortOrder: Number(formData.get("sortOrder")) || 0,
    published: formData.get("published") === "on",
  }
}

function validate(data: ReturnType<typeof parseForm>): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!["BG", "EN"].includes(data.language)) errors.language = "Required"
  if (!["PROJECT", "NEWS"].includes(data.type)) errors.type = "Required"
  if (!data.title) errors.title = "Required"
  if (!data.slug) errors.slug = "Required"
  if (!data.translationKey) errors.translationKey = "Required"
  return errors
}

function isUniqueViolation(e: unknown): boolean {
  return e instanceof Error && e.message.includes("Unique constraint")
}

export async function createProjectNewsItem(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const data = parseForm(formData)
  const errors = validate(data)
  if (Object.keys(errors).length) return { errors }

  try {
    await prisma.projectNewsItem.create({ data })
  } catch (e) {
    if (isUniqueViolation(e)) {
      return { errors: { slug: "An item with this language + slug already exists" } }
    }
    throw e
  }

  revalidatePath("/admin/projects")
  redirect("/admin/projects")
}

export async function updateProjectNewsItem(
  id: string,
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const data = parseForm(formData)
  const errors = validate(data)
  if (Object.keys(errors).length) return { errors }

  try {
    await prisma.projectNewsItem.update({ where: { id }, data })
  } catch (e) {
    if (isUniqueViolation(e)) {
      return { errors: { slug: "An item with this language + slug already exists" } }
    }
    throw e
  }

  revalidatePath("/admin/projects")
  redirect("/admin/projects")
}

export async function deleteProjectNewsItem(formData: FormData) {
  const id = formData.get("id") as string
  await prisma.projectNewsItem.delete({ where: { id } })
  revalidatePath("/admin/projects")
  redirect("/admin/projects")
}
