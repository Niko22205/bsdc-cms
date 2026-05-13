"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function toggleRead(id: string, read: boolean) {
  await prisma.contactSubmission.update({ where: { id }, data: { read } })
  revalidatePath("/admin/submissions")
  revalidatePath(`/admin/submissions/${id}`)
}

export async function deleteSubmission(formData: FormData) {
  const id = String(formData.get("id"))
  await prisma.contactSubmission.delete({ where: { id } })
  revalidatePath("/admin/submissions")
  redirect("/admin/submissions")
}
