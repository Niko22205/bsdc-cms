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
  const [activeScene, setActiveScene] = useState(0)
  const [currentScene, setCurrentScene] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      setCurrentScene((e as CustomEvent<{ scene: number }>).detail.scene)
    }
    window.addEventListener('bsdc:navigate', handler)
    return () => window.removeEventListener('bsdc:navigate', handler)
  }, [])

  const navLinks = [
    { scene: 0, label: lang === "en" ? "Home"     : "Начало"    },
    { scene: 1, label: lang === "en" ? "About"    : "За нас"    },
    { scene: 2, label: lang === "en" ? "Services" : "Услуги"    },
    { scene: 3, label: lang === "en" ? "Projects" : "Проекти"   },
    { scene: 4, label: lang === "en" ? "Contact"  : "Контакти"  },
  ]

  function navigate(scene: number) {
    window.dispatchEvent(new CustomEvent("bsdc:navigate", { detail: { scene } }))
  }

  function openEnquiry() {
    window.dispatchEvent(new CustomEvent("bsdc:enquiry"))
  }

  const linkBase = "font-sans font-light text-[10px] uppercase tracking-[0.3em] transition-colors duration-200 cursor-pointer"

  return (
    <header className="fixed left-0 right-0 top-0 z-[600]">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6">

        {/* Wordmark — hidden on hero (scene 0) */}
        <div style={{ opacity: currentScene !== 0 ? 1 : 0, transition: 'opacity 0.6s ease', pointerEvents: currentScene !== 0 ? 'auto' : 'none' }}>
          <Link href={`/${lang}`} className="font-serif font-light text-[14px] text-[rgba(245,243,239,0.8)] uppercase tracking-[0.08em]">
            BSDC
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden gap-8 sm:flex">
          {navLinks.map((l) => (
            <button
              key={l.scene}
              type="button"
              onClick={() => { navigate(l.scene); setActiveScene(l.scene) }}
              className={`${linkBase} ${
                activeScene === l.scene
                  ? "text-brand-copper border-b border-brand-copper pb-px"
                  : "text-brand-text-caption hover:text-brand-copper"
              }`}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* Language toggle */}
          <div className="hidden items-center gap-1.5 sm:flex">
            <Link
              href="/bg"
              className={`${linkBase} tracking-[0.2em] ${
                lang === "bg"
                  ? "text-[rgba(245,243,239,0.9)]"
                  : "text-[rgba(245,243,239,0.4)] hover:text-[rgba(245,243,239,0.7)]"
              }`}
            >
              BG
            </Link>
            <span className="font-sans text-[10px] text-[rgba(245,243,239,0.2)]">/</span>
            <Link
              href="/en"
              className={`${linkBase} tracking-[0.2em] ${
                lang === "en"
                  ? "text-[rgba(245,243,239,0.9)]"
                  : "text-[rgba(245,243,239,0.4)] hover:text-[rgba(245,243,239,0.7)]"
              }`}
            >
              EN
            </Link>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={openEnquiry}
            className="hidden font-sans font-light text-[10px] uppercase tracking-[0.25em] px-6 py-2.5 border border-[rgba(245,243,239,0.25)] text-[rgba(245,243,239,0.8)] hover:border-brand-copper hover:text-brand-copper transition-colors duration-200 cursor-pointer sm:block"
            style={{ borderRadius: '1px' }}
          >
            {lang === "en" ? "Enquiry" : "Запитване"}
          </button>

          {/* Mobile hamburger */}
          <button
            className="flex flex-col gap-1.5 sm:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className={`block h-0.5 w-5 bg-white transition-all duration-200 ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 bg-white transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-white transition-all duration-200 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="px-6 py-2 sm:hidden" style={{ background: '#0C0A08' }}>
          <nav className="flex flex-col">
            {navLinks.map((l) => (
              <button
                key={l.scene}
                type="button"
                onClick={() => { navigate(l.scene); setActiveScene(l.scene); setMenuOpen(false) }}
                className={`${linkBase} border-b border-white/5 py-3 text-left ${
                  activeScene === l.scene
                    ? "text-brand-copper"
                    : "text-brand-text-caption hover:text-[rgba(245,243,239,0.9)]"
                }`}
              >
                {l.label}
              </button>
            ))}
            <div className="flex items-center gap-3 border-b border-white/5 py-3">
              <Link
                href="/bg"
                className={`${linkBase} tracking-[0.2em] ${lang === "bg" ? "text-[rgba(245,243,239,0.9)]" : "text-[rgba(245,243,239,0.4)]"}`}
                onClick={() => setMenuOpen(false)}
              >
                BG
              </Link>
              <span className="font-sans text-[10px] text-[rgba(245,243,239,0.2)]">/</span>
              <Link
                href="/en"
                className={`${linkBase} tracking-[0.2em] ${lang === "en" ? "text-[rgba(245,243,239,0.9)]" : "text-[rgba(245,243,239,0.4)]"}`}
                onClick={() => setMenuOpen(false)}
              >
                EN
              </Link>
            </div>
            <button
              type="button"
              onClick={() => { openEnquiry(); setMenuOpen(false) }}
              className="mb-2 mt-3 self-start font-sans font-light text-[10px] uppercase tracking-[0.25em] px-6 py-2.5 border border-[rgba(245,243,239,0.25)] text-[rgba(245,243,239,0.8)] hover:border-brand-copper hover:text-brand-copper transition-colors duration-200 cursor-pointer"
              style={{ borderRadius: '1px' }}
            >
              {lang === "en" ? "Enquiry" : "Запитване"}
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
