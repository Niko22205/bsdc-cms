"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { SiteSetting } from "@/generated/prisma/client"
import type { Lang } from "../[lang]/page"

type Props = {
  settings: SiteSetting | null
  lang: Lang
}

export function Navbar({ settings, lang }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const navLinks = [
    { href: "#about", label: lang === "en" ? "About" : "За нас" },
    { href: "#services", label: lang === "en" ? "Services" : "Услуги" },
    { href: "#projects", label: lang === "en" ? "Projects" : "Проекти" },
    { href: "#partners", label: lang === "en" ? "Partners" : "Партньори" },
    { href: "#contact", label: lang === "en" ? "Contact" : "Контакти" },
  ]

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/[0.06] bg-[#020617]/95 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href={`/${lang}`}>
          <img src="/uploads/bsdc/logo-white.png" alt="BSDC" className="h-16 w-auto object-contain" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden gap-8 sm:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative text-[11px] uppercase tracking-[0.18em] text-slate-400 transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:scale-x-0 after:bg-[#B87333] after:transition-transform after:duration-300 after:content-[''] hover:text-white hover:after:scale-x-100"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* Language toggle */}
          <div className="hidden items-center gap-1.5 text-[11px] font-medium sm:flex">
            <Link
              href="/bg"
              className={
                lang === "bg"
                  ? "font-semibold text-white"
                  : "text-slate-500 transition-colors hover:text-slate-300"
              }
            >
              BG
            </Link>
            <span className="text-slate-600">/</span>
            <Link
              href="/en"
              className={
                lang === "en"
                  ? "font-semibold text-white"
                  : "text-slate-500 transition-colors hover:text-slate-300"
              }
            >
              EN
            </Link>
          </div>

          {/* CTA button */}
          <a
            href="#contact"
            className="hidden border border-[#B87333] px-4 py-1.5 text-[11px] uppercase tracking-widest text-[#B87333] transition-all duration-300 hover:bg-[#B87333] hover:text-white sm:block"
          >
            {lang === "en" ? "Enquiry" : "Запитване"}
          </a>

          {/* Mobile hamburger */}
          <button
            className="flex flex-col gap-1.5 sm:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span
              className={`block h-0.5 w-5 bg-white transition-all duration-200 ${
                menuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-white transition-all duration-200 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-white transition-all duration-200 ${
                menuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="bg-[#020617] px-6 py-2 sm:hidden">
          <nav className="flex flex-col text-[11px] uppercase tracking-[0.18em] text-slate-400">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="border-b border-white/5 py-3 transition-colors hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <div className="flex items-center gap-3 border-b border-white/5 py-3">
              <Link
                href="/bg"
                className={lang === "bg" ? "font-semibold text-white" : "text-slate-500"}
                onClick={() => setMenuOpen(false)}
              >
                BG
              </Link>
              <span className="text-slate-600">/</span>
              <Link
                href="/en"
                className={lang === "en" ? "font-semibold text-white" : "text-slate-500"}
                onClick={() => setMenuOpen(false)}
              >
                EN
              </Link>
            </div>
            <a
              href="#contact"
              className="mb-2 mt-3 self-start border border-[#B87333] px-4 py-1.5 text-[11px] uppercase tracking-widest text-[#B87333]"
              onClick={() => setMenuOpen(false)}
            >
              {lang === "en" ? "Enquiry" : "Запитване"}
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
