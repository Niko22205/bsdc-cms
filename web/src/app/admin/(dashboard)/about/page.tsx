import { prisma } from "@/lib/prisma"
import { saveAboutContent } from "./actions"
import { AboutForm } from "./_components/AboutForm"
import { PageHeader } from "../../_components/ui/PageHeader"
import { Badge } from "../../_components/ui/Badge"

export default async function AboutSectionPage() {
  const [bg, en] = await Promise.all([
    prisma.aboutContent.findUnique({ where: { language: "BG" } }),
    prisma.aboutContent.findUnique({ where: { language: "EN" } }),
  ])

  return (
    <div className="space-y-8">
      <PageHeader
        title="About Section"
        description="Company story, mission, and statistics."
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
              <AboutForm language={lang} action={saveAboutContent} initial={initial ?? {}} />
            </div>
          </section>
        )
      })}
    </div>
  )
}
