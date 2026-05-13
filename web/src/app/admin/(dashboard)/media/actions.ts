"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export type MediaFormState = {
  errors?: Record<string, string>
}

function parseForm(formData: FormData) {
  return {
    url: String(formData.get("url") ?? "").trim(),
    filename: String(formData.get("filename") ?? "").trim(),
    mimeType: String(formData.get("mimeType") ?? "").trim(),
    size: parseInt(String(formData.get("size") ?? "0"), 10) || 0,
    altText: String(formData.get("altText") ?? "").trim() || null,
  }
}

function validate(data: ReturnType<typeof parseForm>): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!data.url) errors.url = "Required"
  if (!data.filename) errors.filename = "Required"
  if (!data.mimeType) errors.mimeType = "Required"
  return errors
}

export async function createMediaRecord(
  _prev: MediaFormState,
  formData: FormData,
): Promise<MediaFormState> {
  const data = parseForm(formData)
  const errors = validate(data)
  if (Object.keys(errors).length) return { errors }

  await prisma.media.create({ data })

  revalidatePath("/admin/media")
  redirect("/admin/media")
}

export async function deleteMedia(formData: FormData) {
  const id = String(formData.get("id"))
  await prisma.media.delete({ where: { id } })
  revalidatePath("/admin/media")
  redirect("/admin/media")
}
