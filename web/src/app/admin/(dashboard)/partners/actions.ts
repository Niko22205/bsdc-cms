"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export type PartnerFormState = {
  errors?: Record<string, string>
}

function parseForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    logoUrl: String(formData.get("logoUrl") ?? "").trim(),
    websiteUrl: String(formData.get("websiteUrl") ?? "").trim() || null,
    sortOrder: Number(formData.get("sortOrder")) || 0,
    published: formData.get("published") === "on",
  }
}

function validate(data: ReturnType<typeof parseForm>): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!data.name) errors.name = "Required"
  if (!data.logoUrl) errors.logoUrl = "Required"
  return errors
}

export async function createPartner(
  _prev: PartnerFormState,
  formData: FormData,
): Promise<PartnerFormState> {
  const data = parseForm(formData)
  const errors = validate(data)
  if (Object.keys(errors).length) return { errors }

  await prisma.partner.create({ data })

  revalidatePath("/admin/partners")
  redirect("/admin/partners")
}

export async function updatePartner(
  id: string,
  _prev: PartnerFormState,
  formData: FormData,
): Promise<PartnerFormState> {
  const data = parseForm(formData)
  const errors = validate(data)
  if (Object.keys(errors).length) return { errors }

  await prisma.partner.update({ where: { id }, data })

  revalidatePath("/admin/partners")
  redirect("/admin/partners")
}

export async function deletePartner(formData: FormData) {
  const id = formData.get("id") as string
  await prisma.partner.delete({ where: { id } })
  revalidatePath("/admin/partners")
  redirect("/admin/partners")
}
