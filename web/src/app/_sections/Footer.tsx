import Link from "next/link"
import type { SiteSetting } from "@/generated/prisma/client"

type Props = {
  settings: SiteSetting | null
}

export function Footer({ settings }: Props) {
  const socialLinks =
    settings?.socialLinks !== null &&
    typeof settings?.socialLinks === "object" &&
    !Array.isArray(settings?.socialLinks)
      ? (settings.socialLinks as Record<string, string>)
      : {}

  const year = new Date().getFullYear()

  const navLinks = [
    { href: "#about", label: "За нас" },
    { href: "#services", label: "Услуги" },
    { href: "#projects", label: "Проекти" },
    { href: "#partners", label: "Партньори" },
    { href: "#contact", label: "Контакти" },
  ]

  return (
    <footer className="border-t border-white/10 bg-[#040c18] px-6 py-16 text-slate-400">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="text-xl font-bold tracking-wide text-white">
              {settings?.companyName ?? "BSDC"}
            </p>
            {settings?.footerText && (
              <p className="mt-3 max-w-sm text-sm leading-relaxed">
                {settings.footerText}
              </p>
            )}
            {Object.keys(socialLinks).length > 0 && (
              <div className="mt-5 flex gap-5">
                {Object.entries(socialLinks).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm capitalize transition hover:text-white"
                  >
                    {platform}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 text-sm">
            <p className="font-semibold text-white">Навигация</p>
            {navLinks.map((l) => (
              <p key={l.href}>
                <a href={l.href} className="transition hover:text-white">
                  {l.label}
                </a>
              </p>
            ))}
          </div>

          <div className="space-y-3 text-sm">
            <p className="font-semibold text-white">Контакти</p>
            {settings?.address && <p>{settings.address}</p>}
            {settings?.phones?.map((phone, i) => (
              <p key={i}>
                <a href={`tel:${phone}`} className="transition hover:text-white">
                  {phone}
                </a>
              </p>
            ))}
            {settings?.email && (
              <p>
                <a
                  href={`mailto:${settings.email}`}
                  className="transition hover:text-white"
                >
                  {settings.email}
                </a>
              </p>
            )}
            {settings?.workingHours && <p>{settings.workingHours}</p>}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-600 sm:flex-row sm:items-center">
          <p>
            © {year} {settings?.companyName ?? "BSDC"}. Всички права запазени.
          </p>
          <div className="flex gap-4">
            <Link href="/bg" className="transition hover:text-slate-400">
              BG
            </Link>
            <Link href="/en" className="transition hover:text-slate-400">
              EN
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
