import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Briefcase, FolderOpen, ImageIcon, ArrowRight, Plus } from "lucide-react"
import { DashboardStats } from "./_components/DashboardStats"
import { InquiryChart, type ChartPoint } from "./_components/InquiryChart"
import { FadeIn } from "./_components/FadeIn"

// ── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 60) return "just now"
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 7 * 86400) return `${Math.floor(s / 86400)}d ago`
  return date.toLocaleDateString("en", { month: "short", day: "numeric" })
}

// ── Build 7-day inquiry chart data ──────────────────────────────────────────

async function getChartData(): Promise<ChartPoint[]> {
  const since = new Date()
  since.setDate(since.getDate() - 6)
  since.setHours(0, 0, 0, 0)

  const subs = await prisma.contactSubmission.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  })

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(since)
    d.setDate(d.getDate() + i)
    const dayStr = d.toISOString().slice(0, 10)
    const label = new Intl.DateTimeFormat("en", { weekday: "short" }).format(d)
    const count = subs.filter(
      (s) => s.createdAt.toISOString().slice(0, 10) === dayStr,
    ).length
    return { day: dayStr, label, count }
  })
}

// ── Quick action definitions ─────────────────────────────────────────────────

const ACTIONS = [
  {
    label: "Add New Service",
    description: "Create a service listing",
    href: "/admin/services/new",
    Icon: Briefcase,
  },
  {
    label: "Post New Project",
    description: "Publish a project or news item",
    href: "/admin/projects/new",
    Icon: FolderOpen,
  },
  {
    label: "Manage Gallery",
    description: "Upload and organise media files",
    href: "/admin/media",
    Icon: ImageIcon,
  },
]

// ── Page ────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const [unread, services, projects, media, recentSubs, chartData] =
    await Promise.all([
      prisma.contactSubmission.count({ where: { read: false } }),
      prisma.service.count({ where: { published: true } }),
      prisma.projectNewsItem.count(),
      prisma.media.count(),
      prisma.contactSubmission.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          message: true,
          read: true,
          createdAt: true,
          inquiryType: true,
        },
      }),
      getChartData(),
    ])

  const today = new Date().toLocaleDateString("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    // Break out of the layout's p-8 to fill the full main area with the dark bg
    <div className="-m-8 min-h-full bg-[#020617]">
      <div className="space-y-7 p-8">

        {/* ── Page header ──────────────────────────────────────────────── */}
        <FadeIn delay={0}>
          <div className="flex items-end justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: "#B87333" }}
                />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  BSDC · Admin
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Command Center
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Your operational overview
              </p>
            </div>
            <p className="hidden text-xs text-slate-600 sm:block">{today}</p>
          </div>
        </FadeIn>

        {/* ── Stats row ────────────────────────────────────────────────── */}
        <DashboardStats
          unread={unread}
          services={services}
          projects={projects}
          media={media}
        />

        {/* ── Chart + Quick Actions ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Inquiry trend chart */}
          <FadeIn delay={0.36} className="lg:col-span-2">
            <InquiryChart data={chartData} />
          </FadeIn>

          {/* Quick action tiles */}
          <FadeIn delay={0.44}>
            <div className="flex h-full flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Quick Actions
              </p>
              {ACTIONS.map(({ label, description, href, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4 backdrop-blur-md transition-all duration-200 hover:border-[#B87333]/30 hover:bg-white/[0.06]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#B87333]/[0.12] transition-colors group-hover:bg-[#B87333]/[0.18]">
                    <Icon size={18} color="#B87333" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="text-xs text-slate-500">{description}</p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="shrink-0 text-slate-600 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#B87333]"
                  />
                </Link>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* ── Recent Submissions ───────────────────────────────────────── */}
        <FadeIn delay={0.52}>
          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04] backdrop-blur-md">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.05] px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  Latest Messages
                </p>
                <p className="text-xs text-slate-500">Recent contact form inquiries</p>
              </div>
              {unread > 0 && (
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                  style={{ background: "rgba(184,115,51,0.18)", color: "#B87333" }}
                >
                  {unread} unread
                </span>
              )}
            </div>

            {/* Submission rows */}
            {recentSubs.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-slate-500">No messages yet.</p>
              </div>
            ) : (
              <ul>
                {recentSubs.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-start gap-4 border-b border-white/[0.04] px-6 py-4 last:border-b-0"
                  >
                    {/* Unread indicator */}
                    <div className="mt-1.5 shrink-0">
                      {!s.read ? (
                        <span
                          className="block h-2 w-2 rounded-full"
                          style={{ background: "#B87333" }}
                        />
                      ) : (
                        <span className="block h-2 w-2 rounded-full bg-white/[0.08]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-white">
                          {s.name}
                        </p>
                        <p className="shrink-0 text-[10px] text-slate-500">
                          {timeAgo(s.createdAt)}
                        </p>
                      </div>
                      <p className="truncate text-xs text-slate-400">{s.email}</p>
                      {s.inquiryType && (
                        <span
                          className="mt-1 inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            color: "rgba(255,255,255,0.4)",
                          }}
                        >
                          {s.inquiryType}
                        </span>
                      )}
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                        {s.message}
                      </p>
                    </div>

                    {/* View link */}
                    <Link
                      href={`/admin/submissions/${s.id}`}
                      className="mt-0.5 shrink-0 text-xs font-medium transition-colors"
                      style={{ color: "rgba(184,115,51,0.7)" }}
                    >
                      View →
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {/* Footer */}
            <div className="border-t border-white/[0.05] px-6 py-3">
              <Link
                href="/admin/submissions"
                className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                style={{ color: "#B87333" }}
              >
                View all messages
                <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* ── Add New button (floating helper) ────────────────────────── */}
        <FadeIn delay={0.6}>
          <div className="flex items-center justify-center pt-2">
            <Link
              href="/admin/services/new"
              className="group inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-slate-400 backdrop-blur-md transition-all hover:border-[#B87333]/30 hover:text-white"
            >
              <Plus size={14} />
              Create something new
            </Link>
          </div>
        </FadeIn>

      </div>
    </div>
  )
}
