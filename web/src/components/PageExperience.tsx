"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
import gsap from "gsap"

const GlobalBackground = dynamic(() => import("./3d/GlobalBackground"), { ssr: false })
import type {
  HomeContent,
  AboutContent,
  Service,
  ProjectNewsItem,
  Certificate,
  Partner,
  SiteSetting,
} from "@/generated/prisma/client"


interface Props {
  home: HomeContent | null
  about: AboutContent | null
  services: Service[]
  projects: ProjectNewsItem[]
  certificates: Certificate[]
  partners: Partner[]
  settings: SiteSetting | null
  lang: string
}

const SCENE_LABELS = ["Hero", "About", "Services", "Projects", "Contact"]

export default function PageExperience({
  home,
  about,
  services: _services,
  projects: _projects,
  certificates,
  partners: _partners,
  settings: _settings,
  lang,
}: Props) {
  const allStats = (() => {
    try {
      const parsed = JSON.parse((about?.statistics as string) ?? "[]")
      return Array.isArray(parsed) ? parsed as { value: string; label: string }[] : []
    } catch { return [] as { value: string; label: string }[] }
  })()
  const heroStats  = allStats.slice(0, 3)
  const aboutStats = allStats.slice(3, 6)
  const [currentScene, setCurrentScene] = useState(0)
  const currentSceneRef = useRef(0)
  const isAnimating = useRef(false)
  const touchStartY = useRef(0)

  const rootRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const aboutRef = useRef<HTMLDivElement>(null)
  const servicesRef = useRef<HTMLDivElement>(null)
  const projectsRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)

  const sceneRefs = [heroRef, aboutRef, servicesRef, projectsRef, contactRef]
  const totalScenes = sceneRefs.length

  // ── Transitions ─────────────────────────────────────────────────────────

  function standardTransition(current: number, next: number) {
    const currentEl = sceneRefs[current].current
    const nextEl = sceneRefs[next].current
    const direction = next > current ? 1 : -1

    const tl = gsap.timeline({
      onComplete: () => {
        currentSceneRef.current = next
        setCurrentScene(next)
        isAnimating.current = false
      },
    })

    if (currentEl) {
      tl.to(currentEl, { opacity: 0, y: -60 * direction, duration: 0.9, ease: "power3.inOut" }, 0)
    }
    if (nextEl) {
      gsap.set(nextEl, { opacity: 0, y: 60 * direction })
      tl.to(nextEl, { opacity: 1, y: 0, duration: 0.9, ease: "power3.inOut" }, 0)
    }
  }

  function heroExitTransition(next: number) {
    const heroEl = heroRef.current
    const nextEl = sceneRefs[next].current

    // ── Cinematic scatter + ripple transition for hero → about ───────────
    if (next === 1) {
      const tl = gsap.timeline({
        onComplete: () => {
          currentSceneRef.current = next
          setCurrentScene(next)
          isAnimating.current = false
        },
      })

      if (heroEl) {
        tl.to(heroEl.querySelectorAll(".hero-word"), {
          x: () => (Math.random() - 0.5) * 1000,
          y: () => (Math.random() - 0.5) * 800,
          rotation: () => (Math.random() - 0.5) * 360,
          opacity: 0,
          duration: 0.6,
          stagger: 0.04,
          ease: "power2.in",
        }, 0)

        const eyebrow = heroEl.querySelector(".hero-eyebrow")
        if (eyebrow) tl.to(eyebrow, { x: -300, opacity: 0, duration: 0.4, ease: "power2.in" }, 0)

        const sub = heroEl.querySelector(".hero-sub")
        if (sub) tl.to(sub, { y: 50, opacity: 0, duration: 0.4, ease: "power2.in" }, 0)

        const cta = heroEl.querySelector(".hero-cta")
        if (cta) tl.to(cta, { y: 50, opacity: 0, duration: 0.4, ease: "power2.in" }, 0)

        const stats = heroEl.querySelector(".hero-stats")
        if (stats) tl.to(stats, { y: 30, opacity: 0, duration: 0.4, ease: "power2.in" }, 0)

        const bg = heroEl.querySelector(".hero-bg-wrapper")
        if (bg) tl.to(bg, { scale: 1.15, opacity: 0, duration: 0.8, ease: "power2.in" }, 0)
      }

      // Ripple overlay at t=0.3
      tl.add(() => {
        const ripple = document.createElement("div")
        ripple.style.cssText = [
          "position:fixed", "inset:0", "z-index:100", "pointer-events:none",
          "background:radial-gradient(circle at 50% 50%, #07111f 0%, transparent 70%)",
          "transform-origin:center center",
        ].join(";")
        document.body.appendChild(ripple)
        gsap.fromTo(ripple,
          { scale: 0, opacity: 0.8 },
          { scale: 4, opacity: 0, duration: 0.9, ease: "power2.out", onComplete: () => ripple.remove() },
        )
      }, 0.3)

      // About scene enters at t=0.4
      if (nextEl) {
        gsap.set(nextEl, { opacity: 0, scale: 0.95, y: 0 })
        tl.to(nextEl, { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }, 0.4)
      }

      return
    }

    // ── Default hero exit for scenes 2–4 ────────────────────────────────
    const tl = gsap.timeline({
      onComplete: () => {
        currentSceneRef.current = next
        setCurrentScene(next)
        isAnimating.current = false
      },
    })

    if (heroEl) {
      tl.to(heroEl.querySelectorAll(".hero-word"), {
        x: () => (Math.random() - 0.5) * 400,
        y: () => (Math.random() - 0.5) * 300,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.in",
      }, 0)

      const supporting = [
        heroEl.querySelector(".hero-eyebrow"),
        heroEl.querySelector(".hero-sub"),
        heroEl.querySelector(".hero-cta"),
        heroEl.querySelector(".hero-stats"),
      ].filter(Boolean)
      if (supporting.length) {
        tl.to(supporting, { opacity: 0, duration: 0.4, ease: "power2.in" }, 0)
      }

      const bg = heroEl.querySelector(".hero-bg-wrapper")
      if (bg) {
        tl.to(bg, { scale: 1.2, opacity: 0, duration: 0.7, ease: "power2.in" }, 0)
      }
    }

    if (nextEl) {
      gsap.set(nextEl, { y: "100vh", opacity: 1 })
      tl.to(nextEl, { y: 0, duration: 0.8, ease: "power3.inOut" }, "-=0.2")
    }
  }

  function heroEnterTransition(from: number) {
    const heroEl = heroRef.current
    const fromEl = sceneRefs[from].current

    // Reset scattered hero elements before animating in
    if (heroEl) {
      gsap.set(heroEl.querySelectorAll(".hero-word"), { x: 0, y: 0, rotation: 0, opacity: 1 })
      const eyebrow = heroEl.querySelector(".hero-eyebrow")
      if (eyebrow) gsap.set(eyebrow, { x: 0, opacity: 1 })
      const others = [
        heroEl.querySelector(".hero-sub"),
        heroEl.querySelector(".hero-cta"),
        heroEl.querySelector(".hero-stats"),
      ].filter(Boolean)
      if (others.length) gsap.set(others, { opacity: 1 })
      const bg = heroEl.querySelector(".hero-bg-wrapper")
      if (bg) gsap.set(bg, { scale: 1, opacity: 1 })
    }

    const tl = gsap.timeline({
      onComplete: () => {
        currentSceneRef.current = 0
        setCurrentScene(0)
        isAnimating.current = false
      },
    })

    if (fromEl) {
      tl.to(fromEl, { opacity: 0, y: 60, duration: 0.9, ease: "power3.inOut" }, 0)
    }
    if (heroEl) {
      gsap.set(heroEl, { opacity: 0, y: -60 })
      tl.to(heroEl, { opacity: 1, y: 0, duration: 0.9, ease: "power3.inOut" }, 0)
    }
  }

  function runAboutEntrance() {
    const el = aboutRef.current
    if (!el) return

    gsap.fromTo(el.querySelector(".about-eyebrow"),
      { x: -40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
    )
    gsap.fromTo(el.querySelector(".about-title"),
      { x: -60, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, delay: 0.1, ease: "power3.out" },
    )
    gsap.fromTo(el.querySelector(".about-text"),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, delay: 0.2, ease: "power3.out" },
    )
    gsap.fromTo(el.querySelector(".about-image"),
      { x: 80, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.9, delay: 0.1, ease: "power3.out" },
    )
    gsap.fromTo(el.querySelector(".about-stats"),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.3, ease: "power3.out" },
    )
    gsap.fromTo(el.querySelector(".about-certs"),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.4, ease: "power3.out" },
    )

    // Counting animation for about stats
    el.querySelectorAll("[data-stat-value]").forEach((statEl) => {
      const raw = statEl.getAttribute("data-stat-value") ?? ""
      if (raw === "24/7") return
      const suffix = raw.includes("+") ? "+" : raw.includes("м") ? "м" : ""
      const num = parseInt(raw.replace(/\D/g, ""))
      if (isNaN(num)) return
      const counter = { val: num > 1000 ? num - 20 : 0 }
      gsap.to(counter, {
        val: num,
        duration: 2.5,
        delay: 0.4,
        ease: "power2.out",
        onUpdate() { statEl.textContent = Math.round(counter.val) + suffix },
      })
    })
  }

  function goToScene(next: number) {
    const current = currentSceneRef.current
    if (isAnimating.current) return
    if (next < 0 || next >= totalScenes) return
    if (next === current) return

    isAnimating.current = true

    if (current === 0) {
      heroExitTransition(next)
    } else if (next === 0) {
      heroEnterTransition(current)
    } else {
      standardTransition(current, next)
    }

    if (next === 1) {
      gsap.delayedCall(0.4, runAboutEntrance)
    }
  }

  // ── Init + entrance ──────────────────────────────────────────────────────

  useEffect(() => {
    sceneRefs.forEach((ref, i) => {
      if (!ref.current) return
      gsap.set(ref.current, { opacity: i === 0 ? 1 : 0, y: 0 })
    })

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.5 })
      tl.from(".hero-eyebrow", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" })
      tl.from(".hero-word",    { y: 80, opacity: 0, stagger: 0.12, duration: 0.9, ease: "power3.out" }, "-=0.4")
      tl.from(".hero-sub",     { y: 20, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.3")
      tl.from(".hero-cta",     { y: 20, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.3")
      tl.from(".hero-stats",   { y: 30, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.3",)
      tl.add(() => {
        heroRef.current?.querySelectorAll("[data-stat-value]").forEach((el) => {
          const raw = el.getAttribute("data-stat-value") ?? ""
          if (raw === "24/7") return
          const suffix = raw.includes("+") ? "+" : raw.includes("м") ? "м" : ""
          const num = parseInt(raw.replace(/\D/g, ""))
          if (isNaN(num)) return
          const counter = { val: num > 1000 ? num - 20 : 0 }
          gsap.to(counter, {
            val: num,
            duration: 2.5,
            ease: "power2.out",
            onUpdate() { el.textContent = Math.round(counter.val) + suffix },
          })
        })
      })
    }, heroRef)

    return () => ctx.revert()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Event listeners ──────────────────────────────────────────────────────

  useEffect(() => {
    function handleWheel(e: WheelEvent) {
      e.preventDefault()
      if (isAnimating.current) return
      if (e.deltaY > 50) goToScene(currentSceneRef.current + 1)
      else if (e.deltaY < -50) goToScene(currentSceneRef.current - 1)
    }
    function handleTouchStart(e: TouchEvent) {
      touchStartY.current = e.touches[0].clientY
    }
    function handleTouchEnd(e: TouchEvent) {
      const delta = touchStartY.current - e.changedTouches[0].clientY
      if (delta > 50) goToScene(currentSceneRef.current + 1)
      else if (delta < -50) goToScene(currentSceneRef.current - 1)
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") goToScene(currentSceneRef.current + 1)
      else if (e.key === "ArrowUp") goToScene(currentSceneRef.current - 1)
    }

    window.addEventListener("wheel", handleWheel, { passive: false })
    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchend", handleTouchEnd, { passive: true })
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchend", handleTouchEnd)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div ref={rootRef} className="fixed inset-0 overflow-hidden bg-[#020617]">

      <GlobalBackground />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <div ref={heroRef} className="pointer-events-none absolute inset-0" style={{ willChange: "opacity, transform" }}>

        {/* 1. Background with Ken Burns */}
        {home?.heroImageUrl && (
          <div className="hero-bg-wrapper pointer-events-none absolute inset-0 z-[-1] overflow-hidden">
            <Image
              src={home.heroImageUrl}
              alt="BSDC"
              fill
              priority
              unoptimized
              className="object-cover"
              style={{ animation: "kenburns 14s ease-in-out infinite alternate" }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#020617]/80 to-transparent" />
          </div>
        )}

        {/* 2. Content */}
        <div className="pointer-events-auto absolute inset-0 z-30 flex flex-col justify-center px-6 pt-16 md:px-16 md:pt-20 lg:px-24">

          <div className="hero-eyebrow mb-6 flex items-center gap-4">
            <div className="h-px w-8 bg-[#B87333]" />
            <span className="text-[11px] uppercase tracking-[0.35em] text-[#B87333]">
              {home?.eyebrow ?? (lang === "bg" ? "ПОДВОДНИ ТЕХНОЛОГИИ — ОТ 2001" : "UNDERWATER TECHNOLOGIES — SINCE 2001")}
            </span>
          </div>

          <div className="hero-headline mb-8">
            {(home?.headline ?? "Черноморски Водолазен Център")
              .split(" ")
              .map((word, i) => (
                <span
                  key={i}
                  className="hero-word block text-5xl font-black leading-[0.88] tracking-tight text-white md:text-7xl lg:text-8xl"
                >
                  {word}
                </span>
              ))}
          </div>

          <p className="hero-sub mb-10 max-w-sm text-sm leading-relaxed text-slate-400 md:text-base">
            {home?.subheadline ?? ""}
          </p>

          <div className="hero-cta flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => goToScene(2)}
              className="pointer-events-auto cursor-pointer bg-[#B87333] px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-[#a0622b]"
            >
              {home?.ctaLabel ?? "Нашите услуги"}
            </button>
            <button
              type="button"
              onClick={() => {
                const target = home?.ctaSecondaryTarget
                if (!target || target === "#about") goToScene(1)
                else window.location.href = target
              }}
              className="pointer-events-auto cursor-pointer border border-white/20 px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-white/70 transition-all duration-300 hover:border-white/40 hover:text-white"
            >
              {home?.ctaSecondaryLabel ?? (lang === "bg" ? "За нас" : "About us")}
            </button>
          </div>
        </div>

        {/* 4. Stats strip */}
        <div className="hero-stats pointer-events-none absolute bottom-0 left-0 right-0 z-10 grid grid-cols-3 border-t border-white/[0.06] bg-[#020617]/40 backdrop-blur-sm">
          {(heroStats.length ? heroStats : [
            { value: "2001", label: "Основана" },
            { value: "300м", label: "Макс. дълбочина" },
            { value: "6+",   label: "Вида услуги" },
          ]).map((stat, i) => (
            <div key={i} className={`py-6 text-center ${i < 2 ? "border-r border-white/[0.06]" : ""}`}>
              <div data-stat-value={stat.value} className="text-3xl font-black text-white">{stat.value}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* 5. Scroll indicator */}
        <div className="pointer-events-none absolute bottom-24 right-8 z-10 hidden flex-col items-center gap-2 sm:flex">
          <span
            className="text-[9px] uppercase tracking-[0.3em] text-slate-500"
            style={{ writingMode: "vertical-rl" }}
          >
            Scroll
          </span>
          <div className="h-12 w-px animate-pulse bg-gradient-to-b from-[#B87333] to-transparent" />
        </div>

      </div>

      {/* ── ABOUT ─────────────────────────────────────────────────────── */}
      <div ref={aboutRef} className="pointer-events-none absolute inset-0" style={{willChange:"opacity,transform"}}>
  <div className="pointer-events-auto absolute inset-0 flex flex-col">

    <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
      <div className="flex w-full flex-col justify-center overflow-hidden bg-[#07111f] px-6 py-8 md:w-1/2 md:px-16 md:py-0">
        <div className="about-eyebrow mb-3 flex items-center gap-3 md:mb-4">
          <div className="h-px w-6 bg-[#B87333]" />
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#B87333]">
            {about?.subtitle ?? "ВИСОКОКАЧЕСТВЕНИ РЕШЕНИЯ"}
          </span>
        </div>
        <h2 className="about-title mb-4 text-4xl font-black leading-tight text-white md:mb-6 md:text-5xl lg:text-6xl">
          {about?.title ?? "За нас"}
        </h2>
        <div className="about-text max-h-24 overflow-hidden text-sm leading-relaxed text-slate-400 md:max-h-none"
          dangerouslySetInnerHTML={{__html: about?.content ?? ""}} />
        <div className="about-stats mt-5 flex gap-6 md:mt-8 md:gap-10">
          {aboutStats.map((stat: {value: string, label: string}, i: number) => (
            <div key={i}>
              <div className="text-2xl font-black text-[#B87333] md:text-3xl" data-stat-value={stat.value}>
                {stat.value}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="about-image relative hidden overflow-hidden md:block md:w-1/2">
        {about?.imageUrl ? (
          <>
            <img src={about.imageUrl}
              alt="About BSDC"
              className="absolute inset-0 h-full w-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#07111f] via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[#07111f]" />
        )}
      </div>
    </div>

    <div className="border-t border-white/[0.06]" style={{background:"rgba(2,6,23,0.95)"}}>
      <div className="px-6 py-4 md:px-16 md:py-6">
        <p className="about-certs mb-3 text-base font-bold text-white md:mb-4 md:text-xl">Сертификати</p>
        <div className="flex flex-wrap justify-center gap-2">
          {certificates.map((cert) => (
            <div key={cert.id}
              className="w-36 border border-white/[0.08] p-2.5 transition-colors hover:border-[#B87333]/40 md:w-44 md:p-3">
              <div className="mb-1 text-xs font-semibold leading-tight text-white">{cert.title}</div>
              <div className="mb-1 text-[10px] uppercase text-[#B87333]">{cert.issuer}</div>
              {cert.issueDate && (
                <div className="text-[10px] text-slate-500">
                  {new Date(cert.issueDate).toLocaleDateString("bg-BG")}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>

  </div>
</div>

      {/* ── SERVICES ──────────────────────────────────────────────────── */}
      <div ref={servicesRef} className="pointer-events-none absolute inset-0" style={{ willChange: "opacity, transform" }}>
        <div className="flex h-full items-center justify-center text-white">
          <h2 className="text-4xl font-black">Services</h2>
        </div>
      </div>

      {/* ── PROJECTS ──────────────────────────────────────────────────── */}
      <div ref={projectsRef} className="pointer-events-none absolute inset-0" style={{ willChange: "opacity, transform" }}>
        <div className="flex h-full items-center justify-center text-white">
          <h2 className="text-4xl font-black">Projects</h2>
        </div>
      </div>

      {/* ── CONTACT ───────────────────────────────────────────────────── */}
      <div ref={contactRef} className="pointer-events-none absolute inset-0" style={{ willChange: "opacity, transform" }}>
        <div className="flex h-full items-center justify-center text-white">
          <h2 className="text-4xl font-black">Contact</h2>
        </div>
      </div>

      {/* Navigation dots — right side */}
      <div className="fixed right-6 top-1/2 z-50 flex -translate-y-1/2 flex-col items-center gap-3">
        {SCENE_LABELS.map((label, i) => (
          <button
            key={i}
            onClick={() => goToScene(i)}
            aria-label={`Go to ${label}`}
            className="flex items-center justify-center"
            style={{ width: 44, height: 44 }}
          >
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width: 8,
                height: i === currentScene ? 24 : 8,
                backgroundColor: i === currentScene ? "#B87333" : "rgba(255,255,255,0.2)",
              }}
            />
          </button>
        ))}
      </div>

      {/* Scene counter — bottom left */}
      <div className="fixed bottom-8 left-8 z-50 flex items-baseline gap-1.5">
        <span className="text-lg font-black text-white">
          {String(currentScene + 1).padStart(2, "0")}
        </span>
        <span className="text-xs text-white/20">/</span>
        <span className="text-xs text-white/30">
          {String(totalScenes).padStart(2, "0")}
        </span>
      </div>

    </div>
  )
}
