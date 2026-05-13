"use server"

import { prisma } from "@/lib/prisma"

export type ContactState = {
  success?: boolean
  errors?: {
    name?: string
    email?: string
    message?: string
  }
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = formData.get("name")?.toString().trim() ?? ""
  const email = formData.get("email")?.toString().trim() ?? ""
  const phone = formData.get("phone")?.toString().trim() || null
  const inquiryType = formData.get("inquiryType")?.toString().trim() || null
  const message = formData.get("message")?.toString().trim() ?? ""
  const source = formData.get("source")?.toString().trim() || null

  const errors: NonNullable<ContactState["errors"]> = {}
  if (name.length < 2) errors.name = "Моля въведете вашето име."
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Моля въведете валиден имейл адрес."
  if (message.length < 10) errors.message = "Съобщението трябва да е поне 10 символа."

  if (Object.keys(errors).length > 0) return { errors }

  await prisma.contactSubmission.create({
    data: { name, email, phone, inquiryType, message, source },
  })

  return { success: true }
}
