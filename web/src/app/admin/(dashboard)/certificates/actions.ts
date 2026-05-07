"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { Language } from "@/generated/prisma/enums"

export type CertificateFormState = {
  errors?: Record<string, string>
}

function parseForm(formData: FormData) {
  const issueDateRaw = String(formData.get("issueDate") ?? "").trim()
  return {
    language: (formData.get("language") as string) as Language,
    translationKey: String(formData.get("translationKey") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    issuer: String(formData.get("issuer") ?? "").trim() || null,
    issueDate: issueDateRaw ? new Date(issueDateRaw) : null,
    fileUrl: String(formData.get("fileUrl") ?? "").trim() || null,
    imageUrl: String(formData.get("imageUrl") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    sortOrder: Number(formData.get("sortOrder")) || 0,
    published: formData.get("published") === "on",
  }
}

function validate(data: ReturnType<typeof parseForm>): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!["BG", "EN"].includes(data.language)) errors.language = "Required"
  if (!data.translationKey) errors.translationKey = "Required"
  if (!data.title) errors.title = "Required"
  return errors
}

function isUniqueViolation(e: unknown): boolean {
  return e instanceof Error && e.message.includes("Unique constraint")
}

export async function createCertificate(
  _prev: CertificateFormState,
  formData: FormData,
): Promise<CertificateFormState> {
  const data = parseForm(formData)
  const errors = validate(data)
  if (Object.keys(errors).length) return { errors }

  try {
    await prisma.certificate.create({ data })
  } catch (e) {
    if (isUniqueViolation(e)) {
      return { errors: { translationKey: "A certificate with this language + key already exists" } }
    }
    throw e
  }

  revalidatePath("/admin/certificates")
  redirect("/admin/certificates")
}

export async function updateCertificate(
  id: string,
  _prev: CertificateFormState,
  formData: FormData,
): Promise<CertificateFormState> {
  const data = parseForm(formData)
  const errors = validate(data)
  if (Object.keys(errors).length) return { errors }

  try {
    await prisma.certificate.update({ where: { id }, data })
  } catch (e) {
    if (isUniqueViolation(e)) {
      return { errors: { translationKey: "A certificate with this language + key already exists" } }
    }
    throw e
  }

  revalidatePath("/admin/certificates")
  redirect("/admin/certificates")
}

export async function deleteCertificate(formData: FormData) {
  const id = formData.get("id") as string
  await prisma.certificate.delete({ where: { id } })
  revalidatePath("/admin/certificates")
  redirect("/admin/certificates")
}
