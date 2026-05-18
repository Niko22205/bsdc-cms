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

// ── Service detail metadata (per service index 0-5) ──────────────────────────

interface ServiceMeta {
  accent: string
  bg: string
  activities: string[]
  cards: { title: string; value: string; sub: string }[]
}

const SERVICE_META: ServiceMeta[] = [
  {
    // 0 — Индустриални водолазни услуги (diving-services, sortOrder 0)
    accent: "#B87333",
    bg: "#07111f",
    activities: [
      "Подводни огледи и инспекции",
      "Подводни ремонти и укрепване",
      "Монтаж и демонтаж на конструкции",
      "Почистване на подводни повърхности",
      "Подводно бетониране",
      "Аварийни водолазни операции",
    ],
    cards: [
      { title: "Услуга", value: "Подводна", sub: "индустриална" },
      { title: "Метод", value: "Водолазен", sub: "инспекции" },
      { title: "Изход", value: "Доклад", sub: "документиране" },
    ],
  },
  {
    // 1 — ROV инспекции
    accent: "#00c8e8",
    bg: "#040e1a",
    activities: [
      "Видео и фотодокументиране на конструкции",
      "Обследване на тръбопроводи и кабели",
      "ROV инспекции при ограничена видимост",
      "Инспекция на труднодостъпни зони",
      "Документиране на дефекти и повреди",
      "Изготвяне на технически доклади",
    ],
    cards: [
      { title: "Метод", value: "ROV", sub: "дистанционен" },
      { title: "Изход", value: "Видео", sub: "документиране" },
      { title: "Приложение", value: "Инспекция", sub: "обследване" },
    ],
  },
  {
    // 2 — Батиметрия
    accent: "#38bdf8",
    bg: "#040c18",
    activities: [
      "Батиметрични измервания",
      "Сонарни обследвания на дъното",
      "Хидрографски изследвания",
      "Мониторинг на наносни отложения",
      "Изготвяне на цифрови модели на дъното",
      "Технически доклади и карти",
    ],
    cards: [
      { title: "Метод", value: "Сонар", sub: "измерване" },
      { title: "Изход", value: "Карта", sub: "на дъното" },
      { title: "Данни", value: "Цифров", sub: "модел" },
    ],
  },
  {
    // 3 — Оператор на язовири
    accent: "#B87333",
    bg: "#0c0e14",
    activities: [
      "Мониторинг на техническото състояние",
      "Контрол на водоизпускателните органи",
      "Профилактика и текущи ремонти",
      "Технически отчети и документация",
      "Действия при аварийни ситуации",
      "Координация с компетентните органи",
    ],
    cards: [
      { title: "Тип", value: "Язовири", sub: "оператор" },
      { title: "Обслужване", value: "Редовно", sub: "поддръжка" },
      { title: "Изход", value: "Отчет", sub: "документация" },
    ],
  },
  {
    // 4 — Хидротехническо строителство
    accent: "#B87333",
    bg: "#0a0b0d",
    activities: [
      "Ремонт на хидротехнически съоръжения",
      "Подводно и надводно бетониране",
      "Монтаж на метални конструкции",
      "Укрепителни и защитни работи",
      "Хидроизолация на съоръжения",
      "Строително-монтажни работи",
    ],
    cards: [
      { title: "Тип", value: "СМР", sub: "строителство" },
      { title: "Метод", value: "Подводен", sub: "и надводен" },
      { title: "Изход", value: "Доклад", sub: "документация" },
    ],
  },
  {
    // 5 — Водолазни курсове
    accent: "#60a5fa",
    bg: "#061020",
    activities: [
      "Пробни водолазни изживявания",
      "Начални курсове по NAUI",
      "Начални курсове по CMAS",
      "Курсове за напреднали водолази",
      "Обучение на открита вода",
      "Теоретична и практическа подготовка",
    ],
    cards: [
      { title: "Система", value: "NAUI", sub: "сертификати" },
      { title: "Система", value: "CMAS", sub: "сертификати" },
      { title: "Обучение", value: "Открита", sub: "вода" },
    ],
  },
]

// ── About CMS content types ───────────────────────────────────────────────────

interface WhyUsItem    { title: string; desc?: string }
interface TimelineItem { year: string | null; label: string; desc: string }
// whyUs JSON shape:   { label?: string; items: WhyUsItem[] }  OR  WhyUsItem[]
// timeline JSON shape: { label?: string; items: TimelineItem[] } OR TimelineItem[]

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────

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
  function parseCmsJson<T>(raw: unknown): T[] {
    if (!raw) return []
    if (Array.isArray(raw)) return raw as T[]
    try { return JSON.parse(String(raw)) as T[] } catch { return [] }
  }

  const allStats   = parseCmsJson<{ value: string; label: string }>(about?.statistics)
  const heroStats  = allStats.slice(0, 3)
  const aboutStats = allStats.slice(3, 6)

  function parseCmsSection<T>(raw: unknown, defaultLabel: string): { label: string; items: T[] } {
    const val = raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : null
    if (val && Array.isArray(val.items)) {
      return { label: typeof val.label === "string" ? val.label : defaultLabel, items: val.items as T[] }
    }
    return { label: defaultLabel, items: parseCmsJson<T>(raw) }
  }

  const whyUsSection   = parseCmsSection<WhyUsItem>(about?.whyUs, "Защо да ни изберете")
  const timelineSection = parseCmsSection<TimelineItem>(about?.timeline, "Развитие")
  const whyUsItems     = whyUsSection.items
  const timelineItems  = timelineSection.items

  const [currentScene, setCurrentScene]             = useState(0)
  const [activeServiceIndex, setActiveServiceIndex] = useState(0)
  const [activeService, setActiveService]           = useState<Service | null>(null)
  const [projectPage, setProjectPage]               = useState(0)
  const [contactStatus, setContactStatus]           = useState<"idle" | "loading" | "success" | "error">("idle")
  const [showContactModal, setShowContactModal]     = useState(false)
  const [selectedProject, setSelectedProject]       = useState<ProjectNewsItem | null>(null)
  const [projectFilter, setProjectFilter]           = useState<'ALL' | 'PROJECT' | 'NEWS'>('ALL')
  const [categoryFilter, setCategoryFilter]         = useState<string>('ALL')

  const currentSceneRef      = useRef(0)
  const selectedProjectRef   = useRef<ProjectNewsItem | null>(null)
  const activeServiceRef     = useRef<Service | null>(null)
  const isAnimating          = useRef(false)
  const touchStartY          = useRef(0)
  const cubeRef              = useRef<ServicesCubeHandle>(null)
  const projectGridRef       = useRef<HTMLDivElement>(null)
  const aboutEntranceFired   = useRef(false)

  const rootRef          = useRef<HTMLDivElement>(null)
  const heroRef          = useRef<HTMLDivElement>(null)
  const aboutRef         = useRef<HTMLDivElement>(null)
  const aboutScrollRef   = useRef<HTMLDivElement>(null)
  const servicesRef      = useRef<HTMLDivElement>(null)
  const projectsRef      = useRef<HTMLDivElement>(null)
  const contactRef       = useRef<HTMLDivElement>(null)
  const timelineScrollRef = useRef<HTMLDivElement>(null)

  const sceneRefs  = [heroRef, aboutRef, servicesRef, projectsRef, contactRef]
  const totalScenes = sceneRefs.length

  const projectsPerPage = 2
  const filteredProjects = projects.filter(p => {
    const typeOk = projectFilter === 'ALL' || p.type === projectFilter
    const catOk  = categoryFilter === 'ALL' || p.category === categoryFilter
    return typeOk && catOk
  })
  const totalPages    = Math.ceil(Math.max(filteredProjects.length, 1) / projectsPerPage)
  const pagedProjects = filteredProjects.slice(projectPage * projectsPerPage, (projectPage + 1) * projectsPerPage)
  const TYPE_LEVEL_VALUES = new Set(["PROJECT", "NEWS", "Проекти", "Новини", "project", "news"])
  const uniqueCategories = Array.from(
    new Set(projects.map(p => p.category).filter((c): c is string => c !== null && !TYPE_LEVEL_VALUES.has(c)))
  )
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

  // keep refs in sync so wheel/key handlers (stale closures) can read them
  useEffect(() => { selectedProjectRef.current = selectedProject }, [selectedProject])
  useEffect(() => { activeServiceRef.current = activeService }, [activeService])
  useEffect(() => { setProjectPage(0) }, [projectFilter, categoryFilter])

  // ── Transitions ───────────────────────────────────────────────────────────

  function triggerSceneEntrance(sceneIndex: number) {
    const delay = 1.0

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
      gsap.fromTo(".about-eyebrow",   { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, delay })
      gsap.fromTo(".about-title",     { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, delay: delay + 0.1 })
      gsap.fromTo(".about-text",      { y: 30,  opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay: delay + 0.2 })
      gsap.fromTo(".about-image",     { x: 80,  opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, delay: delay + 0.1 })
      gsap.fromTo(".about-stats",     { y: 20,  opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: delay + 0.3 })
      gsap.fromTo(".about-why",       { y: 20,  opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: delay + 0.4 })
      gsap.fromTo(".about-timeline",  { y: 20,  opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: delay + 0.5 })
      gsap.fromTo(".about-tl-item",   { y: 14,  opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, delay: delay + 0.6 })

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
      gsap.fromTo(".services-menu", { x: -100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, delay: delay + 0.4 })
      cubeRef.current?.startEntrance()
    }

    if (sceneIndex === 3) {
      gsap.fromTo(".project-card", { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.6, delay: delay + 0.3 })
    }

    if (sceneIndex === 4) {
      gsap.fromTo(".contact-info", { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, delay })
      gsap.fromTo(".contact-form", { x: 40,  opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, delay: delay + 0.1 })
    }
  }

  function goToScene(next: number) {
    // Close service detail if open so nav always works
    if (activeServiceRef.current) {
      setActiveService(null)
      cubeRef.current?.zoomOut()
    }

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

    if (nextEl) gsap.set(nextEl, { opacity: next === 2 ? 0.001 : 0 })

    // Reset next scene's animated elements to hidden BEFORE dissolve starts
    if (next === 1) {
      gsap.set('.about-eyebrow,.about-title,.about-text,.about-image,.about-stats,.about-why,.about-timeline,.about-tl-item', { opacity: 0, y: 20, x: 0 })
      aboutScrollRef.current?.scrollTo({ top: 0 })
    }
    if (next === 2) gsap.set('.services-menu', { opacity: 0, x: -100 })
    if (next === 3) gsap.set('.project-card', { opacity: 0, y: 60 })
    if (next === 4) gsap.set('.contact-info,.contact-form', { opacity: 0, x: 0 })

    const tl = gsap.timeline({
      onComplete: () => {
        currentSceneRef.current = next
        setCurrentScene(next)
        isAnimating.current = false
        sceneRefs.forEach((ref, i) => {
          if (ref.current) ref.current.style.zIndex = i === next ? '10' : '1'
        })
        triggerSceneEntrance(next)
      },
    })

    if (currentEl) tl.to(currentEl, { opacity: current === 2 ? 0.001 : 0, duration: 1.4, ease: "power2.inOut" }, 0)
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

    // Set initial z-index
    sceneRefs.forEach((ref, i) => {
      if (ref.current) ref.current.style.zIndex = i === 0 ? '10' : '1'
    })

    // GSAP owns initial hidden state for non-hero animated elements
    gsap.set('.about-eyebrow, .about-title, .about-text, .about-image, .about-stats, .about-why, .about-timeline, .about-tl-item', { opacity: 0, y: 20 })
    gsap.set('.services-menu', { opacity: 0, x: -100 })
    gsap.set('.project-card', { opacity: 0, y: 60 })
    gsap.set('.contact-info', { opacity: 0, x: -40 })
    gsap.set('.contact-form', { opacity: 0, x: 40 })

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.5 })
      tl.fromTo(".hero-eyebrow", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" })
      tl.fromTo(".hero-word",    { y: 80, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.9, ease: "power3.out" }, "-=0.4")
      tl.fromTo(".hero-sub",     { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, "-=0.3")
      tl.fromTo(".hero-cta",     { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, "-=0.3")
      tl.fromTo(".hero-stats",   { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, "-=0.3")
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

  // ── Timeline drag-to-scroll ───────────────────────────────────────────────

  useEffect(() => {
    const el = timelineScrollRef.current
    if (!el) return
    let active = false, startX = 0, scrollStart = 0
    const onDown = (e: MouseEvent) => {
      active = true; startX = e.pageX; scrollStart = el.scrollLeft
      el.style.userSelect = 'none'
    }
    const onMove = (e: MouseEvent) => {
      if (!active) return
      el.scrollLeft = scrollStart - (e.pageX - startX)
    }
    const onUp = () => { active = false; el.style.userSelect = '' }
    el.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      el.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  // ── Event listeners ───────────────────────────────────────────────────────

  useEffect(() => {
    function handleWheel(e: WheelEvent) {
      if (selectedProjectRef.current || activeServiceRef.current) return
      e.preventDefault()
      if (isAnimating.current) return

      // On About scene: let inner container scroll before navigating to next/prev scene
      if (currentSceneRef.current === 1) {
        const el = aboutScrollRef.current
        if (el) {
          const atTop    = el.scrollTop <= 2
          const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4
          if (e.deltaY > 50 && !atBottom) { el.scrollBy({ top: e.deltaY, behavior: "smooth" }); return }
          if (e.deltaY < -50 && !atTop)   { el.scrollBy({ top: e.deltaY, behavior: "smooth" }); return }
        }
      }

      if (e.deltaY > 50)  goToScene(currentSceneRef.current + 1)
      else if (e.deltaY < -50) goToScene(currentSceneRef.current - 1)
    }
    function handleTouchStart(e: TouchEvent) { touchStartY.current = e.touches[0].clientY }
    function handleTouchEnd(e: TouchEvent) {
      if (selectedProjectRef.current || activeServiceRef.current) return
      const delta = touchStartY.current - e.changedTouches[0].clientY
      if (delta > 50) goToScene(currentSceneRef.current + 1)
      else if (delta < -50) goToScene(currentSceneRef.current - 1)
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (activeServiceRef.current) {
          setActiveService(null)
          cubeRef.current?.zoomOut()
        }
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

  // ── Service detail overlay (6 unique layouts) ─────────────────────────────

  function renderServiceDetail(svc: Service, svcIdx: number) {
    const meta = SERVICE_META[svcIdx] ?? SERVICE_META[0]

    const closeDetail = () => {
      setActiveService(null)
      cubeRef.current?.zoomOut()
    }

    const CloseBtn = (
      <button
        type="button"
        onClick={closeDetail}
        className="fixed right-8 bottom-8 z-[510] flex h-12 w-12 cursor-pointer items-center justify-center border border-white/25 bg-black/70 text-white/70 backdrop-blur-sm transition-all hover:border-white/50 hover:bg-black/90 hover:text-white"
        aria-label={lang === "bg" ? "Затвори" : "Close"}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M14 4L4 14M4 4l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    )

    const BackBtn = (
      <button
        type="button"
        onClick={closeDetail}
        className="fixed left-8 bottom-8 z-[510] flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] transition-opacity hover:opacity-70"
        style={{ color: meta.accent }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2.5L4.5 7 9 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {lang === "bg" ? "Назад към услугите" : "Back to services"}
      </button>
    )

    const galleryImages = svc.images?.length > 0 ? svc.images : []

    const GalleryStrip = galleryImages.length > 0 ? (
      <div className="flex gap-2">
        {galleryImages.map((src, i) => (
          <div
            key={i}
            className="relative h-48 flex-1 overflow-hidden"
            style={{ border: `1px solid ${meta.accent}30` }}
          >
            <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-75 transition-opacity hover:opacity-100" />
          </div>
        ))}
      </div>
    ) : null

    const ActivitiesList = (
      <ul className="flex flex-col gap-2">
        {meta.activities.map((act, i) => (
          <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-slate-300">
            <span
              className="mt-[7px] h-[5px] w-[5px] flex-shrink-0 rounded-full"
              style={{ background: meta.accent }}
            />
            {act}
          </li>
        ))}
      </ul>
    )

    const StatCards = (
      <div className="flex gap-3">
        {meta.cards.map((card, i) => (
          <div
            key={i}
            className="flex-1 p-3"
            style={{ border: `1px solid ${meta.accent}40`, background: `${meta.accent}10` }}
          >
            <div className="text-lg font-black" style={{ color: meta.accent }}>{card.value}</div>
            <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-white/70">{card.title}</div>
            <div className="text-[9px] text-white/35">{card.sub}</div>
          </div>
        ))}
      </div>
    )

    // ── Layout 0: Industrial — side-by-side, image left ─────────────────────
    if (svcIdx === 0) {
      return (
        <div
          className="animate-bsdc-panel-in fixed inset-0 z-[500] overflow-hidden flex flex-col pointer-events-auto"
          style={{ background: meta.bg }}
        >
          {CloseBtn}
          {BackBtn}
          <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
            {/* Left: main image — full height, no scroll */}
            <div className="relative h-64 flex-shrink-0 lg:h-auto lg:w-[44%]">
              {(svc.featuredImageUrl || svc.images.length > 0) ? (
                <img
                  src={svc.featuredImageUrl ?? svc.images[0]}
                  alt={svc.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1a2744 0%, #0d1f3c 100%)' }} />
              )}
              <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 60%, #07111f)" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07111f] via-transparent to-transparent lg:hidden" />
              {/* Vertical accent line */}
              <div
                className="absolute right-0 top-0 hidden h-full w-0.5 lg:block"
                style={{ background: `linear-gradient(to bottom, transparent, ${meta.accent}, transparent)` }}
              />
            </div>

            {/* Right: scrollable content column */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-8 py-10 lg:px-16 lg:py-20">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-px w-8" style={{ background: meta.accent }} />
                  <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: meta.accent }}>
                    {lang === "bg" ? "Индустриален водолазен отдел" : "Industrial diving"}
                  </span>
                </div>
                <h2 className="mb-5 text-3xl font-black leading-tight text-white lg:text-4xl">{svc.title}</h2>
                {svc.content && (
                  <div
                    className="mb-6 max-w-lg text-sm leading-relaxed text-slate-300 [&_p]:mb-3"
                    dangerouslySetInnerHTML={{ __html: svc.content }}
                  />
                )}
                <h3 className="mb-3 text-[10px] uppercase tracking-[0.3em]" style={{ color: meta.accent }}>
                  {lang === "bg" ? "Основни дейности" : "Key activities"}
                </h3>
                <div className="mb-6">{ActivitiesList}</div>
                <div className="mb-2">{StatCards}</div>
              </div>
              {GalleryStrip ? (
                <div className="flex-shrink-0 px-8 pb-24 lg:px-16">{GalleryStrip}</div>
              ) : (
                <div className="h-24 flex-shrink-0" />
              )}
            </div>
          </div>
        </div>
      )
    }

    // ── Layout 1: ROV — monitor viewport top, columns below ─────────────────
    if (svcIdx === 1) {
      return (
        <div
          className="animate-bsdc-panel-in fixed inset-0 z-[500] overflow-hidden flex flex-col pointer-events-auto"
          style={{ background: meta.bg }}
        >
          {CloseBtn}
          {BackBtn}

          {/* Monitor viewport frame — flex-shrink-0 at top */}
          <div className="flex-shrink-0 mx-6 mt-10 mb-5 border-2 lg:mx-16 lg:mt-12" style={{ borderColor: `${meta.accent}60` }}>
            <div className="relative h-56 overflow-hidden lg:h-72">
              {(svc.featuredImageUrl || svc.images.length > 0) ? (
                <img
                  src={svc.featuredImageUrl ?? svc.images[0]}
                  alt={svc.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1a2744 0%, #0d1f3c 100%)' }} />
              )}
              {/* Scan-line overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,200,232,0.03) 2px, rgba(0,200,232,0.03) 4px)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040e1a]/80 to-transparent" />
              {/* HUD corners */}
              {[["left-2 top-2 border-l-2 border-t-2",""],["right-2 top-2 border-r-2 border-t-2",""],["left-2 bottom-2 border-l-2 border-b-2",""],["right-2 bottom-2 border-r-2 border-b-2",""]].map(([cls], i) => (
                <div key={i} className={`absolute h-4 w-4 ${cls}`} style={{ borderColor: meta.accent }} />
              ))}
              <div className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-wider" style={{ color: meta.accent }}>
                ROV LIVE · HD REC
              </div>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 pb-5 lg:px-16">
            <h2 className="mb-5 text-2xl font-black leading-tight text-white lg:text-3xl">{svc.title}</h2>

            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                {svc.content && (
                  <div
                    className="mb-4 text-sm leading-relaxed text-slate-300 [&_p]:mb-3"
                    dangerouslySetInnerHTML={{ __html: svc.content }}
                  />
                )}
                <h3 className="mb-3 text-[10px] uppercase tracking-[0.3em]" style={{ color: meta.accent }}>
                  {lang === "bg" ? "Обхват на инспекциите" : "Inspection scope"}
                </h3>
                {ActivitiesList}
              </div>
              <div>
                <h3 className="mb-3 text-[10px] uppercase tracking-[0.3em]" style={{ color: meta.accent }}>
                  {lang === "bg" ? "Технически параметри" : "Technical specs"}
                </h3>
                <div className="flex flex-col gap-3">
                  {meta.cards.map((card, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 border-l-2 px-4 py-3"
                      style={{ borderColor: meta.accent, background: `${meta.accent}08` }}
                    >
                      <div className="font-mono text-2xl font-black" style={{ color: meta.accent }}>{card.value}</div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-white">{card.title}</div>
                        <div className="text-[10px] text-white/40">{card.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {GalleryStrip ? (
            <div className="flex-shrink-0 px-6 pb-24 lg:px-16">{GalleryStrip}</div>
          ) : (
            <div className="h-24 flex-shrink-0" />
          )}
        </div>
      )
    }

    // ── Layout 2: Bathymetry — data panels left, sonar image right ───────────
    if (svcIdx === 2) {
      return (
        <div
          className="animate-bsdc-panel-in fixed inset-0 z-[500] overflow-hidden flex flex-col pointer-events-auto"
          style={{ background: meta.bg }}
        >
          {CloseBtn}
          {BackBtn}
          <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
            {/* Left: scrollable text column */}
            <div className="flex flex-1 flex-col overflow-hidden lg:w-1/2">
              <div className="flex-1 overflow-y-auto px-8 py-10 lg:px-16 lg:py-20">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-px w-8" style={{ background: meta.accent }} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: meta.accent }}>
                    SURVEY / HYDROGRAPHY
                  </span>
                </div>
                <h2 className="mb-5 text-2xl font-black leading-tight text-white lg:text-3xl">{svc.title}</h2>

                {/* Measurement cards */}
                <div className="mb-5 grid grid-cols-3 gap-2">
                  {meta.cards.map((card, i) => (
                    <div
                      key={i}
                      className="p-3 text-center"
                      style={{
                        background: `linear-gradient(135deg, ${meta.accent}15 0%, transparent 100%)`,
                        border: `1px solid ${meta.accent}30`,
                      }}
                    >
                      <div className="mb-1 font-mono text-base font-black" style={{ color: meta.accent }}>{card.value}</div>
                      <div className="text-[9px] uppercase tracking-wider text-white/60">{card.title}</div>
                      <div className="text-[9px] text-white/30">{card.sub}</div>
                    </div>
                  ))}
                </div>

                {svc.content && (
                  <div
                    className="mb-5 text-sm leading-relaxed text-slate-300 [&_p]:mb-3"
                    dangerouslySetInnerHTML={{ __html: svc.content }}
                  />
                )}
                <h3 className="mb-3 text-[10px] font-mono uppercase tracking-[0.3em]" style={{ color: meta.accent }}>
                  {lang === "bg" ? "Методи и обхват" : "Methods & scope"}
                </h3>
                {ActivitiesList}
              </div>
              {GalleryStrip ? (
                <div className="flex-shrink-0 px-8 pb-24 lg:px-16">{GalleryStrip}</div>
              ) : (
                <div className="h-24 flex-shrink-0" />
              )}
            </div>

            {/* Right: image with sonar overlay — full height */}
            <div className="relative hidden lg:block lg:w-1/2">
              {(svc.featuredImageUrl || svc.images.length > 0) ? (
                <img
                  src={svc.featuredImageUrl ?? svc.images[0]}
                  alt={svc.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1a2744 0%, #0d1f3c 100%)' }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#040c18]/50" />
              {/* Sonar rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[80, 140, 200, 270].map((r) => (
                  <div
                    key={r}
                    className="absolute rounded-full border"
                    style={{ width: r, height: r, borderColor: `${meta.accent}22` }}
                  />
                ))}
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ background: meta.accent, boxShadow: `0 0 14px ${meta.accent}` }}
                />
              </div>
            </div>
          </div>
        </div>
      )
    }

    // ── Layout 3: Dam — image strip top, columns below ───────────────────────
    if (svcIdx === 3) {
      return (
        <div
          className="animate-bsdc-panel-in fixed inset-0 z-[500] overflow-hidden flex flex-col pointer-events-auto"
          style={{ background: meta.bg }}
        >
          {CloseBtn}
          {BackBtn}

          {/* Top image strip — flex-shrink-0 */}
          <div
            className="relative flex-shrink-0 h-52 overflow-hidden border-b lg:h-64"
            style={{ borderColor: `${meta.accent}30` }}
          >
            {(svc.featuredImageUrl || svc.images.length > 0) ? (
              <img
                src={svc.featuredImageUrl ?? svc.images[0]}
                alt={svc.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1a2744 0%, #0d1f3c 100%)' }} />
            )}
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, #0c0e14 0%, rgba(12,14,20,0.3) 50%, transparent 100%)" }}
            />
            <div className="absolute bottom-4 left-6 right-0 lg:left-16">
              <div className="mb-1.5 flex items-center gap-3">
                <div className="h-px w-8" style={{ background: meta.accent }} />
                <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: meta.accent }}>
                  {lang === "bg" ? "Управление & Експлоатация" : "Operations & Management"}
                </span>
              </div>
              <h2 className="text-2xl font-black leading-tight text-white lg:text-3xl">{svc.title}</h2>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-16">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Content */}
              <div className="lg:col-span-2">
                {svc.content && (
                  <div
                    className="mb-5 text-sm leading-relaxed text-slate-300 [&_p]:mb-3"
                    dangerouslySetInnerHTML={{ __html: svc.content }}
                  />
                )}
                <h3 className="mb-3 text-[10px] uppercase tracking-[0.3em]" style={{ color: meta.accent }}>
                  {lang === "bg" ? "Основни задачи" : "Core responsibilities"}
                </h3>
                {ActivitiesList}
              </div>

              {/* Key metric cards */}
              <div>
                <h3 className="mb-3 text-[10px] uppercase tracking-[0.3em]" style={{ color: meta.accent }}>
                  {lang === "bg" ? "Ключови показатели" : "Key metrics"}
                </h3>
                <div className="flex flex-col gap-3">
                  {meta.cards.map((card, i) => (
                    <div
                      key={i}
                      className="border p-4"
                      style={{ borderColor: `${meta.accent}40`, background: `${meta.accent}0a` }}
                    >
                      <div className="text-2xl font-black" style={{ color: meta.accent }}>{card.value}</div>
                      <div className="mt-0.5 text-xs font-bold uppercase tracking-wider text-white/80">{card.title}</div>
                      <div className="text-[10px] text-white/40">{card.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {GalleryStrip ? (
            <div className="flex-shrink-0 px-6 pb-24 lg:px-16">{GalleryStrip}</div>
          ) : (
            <div className="h-24 flex-shrink-0" />
          )}
        </div>
      )
    }

    // ── Layout 4: Construction — fullbleed image with title, cards below ─────
    if (svcIdx === 4) {
      return (
        <div
          className="animate-bsdc-panel-in fixed inset-0 z-[500] overflow-hidden flex flex-col pointer-events-auto"
          style={{ background: meta.bg }}
        >
          {CloseBtn}
          {BackBtn}

          {/* Hero image with title overlay — flex-shrink-0 */}
          <div className="relative flex-shrink-0 h-72 lg:h-96">
            {(svc.featuredImageUrl || svc.images.length > 0) ? (
              <img
                src={svc.featuredImageUrl ?? svc.images[0]}
                alt={svc.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1a2744 0%, #0d1f3c 100%)' }} />
            )}
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, #0a0b0d 0%, rgba(10,11,13,0.45) 55%, rgba(10,11,13,0.2) 100%)" }}
            />
            <div className="absolute bottom-0 left-0 right-0 px-8 pb-8 lg:px-16">
              <div className="mb-2 flex items-center gap-3">
                <div className="h-px w-8" style={{ background: meta.accent }} />
                <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: meta.accent }}>
                  {lang === "bg" ? "Строителство & СМР" : "Civil & Maritime Works"}
                </span>
              </div>
              <h2 className="text-3xl font-black leading-tight text-white lg:text-4xl">{svc.title}</h2>
            </div>
          </div>

          {/* Scrollable content below image */}
          <div className="flex-1 overflow-y-auto px-8 py-8 lg:px-16">
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                {svc.content && (
                  <div
                    className="mb-5 text-sm leading-relaxed text-slate-300 [&_p]:mb-3"
                    dangerouslySetInnerHTML={{ __html: svc.content }}
                  />
                )}
                <h3 className="mb-3 text-[10px] uppercase tracking-[0.3em]" style={{ color: meta.accent }}>
                  {lang === "bg" ? "Видове работи" : "Types of works"}
                </h3>
                {ActivitiesList}
              </div>
              <div>
                <h3 className="mb-3 text-[10px] uppercase tracking-[0.3em]" style={{ color: meta.accent }}>
                  {lang === "bg" ? "Спецификации" : "Specifications"}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {meta.cards.map((card, i) => (
                    <div
                      key={i}
                      className="border p-4 text-center"
                      style={{ borderColor: `${meta.accent}40`, background: "#131415" }}
                    >
                      <div className="text-xl font-black" style={{ color: meta.accent }}>{card.value}</div>
                      <div className="mt-1 text-[9px] uppercase tracking-wider text-white/60">{card.title}</div>
                      <div className="text-[9px] text-white/30">{card.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {GalleryStrip ? (
            <div className="flex-shrink-0 px-8 pb-24 lg:px-16">{GalleryStrip}</div>
          ) : (
            <div className="h-24 flex-shrink-0" />
          )}
        </div>
      )
    }

    // ── Layout 5: Courses — split, accreditation cards right ─────────────────
    return (
      <div
        className="animate-bsdc-panel-in fixed inset-0 z-[500] overflow-hidden flex flex-col pointer-events-auto"
        style={{ background: meta.bg }}
      >
        {CloseBtn}
        {BackBtn}
        <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
          {/* Left: scrollable text column */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-8 py-10 lg:px-16 lg:py-20">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px w-8" style={{ background: meta.accent }} />
                <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: meta.accent }}>
                  {lang === "bg" ? "Обучение & Сертификация" : "Training & Certification"}
                </span>
              </div>
              <h2 className="mb-5 text-3xl font-black leading-tight text-white lg:text-4xl">{svc.title}</h2>
              {svc.content && (
                <div
                  className="mb-5 max-w-lg text-sm leading-relaxed text-slate-300 [&_p]:mb-3"
                  dangerouslySetInnerHTML={{ __html: svc.content }}
                />
              )}
              <h3 className="mb-3 text-[10px] uppercase tracking-[0.3em]" style={{ color: meta.accent }}>
                {lang === "bg" ? "Програми на обучение" : "Training programs"}
              </h3>
              {ActivitiesList}
            </div>
            {GalleryStrip ? (
              <div className="flex-shrink-0 px-8 pb-24 lg:px-16">{GalleryStrip}</div>
            ) : (
              <div className="h-24 flex-shrink-0" />
            )}
          </div>

          {/* Right: image + accreditation cards — full height */}
          <div
            className="flex flex-col justify-center gap-4 px-8 py-10 lg:w-80 lg:flex-shrink-0 lg:px-10"
            style={{ background: `${meta.accent}08`, borderLeft: `1px solid ${meta.accent}20` }}
          >
            <div className="relative h-44 overflow-hidden">
              {(svc.featuredImageUrl || svc.images.length > 0) ? (
                <img
                  src={svc.featuredImageUrl ?? svc.images[0]}
                  alt={svc.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1a2744 0%, #0d1f3c 100%)' }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#061020]/80 to-transparent" />
            </div>
            <h3 className="text-[10px] uppercase tracking-[0.3em]" style={{ color: meta.accent }}>
              {lang === "bg" ? "Акредитации & резултати" : "Accreditations & results"}
            </h3>
            {meta.cards.map((card, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-l-2 px-4 py-3"
                style={{ borderColor: meta.accent, background: "rgba(255,255,255,0.03)" }}
              >
                <div className="text-2xl font-black" style={{ color: meta.accent }}>{card.value}</div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-white">{card.title}</div>
                  <div className="text-[10px] text-white/40">{card.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Main scene container ─────────────────────────────────────────── */}
      <div ref={rootRef} className="fixed inset-0 overflow-hidden bg-[#020617]">

        <GlobalBackground />

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <div ref={heroRef} className="absolute inset-0" style={{ willChange: "opacity, transform" }}>

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

          <div className="absolute inset-0 z-30 flex flex-col justify-center px-6 pt-16 md:px-16 md:pt-20 lg:px-24">
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

            <p className="hero-sub mb-10 max-w-sm text-sm leading-relaxed text-slate-300 md:text-base">
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
                onClick={() => goToScene(1)}
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
                <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute bottom-24 right-8 z-10 hidden flex-col items-center gap-2 sm:flex">
            <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400" style={{ writingMode: "vertical-rl" }}>
              Scroll
            </span>
            <div className="h-12 w-px animate-pulse bg-gradient-to-b from-[#B87333] to-transparent" />
          </div>

        </div>

        {/* ── ABOUT ────────────────────────────────────────────────────────── */}
        <div ref={aboutRef} className="absolute inset-0" style={{ willChange: "opacity, transform" }}>
          {/* 3-row flex layout: Row1 story (flex-1) | Row2 why+certs (fixed) | Row3 timeline (fixed) */}
          <div
            ref={aboutScrollRef}
            className="absolute inset-0 flex flex-col overflow-y-auto bg-[#07111f]"
            style={{ scrollbarWidth: "none" }}
          >

            {/* ── Row 1: Story + Image — takes all remaining space ── */}
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">

              {/* Left: narrative */}
              <div className="flex flex-col justify-center overflow-hidden px-8 py-8 md:w-[54%] md:px-14">
                <div className="about-eyebrow mb-3 flex items-center gap-3">
                  <div className="h-px w-8 bg-[#B87333]" />
                  <span className="text-[11px] uppercase tracking-[0.3em] text-[#B87333]">
                    {about?.subtitle ?? "BSDC"}
                  </span>
                </div>

                <h2 className="about-title mb-4 text-3xl font-black leading-tight text-white md:text-4xl lg:text-[2.5rem]">
                  {about?.title ?? "За нас"}
                </h2>

                <div
                  className="about-text mb-5 line-clamp-4 text-sm leading-relaxed text-slate-300 md:text-[15px]"
                  dangerouslySetInnerHTML={{
                    __html: (about?.content ?? "").replace(/\n\n+/g, "<br><br>"),
                  }}
                />

                {allStats.length > 0 && (
                  <div className="about-stats flex flex-wrap gap-x-5 gap-y-3 border-t border-white/[0.07] pt-4">
                    {allStats.map((stat, i) => (
                      <div key={i}>
                        <div data-stat-value={stat.value} className="text-xl font-black text-white">
                          {stat.value}
                        </div>
                        <div className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-slate-400">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: image */}
              <div className="about-image relative hidden overflow-hidden md:block md:w-[46%]">
                {about?.imageUrl ? (
                  <img
                    src={about.imageUrl}
                    alt="About BSDC"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#040c18]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-[#07111f] via-[#07111f]/30 to-transparent" />
              </div>
            </div>

            {/* ── Row 2: Why Us + Certificates side by side ── */}
            {(whyUsItems.length > 0 || certificates.length > 0) && (
              <div className="about-why flex-shrink-0 border-t border-white/[0.07] bg-[#020617] px-8 py-6 md:px-14">
                <div className={`grid gap-x-10 gap-y-5 ${certificates.length > 0 ? "md:grid-cols-2" : ""}`}>

                  {/* Why Us */}
                  {whyUsItems.length > 0 && (
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <div className="h-px w-5 bg-[#B87333]/60" />
                        <span className="text-[10px] uppercase tracking-[0.28em] text-[#B87333]/80">
                          {whyUsSection.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
                        {whyUsItems.map((item, i) => (
                          <div
                            key={i}
                            className="border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 transition-colors hover:border-[#B87333]/30"
                          >
                            <div className="flex items-start gap-1.5">
                              <span className="mt-0.5 flex-shrink-0 text-[10px] text-[#B87333]">▸</span>
                              <div>
                                <div className="text-xs font-semibold leading-snug text-white">{item.title}</div>
                                {item.desc && (
                                  <div className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-400">
                                    {item.desc}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certificates */}
                  {certificates.length > 0 && (
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <div className="h-px w-5 bg-[#B87333]/60" />
                        <span className="text-[10px] uppercase tracking-[0.28em] text-[#B87333]/80">
                          Сертификати
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {certificates.map((cert) => (
                          <div
                            key={cert.id}
                            className="border border-[#B87333]/25 bg-[#B87333]/[0.04] px-3 py-2.5 transition-colors hover:border-[#B87333]/50"
                          >
                            <div className="text-xs font-semibold text-slate-100 md:text-sm">{cert.title}</div>
                            {cert.issuer && (
                              <div className="text-[11px] text-slate-400">{cert.issuer}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Row 3: Timeline — horizontal, drag-scroll ── */}
            {timelineItems.length > 0 && (
              <div className="about-timeline flex-shrink-0 border-t border-white/[0.07] bg-[#040c18] py-5">
                <div className="mb-4 flex items-center gap-2 px-8 md:px-14">
                  <div className="h-px w-5 bg-[#B87333]" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#B87333]">
                    {timelineSection.label}
                  </span>
                </div>

                <div className="relative">
                  <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-12 bg-gradient-to-r from-[#040c18] to-transparent" />
                  <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-12 bg-gradient-to-l from-[#040c18] to-transparent" />

                  <div
                    ref={timelineScrollRef}
                    className="cursor-grab overflow-x-auto overflow-y-hidden active:cursor-grabbing"
                    style={{ scrollbarWidth: "none", height: 210 }}
                  >
                    <div className="relative px-14" style={{ minWidth: "max-content" }}>
                      {/* Copper connector line at midpoint (top 103px) */}
                      <div
                        className="pointer-events-none absolute"
                        style={{ left: 40, right: 40, top: 103, height: 1, background: "rgba(184,115,51,0.35)" }}
                      />

                      <div className="flex" style={{ height: 210 }}>
                        {timelineItems.map((item, i) => {
                          const isEven = i % 2 === 0
                          return (
                            <div
                              key={i}
                              className="about-tl-item relative flex-shrink-0"
                              style={{ width: 200 }}
                            >
                              {/* Dot on the line */}
                              <div
                                className="absolute z-10"
                                style={{
                                  left: "50%",
                                  top: 96,
                                  transform: "translateX(-50%)",
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  border: "2px solid #B87333",
                                  background: item.year ? "#B87333" : "rgba(4,12,24,1)",
                                  boxShadow: item.year ? "0 0 10px rgba(184,115,51,0.5)" : "none",
                                }}
                              />

                              {/* Card: even above, odd below */}
                              <div
                                className="absolute mx-2.5 border border-[#B87333]/25 bg-[#07111f]/90 px-2.5 py-2 transition-colors hover:border-[#B87333]/50"
                                style={isEven ? { top: 4, bottom: 115 } : { top: 115, bottom: 4 }}
                              >
                                {item.year && (
                                  <div className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#B87333]">
                                    {item.year}
                                  </div>
                                )}
                                <div className="text-xs font-semibold leading-snug text-white">
                                  {item.label}
                                </div>
                                <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                                  {item.desc}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── SERVICES ─────────────────────────────────────────────────────── */}
        <div ref={servicesRef} className="absolute inset-0" style={{ willChange: "opacity, transform" }}>
          <div className="absolute inset-0 flex">

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
                      activeServiceIndex === i ? "text-white" : "text-slate-400 hover:text-slate-300"
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
                    setActiveService(svc)
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
          className="journal-grain absolute inset-0 overflow-hidden"
          style={{ willChange: "opacity, transform", background: "#0f0a05" }}
        >
          <div className="absolute inset-0 flex flex-col px-8 py-8 md:px-16">

            {/* Header */}
            <div className="mb-4 flex flex-shrink-0 items-end justify-between">
              <div>
                <div className="mb-1.5 flex items-center gap-3">
                  <div className="h-px w-6 bg-[#B87333]" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#B87333]">
                    {lang === "bg" ? "Проекти" : "Projects"}
                  </span>
                </div>
                <h2 className="text-2xl font-black leading-tight text-[#f0e6cc] md:text-3xl">
                  {lang === "bg" ? "Нашата работа" : "Our Work"}
                </h2>

                {/* Type + category filters */}
                <div className="mb-3 flex flex-shrink-0 flex-wrap gap-2">
                  {(['ALL', 'PROJECT', 'NEWS'] as const).map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setProjectFilter(f)}
                      className={`border px-3 py-1 text-[10px] uppercase tracking-[0.15em] transition-colors ${
                        projectFilter === f
                          ? 'border-[#B87333] text-[#B87333]'
                          : 'border-[#f0e6cc]/20 text-[#f0e6cc]/40 hover:border-[#f0e6cc]/40 hover:text-[#f0e6cc]/70'
                      }`}
                    >
                      {f === 'ALL' ? (lang === 'bg' ? 'Всички' : 'All')
                       : f === 'PROJECT' ? (lang === 'bg' ? 'Проекти' : 'Projects')
                       : (lang === 'bg' ? 'Новини' : 'News')}
                    </button>
                  ))}
                  {uniqueCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(categoryFilter === cat ? 'ALL' : cat)}
                      className={`border px-3 py-1 text-[10px] uppercase tracking-[0.15em] transition-colors ${
                        categoryFilter === cat
                          ? 'border-[#B87333]/60 text-[#B87333]/80'
                          : 'border-[#f0e6cc]/10 text-[#f0e6cc]/30 hover:border-[#f0e6cc]/30 hover:text-[#f0e6cc]/60'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
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

            {/* Project grid — fills remaining height */}
            <div ref={projectGridRef} className="grid min-h-0 flex-1 grid-cols-2">
              {pagedProjects.map((project) => (
                <div
                  key={project.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedProject(project)}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedProject(project)}
                  className="project-card group relative flex h-full cursor-pointer flex-col overflow-hidden border border-[#f0e6cc]/[0.08] bg-[#1a1108]/60 transition-colors hover:border-[#B87333]/30"
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
                  }}
                >
                  {/* Large image filling most of the card */}
                  {project.featuredImageUrl ? (
                    <div className="relative min-h-0 flex-1 overflow-hidden">
                      <img
                        src={project.featuredImageUrl}
                        alt={project.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        style={{ filter: "sepia(30%) contrast(0.9)" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1108] via-[#1a1108]/20 to-transparent" />
                    </div>
                  ) : (
                    <div className="relative min-h-0 flex-1 overflow-hidden bg-gradient-to-br from-[#1a1208] to-[#0f0a05]">
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: "repeating-linear-gradient(45deg, #B87333 0, #B87333 1px, transparent 0, transparent 50%)", backgroundSize: "14px 14px" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center p-6">
                        <span className="text-center text-4xl font-black uppercase leading-tight text-[#f0e6cc]" style={{ opacity: 0.04 }}>
                          {project.title}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Text — fixed height at bottom */}
                  <div className="flex-shrink-0 border-t border-[#f0e6cc]/[0.06] p-4">
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
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#f0e6cc]/50">
                        {project.excerpt}
                      </p>
                    )}
                    <div className="mt-2">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-[#B87333]/60 transition-colors group-hover:text-[#B87333]">
                        {lang === "bg" ? "Прочети повече" : "Read more"} →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {Array.from({ length: Math.max(0, 2 - pagedProjects.length) }).map((_, i) => (
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
              <div className="mt-3 flex flex-shrink-0 justify-center gap-2">
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
        <div ref={contactRef} className="absolute inset-0" style={{ willChange: "opacity, transform" }}>

          {/* Map as full-height dark background */}
          {settings?.googleMapsEmbed && (
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              {settings.googleMapsEmbed.trim().startsWith("<iframe") ? (
                <div
                  className="h-full w-full [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0"
                  style={{ filter: "invert(90%) hue-rotate(180deg) brightness(0.35)" }}
                  dangerouslySetInnerHTML={{ __html: settings.googleMapsEmbed }}
                />
              ) : (
                <iframe
                  src={settings.googleMapsEmbed}
                  className="h-full w-full border-0"
                  style={{ filter: "invert(90%) hue-rotate(180deg) brightness(0.35)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Map"
                />
              )}
            </div>
          )}

          <div className="absolute inset-0 z-[2] flex flex-col">

            {/* Main content */}
            <div className="flex flex-1 overflow-hidden">

              {/* Left: company info */}
              <div className="contact-info flex w-full flex-col justify-center bg-[#07111f]/95 px-8 py-10 md:w-2/5 md:px-12">
                <h2 className="mb-8 text-3xl font-black leading-tight text-white md:text-4xl">
                  {settings?.companyName ?? "BSDC"}
                </h2>
                <div className="flex flex-col gap-5">
                  {settings?.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#B87333]" />
                      <span className="text-base leading-relaxed text-slate-300">{settings.address}</span>
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
                            className="text-base text-slate-300 transition-colors hover:text-white"
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
                        className="text-base text-slate-300 transition-colors hover:text-white"
                      >
                        {settings.email}
                      </a>
                    </div>
                  )}
                  {settings?.workingHours && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 flex-shrink-0 text-[#B87333]" />
                      <span className="text-base text-slate-300">{settings.workingHours}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: contact form */}
              <div className="contact-form flex flex-1 flex-col justify-center bg-[#020617]/95 px-8 py-10 md:px-12">
                <h3 className="mb-6 text-xl font-bold text-white">
                  {lang === "bg" ? "Изпратете запитване" : "Send an Enquiry"}
                </h3>
                <form onSubmit={submitContact} className="flex flex-col gap-4">
                  {/* Honeypot */}
                  <input name="website" type="text" className="hidden" tabIndex={-1} autoComplete="off" />

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder={lang === "bg" ? "Вашето име" : "Your name"}
                      className="border-0 border-b border-white/20 bg-transparent px-0 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-b focus:border-[#B87333]/60"
                    />
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder={lang === "bg" ? "Имейл" : "Email"}
                      className="border-0 border-b border-white/20 bg-transparent px-0 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-b focus:border-[#B87333]/60"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      name="phone"
                      type="tel"
                      placeholder={lang === "bg" ? "Телефон" : "Phone"}
                      className="border-0 border-b border-white/20 bg-transparent px-0 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-b focus:border-[#B87333]/60"
                    />
                    <select
                      name="type"
                      className="border-0 border-b border-white/20 bg-transparent px-0 py-3 text-sm text-slate-300 outline-none transition-colors focus:border-b focus:border-[#B87333]/60"
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
                    className="resize-none border-0 border-b border-white/20 bg-transparent px-0 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-b focus:border-[#B87333]/60"
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
                <div className="text-center">
                  <img src="/uploads/bsdc/logo-white.png" alt="BSDC" className="mx-auto mb-3 block h-20 w-auto object-contain" style={{ filter: "brightness(0.8)" }} />
                  <p className="max-w-[200px] text-sm leading-relaxed text-slate-400">
                    {lang === "bg" ? (
                      <>Подводни технологии и<br />хидротехническо инженерство от 2001 г.</>
                    ) : (
                      <>Underwater technologies and<br />hydrotechnical engineering since 2001.</>
                    )}
                  </p>
                </div>
                {/* Navigation */}
                <div>
                  <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-300">
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
                        className="text-left text-sm text-slate-400 transition-colors hover:text-slate-200"
                      >
                        {label}
                      </button>
                    ))}
                  </nav>
                </div>
                {/* Services */}
                <div>
                  <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-300">
                    {lang === "bg" ? "Услуги" : "Services"}
                  </p>
                  <div className="flex flex-col gap-1">
                    {services.slice(0, 6).map((svc) => (
                      <span key={svc.id} className="text-sm leading-tight text-slate-400">{svc.title}</span>
                    ))}
                  </div>
                </div>
                {/* Contact + Legal */}
                <div>
                  <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-300">
                    {lang === "bg" ? "Контакти и правно" : "Contact & Legal"}
                  </p>
                  <div className="mb-3 flex flex-col gap-1">
                    {settings?.email && (
                      <a href={`mailto:${settings.email}`} className="text-sm text-slate-400 transition-colors hover:text-slate-200">
                        {settings.email}
                      </a>
                    )}
                    {settings?.phones?.[0] && (
                      <a href={`tel:${settings.phones[0].replace(/\s/g, "")}`} className="text-sm text-slate-400 transition-colors hover:text-slate-200">
                        {settings.phones[0]}
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <a href={`/${lang}/privacy`} className="text-sm text-slate-400 transition-colors hover:text-slate-300">
                      {lang === "bg" ? "Политика за поверителност" : "Privacy Policy"}
                    </a>
                    <a href={`/${lang}/cookies`} className="text-sm text-slate-400 transition-colors hover:text-slate-300">
                      {lang === "bg" ? "Политика за бисквитки" : "Cookie Policy"}
                    </a>
                    <a href={`/${lang}/terms`} className="text-sm text-slate-400 transition-colors hover:text-slate-300">
                      {lang === "bg" ? "Условия за ползване" : "Terms of Use"}
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-4 border-t border-white/[0.04] pt-3 text-center">
                <p className="text-sm text-slate-400">
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

      </div>

      {/* ── SERVICE DETAIL — outside rootRef so fixed positioning works ─────── */}
      {activeService && renderServiceDetail(activeService, activeServiceIndex)}

      {/* ── PROJECT DETAIL MODAL — outside rootRef ───────────────────────── */}
      {selectedProject && (() => {
        const idx  = projects.findIndex((p) => p.id === selectedProject.id)
        const prev = idx > 0 ? projects[idx - 1] : null
        const next = idx < projects.length - 1 ? projects[idx + 1] : null
        return (
          <div className="fixed inset-0 z-[500] flex items-center justify-center px-4 py-8 pointer-events-auto">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedProject(null)}
            />
            <div
              className="journal-grain relative z-10 flex h-full w-full max-w-2xl flex-col border border-[#f0e6cc]/[0.08]"
              style={{ background: "#100d08" }}
            >
              {/* Header with working close button */}
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
                  className="ml-4 flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center border border-[#f0e6cc]/20 text-slate-400 transition-colors hover:border-[#f0e6cc]/40 hover:text-white"
                  style={{ pointerEvents: "auto" }}
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
                    className="mb-5 h-48 w-full object-cover"
                    style={{ filter: "sepia(25%) contrast(0.9)" }}
                  />
                )}
                {/* Gallery — uses CMS images if available, else fallback placeholders */}
                {(() => {
                  const galleryItems = selectedProject.images.length > 0
                    ? selectedProject.images.slice(0, 4)
                    : ["/uploads/bsdc/project-pic-01.jpg", "/uploads/bsdc/project-pic-03.jpg", "/uploads/bsdc/gallery-pic-05.jpg", "/uploads/bsdc/gallery-pic-06.jpg"]
                  return (
                    <div className="mb-5 flex gap-2">
                      {galleryItems.map((src, i) => (
                        <div key={i} className="relative h-16 flex-1 overflow-hidden border border-[#f0e6cc]/[0.06]">
                          <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" style={{ filter: "sepia(20%)" }} />
                        </div>
                      ))}
                    </div>
                  )
                })()}
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

      {/* ── CONTACT MODAL — outside rootRef ──────────────────────────────── */}
      {showContactModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center px-4 pointer-events-auto">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => { setShowContactModal(false); setContactStatus("idle") }}
          />
          <div className="relative z-10 w-full max-w-lg border border-white/[0.08] bg-[#07111f] p-8">
            <button
              type="button"
              onClick={() => { setShowContactModal(false); setContactStatus("idle") }}
              className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center text-slate-400 transition-colors hover:text-white"
              style={{ pointerEvents: "auto" }}
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
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
                  className="border border-white/[0.08] bg-[#07111f] px-4 py-3 text-sm text-slate-300 outline-none transition-colors focus:border-[#B87333]/50"
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
    </>
  )
}
