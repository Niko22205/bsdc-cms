import { prisma } from "@/lib/prisma"
import { saveStatistics, type StatItem } from "./actions"
import { StatisticsForm } from "./_components/StatisticsForm"
import { PageHeader } from "../../_components/ui/PageHeader"

function parseStatistics(raw: unknown): { hero: StatItem[]; about: StatItem[] } {
  if (!raw) return { hero: [], about: [] }
  // New format: { hero: [], about: [] }
  if (typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.hero) || Array.isArray(obj.about)) {
      return {
        hero:  Array.isArray(obj.hero)  ? (obj.hero  as StatItem[]) : [],
        about: Array.isArray(obj.about) ? (obj.about as StatItem[]) : [],
      }
    }
  }
  // Legacy flat array: first 3 = hero, rest = about
  if (Array.isArray(raw)) {
    const arr = raw as StatItem[]
    return { hero: arr.slice(0, 3), about: arr.slice(3) }
  }
  return { hero: [], about: [] }
}

export default async function StatisticsPage() {
  const bg = await prisma.aboutContent.findUnique({ where: { language: "BG" } })
  const { hero, about } = parseStatistics(bg?.statistics)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistics"
        description="Manage the numbers shown on the Hero and About scenes."
      />
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-8">
        <StatisticsForm
          action={saveStatistics}
          initialHero={hero}
          initialAbout={about}
        />
      </div>
    </div>
  )
}
