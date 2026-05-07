"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Home Section", href: "/admin/home" },
  { label: "About", href: "/admin/about" },
  { label: "Services", href: "/admin/services" },
  { label: "Projects / News", href: "/admin/projects" },
  { label: "Partners", href: "/admin/partners" },
  { label: "Certificates", href: "/admin/certificates" },
  { label: "Media", href: "/admin/media" },
  { label: "Submissions", href: "/admin/submissions" },
  { label: "Settings", href: "/admin/settings" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-zinc-200 bg-white">
      <div className="flex h-14 items-center border-b border-zinc-200 px-5">
        <span className="text-sm font-semibold tracking-wide text-zinc-900">BSDC</span>
      </div>
      <nav className="flex flex-col gap-0.5 p-3">
        {navItems.map(({ label, href }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={`rounded px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-zinc-100 font-medium text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
