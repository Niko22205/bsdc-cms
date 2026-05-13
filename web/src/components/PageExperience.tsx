"use client"

import {
  type ForwardRefExoticComponent,
  type RefAttributes,
  useEffect,
  useRef,
  useState,
} from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
import gsap from "gsap"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import type { ServicesCubeHandle } from "./3d/ServicesCube"
import type {
  HomeContent,
  AboutContent,
  Service,
  ProjectNewsItem,
  Certificate,
  Partner,
  SiteSetting,
} from "@/generated/prisma/client"

const GlobalBackground = dynamic(() => import("./3d/GlobalBackground"), { ssr: false })
const ServicesCube = dynamic(
  () => import("./3d/ServicesCube"),
  { ssr: false }
) as ForwardRefExoticComponent<{
  services: Service[]
  onServiceSelect: (service: Service | null) => void
  activeIndex: number
} & RefAttributes<ServicesCubeHandle>>

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
  services,
  projects,
  certificates,
  partners,
  settings,
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

  const [currentScene, setCurrentScene]             = useState(0)
  const [activeServiceIndex, setActiveServiceIndex] = useState(0)
  const [projectPage, setProjectPage]               = useState(0)
  const [contactStatus, setContactStatus]           = useState<"idle" | "loading" | "success" | "error">("idle")
  const [showContactModal, setShowContactModal]     = useState(false)
  const [selectedProject, setSelectedProject]       = useState<ProjectNewsItem | null>(null)

  const currentSceneRef      = useRef(0)
  const selectedProjectRef   = useRef<ProjectNewsItem | null>(null)
  const isAnimating          = useRef(false)
  const touchStartY          = useRef(0)
  const cubeRef              = useRef<ServicesCubeHandle>(null)
  const projectGridRef       = useRef<HTMLDivElement>(null)
  const aboutEntranceFired   = useRef(false)

  const rootRef     = useRef<HTMLDivElement>(null)
  const heroRef     = useRef<HTMLDivElement>(null)
  const aboutRef    = useRef<HTMLDivElement>(null)
  const servicesRef = useRef<HTMLDivElement>(null)
  const projectsRef = useRef<HTMLDivElement>(null)
  const contactRef  = useRef<HTMLDivElement>(null)

  const sceneRefs  = [heroRef, aboutRef, servicesRef, projectsRef, contactRef]
  const totalScenes = sceneRefs.length

  const projectsPerPage = 6
  const totalPages      = Math.ceil(Math.max(projects.length, 1) / projectsPerPage)
  const pagedProjects   = projects.slice(projectPage * projectsPerPage, (projectPage + 1) * projectsPerPage)
  const tickerPartners  = [...partners, ...partners]

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function flipPage(nextPage: number) {
    if (nextPage < 0 || nextPage >= totalPages || nextPage === projectPage) return
    const direction = nextPage > projectPage ? 1 : -1
    const grid = projectGridRef.current
    if (grid) {
      gsap.to(grid, {
        x: (-80 * direction) + "px", opacity: 0, duration: 0.3, ease: "power2.in",
        onComplete: () => {
          setProjectPage(nextPage)
          gsap.fromTo(
            grid,
            { x: (80 * direction) + "px", opacity: 0 },
            { x: "0px", opacity: 1, duration: 0.3, ease: "power2.out" },
          )
        },
      })
    } else {
      setProjectPage(nextPage)
    }
  }

  async function submitContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const hp = (form.elements.namedItem("website") as HTMLInputElement).value
    if (hp) return
    const last = localStorage.getItem("bsdc_contact_ts")
    if (last && Date.now() - Number(last) < 60_000) { setContactStatus("error"); return }
    setContactStatus("loading")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:    (form.elements.namedItem("name")    as HTMLInputElement).value,
          email:   (form.elements.namedItem("email")   as HTMLInputElement).value,
          phone:   (form.elements.namedItem("phone")   as HTMLInputElement).value,
          type:    (form.elements.namedItem("type")    as HTMLSelectElement).value,
          message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
        }),
      })
      if (!res.ok) throw new Error("Failed")
      localStorage.setItem("bsdc_contact_ts", String(Date.now()))
      setContactStatus("success")
      form.reset()
    } catch {
      setContactStatus("error")
    }
  }

  // keep ref in sync so wheel/key handlers (stale closures) can read it
  useEffect(() => { selectedProjectRef.current = selectedProject }, [selectedProject])

  // ── Transitions ───────────────────────────────────────────────────────────

  function triggerSceneEntrance(sceneIndex: number) {
    const delay = 0.3

    if (sceneIndex === 0) {
      const el = heroRef.current
      if (el) {
        gsap.set(el.querySelectorAll(".hero-word"), { x: 0, y: 0, rotation: 0, opacity: 1 })
        const eyebrow = el.querySelector(".hero-eyebrow")
        if (eyebrow) gsap.set(eyebrow, { x: 0, opacity: 1 })
        ;[".hero-sub", ".hero-cta", ".hero-stats"].forEach((sel) => {
          const node = el.querySelector(sel)
          if (node) gsap.set(node, { opacity: 1 })
        })
        const bg = el.querySelector(".hero-bg-wrapper")
        if (bg) gsap.set(bg, { scale: 1, opacity: 1 })
      }
    }

    if (sceneIndex === 1) {
      if (aboutEntranceFired.current) return
      aboutEntranceFired.current = true
      gsap.from(".about-eyebrow", { x: -40, opacity: 0, duration: 0.7, delay })
      gsap.from(".about-title",   { x: -60, opacity: 0, duration: 0.8, delay: delay + 0.1 })
      gsap.from(".about-text",    { y: 30,  opacity: 0, duration: 0.7, delay: delay + 0.2 })
      gsap.from(".about-image",   { x: 80,  opacity: 0, duration: 0.9, delay: delay + 0.1 })
      gsap.from(".about-stats",   { y: 30,  opacity: 0, duration: 0.6, delay: delay + 0.3 })
      gsap.from(".about-certs",   { y: 40,  opacity: 0, duration: 0.6, delay: delay + 0.4 })

      aboutRef.current?.querySelectorAll("[data-stat-value]").forEach((statEl) => {
        const raw = statEl.getAttribute("data-stat-value") ?? ""
        if (raw === "24/7") return
        const suffix = raw.includes("+") ? "+" : raw.includes("м") ? "м" : ""
        const num = parseInt(raw.replace(/\D/g, ""))
        if (isNaN(num)) return
        const counter = { val: num > 1000 ? num - 20 : 0 }
        gsap.to(counter, {
          val: num,
          duration: 2.5,
          delay: delay + 0.4,
          ease: "power2.out",
          onUpdate() { statEl.textContent = Math.round(counter.val) + suffix },
        })
      })
    }

    if (sceneIndex === 2) {
      gsap.from(".services-menu", { x: -100, opacity: 0, duration: 0.6, delay: delay + 0.4 })
      cubeRef.current?.startEntrance()
    }

    if (sceneIndex === 3) {
      gsap.from(".project-card", { y: 60, opacity: 0, stagger: 0.08, duration: 0.6, delay: delay + 0.3 })
    }

    if (sceneIndex === 4) {
      gsap.from(".contact-info", { x: -40, opacity: 0, duration: 0.7, delay })
      gsap.from(".contact-form", { x: 40,  opacity: 0, duration: 0.7, delay: delay + 0.1 })
    }
  }

  function goToScene(next: number) {
    const current = currentSceneRef.current
    if (isAnimating.current) return
    if (next < 0 || next >= totalScenes) return
    if (next === current) return

    if (current === 1) aboutEntranceFired.current = false

    isAnimating.current = true
    window.dispatchEvent(new CustomEvent("bsdc:scene-transition"))

    const currentEl = sceneRefs[current].current
    const nextEl    = sceneRefs[next].current

    if (next === 0) {
      const el = heroRef.current
      if (el) {
        gsap.set(el.querySelectorAll(".hero-word"), { x: 0, y: 0, rotation: 0, opacity: 1 })
        const eyebrow = el.querySelector(".hero-eyebrow")
        if (eyebrow) gsap.set(eyebrow, { x: 0, opacity: 1 })
        ;[".hero-sub", ".hero-cta", ".hero-stats"].forEach((sel) => {
          const node = el.querySelector(sel)
          if (node) gsap.set(node, { opacity: 1 })
        })
        const bg = el.querySelector(".hero-bg-wrapper")
        if (bg) gsap.set(bg, { scale: 1, opacity: 1 })
      }
    }

    if (nextEl) gsap.set(nextEl, { opacity: 0 })

    const tl = gsap.timeline({
      onComplete: () => {
        currentSceneRef.current = next
        setCurrentScene(next)
        isAnimating.current = false
        triggerSceneEntrance(next)
      },
    })

    if (currentEl) tl.to(currentEl, { opacity: 0, duration: 1.4, ease: "power2.inOut" }, 0)
    if (nextEl)    tl.to(nextEl,    { opacity: 1, duration: 1.4, ease: "power2.inOut" }, 0)

    if (current === 0 && next === 1) {
      const words = heroRef.current?.querySelectorAll(".hero-word")
      if (words?.length) {
        tl.to(Array.from(words), {
          x: () => (Math.random() - 0.5) * 1000,
          y: () => (Math.random() - 0.5) * 800,
          rotation: () => (Math.random() - 0.5) * 360,
          opacity: 0,
          duration: 0.5,
          stagger: 0.04,
          ease: "power2.in",
        }, 0)
      }
      const eyebrow = heroRef.current?.querySelector(".hero-eyebrow")
      if (eyebrow) tl.to(eyebrow, { x: -300, opacity: 0, duration: 0.4, ease: "power2.in" }, 0)

      tl.add(() => {
        const ripple = document.createElement("div")
        ripple.style.cssText = [
          "position:fixed", "inset:0", "z-index:100", "pointer-events:none",
          "background:radial-gradient(circle at 50% 50%, #07111f 0%, transparent 70%)",
          "transform-origin:center center",
        ].join(";")
        document.body.appendChild(ripple)
        gsap.fromTo(ripple,
          { scale: 0, opacity: 0.6 },
          { scale: 4, opacity: 0, duration: 0.9, ease: "power2.out", onComplete: () => ripple.remove() },
        )
      }, 0.3)
    }
  }

  // ── Init + entrance ───────────────────────────────────────────────────────

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
      tl.from(".hero-stats",   { y: 30, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.3")
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

  // ── Event listeners ───────────────────────────────────────────────────────

  useEffect(() => {
    function handleWheel(e: WheelEvent) {
      if (selectedProjectRef.current) return
      e.preventDefault()
      if (isAnimating.current) return
      if (e.deltaY > 50)  goToScene(currentSceneRef.current + 1)
      else if (e.deltaY < -50) goToScene(currentSceneRef.current - 1)
    }
    function handleTouchStart(e: TouchEvent) { touchStartY.current = e.touches[0].clientY }
    function handleTouchEnd(e: TouchEvent) {
      if (selectedProjectRef.current) return
      const delta = touchStartY.current - e.changedTouches[0].clientY
      if (delta > 50) goToScene(currentSceneRef.current + 1)
      else if (delta < -50) goToScene(currentSceneRef.current - 1)
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSelectedProject(null)
        setShowContactModal(false)
        setContactStatus("idle")
        return
      }
      if (e.key === "ArrowDown") goToScene(currentSceneRef.current + 1)
      else if (e.key === "ArrowUp") goToScene(currentSceneRef.current - 1)
    }

    function handleNavigate(e: Event) {
      goToScene((e as CustomEvent<{ scene: number }>).detail.scene)
    }
    function handleEnquiry() {
      setShowContactModal(true)
    }

    window.addEventListener("wheel", handleWheel, { passive: false })
    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchend", handleTouchEnd, { passive: true })
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("bsdc:navigate", handleNavigate)
    window.addEventListener("bsdc:enquiry", handleEnquiry)
    return () => {
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchend", handleTouchEnd)
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("bsdc:navigate", handleNavigate)
      window.removeEventListener("bsdc:enquiry", handleEnquiry)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div ref={rootRef} className="fixed inset-0 overflow-hidden bg-[#020617]">

      <GlobalBackground />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div ref={heroRef} className="pointer-events-none absolute inset-0" style={{ willChange: "opacity, transform" }}>

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

        <div className={`${currentScene === 0 ? "pointer-events-auto" : "pointer-events-none"} absolute inset-0 z-30 flex flex-col justify-center px-6 pt-16 md:px-16 md:pt-20 lg:px-24`}>
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
              className="cursor-pointer bg-[#B87333] px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-[#a0622b]"
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
              className="cursor-pointer border border-white/20 px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-white/70 transition-all duration-300 hover:border-white/40 hover:text-white"
            >
              {home?.ctaSecondaryLabel ?? (lang === "bg" ? "За нас" : "About us")}
            </button>
          </div>
        </div>

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

        <div className="pointer-events-none absolute bottom-24 right-8 z-10 hidden flex-col items-center gap-2 sm:flex">
          <span className="text-[9px] uppercase tracking-[0.3em] text-slate-500" style={{ writingMode: "vertical-rl" }}>
            Scroll
          </span>
          <div className="h-12 w-px animate-pulse bg-gradient-to-b from-[#B87333] to-transparent" />
        </div>

      </div>

      {/* ── ABOUT ────────────────────────────────────────────────────────── */}
      <div ref={aboutRef} className="pointer-events-none absolute inset-0" style={{ willChange: "opacity, transform" }}>
        <div className={`${currentScene === 1 ? "pointer-events-auto" : "pointer-events-none"} absolute inset-0 flex flex-col`}>

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
              <div
                className="about-text max-h-24 overflow-hidden text-sm leading-relaxed text-slate-400 md:max-h-none"
                dangerouslySetInnerHTML={{ __html: about?.content ?? "" }}
              />
              <div className="about-stats mt-5 flex gap-6 md:mt-8 md:gap-10">
                {aboutStats.map((stat: { value: string; label: string }, i: number) => (
                  <div key={i}>
                    <div className="text-2xl font-black text-[#B87333] md:text-3xl" data-stat-value={stat.value}>
                      {stat.value}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="about-image relative hidden overflow-hidden md:block md:w-1/2">
              {about?.imageUrl ? (
                <>
                  <img
                    src={about.imageUrl}
                    alt="About BSDC"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#07111f] via-transparent to-transparent" />
                </>
              ) : (
                <div className="absolute inset-0 bg-[#07111f]" />
              )}
            </div>
          </div>

          <div className="border-t border-white/[0.06]" style={{ background: "rgba(2,6,23,0.95)" }}>
            <div className="px-6 py-4 md:px-16 md:py-6">
              <p className="about-certs mb-3 text-base font-bold text-white md:mb-4 md:text-xl">Сертификати</p>
              <div className="flex flex-wrap justify-center gap-2">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="w-36 border border-white/[0.08] p-2.5 transition-colors hover:border-[#B87333]/40 md:w-44 md:p-3"
                  >
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

      {/* ── SERVICES ─────────────────────────────────────────────────────── */}
      <div ref={servicesRef} className="pointer-events-none absolute inset-0" style={{ willChange: "opacity, transform" }}>
        <div className={`${currentScene === 2 ? "pointer-events-auto" : "pointer-events-none"} absolute inset-0 flex`}>

          {/* Left menu */}
          <div className="services-menu flex w-52 flex-shrink-0 flex-col justify-center border-r border-white/[0.06] bg-[#07111f] px-6 py-12">
            <div className="mb-8 flex items-center gap-3">
              <div className="h-px w-6 bg-[#B87333]" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#B87333]">
                {lang === "bg" ? "Услуги" : "Services"}
              </span>
            </div>
            <nav className="flex flex-col gap-1">
              {services.map((svc, i) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => {
                    setActiveServiceIndex(i)
                    cubeRef.current?.rotateTo(i)
                  }}
                  className={`group flex items-center gap-3 py-3 text-left transition-colors ${
                    activeServiceIndex === i ? "text-white" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <div
                    className={`h-px flex-shrink-0 transition-all duration-300 ${
                      activeServiceIndex === i ? "w-8 bg-[#B87333]" : "w-4 bg-slate-600 group-hover:bg-slate-400"
                    }`}
                  />
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] leading-tight">
                    {svc.title}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* 3D cube */}
          <div className="relative flex-1">
            <ServicesCube
              ref={cubeRef}
              services={services}
              onServiceSelect={(svc) => {
                if (svc) {
                  const idx = services.findIndex((s) => s.id === svc.id)
                  if (idx >= 0) setActiveServiceIndex(idx)
                }
              }}
              activeIndex={activeServiceIndex}
            />
          </div>

        </div>
      </div>

      {/* ── PROJECTS ─────────────────────────────────────────────────────── */}
      <div
        ref={projectsRef}
        className="journal-grain pointer-events-none absolute inset-0 overflow-hidden"
        style={{ willChange: "opacity, transform", background: "#0f0a05" }}
      >
        <div className={`${currentScene === 3 ? "pointer-events-auto" : "pointer-events-none"} absolute inset-0 flex flex-col px-8 py-10 md:px-16`}>

          {/* Header */}
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="h-px w-6 bg-[#B87333]" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#B87333]">
                  {lang === "bg" ? "Проекти" : "Projects"}
                </span>
              </div>
              <h2 className="text-3xl font-black leading-tight text-[#f0e6cc] md:text-4xl">
                {lang === "bg" ? "Нашата работа" : "Our Work"}
              </h2>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => flipPage(projectPage - 1)}
                  disabled={projectPage === 0}
                  className="flex h-9 w-9 items-center justify-center border border-[#f0e6cc]/20 text-[#f0e6cc]/60 transition-colors hover:border-[#B87333] hover:text-[#B87333] disabled:opacity-30"
                >
                  ←
                </button>
                <span className="text-xs text-[#f0e6cc]/40">{projectPage + 1} / {totalPages}</span>
                <button
                  type="button"
                  onClick={() => flipPage(projectPage + 1)}
                  disabled={projectPage >= totalPages - 1}
                  className="flex h-9 w-9 items-center justify-center border border-[#f0e6cc]/20 text-[#f0e6cc]/60 transition-colors hover:border-[#B87333] hover:text-[#B87333] disabled:opacity-30"
                >
                  →
                </button>
              </div>
            )}
          </div>

          {/* Project grid */}
          <div ref={projectGridRef} className="grid flex-1 auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pagedProjects.map((project) => (
              <div
                key={project.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedProject(project)}
                onKeyDown={(e) => e.key === "Enter" && setSelectedProject(project)}
                className="project-card group relative flex cursor-pointer flex-col overflow-hidden border border-[#f0e6cc]/[0.08] bg-[#1a1108]/60 transition-colors hover:border-[#B87333]/30"
                style={{
                  clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
                }}
              >
                {project.featuredImageUrl ? (
                  <div className="relative h-28 overflow-hidden">
                    <img
                      src={project.featuredImageUrl}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ filter: "sepia(30%) contrast(0.9)" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1108] via-transparent to-transparent" />
                  </div>
                ) : (
                  <div className="h-28 bg-[#2a1f0a]/60" />
                )}
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-[#B87333]">
                      {project.type === "NEWS"
                        ? (lang === "bg" ? "Новина" : "News")
                        : (lang === "bg" ? "Проект" : "Project")}
                    </span>
                    {project.publishedAt && (
                      <span className="text-[9px] text-[#f0e6cc]/30">
                        {new Date(project.publishedAt).getFullYear()}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold leading-tight text-[#f0e6cc]">{project.title}</h3>
                  {project.excerpt && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#f0e6cc]/50">
                      {project.excerpt}
                    </p>
                  )}
                  <div className="mt-auto pt-2">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-[#B87333]/60 transition-colors group-hover:text-[#B87333]">
                      {lang === "bg" ? "Прочети повече" : "Read more"} →
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {Array.from({ length: Math.max(0, 6 - pagedProjects.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="border border-[#f0e6cc]/[0.04] bg-[#1a1108]/20"
                style={{
                  clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
                }}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => flipPage(i)}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === projectPage ? 24 : 6,
                    backgroundColor: i === projectPage ? "#B87333" : "rgba(240,230,204,0.2)",
                  }}
                />
              ))}
            </div>
          )}

        </div>
      </div>

      {/* ── CONTACT ──────────────────────────────────────────────────────── */}
      <div ref={contactRef} className="pointer-events-none absolute inset-0" style={{ willChange: "opacity, transform" }}>
        <div className={`${currentScene === 4 ? "pointer-events-auto" : "pointer-events-none"} absolute inset-0 flex flex-col`}>

          {/* Main content */}
          <div className="flex flex-1 overflow-hidden">

            {/* Left: company info */}
            <div className="contact-info flex w-full flex-col justify-center bg-[#07111f] px-8 py-10 md:w-2/5 md:px-12">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-px w-6 bg-[#B87333]" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#B87333]">
                  {lang === "bg" ? "Контакти" : "Contact"}
                </span>
              </div>
              <h2 className="mb-8 text-3xl font-black leading-tight text-white md:text-4xl">
                {settings?.companyName ?? "BSDC"}
              </h2>
              <div className="flex flex-col gap-5">
                {settings?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#B87333]" />
                    <span className="text-sm leading-relaxed text-slate-400">{settings.address}</span>
                  </div>
                )}
                {settings?.phones && settings.phones.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#B87333]" />
                    <div className="flex flex-col gap-1">
                      {settings.phones.map((p, i) => (
                        <a
                          key={i}
                          href={`tel:${p.replace(/\s/g, "")}`}
                          className="text-sm text-slate-400 transition-colors hover:text-white"
                        >
                          {p}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {settings?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 flex-shrink-0 text-[#B87333]" />
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {settings.email}
                    </a>
                  </div>
                )}
                {settings?.workingHours && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 flex-shrink-0 text-[#B87333]" />
                    <span className="text-sm text-slate-400">{settings.workingHours}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: contact form */}
            <div className="contact-form flex flex-1 flex-col justify-center bg-[#020617] px-8 py-10 md:px-12">
              <h3 className="mb-6 text-xl font-bold text-white">
                {lang === "bg" ? "Изпратете запитване" : "Send an Enquiry"}
              </h3>
              <form onSubmit={submitContact} className="flex flex-col gap-4">
                {/* Honeypot — hidden from real users */}
                <input name="website" type="text" className="hidden" tabIndex={-1} autoComplete="off" />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder={lang === "bg" ? "Вашето име" : "Your name"}
                    className="border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-[#B87333]/50"
                  />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder={lang === "bg" ? "Имейл" : "Email"}
                    className="border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-[#B87333]/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="phone"
                    type="tel"
                    placeholder={lang === "bg" ? "Телефон" : "Phone"}
                    className="border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-[#B87333]/50"
                  />
                  <select
                    name="type"
                    className="border border-white/[0.08] bg-[#020617] px-4 py-3 text-sm text-slate-400 outline-none transition-colors focus:border-[#B87333]/50"
                  >
                    <option value="">{lang === "bg" ? "Вид запитване" : "Enquiry type"}</option>
                    <option value="general">{lang === "bg" ? "Обща информация" : "General"}</option>
                    <option value="services">{lang === "bg" ? "Услуги" : "Services"}</option>
                    <option value="project">{lang === "bg" ? "Проект" : "Project"}</option>
                  </select>
                </div>

                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder={lang === "bg" ? "Вашето съобщение..." : "Your message..."}
                  className="resize-none border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-[#B87333]/50"
                />

                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={contactStatus === "loading"}
                    className="self-start bg-[#B87333] px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#a0622b] disabled:opacity-60"
                  >
                    {contactStatus === "loading"
                      ? (lang === "bg" ? "Изпращане..." : "Sending...")
                      : (lang === "bg" ? "Изпрати" : "Send")}
                  </button>

                  {contactStatus === "success" && (
                    <p className="text-sm text-emerald-400">
                      {lang === "bg" ? "Съобщението е изпратено!" : "Message sent successfully!"}
                    </p>
                  )}
                  {contactStatus === "error" && (
                    <p className="text-sm text-red-400">
                      {lang === "bg" ? "Грешка. Опитайте отново." : "Error. Please try again."}
                    </p>
                  )}
                </div>
              </form>
            </div>

          </div>

          {/* Partners ticker */}
          {partners.length > 0 && (
            <div className="overflow-hidden border-t border-white/[0.06] bg-[#07111f]/80 py-4">
              <div className="flex animate-bsdc-ticker gap-16 whitespace-nowrap">
                {tickerPartners.map((p, i) => (
                  <div key={`${p.id}-${i}`} className="flex h-8 flex-shrink-0 items-center">
                    <img
                      src={p.logoUrl}
                      alt={p.name}
                      className="h-full w-auto object-contain opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="border-t border-white/[0.06] bg-[#020617] px-6 py-5 md:px-16">
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-4">
              {/* Brand */}
              <div>
                <img src="/uploads/bsdc/logo-white.png" alt="BSDC" className="mb-2 h-7 w-auto object-contain" style={{ filter: "brightness(0.7)" }} />
                <p className="text-[10px] leading-relaxed text-slate-700">
                  {lang === "bg"
                    ? "Подводни технологии и хидротехническо инженерство от 2001 г."
                    : "Underwater technologies and hydrotechnical engineering since 2001."}
                </p>
              </div>
              {/* Navigation */}
              <div>
                <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
                  {lang === "bg" ? "Навигация" : "Navigation"}
                </p>
                <nav className="flex flex-col gap-1">
                  {([
                    [0, lang === "bg" ? "Начало"   : "Home"],
                    [1, lang === "bg" ? "За нас"   : "About"],
                    [2, lang === "bg" ? "Услуги"   : "Services"],
                    [3, lang === "bg" ? "Проекти"  : "Projects"],
                    [4, lang === "bg" ? "Контакти" : "Contact"],
                  ] as [number, string][]).map(([scene, label]) => (
                    <button
                      key={scene}
                      type="button"
                      onClick={() => goToScene(scene)}
                      className="text-left text-[10px] text-slate-700 transition-colors hover:text-slate-400"
                    >
                      {label}
                    </button>
                  ))}
                </nav>
              </div>
              {/* Services */}
              <div>
                <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
                  {lang === "bg" ? "Услуги" : "Services"}
                </p>
                <div className="flex flex-col gap-1">
                  {services.slice(0, 6).map((svc) => (
                    <span key={svc.id} className="text-[10px] leading-tight text-slate-700">{svc.title}</span>
                  ))}
                </div>
              </div>
              {/* Contact + Legal */}
              <div>
                <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
                  {lang === "bg" ? "Контакти и правно" : "Contact & Legal"}
                </p>
                <div className="mb-3 flex flex-col gap-1">
                  {settings?.email && (
                    <a href={`mailto:${settings.email}`} className="text-[10px] text-slate-700 transition-colors hover:text-slate-400">
                      {settings.email}
                    </a>
                  )}
                  {settings?.phones?.[0] && (
                    <a href={`tel:${settings.phones[0].replace(/\s/g, "")}`} className="text-[10px] text-slate-700 transition-colors hover:text-slate-400">
                      {settings.phones[0]}
                    </a>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <a href={`/${lang}/privacy`} className="text-[10px] text-slate-700 transition-colors hover:text-slate-500">
                    {lang === "bg" ? "Политика за поверителност" : "Privacy Policy"}
                  </a>
                  <a href={`/${lang}/cookies`} className="text-[10px] text-slate-700 transition-colors hover:text-slate-500">
                    {lang === "bg" ? "Политика за бисквитки" : "Cookie Policy"}
                  </a>
                  <a href={`/${lang}/terms`} className="text-[10px] text-slate-700 transition-colors hover:text-slate-500">
                    {lang === "bg" ? "Условия за ползване" : "Terms of Use"}
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-4 border-t border-white/[0.04] pt-3 text-center">
              <p className="text-[9px] text-slate-700">
                {`© ${new Date().getFullYear()} ${settings?.companyName ?? "Черноморски Водолазен Център ООД"}. ${lang === "bg" ? "Всички права запазени." : "All rights reserved."}`}
              </p>
            </div>
          </footer>

        </div>
      </div>

      {/* Navigation dots */}
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

      {/* Scene counter */}
      <div className="fixed bottom-8 left-8 z-50 flex items-baseline gap-1.5">
        <span className="text-lg font-black text-white">{String(currentScene + 1).padStart(2, "0")}</span>
        <span className="text-xs text-white/20">/</span>
        <span className="text-xs text-white/30">{String(totalScenes).padStart(2, "0")}</span>
      </div>

      {/* ── PROJECT DETAIL MODAL ─────────────────────────────────────────── */}
      {selectedProject && (() => {
        const idx  = projects.findIndex((p) => p.id === selectedProject.id)
        const prev = idx > 0 ? projects[idx - 1] : null
        const next = idx < projects.length - 1 ? projects[idx + 1] : null
        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-8">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedProject(null)}
            />
            <div
              className="journal-grain relative z-10 flex h-full w-full max-w-2xl flex-col border border-[#f0e6cc]/[0.08]"
              style={{ background: "#100d08" }}
            >
              {/* Header */}
              <div className="flex flex-shrink-0 items-start justify-between border-b border-[#f0e6cc]/[0.06] px-6 py-4">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-[#B87333]">
                      {selectedProject.category ?? (lang === "bg" ? "Проект" : "Project")}
                    </span>
                    {selectedProject.publishedAt && (
                      <span className="text-[9px] text-[#f0e6cc]/30">
                        {new Date(selectedProject.publishedAt).toLocaleDateString(lang === "bg" ? "bg-BG" : "en-GB")}
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-black leading-tight text-[#f0e6cc] md:text-lg">
                    {selectedProject.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center text-slate-600 transition-colors hover:text-white"
                  aria-label={lang === "bg" ? "Затвори" : "Close"}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {selectedProject.featuredImageUrl && (
                  <img
                    src={selectedProject.featuredImageUrl}
                    alt={selectedProject.title}
                    className="mb-5 h-44 w-full object-cover"
                    style={{ filter: "sepia(25%) contrast(0.9)" }}
                  />
                )}
                {selectedProject.content ? (
                  <div
                    className="text-sm leading-relaxed text-[#f0e6cc]/70 [&_li]:mt-1.5 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{ __html: selectedProject.content }}
                  />
                ) : selectedProject.excerpt ? (
                  <p className="text-sm leading-relaxed text-[#f0e6cc]/70">{selectedProject.excerpt}</p>
                ) : null}
              </div>

              {/* Footer nav */}
              <div className="flex flex-shrink-0 items-center justify-between border-t border-[#f0e6cc]/[0.06] px-6 py-3">
                <button
                  type="button"
                  onClick={() => prev && setSelectedProject(prev)}
                  disabled={!prev}
                  className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-[#f0e6cc]/40 transition-colors hover:text-[#f0e6cc] disabled:opacity-20"
                >
                  ← {lang === "bg" ? "Предишен" : "Previous"}
                </button>
                <span className="text-[9px] text-[#f0e6cc]/20">
                  {idx + 1} / {projects.length}
                </span>
                <button
                  type="button"
                  onClick={() => next && setSelectedProject(next)}
                  disabled={!next}
                  className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-[#f0e6cc]/40 transition-colors hover:text-[#f0e6cc] disabled:opacity-20"
                >
                  {lang === "bg" ? "Следващ" : "Next"} →
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── CONTACT MODAL ────────────────────────────────────────────────── */}
      {showContactModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => { setShowContactModal(false); setContactStatus("idle") }}
          />
          {/* Panel */}
          <div className="relative z-10 w-full max-w-lg border border-white/[0.08] bg-[#07111f] p-8">
            <button
              type="button"
              onClick={() => { setShowContactModal(false); setContactStatus("idle") }}
              className="absolute right-4 top-4 text-slate-500 transition-colors hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
            <h3 className="mb-6 text-xl font-bold text-white">
              {lang === "bg" ? "Изпратете запитване" : "Send an Enquiry"}
            </h3>
            <form onSubmit={submitContact} className="flex flex-col gap-4">
              <input name="website" type="text" className="hidden" tabIndex={-1} autoComplete="off" />
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="name" type="text" required
                  placeholder={lang === "bg" ? "Вашето име" : "Your name"}
                  className="border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-[#B87333]/50"
                />
                <input
                  name="email" type="email" required
                  placeholder="Email"
                  className="border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-[#B87333]/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="phone" type="tel"
                  placeholder={lang === "bg" ? "Телефон" : "Phone"}
                  className="border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-[#B87333]/50"
                />
                <select
                  name="type"
                  className="border border-white/[0.08] bg-[#07111f] px-4 py-3 text-sm text-slate-400 outline-none transition-colors focus:border-[#B87333]/50"
                >
                  <option value="">{lang === "bg" ? "Вид запитване" : "Enquiry type"}</option>
                  <option value="general">{lang === "bg" ? "Обща информация" : "General"}</option>
                  <option value="services">{lang === "bg" ? "Услуги" : "Services"}</option>
                  <option value="project">{lang === "bg" ? "Проект" : "Project"}</option>
                </select>
              </div>
              <textarea
                name="message" required rows={4}
                placeholder={lang === "bg" ? "Вашето съобщение..." : "Your message..."}
                className="resize-none border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-[#B87333]/50"
              />
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={contactStatus === "loading"}
                  className="bg-[#B87333] px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#a0622b] disabled:opacity-60"
                >
                  {contactStatus === "loading"
                    ? (lang === "bg" ? "Изпращане..." : "Sending...")
                    : (lang === "bg" ? "Изпрати" : "Send")}
                </button>
                {contactStatus === "success" && (
                  <p className="text-sm text-emerald-400">
                    {lang === "bg" ? "Изпратено успешно!" : "Sent successfully!"}
                  </p>
                )}
                {contactStatus === "error" && (
                  <p className="text-sm text-red-400">
                    {lang === "bg" ? "Грешка. Опитайте отново." : "Error. Please try again."}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
