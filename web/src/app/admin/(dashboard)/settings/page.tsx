import { prisma } from "@/lib/prisma"
import { saveSettings } from "./actions"
import { SettingsForm } from "./_components/SettingsForm"
import { PageHeader } from "../../_components/ui/PageHeader"

export default async function SettingsPage() {
  const settings = await prisma.siteSetting.findFirst()

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Site-wide configuration, contact info, and SEO defaults."
      />
      <div className="max-w-2xl rounded-xl border border-white/[0.07] bg-white/[0.04] p-8">
        <SettingsForm action={saveSettings} initial={settings ?? {}} />
      </div>
    </div>
  )
}
