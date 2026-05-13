import { prisma } from "@/lib/prisma"
import { saveHomeContent } from "./actions"
import { HomeForm } from "./_components/HomeForm"
import { PageHeader } from "../../_components/ui/PageHeader"
import { Badge } from "../../_components/ui/Badge"

export default async function HomeSectionPage() {
  const [bg, en] = await Promise.all([
    prisma.homeContent.findUnique({ where: { language: "BG" } }),
    prisma.homeContent.findUnique({ where: { language: "EN" } }),
  ])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Home Section"
        description="Hero headline, subheadline, CTA, and banner image."
      />

      {(["BG", "EN"] as const).map((lang) => {
        const initial = lang === "BG" ? bg : en
        return (
          <section key={lang}>
            <div className="mb-3 flex items-center gap-2">
              <Badge variant={lang === "BG" ? "indigo" : "zinc"}>{lang}</Badge>
              <h2 className="text-sm font-semibold text-slate-400">
                {lang === "BG" ? "Bulgarian" : "English"}
              </h2>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-8">
              <HomeForm language={lang} action={saveHomeContent} initial={initial ?? {}} />
            </div>
          </section>
        )
      })}
    </div>
  )
}
