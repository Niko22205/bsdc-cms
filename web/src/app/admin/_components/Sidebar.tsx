"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import {
  LayoutDashboard,
  Home,
  Info,
  Briefcase,
  FolderOpen,
  Handshake,
  Award,
  ImageIcon,
  MessageSquare,
  Settings,
  Search,
  type LucideIcon,
} from "lucide-react"

type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Content",
    items: [
      { label: "Home Section", href: "/admin/home", icon: Home },
      { label: "About", href: "/admin/about", icon: Info },
      { label: "Services", href: "/admin/services", icon: Briefcase },
      { label: "Projects / News", href: "/admin/projects", icon: FolderOpen },
    ],
  },
  {
    label: "Assets",
    items: [
      { label: "Partners", href: "/admin/partners", icon: Handshake },
      { label: "Certificates", href: "/admin/certificates", icon: Award },
      { label: "Media", href: "/admin/media", icon: ImageIcon },
    ],
  },
  {
    label: "Communication",
    items: [{ label: "Submissions", href: "/admin/submissions", icon: MessageSquare }],
  },
  {
    label: "System",
    items: [{ label: "Settings", href: "/admin/settings", icon: Settings }],
  },
]

type SearchResult = {
  id: string
  title: string
  type: "service" | "project"
  href: string
}

export function Sidebar() {
  const pathname = usePathname()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  useEffect(() => {
    const q = query.trim()
    if (!q || q.length < 2) {
      setResults([])
      setShowResults(false)
      return
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
        const data: SearchResult[] = await res.json()
        setResults(data)
        setShowResults(true)
      } catch {
        // ignore
      }
    }, 280)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <aside className="flex h-screen w-60 flex-shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0f1e]">
      {/* Brand */}
      <div className="flex h-14 items-center gap-3 border-b border-white/[0.06] px-4">
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm"
          style={{ background: "#B87333" }}
        >
          B
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-none text-white">BSDC</p>
          <p className="mt-0.5 text-[10px] font-medium text-slate-600">Content Manager</p>
        </div>
      </div>

      {/* Dashboard link */}
      <div className="px-3 pt-3">
        <Link
          href="/admin"
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === "/admin"
              ? "bg-[#B87333]/[0.14] text-[#B87333]"
              : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-200"
          }`}
        >
          <LayoutDashboard size={15} className="shrink-0" />
          Dashboard
        </Link>
      </div>

      {/* Quick Search */}
      <div className="px-3 pt-3" ref={searchRef}>
        <div className="relative">
          <Search
            size={13}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            placeholder="Quick search…"
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] py-2 pl-8 pr-3 text-xs text-slate-300 outline-none transition placeholder:text-slate-700 focus:border-[#B87333]/30 focus:bg-white/[0.06]"
          />
          {showResults && (
            <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c1524] shadow-2xl">
              {results.length === 0 ? (
                <p className="px-3 py-3 text-xs text-slate-600">No results</p>
              ) : (
                results.map((r) => (
                  <Link
                    key={r.id}
                    href={r.href}
                    onClick={() => {
                      setQuery("")
                      setShowResults(false)
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 text-xs text-slate-300 transition hover:bg-white/[0.05]"
                  >
                    <span
                      className="shrink-0 rounded px-1 py-0.5 text-[9px] font-bold uppercase"
                      style={{
                        background: "rgba(184,115,51,0.14)",
                        color: "#B87333",
                      }}
                    >
                      {r.type === "service" ? "SVC" : "PRJ"}
                    </span>
                    <span className="truncate">{r.title}</span>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-700">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map(({ label, href, icon: Icon }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-[#B87333]/[0.14] font-medium text-[#B87333]"
                        : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-200"
                    }`}
                  >
                    <Icon size={15} className="shrink-0" />
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
