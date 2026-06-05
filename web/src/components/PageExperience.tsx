"use client"

import {
  useEffect,
  useRef,
  useState,
} from "react"
import dynamic from "next/dynamic"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useMotionValue, useSpring } from "framer-motion"
import type {
  HomeContent,
  AboutContent,
  Service,
  Certificate,
  Partner,
  SiteSetting,
  ProjectNewsItem,
} from "@/generated/prisma/client"

import { SceneHero } from "./experience/SceneHero"
import { SceneAbout } from "./experience/SceneAbout"
import { SceneServices } from "./experience/SceneServices"
import { SceneContact } from "./experience/SceneContact"
import { SceneProjects } from "./experience/SceneProjects"
import { useSceneTransition } from "@/hooks/useSceneTransition"
import { useSceneNavigator } from "@/hooks/useSceneNavigator"
import { useExitScroll } from "@/hooks/useExitScroll"

const GlobalBackground = dynamic(() => import("./3d/GlobalBackground"), { ssr: false })

// ── Service detail metadata helpers ──────────────────────────────────────────

type StatCard = { title: string; value: string; sub: string }

interface ServiceMeta {
  accent: string
  bg: string
  activities: string[]
  cards: StatCard[]
}

// Fallback values used only when DB fields are empty (e.g. for newly created services)
const SERVICE_META_FALLBACK: ServiceMeta[] = [
  { accent: "#4A5343", bg: "#8A9A86", activities: [], cards: [] },
  { accent: "#4A5343", bg: "#8A9A86", activities: [], cards: [] },
  { accent: "#4A5343", bg: "#8A9A86", activities: [], cards: [] },
  { accent: "#4A5343", bg: "#8A9A86", activities: [], cards: [] },
  { accent: "#4A5343", bg: "#8A9A86", activities: [], cards: [] },
  { accent: "#4A5343", bg: "#8A9A86", activities: [], cards: [] },
]

function resolveServiceMeta(svc: Service, svcIdx: number): ServiceMeta {
  const fallback = SERVICE_META_FALLBACK[svcIdx] ?? SERVICE_META_FALLBACK[0]
  const cards = Array.isArray(svc.statCards) && (svc.statCards as unknown[]).length > 0
    ? (svc.statCards as StatCard[])
    : fallback.cards
  return {
    accent:     svc.accentColor ?? fallback.accent,
    bg:         svc.bgColor     ?? fallback.bg,
    activities: (svc.activities?.length ?? 0) > 0 ? svc.activities : fallback.activities,
    cards,
  }
}

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
  certificates: Certificate[]
  partners: Partner[]
  settings: SiteSetting | null
  lang: string
  projects: ProjectNewsItem[]
}

const SCENE_LABELS = ["Hero", "About", "Services", "Projects", "Contact"]



// ── Component ─────────────────────────────────────────────────────────────────

export default function PageExperience({
  home,
  about,
  services,
  certificates,
  partners,
  settings,
  lang,
  projects,
}: Props) {
  function parseCmsJson<T>(raw: unknown): T[] {
    if (!raw) return []
    if (Array.isArray(raw)) return raw as T[]
    try { return JSON.parse(String(raw)) as T[] } catch { return [] }
  }

  type StatItem = { value: string; label: string }
  function parseStats(raw: unknown): { hero: StatItem[]; about: StatItem[] } {
    if (!raw) return { hero: [], about: [] }
    // New format: { hero: [...], about: [...] }
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

  const { about: aboutStats } = parseStats(about?.statistics)

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
  const [activeIdx, setActiveIdx]          = useState(0)
  const [scrollPos, setScrollPos]          = useState(0)
  const [activeService, setActiveService]           = useState<Service | null>(null)
  const [expandedAct, setExpandedAct]              = useState<number | null>(null)
  const [contactStatus, setContactStatus]           = useState<"idle" | "loading" | "success" | "error">("idle")
  const [showContactModal, setShowContactModal]     = useState(false)
  const [isClosing, setIsClosing]                   = useState(false)
  const [lightboxSrc, setLightboxSrc]               = useState<string | null>(null)
  const [selectedProject, setSelectedProject]       = useState<ProjectNewsItem | null>(null)
  const [projectFilter, setProjectFilter]           = useState<"ALL" | "PROJECT" | "NEWS">("ALL")
  const [categoryFilter, setCategoryFilter]         = useState<string>("ALL")
  const [projActiveIndex, setProjActiveIndex]       = useState(0)
  const [galleryIndex, setGalleryIndex]             = useState(0)
  const [displayedGalleryImg, setDisplayedGalleryImg] = useState<string | null>(null)
  const [relatedPage, setRelatedPage]               = useState(0)
  const dragProgress    = useMotionValue(0)
  const activeProgress  = useSpring(dragProgress, { stiffness: 80, damping: 20 })

  const currentSceneRef          = useRef(0)
  const activeServiceRef         = useRef<Service | null>(null)
  const activeIdxRef             = useRef(0)
  const isAnimating              = useRef(false)
  const touchStartY              = useRef(0)
  const innerGroupRef            = useRef<HTMLDivElement>(null)
  const scrollPosRef             = useRef(0)
  const scrollVelRef             = useRef(0)
  const rafIdRef                 = useRef<number | null>(null)
  const aboutEntranceFired       = useRef(false)
  const servicesEntranceFired    = useRef(false)
  const rootRef          = useRef<HTMLDivElement>(null)
  const heroRef          = useRef<HTMLDivElement>(null)
  const aboutRef         = useRef<HTMLDivElement>(null)
  const aboutScrollRef   = useRef<HTMLDivElement>(null)
  const servicesRef      = useRef<HTMLDivElement>(null)
  const projectsRef      = useRef<HTMLDivElement>(null)
  const contactRef       = useRef<HTMLDivElement>(null)
  const selectedProjectRef     = useRef<ProjectNewsItem | null>(null)
  const carouselContainerRef   = useRef<HTMLDivElement>(null)
  const carouselDragging       = useRef(false)
  const carouselStartX         = useRef(0)
  const carouselStartProgress  = useRef(0)
  const carouselLastX          = useRef(0)
  const carouselLastTime       = useRef(0)
  const carouselVelocity       = useRef(0)   // px/ms, updated on every move
  const modalRef          = useRef<HTMLDivElement>(null)
  const modalScrollRef    = useRef<HTMLDivElement>(null)
  const modalContentRef   = useRef<HTMLDivElement>(null)
  const heroImgRef        = useRef<HTMLImageElement>(null)
  const galleryWrapperRef = useRef<HTMLDivElement>(null)
  const gsapCtxRef        = useRef<gsap.Context | null>(null)
  const additionalScrollRef = useRef(0)
  const handleWheelRef    = useRef<((e: WheelEvent) => void) | null>(null)
  const scrollPointerTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeModalRef     = useRef(closeModal)
  const isClosingRef      = useRef(false)
  const exitDeltaRef      = useRef(0)
  const currentExitRef    = useRef(0)
  const rafExitRef        = useRef<number | null>(null)

  const sceneRefs  = [heroRef, aboutRef, servicesRef, projectsRef, contactRef]
  const totalScenes = sceneRefs.length

  // ── Phase-2 hook extractions ──────────────────────────────────────────────

  const { goToScene } = useSceneTransition({
    heroRef, aboutRef, servicesRef, projectsRef, contactRef, aboutScrollRef,
    sceneRefs,
    currentSceneRef, isAnimating, aboutEntranceFired, servicesEntranceFired,
    scrollPosRef, scrollVelRef, rafIdRef, activeIdxRef, activeServiceRef,
    setCurrentScene, setActiveIdx, setScrollPos, setActiveService,
  })

  useSceneNavigator({
    goToScene,
    selectedProjectRef, activeServiceRef, isAnimating, currentSceneRef,
    aboutScrollRef, servicesCount: services.length,
    scrollVelRef, scrollPosRef, rafIdRef, activeIdxRef,
    touchStartY, setActiveIdx, setScrollPos, setActiveService, setSelectedProject,
    setShowContactModal, setContactStatus,
  })

  useExitScroll({
    selectedProject, modalScrollRef, modalContentRef,
    isClosingRef, rafExitRef, exitDeltaRef, currentExitRef,
    gsapCtxRef, additionalScrollRef, closeModalRef,
    setSelectedProject, setLightboxSrc,
  })

  const tickerPartners  = [...partners, ...partners]

  const filteredProjects = projects.filter(p => {
    const typeOk = projectFilter === "ALL" || p.type === projectFilter
    const catOk  = categoryFilter === "ALL" || p.category === categoryFilter
    return typeOk && catOk
  })
  const TYPE_LEVEL_VALUES = new Set(["PROJECT", "NEWS", "Проекти", "Новини", "project", "news"])
  const uniqueCategories  = Array.from(
    new Set(projects.map(p => p.category).filter((c): c is string => c !== null && !TYPE_LEVEL_VALUES.has(c)))
  )

  // ── Carousel pointer handlers ─────────────────────────────────────────────

  function handleCarouselPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest(".proj-filter-btn,.proj-modal-btn")) return
    carouselDragging.current      = true
    carouselStartX.current        = e.clientX
    carouselLastX.current         = e.clientX
    carouselLastTime.current      = Date.now()
    carouselVelocity.current      = 0
    carouselStartProgress.current = dragProgress.get()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handleCarouselPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!carouselDragging.current) return
    const now = Date.now()
    const dt  = now - carouselLastTime.current
    if (dt > 0) {
      carouselVelocity.current = (e.clientX - carouselLastX.current) / dt
    }
    carouselLastX.current    = e.clientX
    carouselLastTime.current = now
    const delta = (e.clientX - carouselStartX.current) / 160
    dragProgress.set(carouselStartProgress.current - delta)
  }

  function releaseCarousel(el?: HTMLElement, pointerId?: number) {
    carouselDragging.current = false
    if (el && pointerId !== undefined) el.releasePointerCapture(pointerId)
    // Project forward using last measured velocity — 240ms coast window at 160px/card
    const coast  = (carouselVelocity.current * 240) / 160
    const target = dragProgress.get() - coast
    carouselVelocity.current = 0
    dragProgress.set(target)   // spring eases freely to float destination
  }

  function handleCarouselPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!carouselDragging.current) return
    releaseCarousel(e.currentTarget as HTMLElement, e.pointerId)
  }

  function handleCarouselPointerLeave() {
    if (!carouselDragging.current) return
    releaseCarousel()
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

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

  function closeModal() {
    if (isClosingRef.current) return
    if (rafExitRef.current !== null) { cancelAnimationFrame(rafExitRef.current); rafExitRef.current = null }
    exitDeltaRef.current = 0
    currentExitRef.current = 0
    // Clear any inline transform/opacity set by interactive drag so parent CSS transition takes over
    if (modalContentRef.current) {
      modalContentRef.current.style.transition = ''
      modalContentRef.current.style.transform = ''
      modalContentRef.current.style.opacity = ''
    }
    setIsClosing(true)

    if (gsapCtxRef.current) {
      gsapCtxRef.current.revert()
      gsapCtxRef.current = null
    }
    if (modalRef.current) gsap.killTweensOf(modalRef.current)

    setTimeout(() => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      document.body.style.pointerEvents = ''
      additionalScrollRef.current = 0
      setSelectedProject(null)
      setLightboxSrc(null)
      setIsClosing(false)
    }, 800)
  }

  useEffect(() => {
    if (!selectedProject) return
    if (!modalRef.current || !modalScrollRef.current) return

    gsap.registerPlugin(ScrollTrigger)
    modalScrollRef.current.scrollTop = 0
    setGalleryIndex(0)
    setRelatedPage(0)
    const imgs = selectedProject.images ?? []
    if (imgs.length > 0) setDisplayedGalleryImg(imgs[0])

    setIsClosing(false)
    if (gsapCtxRef.current) { gsapCtxRef.current.revert(); gsapCtxRef.current = null }
    additionalScrollRef.current = 0

    gsap.set(modalRef.current, { y: '100vh' })
    gsap.to(modalRef.current, { y: 0, duration: 0.6, ease: 'power2.out' })

    gsapCtxRef.current = gsap.context(() => {
      const scroller = modalScrollRef.current

      // Scene 2: cream bg fades to dark #0F1411 at 50% scroll
      gsap.to('.modal-scene-2-bg', {
        opacity: 1, ease: 'none', force3D: true,
        scrollTrigger: {
          trigger: '.modal-scene-2',
          scroller,
          start: 'top bottom',
          end: 'top center',
          scrub: 1.2,
          invalidateOnRefresh: true,
        }
      })

      // Scene 2: right column fades in at 60% visibility
      gsap.to('.modal-scene-2-text', {
        opacity: 1, ease: 'none', force3D: true,
        scrollTrigger: {
          trigger: '.modal-scene-2',
          scroller,
          start: 'top 40%',
          end: 'top 10%',
          scrub: 1.2,
          invalidateOnRefresh: true,
        }
      })

      // Overlay darkens across full gallery scroll
      gsap.to('.modal-gallery-bg', {
        opacity: 0.95,
        ease: 'none', force3D: true,
        scrollTrigger: {
          trigger: galleryWrapperRef.current,
          scroller,
          start: 'top top',
          end: 'center top',
          scrub: 1.2,
          invalidateOnRefresh: true,
        }
      })

      // Gallery image rises from bottom simultaneously, fully centered when overlay is dark
      gsap.to('.modal-gallery-img', {
        y: '0%',
        ease: 'none', force3D: true,
        scrollTrigger: {
          trigger: galleryWrapperRef.current,
          scroller,
          start: 'top top',
          end: 'center top',
          scrub: 1.2,
          invalidateOnRefresh: true,
        }
      })

      // Controls fade in after image is centered
      gsap.to('.modal-gallery-content', {
        opacity: 1,
        ease: 'none', force3D: true,
        scrollTrigger: {
          trigger: galleryWrapperRef.current,
          scroller,
          start: 'center top',
          end: '65% top',
          scrub: 1.2,
          invalidateOnRefresh: true,
        }
      })

      // Scene 4 fade + slide up
      gsap.fromTo('.modal-scene-4',
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0,
          ease: 'none', force3D: true,
          scrollTrigger: {
            trigger: '.modal-scene-4',
            scroller,
            start: 'top 40%',
            end: 'top 10%',
            scrub: 1,
            invalidateOnRefresh: true,
          }
        }
      )

    }, modalRef)

    // Recalculate ScrollTrigger positions after DOM settles
    const rafId = requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [selectedProject?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Body-scroll lock — prevents background page scroll while modal is open
  useEffect(() => {
    if (selectedProject) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      // Always reset pointer-events on modal open — clears any stuck state from failed closeModal
      document.body.style.pointerEvents = ''
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      document.body.style.pointerEvents = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      document.body.style.pointerEvents = ''
    }
  }, [selectedProject])



  // Modal exit drag — handled by useExitScroll hook

  // keep refs in sync so wheel/key handlers (stale closures) can read them
  useEffect(() => { activeServiceRef.current = activeService }, [activeService])
  useEffect(() => { activeIdxRef.current = activeIdx }, [activeIdx])
  useEffect(() => { selectedProjectRef.current = selectedProject }, [selectedProject])
  useEffect(() => { closeModalRef.current = closeModal }, [closeModal])
  useEffect(() => { isClosingRef.current = isClosing }, [isClosing])

  // Reset carousel position when filters change
  useEffect(() => {
    dragProgress.set(0)
    setProjActiveIndex(0)
  }, [projectFilter, categoryFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to spring — find whichever card is geometrically closest to center right now
  useEffect(() => {
    const unsub = activeProgress.on("change", (latest) => {
      const count = filteredProjects.length
      if (count === 0) return
      const half = count / 2
      let minDist = Infinity
      let closest = 0
      for (let i = 0; i < count; i++) {
        let d = i - latest
        while (d >  half) d -= count
        while (d <= -half) d += count
        if (Math.abs(d) < minDist) { minDist = Math.abs(d); closest = i }
      }
      if (closest !== projActiveIndex) setProjActiveIndex(closest)
    })
    return unsub
  }, [activeProgress, projActiveIndex, filteredProjects.length]) // eslint-disable-line react-hooks/exhaustive-deps
  // Left panel text fades gently when service changes — no abrupt flash
  useEffect(() => {
    if (currentSceneRef.current !== 2) return
    gsap.fromTo('.svc-text-block', { opacity: 0.3 }, { opacity: 1, duration: 0.55, ease: 'power1.out' })
  }, [activeIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cinematic entrance animations for service detail overlays
  useEffect(() => {
    if (!activeService) return

    // Read stat numbers before hiding (GSAP only changes opacity/transform, not textContent,
    // but we save references here so the counter closure captures the correct DOM nodes)
    type StatCounter = { el: HTMLElement; prefix: string; num: number; suffix: string }
    const statCounters: StatCounter[] = []
    document.querySelectorAll<HTMLElement>('.sd-stat').forEach((statEl) => {
      const valueEl = statEl.querySelector<HTMLElement>('div')
      if (!valueEl) return
      const raw = valueEl.textContent ?? ''
      const match = raw.match(/^([^0-9]*)(\d+)(.*)$/)
      if (!match) return
      const num = parseFloat(match[2])
      if (isNaN(num) || num < 2) return
      statCounters.push({ el: valueEl, prefix: match[1], num, suffix: match[3] })
    })

    // Set everything invisible before panel-in completes
    gsap.set('.sd-image, .sd-eyebrow, .sd-title, .sd-desc, .sd-card, .sd-row, .sd-stat', { opacity: 0 })
    const tl = gsap.timeline()
    // Image: dramatic scale-in
    tl.fromTo('.sd-image',   { scale: 1.07, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1, ease: 'power2.out' }, 0.1)
    // Eyebrow: slide from left
    tl.fromTo('.sd-eyebrow', { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }, 0.3)
    // Title: clip-path wipe from bottom upward + slide up — more cinematic than plain fade
    tl.fromTo('.sd-title',   { y: 36, opacity: 0, clipPath: 'inset(100% 0 0 0)' }, { y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', duration: 0.68, ease: 'power3.out' }, 0.45)
    // Description
    tl.fromTo('.sd-desc',    { y: 18, opacity: 0 },  { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.6)
    // Activity cards stagger in with bounce
    tl.fromTo('.sd-card',    { y: 24, opacity: 0 },  { y: 0, opacity: 1, stagger: 0.055, duration: 0.48, ease: 'back.out(1.2)' }, 0.72)
    // List rows slide in from left
    tl.fromTo('.sd-row',     { x: -16, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.04, duration: 0.4, ease: 'power2.out' }, 0.75)
    // Stat tiles pop in with back-ease
    tl.fromTo('.sd-stat',    { y: 18, opacity: 0, scale: 0.93 }, { y: 0, opacity: 1, scale: 1, stagger: 0.07, duration: 0.5, ease: 'back.out(1.3)' }, 0.78)

    // Counter animation: numbers count up as stat tiles materialize
    statCounters.forEach(({ el, prefix, num, suffix }, idx) => {
      const counter = { val: num > 20 ? Math.round(num * 0.25) : 0 }
      gsap.to(counter, {
        val: num,
        duration: 1.3,
        delay: 0.92 + idx * 0.07,
        ease: 'power2.out',
        onUpdate() { el.textContent = prefix + Math.round(counter.val) + suffix },
      })
    })
  }, [activeService]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Transitions, Init, Event listeners — extracted to hooks ────────────

  // ── Service detail overlay (6 unique cinematic layouts) ──────────────────

  function renderServiceDetail(svc: Service, svcIdx: number) {
    const meta = resolveServiceMeta(svc, svcIdx)
    const closeDetail = () => setActiveService(null)
    const galleryImages: string[] = svc.images?.length > 0 ? svc.images : []
    const imgSrc = svc.featuredImageUrl ?? svc.images?.[0] ?? null

    const CloseBtn = (
      <button
        type="button"
        onClick={closeDetail}
        className="fixed right-8 bottom-8 z-[510] flex h-12 w-12 cursor-pointer items-center justify-center border border-[#1A221E]/25 bg-black/70 text-[#1A221E]/70 backdrop-blur-sm transition-all hover:border-[#1A221E]/50 hover:bg-black/90 hover:text-[#1A221E]"
        aria-label="Close"
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
        {lang === "bg" ? "Назад" : "Back"}
      </button>
    )

    // ── Layout 0 — Industrial Diving — SPLIT SCREEN (Operations Room) ────────
    if (svcIdx === 0) {
      return (
        <div className="animate-bsdc-panel-in fixed inset-0 z-[500] flex overflow-hidden pointer-events-auto" style={{ background: "#8A9A86" }}>
          {CloseBtn}{BackBtn}

          {/* LEFT — full-height atmospheric image */}
          <div className="relative hidden w-[45%] flex-shrink-0 md:block">
            {imgSrc
              ? <img src={imgSrc} alt={svc.title} className="sd-image absolute inset-0 h-full w-full object-cover object-center" style={{ filter: "brightness(0.45) saturate(0.7)" }} />
              : <div className="absolute inset-0 bg-[#8A9A86]" />
            }
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 60%, #8A9A86 100%)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.7) 100%)" }} />
            <div className="absolute bottom-0 left-0 top-0 w-[3px]" style={{ background: "linear-gradient(to bottom, transparent, #4A5343, transparent)" }} />
            <div className="absolute bottom-14 left-8 font-mono text-[10px] tracking-[0.35em] text-[#4A5343]/50 uppercase">BSDC · {lang === "bg" ? "ОТ 2001" : "SINCE 2001"}</div>
          </div>

          {/* RIGHT — content panel, scrollable */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <div className="flex min-h-full flex-col px-10 py-14 lg:px-16 lg:py-20">

              <div className="sd-eyebrow mb-5 flex items-center gap-3">
                <div className="h-px w-10 bg-[#4A5343]" />
                <span className="text-[10px] uppercase tracking-[0.45em] text-[#4A5343]">
                  {lang === "bg" ? "Индустриален водолазен отдел" : "Industrial Diving Division"}
                </span>
              </div>

              <h2 className="sd-title mb-8 text-4xl font-light leading-[1.0] tracking-tight text-[#1A221E] lg:text-5xl">
                {svc.title}
              </h2>

              {svc.content && (
                <div
                  className="sd-desc mb-10 max-w-2xl text-base leading-[1.8] text-[#1A221E]/75 [&_p]:mb-4"
                  dangerouslySetInnerHTML={{ __html: svc.content }}
                />
              )}

              <div className="mb-10">
                <div className="mb-5 flex items-center gap-4">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-[#4A5343]">
                    {lang === "bg" ? "Операции" : "Operations"}
                  </span>
                  <div className="h-px flex-1" style={{ background: "linear-gradient(to right, rgba(74,83,67,0.4), transparent)" }} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {meta.activities.map((act, i) => (
                    <div key={i} className="sd-card flex items-start gap-4 py-4 px-5" style={{ borderLeft: "2px solid rgba(74,83,67,0.25)", background: "rgba(74,83,67,0.04)" }}>
                      <svg className="mt-1 flex-shrink-0" width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <rect x="4" y="0.5" width="5" height="5" transform="rotate(45 4 0.5)" fill="#4A5343" fillOpacity="0.7" />
                      </svg>
                      <span className="text-sm leading-snug text-[#1A221E]/90">{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-10">
                {meta.cards.map((card, i) => (
                  <div key={i} className="sd-stat relative p-5 overflow-hidden" style={{ background: "rgba(74,83,67,0.06)", border: "1px solid rgba(74,83,67,0.2)" }}>
                    <div className="font-mono text-4xl font-light leading-none text-[#1A221E]">{card.value}</div>
                    <div className="mt-2 text-[11px] uppercase tracking-wider text-[#4A5343]">{card.title}</div>
                    <div className="mt-0.5 text-[10px] text-[#1A221E]/40">{card.sub}</div>
                    <div className="absolute right-0 bottom-0 h-6 w-6" style={{ background: "linear-gradient(315deg, rgba(74,83,67,0.3) 0%, transparent 70%)" }} />
                  </div>
                ))}
              </div>

              {galleryImages.length > 0 && (
                <div className="flex gap-2 pb-24">
                  {galleryImages.map((src, i) => (
                    <div key={i} className="sd-row relative h-40 flex-1 cursor-pointer overflow-hidden" style={{ border: "1px solid rgba(74,83,67,0.2)" }} onClick={() => setLightboxSrc(src)}>
                      <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 transition-opacity hover:opacity-100" />
                    </div>
                  ))}
                </div>
              )}
              {galleryImages.length === 0 && <div className="h-24" />}
            </div>
          </div>
        </div>
      )
    }

    // ── Layout 1 — ROV — TERMINAL / MONITOR ROOM ──────────────────────────────
    if (svcIdx === 1) {
      return (
        <div className="animate-bsdc-panel-in fixed inset-0 z-[500] flex flex-col overflow-hidden pointer-events-auto" style={{ background: "#8A9A86" }}>
          {CloseBtn}{BackBtn}

          {/* Terminal scanline bg */}
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(74,83,67,0.015) 4px, rgba(74,83,67,0.015) 5px)" }} />

          <div className="relative flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <div className="flex min-h-full flex-col px-10 py-14 lg:px-16">

              {/* TOP SECTION: text left + monitor frame right */}
              <div className="flex flex-col gap-8 mb-12 lg:flex-row lg:items-start lg:gap-14">

                {/* LEFT: title + description */}
                <div className="flex-1">
                  <div className="sd-eyebrow mb-4 font-mono text-[9px] tracking-[0.5em] text-[#4A5343]/50 uppercase">
                    {lang === "bg" ? "МІСІЯ БРИФ" : "MISSION BRIEF"}
                  </div>
                  <h2 className="sd-title mb-6 text-3xl font-light leading-tight text-[#1A221E] lg:text-5xl">
                    {svc.title}
                  </h2>
                  {svc.content && (
                    <div
                      className="sd-desc mb-8 text-sm leading-[1.85] text-[#1A221E]/55 [&_p]:mb-3"
                      dangerouslySetInnerHTML={{ __html: svc.content }}
                    />
                  )}
                  {/* Stats below description */}
                  <div className="grid grid-cols-3 gap-3">
                    {meta.cards.map((card, i) => (
                      <div key={i} className="sd-stat p-4" style={{ border: "1px solid rgba(74,83,67,0.2)", background: "rgba(74,83,67,0.04)" }}>
                        <div className="font-mono text-2xl font-light text-[#4A5343]">{card.value}</div>
                        <div className="mt-1 text-[10px] uppercase tracking-wider text-[#1A221E]/55">{card.title}</div>
                        <div className="text-[9px] text-[#1A221E]/30">{card.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT: framed LIVE FEED monitor (compact, atmospheric) */}
                {imgSrc && (
                  <div className="lg:w-[40%] lg:flex-shrink-0">
                    {/* Monitor outer bezel — click to view full image */}
                    <div className="relative cursor-pointer overflow-hidden" style={{ border: "2px solid rgba(74,83,67,0.3)", aspectRatio: "4/3", boxShadow: "0 0 40px rgba(74,83,67,0.08), inset 0 0 20px rgba(36,47,42,0.3)" }} onClick={() => imgSrc && setLightboxSrc(imgSrc)}>
                      <img
                        src={imgSrc}
                        alt={svc.title}
                        className="sd-image h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                        style={{ filter: "brightness(0.6) hue-rotate(165deg) saturate(1.3)" }}
                      />
                      {/* Scanlines on monitor */}
                      <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.25) 2px, rgba(0,0,0,0.25) 3px)" }} />
                      {/* Animated scan line that sweeps downward */}
                      <div
                        className="pointer-events-none absolute left-0 right-0 h-[2px]"
                        style={{
                          top: 0,
                          background: "linear-gradient(to right, transparent 0%, rgba(74,83,67,0.7) 40%, rgba(74,83,67,0.9) 50%, rgba(74,83,67,0.7) 60%, transparent 100%)",
                          opacity: 0,
                        }}
                      />
                      {/* Screen vignette */}
                      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.65) 100%)" }} />
                      {/* HUD top bar */}
                      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2" style={{ background: "rgba(74,83,67,0.08)", borderBottom: "1px solid rgba(74,83,67,0.2)" }}>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#4A5343] animate-pulse" />
                          <span className="font-mono text-[8px] tracking-[0.35em] text-[#4A5343]">LIVE · REC</span>
                          <span className="font-mono text-[9px] text-[#4A5343]/80 leading-none">▌</span>
                        </div>
                        <span className="font-mono text-[8px] text-[#4A5343]/50">LBV-ROV</span>
                      </div>
                      {/* HUD corner marks */}
                      {(["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"] as const).map((pos, i) => (
                        <div key={i} className={`absolute ${pos} h-3 w-3`} style={{ border: "1.5px solid rgba(74,83,67,0.45)", borderRadius: 0, ...(i === 0 ? { borderRight: "none", borderBottom: "none" } : i === 1 ? { borderLeft: "none", borderBottom: "none" } : i === 2 ? { borderRight: "none", borderTop: "none" } : { borderLeft: "none", borderTop: "none" }) }} />
                      ))}
                      {/* HUD bottom info */}
                      <div className="absolute bottom-0 left-0 right-0 px-3 py-2" style={{ background: "rgba(15,20,17,0.6)", borderTop: "1px solid rgba(138,154,134,0.15)" }}>
                        <span className="font-mono text-[8px] text-[#8A9A86]/50">DEPTH — · VIS HD · GPS –</span>
                      </div>
                    </div>
                    {/* Monitor label */}
                    <div className="mt-2 text-center font-mono text-[9px] tracking-[0.4em] text-[#8A9A86]/30 uppercase">
                      {lang === "bg" ? "Видеопоток в реално време" : "Live video feed"}
                    </div>
                  </div>
                )}
              </div>

              {/* MISSION SCOPE — numbered log entries, full width */}
              <div className="mb-10">
                <div className="mb-4 flex items-center gap-4">
                  <span className="font-mono text-[9px] tracking-[0.5em] text-[#8A9A86]/50 uppercase">
                    {lang === "bg" ? "Обхват на мисията" : "Mission scope"}
                  </span>
                  <div className="h-px flex-1 bg-[#8A9A86]/10" />
                </div>
                <div className="grid gap-0 sm:grid-cols-2">
                  {meta.activities.map((act, i) => (
                    <div
                      key={i}
                      className="sd-row flex items-baseline gap-4 py-3.5 px-4"
                      style={{ borderBottom: "1px solid rgba(138,154,134,0.08)", background: i % 2 === 0 ? "rgba(138,154,134,0.02)" : "transparent" }}
                    >
                      <span className="flex-shrink-0 font-mono text-[11px] text-[#8A9A86]/35">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-sm leading-snug text-[#F5F3EF]/75">{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gallery */}
              {galleryImages.length > 0 && (
                <div className="flex gap-2 pb-24">
                  {galleryImages.map((src, i) => (
                    <div key={i} className="sd-row relative h-32 flex-1 cursor-pointer overflow-hidden" style={{ border: "1px solid rgba(138,154,134,0.15)" }} onClick={() => setLightboxSrc(src)}>
                      <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 transition-opacity hover:opacity-100" style={{ filter: "hue-rotate(160deg) saturate(1.2)" }} />
                    </div>
                  ))}
                </div>
              )}
              {galleryImages.length === 0 && <div className="h-24" />}
            </div>
          </div>
        </div>
      )
    }

    // ── Layout 2 — Bathymetry — SCIENTIFIC DATA REPORT ───────────────────────
    if (svcIdx === 2) {
      return (
        <div className="animate-bsdc-panel-in fixed inset-0 z-[500] flex flex-col overflow-hidden pointer-events-auto" style={{ background: "#0F1411" }}>
          {CloseBtn}{BackBtn}

          {/* BANNER — sonar grid + rings, image faint background */}
          <div className="relative flex-shrink-0 overflow-hidden" style={{ height: "34vh" }}>
            {imgSrc
              ? <img src={imgSrc} alt={svc.title} className="sd-image absolute inset-0 h-full w-full object-cover object-top" style={{ filter: "brightness(0.4) saturate(0.5)" }} />
              : <div className="absolute inset-0 bg-[#0F1411]" />
            }
            <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(138,154,134,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(138,154,134,0.06) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              {[80, 160, 240, 320].map((r, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: r * 2,
                    height: r * 2,
                    border: `1px solid rgba(138,154,134,${0.14 - i * 0.03})`,
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 20%, #0F1411 100%)" }} />
            <div className="absolute bottom-0 left-0 right-0 px-10 pb-8 lg:px-16">
              <div className="sd-eyebrow mb-2 flex items-center gap-3">
                <div className="h-px w-8 bg-[#8A9A86]" />
                <span className="font-mono text-[10px] tracking-[0.4em] text-[#8A9A86]">
                  {lang === "bg" ? "ХИДРОГРАФСКИ ОТДЕЛ" : "HYDROGRAPHIC DIVISION"}
                </span>
              </div>
              <h2 className="sd-title text-4xl font-light leading-none text-white lg:text-5xl">{svc.title}</h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <div className="px-10 pt-8 pb-20 lg:px-16">
              <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">

                <div className="lg:w-[45%]">
                  {svc.content && (
                    <div
                      className="sd-desc mb-8 text-sm leading-[1.9] text-[#F5F3EF]/55 [&_p]:mb-4"
                      dangerouslySetInnerHTML={{ __html: svc.content }}
                    />
                  )}
                  <table className="w-full text-sm">
                    <tbody>
                      {meta.cards.map((card, i) => (
                        <tr key={i} className="sd-stat" style={{ borderBottom: "1px solid rgba(138,154,134,0.1)" }}>
                          <td className="py-3 font-light text-white/70 w-1/2">{card.title}</td>
                          <td className="py-3 font-mono font-light text-right" style={{ color: "#8A9A86" }}>{card.value}</td>
                          <td className="py-3 pl-3 text-xs text-[#F5F3EF]/40">{card.sub}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="font-mono text-[10px] tracking-[0.4em] text-[#8A9A86]/60 uppercase">
                      {lang === "bg" ? "Обхват на услугата" : "Service scope"}
                    </span>
                    <div className="h-px flex-1 bg-[#8A9A86]/15" />
                  </div>
                  <div className="flex flex-col gap-1">
                    {meta.activities.map((act, i) => (
                      <div key={i} className="sd-row flex gap-5 py-3.5" style={{ borderBottom: "1px solid rgba(138,154,134,0.08)" }}>
                        <div className="w-6 flex-shrink-0 font-mono text-xs text-[#8A9A86]/35 pt-0.5">{String(i + 1).padStart(2, "0")}</div>
                        <div className="text-sm leading-snug text-[#F5F3EF]/75">{act}</div>
                      </div>
                    ))}
                  </div>
                  {galleryImages.length > 0 && (
                    <div className="mt-6 flex gap-2">
                      {galleryImages.map((src, i) => (
                        <div key={i} className="sd-row relative h-36 flex-1 cursor-pointer overflow-hidden" style={{ border: "1px solid rgba(138,154,134,0.15)" }} onClick={() => setLightboxSrc(src)}>
                          <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-65 transition-opacity hover:opacity-100" style={{ filter: "saturate(0.5) hue-rotate(180deg)" }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // ── Layout 3 — Dam Operations — ATMOSPHERIC GLASSMORPHISM ────────────────
    if (svcIdx === 3) {
      return (
        <div className="animate-bsdc-panel-in fixed inset-0 z-[500] overflow-hidden pointer-events-auto" style={{ background: "#0F1411" }}>
          {CloseBtn}{BackBtn}

          {imgSrc && (
            <div className="absolute inset-0">
              <img src={imgSrc} alt="" className="sd-image h-full w-full object-cover object-center" style={{ filter: "brightness(0.22) saturate(0.45)" }} />
            </div>
          )}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 60% 40%, rgba(138,154,134,0.12) 0%, transparent 60%), linear-gradient(to bottom, rgba(15,20,17,0.7) 0%, rgba(15,20,17,0.25) 50%, rgba(15,20,17,0.85) 100%)" }} />

          <div className="absolute inset-0 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <div className="flex min-h-full flex-col justify-center px-8 py-14 lg:px-16">

              <div className="sd-eyebrow mb-4 flex items-center gap-3">
                <div className="h-px w-8 bg-[#8A9A86]" />
                <span className="text-[10px] uppercase tracking-[0.45em] text-[#8A9A86]">
                  {lang === "bg" ? "Управление · Експлоатация" : "Operations · Management"}
                </span>
              </div>

              <h2 className="sd-title mb-10 max-w-2xl text-5xl font-light leading-[1.0] tracking-tight text-white lg:text-6xl">
                {svc.title}
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
                {meta.activities.map((act, i) => (
                  <div key={i} className="sd-card p-5 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
                    <div className="mb-3 font-mono text-xs" style={{ color: "#8A9A86" }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <p className="text-sm leading-snug text-white/85">{act}</p>
                  </div>
                ))}
              </div>

              {svc.content && (
                <div
                  className="sd-desc mb-8 p-7 text-sm leading-[1.85] text-[#F5F3EF]/75 backdrop-blur-sm [&_p]:mb-3"
                  style={{ background: "rgba(15,20,17,0.6)", border: "1px solid rgba(255,255,255,0.06)", maxWidth: "52rem" }}
                  dangerouslySetInnerHTML={{ __html: svc.content }}
                />
              )}

              <div className="flex flex-wrap gap-4 mb-10">
                {meta.cards.map((card, i) => (
                  <div key={i} className="sd-stat flex-1 min-w-[140px] p-5 backdrop-blur-sm" style={{ background: "rgba(138,154,134,0.07)", border: "1px solid rgba(138,154,134,0.22)" }}>
                    <div className="font-mono text-3xl font-light text-white">{card.value}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-wider" style={{ color: "#8A9A86" }}>{card.title}</div>
                    <div className="text-[10px] text-[#F5F3EF]/40">{card.sub}</div>
                  </div>
                ))}
              </div>

              {galleryImages.length > 0 && (
                <div className="flex gap-3 pb-24">
                  {galleryImages.map((src, i) => (
                    <div key={i} className="sd-row relative h-44 flex-1 cursor-pointer overflow-hidden backdrop-blur-sm" style={{ border: "1px solid rgba(255,255,255,0.07)" }} onClick={() => setLightboxSrc(src)}>
                      <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 transition-opacity hover:opacity-100" />
                    </div>
                  ))}
                </div>
              )}
              {galleryImages.length === 0 && <div className="h-24" />}
            </div>
          </div>
        </div>
      )
    }

    // ── Layout 4 — Construction — BLUEPRINT / TECHNICAL DOSSIER ──────────────
    if (svcIdx === 4) {
      return (
        <div className="animate-bsdc-panel-in fixed inset-0 z-[500] flex flex-col overflow-hidden pointer-events-auto" style={{ background: "#0F1411" }}>
          {CloseBtn}{BackBtn}

          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(245,243,239,0.1) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.7) 100%)" }} />

          <div className="relative flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <div className="px-10 pt-14 pb-24 lg:px-16">

              <div className="flex flex-col gap-8 mb-12 lg:flex-row lg:items-start lg:gap-12">
                <div className="lg:flex-1">
                  <div className="sd-eyebrow mb-3 flex items-center gap-3">
                    <div className="h-px w-8 bg-[#F5F3EF]/60" />
                    <span className="font-mono text-[10px] tracking-[0.45em] text-[#F5F3EF]/60 uppercase">
                      {lang === "bg" ? "Строителство · СМР" : "Civil & Maritime Works"}
                    </span>
                  </div>
                  <h2 className="sd-title mb-5 text-4xl font-light leading-[1.0] text-white lg:text-5xl">{svc.title}</h2>
                  {svc.content && (
                    <div
                      className="sd-desc text-sm leading-[1.85] text-[#F5F3EF]/55 [&_p]:mb-3"
                      dangerouslySetInnerHTML={{ __html: svc.content }}
                    />
                  )}
                </div>
                {imgSrc && (
                  <div className="relative h-64 w-full overflow-hidden lg:h-72 lg:w-[38%] lg:flex-shrink-0" style={{ transform: "rotate(-1.5deg)", border: "1px solid rgba(245,243,239,0.2)", boxShadow: "8px 8px 0 rgba(15,20,17,0.4)" }}>
                    <img src={imgSrc} alt={svc.title} className="sd-image h-full w-full object-cover" style={{ filter: "brightness(0.75) saturate(0.7)" }} />
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2" style={{ background: "rgba(0,0,0,0.7)" }}>
                      <span className="font-mono text-[9px] tracking-widest text-[#F5F3EF]/70 uppercase">
                        {lang === "bg" ? "Снимка от обект" : "Site photograph"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-10">
                <div className="mb-5 flex items-center gap-4">
                  <span className="font-mono text-[10px] tracking-[0.4em] text-[#F5F3EF]/60 uppercase">
                    {lang === "bg" ? "Технически обхват" : "Technical scope"}
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {meta.activities.map((act, i) => (
                    <div key={i} className="sd-card flex items-start gap-4 px-5 py-4" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderLeft: "3px solid rgba(245,243,239,0.35)" }}>
                      <span className="flex-shrink-0 font-mono text-[11px] text-[#F5F3EF]/40 w-7">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-sm leading-snug text-[#F5F3EF]/75">{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-10 flex flex-wrap gap-0">
                {meta.cards.map((card, i) => (
                  <div key={i} className="sd-stat flex-1 min-w-[150px] px-6 py-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRight: i < meta.cards.length - 1 ? "none" : undefined }}>
                    <div className="font-mono text-3xl font-light text-white">{card.value}</div>
                    <div className="mt-1 text-xs uppercase tracking-wider text-[#F5F3EF]/70">{card.title}</div>
                    <div className="text-[10px] text-[#F5F3EF]/30">{card.sub}</div>
                  </div>
                ))}
              </div>

              {galleryImages.length > 0 && (
                <div className="flex gap-2">
                  {galleryImages.map((src, i) => (
                    <div key={i} className="sd-row relative h-40 flex-1 cursor-pointer overflow-hidden" style={{ border: "1px solid rgba(245,243,239,0.15)" }} onClick={() => setLightboxSrc(src)}>
                      <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-65 transition-opacity hover:opacity-100" style={{ filter: "saturate(0.6)" }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    // ── Layout 5 — Courses — ADVENTURE POSTER ─────────────────────────────────
    {
      const col = "#8A9A86"
      return (
        <div className="animate-bsdc-panel-in fixed inset-0 z-[500] flex flex-col overflow-hidden pointer-events-auto" style={{ background: "#0F1411" }}>
          {CloseBtn}{BackBtn}

          {/* POSTER HEADER */}
          <div className="relative flex-shrink-0 overflow-hidden" style={{ height: "38vh", minHeight: 240 }}>
            {imgSrc
              ? <img src={imgSrc} alt={svc.title} className="sd-image absolute inset-0 h-full w-full object-cover object-center" />
              : <div className="absolute inset-0 bg-[#0F1411]" />
            }
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0F1411 0%, rgba(15,20,17,0.6) 40%, rgba(15,20,17,0.2) 70%, transparent 100%)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(15,20,17,0.8) 0%, transparent 50%)" }} />
            <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "linear-gradient(to right, #8A9A86, #8A9A86, transparent)" }} />
            <div className="absolute bottom-0 left-0 right-0 px-10 pb-10 lg:px-16">
              <div className="sd-eyebrow mb-3 flex items-center gap-3">
                <div className="h-px w-8 bg-[#8A9A86]" />
                <span className="text-[10px] uppercase tracking-[0.45em] text-[#8A9A86]">
                  {lang === "bg" ? "Обучение · Сертификация" : "Training · Certification"}
                </span>
              </div>
              <h2 className="sd-title mb-2 text-4xl font-light leading-[1.0] text-white lg:text-6xl">{svc.title}</h2>
              {svc.shortDescription && (
                <p className="max-w-xl text-base text-[#F5F3EF]/70">{svc.shortDescription}</p>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <div className="px-10 pt-10 pb-24 lg:px-16">
              {svc.content && (
                <div
                  className="sd-desc mb-10 max-w-3xl text-sm leading-[1.9] text-[#F5F3EF]/55 [&_p]:mb-3"
                  dangerouslySetInnerHTML={{ __html: svc.content }}
                />
              )}
              <div className="mb-8">
                <div className="mb-5 flex items-center gap-4">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-[#8A9A86]/70">
                    {lang === "bg" ? "Модули на обучението" : "Training modules"}
                  </span>
                  <div className="h-px flex-1" style={{ background: "rgba(138,154,134,0.2)" }} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {meta.activities.map((act, i) => {
                    return (
                      <div key={i} className="sd-card group relative overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-0.5" style={{ background: `${col}0c`, border: `1px solid ${col}28` }}>
                        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(to right, ${col}, transparent)` }} />
                        <div className="mb-3 font-mono text-xs" style={{ color: col }}>{String(i + 1).padStart(2, "0")}</div>
                        <p className="text-sm leading-snug text-white/85">{act}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {meta.cards.map((card, i) => (
                  <div key={i} className="sd-stat p-5" style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.18)" }}>
                    <div className="font-mono text-4xl font-light text-white">{card.value}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-wider text-[#8A9A86]/80">{card.title}</div>
                    <div className="text-[10px] text-[#F5F3EF]/40">{card.sub}</div>
                  </div>
                ))}
              </div>
              {galleryImages.length > 0 && (
                <div className="flex gap-2">
                  {galleryImages.map((src, i) => (
                    <div key={i} className="sd-row relative h-44 flex-1 cursor-pointer overflow-hidden" style={{ border: "1px solid rgba(138,154,134,0.12)" }} onClick={() => setLightboxSrc(src)}>
                      <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 transition-opacity hover:opacity-100" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Main scene container ─────────────────────────────────────────── */}
      <div ref={rootRef} className="fixed inset-0 overflow-hidden bg-[#0F1411]">

        <GlobalBackground />

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <SceneHero
          active={currentScene === 0}
          data={home}
          lang={lang}
          heroRef={heroRef}
        />

        {/* ── ABOUT ────────────────────────────────────────────────────────── */}
        <SceneAbout
          aboutRef={aboutRef}
          aboutScrollRef={aboutScrollRef}
          about={about}
          aboutStats={aboutStats}
          whyUsSection={whyUsSection}
          whyUsItems={whyUsItems}
          timelineSection={timelineSection}
          timelineItems={timelineItems}
          certificates={certificates}
          lang={lang}
        />

        {/* ── SERVICES — Mission Control ───────────────────────────────────── */}
        <SceneServices
          servicesRef={servicesRef}
          innerGroupRef={innerGroupRef}
          services={services}
          activeIdx={activeIdx}
          activeIdxRef={activeIdxRef}
          scrollPos={scrollPos}
          scrollPosRef={scrollPosRef}
          scrollVelRef={scrollVelRef}
          rafIdRef={rafIdRef}
          lang={lang}
          setActiveService={setActiveService}
          setActiveIdx={setActiveIdx}
          setScrollPos={setScrollPos}
          setExpandedAct={setExpandedAct}
        />

        {/* ── PROJECTS ─────────────────────────────────────────────────────── */}
        <SceneProjects
          projectsRef={projectsRef}
          carouselContainerRef={carouselContainerRef}
          filteredProjects={filteredProjects}
          uniqueCategories={uniqueCategories}
          projActiveIndex={projActiveIndex}
          projectFilter={projectFilter}
          categoryFilter={categoryFilter}
          dragProgress={dragProgress}
          activeProgress={activeProgress}
          lang={lang}
          setProjectFilter={setProjectFilter}
          setCategoryFilter={setCategoryFilter}
          setSelectedProject={setSelectedProject}
          handleCarouselPointerDown={handleCarouselPointerDown}
          handleCarouselPointerMove={handleCarouselPointerMove}
          handleCarouselPointerUp={handleCarouselPointerUp}
          handleCarouselPointerLeave={handleCarouselPointerLeave}
        />

        {/* ── CONTACT ──────────────────────────────────────────────────────── */}
        <SceneContact
          contactRef={contactRef}
          settings={settings}
          services={services}
          partners={partners}
          tickerPartners={tickerPartners}
          contactStatus={contactStatus}
          lang={lang}
          goToScene={goToScene}
          submitContact={submitContact}
        />

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
                  backgroundColor: i === currentScene ? "#8A9A86" : "rgba(255,255,255,0.2)",
                }}
              />
            </button>
          ))}
        </div>

        {/* Scene counter */}
        <div className="fixed bottom-8 left-8 z-50 flex items-baseline gap-1.5">
          <span className="text-lg font-light text-white">{String(currentScene + 1).padStart(2, "0")}</span>
          <span className="text-xs text-white/20">/</span>
          <span className="text-xs text-white/30">{String(totalScenes).padStart(2, "0")}</span>
        </div>

      </div>

      {/* ── SERVICE DETAIL — outside rootRef so fixed positioning works ─────── */}
      {activeService && renderServiceDetail(activeService, activeIdx)}

      {/* ── PROJECT MODAL ──────────────────────────────────────────────────── */}
      {selectedProject && (
        <>
          {/* Close button — fixed, outside modal div so it's always on top */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); closeModal() }}
            aria-label="Затвори"
            className="fixed top-6 right-8 z-[1001] flex items-center gap-2 cursor-pointer transition-colors duration-200 pointer-events-auto"
            style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.6)', background: 'rgba(138,154,134,0.1)', border: '1px solid rgba(138,154,134,0.3)', padding: '10px 18px' }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path d="M10 1L1 10M1 1l9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span>ЗАТВОРИ</span>
          </button>

          {/* Cinematic dim overlay — no blur, projects stay sharp */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999,
              background: 'rgba(15,20,17,0.22)',
              pointerEvents: 'none',
            }}
          />

          {/* Modal panel — slides up from bottom via GSAP */}
          <div
            ref={modalRef}
            className={`fixed inset-0 z-[1000] will-change-transform${isClosing ? ' transition-[opacity,transform] duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] opacity-0 -translate-y-full pointer-events-none' : ''}`}
            style={{ transform: isClosing ? undefined : 'translateY(100vh)', width: '100vw', height: '100vh', top: 0, left: 0 }}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div
              ref={modalScrollRef}
              className="w-full h-full overflow-y-auto overflow-x-hidden will-change-transform subpixel-antialiased"
              style={{ overscrollBehavior: 'contain', touchAction: 'pan-y', pointerEvents: 'auto' }}
            >
              <div ref={modalContentRef} className="bg-[#0F1411]">

              {/* ── SCENE 1: HERO ── */}
              <div className="modal-hero" style={{ position: 'relative', height: '140vh' }}>
                <img
                  ref={heroImgRef}
                  src={selectedProject.featuredImageUrl ?? ''}
                  alt=""
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transformOrigin: 'center center' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0F1411 0%, rgba(15,20,17,0.3) 50%, transparent 100%)' }} />
                <div
                  className="modal-hero-content"
                  style={{ position: 'sticky', top: 'calc(100vh - 160px)', left: 0, right: 0, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', pointerEvents: 'none', padding: '0 64px 48px 64px', zIndex: 10 }}
                >
                  <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 4.5rem)', fontWeight: 300, color: 'white', lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0, maxWidth: '55%' }}>
                    {selectedProject.location || selectedProject.title}
                  </h1>
                  <div style={{ display: 'flex', flexDirection: 'row', gap: '48px', alignItems: 'flex-end', paddingBottom: '6px' }}>
                    <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
                      {selectedProject.category || selectedProject.type}
                    </span>
                    <span style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)', maxWidth: '320px', lineHeight: 1.6 }}>
                      {selectedProject.location ? selectedProject.title : selectedProject.excerpt}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── SCENE 2: CONTENT — cream bg transitions to dark ── */}
              <div className="modal-scene-2 relative" style={{ paddingTop: '100px', paddingBottom: '120px', background: '#E8E0D5' }}>
                {/* Dark overlay — GSAP fades this in as you scroll */}
                <div className="modal-scene-2-bg absolute inset-0" style={{ background: '#0F1411', opacity: 0 }} />
                <div className="relative max-w-7xl mx-auto" style={{ zIndex: 1, padding: '0 64px', display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '80px', alignItems: 'start' }}>

                  {/* LEFT: featured image, always visible */}
                  <div>
                    {selectedProject.featuredImageUrl && (
                      <img
                        src={selectedProject.featuredImageUrl}
                        alt=""
                        style={{ width: '100%', height: '600px', objectFit: 'cover', display: 'block' }}
                      />
                    )}
                  </div>

                  {/* RIGHT: article + specs — fades in at 60% */}
                  <div className="modal-scene-2-text" style={{ opacity: 0, display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    <div
                      className="modal-article"
                      style={{ fontSize: '16px', color: 'rgba(255,255,255,0.72)', lineHeight: '1.8', letterSpacing: '0.01em' }}
                      dangerouslySetInnerHTML={{ __html: selectedProject.content ?? '' }}
                    />

                    {/* Equipment + Activities 2-col grid */}
                    {((selectedProject.equipmentUsed ?? []).length > 0 || (selectedProject.activitiesDone ?? []).length > 0) && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 48px' }}>
                        {(selectedProject.equipmentUsed ?? []).length > 0 && (
                          <div>
                            <p style={{ color: '#8A9A86', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', margin: '0 0 16px 0', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>ОБОРУДВАНЕ</p>
                            {(selectedProject.equipmentUsed ?? []).map((item: string, i: number) => (
                              <div key={i} style={{ display: 'flex', gap: '16px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', fontFamily: 'monospace', minWidth: '24px', flexShrink: 0 }}>{String(i+1).padStart(2,'0')}</span>
                                <span style={{ color: 'rgba(255,255,255,0.82)', fontSize: '13px', lineHeight: 1.5 }}>{item}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {(selectedProject.activitiesDone ?? []).length > 0 && (
                          <div>
                            <p style={{ color: '#8A9A86', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', margin: '0 0 16px 0', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>ДЕЙНОСТИ</p>
                            {(selectedProject.activitiesDone ?? []).map((item: string, i: number) => (
                              <div key={i} style={{ display: 'flex', gap: '16px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', fontFamily: 'monospace', minWidth: '24px', flexShrink: 0 }}>{String(i+1).padStart(2,'0')}</span>
                                <span style={{ color: 'rgba(255,255,255,0.82)', fontSize: '13px', lineHeight: 1.5 }}>{item}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Location + Client rows */}
                    {(selectedProject.location || selectedProject.client) && (
                      <div>
                        {selectedProject.location && (
                          <div style={{ display: 'flex', gap: '48px', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <span style={{ color: '#8A9A86', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', minWidth: '130px', flexShrink: 0 }}>ЛОКАЦИЯ</span>
                            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>{selectedProject.location}</span>
                          </div>
                        )}
                        {selectedProject.client && (
                          <div style={{ display: 'flex', gap: '48px', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <span style={{ color: '#8A9A86', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', minWidth: '130px', flexShrink: 0 }}>ВЪЗЛОЖИТЕЛ</span>
                            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>{selectedProject.client}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── SCENE 3: GALLERY — featured image darkens, gallery image reveals ── */}
              <div ref={galleryWrapperRef} className="relative" style={{ height: '260vh' }}>
                <div className="sticky top-0 h-screen overflow-hidden">
                  {/* Layer 1: featured image (always visible as base) */}
                  <img
                    src={selectedProject.featuredImageUrl ?? ''}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Layer 2: dark overlay — fades in to 0.88 as you scroll */}
                  <div className="modal-gallery-bg absolute inset-0" style={{ background: '#000', opacity: 0 }} />
                  {/* Layer 3: gallery image — slides up from below */}
                  <div
                    className="modal-gallery-img"
                    style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', transform: 'translateY(100%)' }}
                  >
                    {displayedGalleryImg && (
                      <img
                        src={displayedGalleryImg}
                        alt=""
                        style={{ maxWidth: '70%', maxHeight: '70vh', objectFit: 'contain', boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}
                      />
                    )}
                  </div>
                  {/* Layer 4: controls overlay */}
                  <div className="modal-gallery-content absolute inset-0 flex flex-col justify-between" style={{ padding: '64px', opacity: 0 }}>
                    <div />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '0.25em' }}>
                        {String((galleryIndex ?? 0) + 1).padStart(2,'0')} / {String((selectedProject.images ?? []).length || 1).padStart(2,'0')}
                      </span>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          type="button"
                          aria-label="Предишна снимка"
                          onClick={() => {
                            const imgs = selectedProject.images ?? []
                            const ni = ((galleryIndex ?? 0) - 1 + imgs.length) % imgs.length
                            setGalleryIndex(ni)
                            setDisplayedGalleryImg(imgs[ni] ?? null)
                          }}
                          style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-label="Следваща снимка"
                          onClick={() => {
                            const imgs = selectedProject.images ?? []
                            const ni = ((galleryIndex ?? 0) + 1) % imgs.length
                            setGalleryIndex(ni)
                            setDisplayedGalleryImg(imgs[ni] ?? null)
                          }}
                          style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SCENE 4: RELATED PROJECTS ── */}
              <div className="modal-scene-4" style={{ opacity: 0, background: '#0F1411', minHeight: '100vh', padding: '120px 64px' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '80px', alignItems: 'start' }}>

                  {/* Sidebar: label + pagination */}
                  <div>
                    <p style={{ color: '#8A9A86', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '32px' }}>СВЪРЗАНИ ПРОЕКТИ</p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="button"
                        aria-label="Предишна страница"
                        onClick={() => setRelatedPage(p => Math.max(0, p - 1))}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.2s' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        aria-label="Следваща страница"
                        onClick={() => setRelatedPage(p => p + 1)}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.2s' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* 3-col project cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                    {(projects ?? [])
                      .filter((p: ProjectNewsItem) => p.id !== selectedProject.id)
                      .slice((relatedPage ?? 0) * 3, (relatedPage ?? 0) * 3 + 3)
                      .map((p: ProjectNewsItem) => (
                        <div
                          key={p.id}
                          className="cursor-pointer"
                          onClick={() => { if (modalScrollRef.current) modalScrollRef.current.scrollTop = 0; setSelectedProject(p) }}
                        >
                          {p.featuredImageUrl && (
                            <img
                              src={p.featuredImageUrl}
                              alt={p.title}
                              style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block', marginBottom: '24px' }}
                            />
                          )}
                          <p style={{ color: '#8A9A86', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '12px', fontFamily: 'monospace', margin: '0 0 12px 0' }}>
                            {p.location || p.category}
                          </p>
                          <p style={{ color: 'white', fontSize: '22px', fontWeight: 500, lineHeight: 1.25, margin: 0 }}>
                            {p.title}
                          </p>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>

              </div>{/* end modalContentRef */}

            </div>
          </div>
        </>
      )}

      {/* ── LIGHTBOX — image zoom overlay ─────────────────────────────────── */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[600] flex items-center justify-center bg-black/92 pointer-events-auto"
          onClick={() => setLightboxSrc(null)}
        >
          <img
            src={lightboxSrc}
            alt=""
            className="max-h-[88vh] max-w-[88vw] object-contain"
            style={{ boxShadow: "0 0 80px rgba(0,0,0,0.8)" }}
            onClick={e => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setLightboxSrc(null)}
            className="absolute top-6 right-6 flex h-11 w-11 items-center justify-center border border-white/25 bg-black/70 text-white/70 backdrop-blur-sm transition-all hover:border-white/50 hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.35em] text-white/30">
            {lang === "bg" ? "Клик навсякъде за затваряне" : "Click anywhere to close"}
          </div>
        </div>
      )}

      {/* ── CONTACT MODAL — outside rootRef ──────────────────────────────── */}
      {showContactModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center px-4 pointer-events-auto">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => { setShowContactModal(false); setContactStatus("idle") }}
          />
          <div className="relative z-10 w-full max-w-lg border border-white/[0.08] bg-[#0F1411] p-8">
            <button
              type="button"
              onClick={() => { setShowContactModal(false); setContactStatus("idle") }}
              className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center text-[#F5F3EF]/55 transition-colors hover:text-white"
              style={{ pointerEvents: "auto" }}
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <h3 className="mb-6 text-xl font-light text-white">
              {lang === "bg" ? "Изпратете запитване" : "Send an Enquiry"}
            </h3>
            <form onSubmit={submitContact} className="flex flex-col gap-4">
              <input name="website" type="text" className="hidden" tabIndex={-1} autoComplete="off" />
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="name" type="text" required
                  placeholder={lang === "bg" ? "Вашето име" : "Your name"}
                  className="border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-[#F5F3EF]/30 outline-none transition-colors focus:border-[#8A9A86]/50"
                />
                <input
                  name="email" type="email" required
                  placeholder="Email"
                  className="border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-[#F5F3EF]/30 outline-none transition-colors focus:border-[#8A9A86]/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="phone" type="tel"
                  placeholder={lang === "bg" ? "Телефон" : "Phone"}
                  className="border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-[#F5F3EF]/30 outline-none transition-colors focus:border-[#8A9A86]/50"
                />
                <select
                  name="type"
                  className="border border-white/[0.08] bg-[#0F1411] px-4 py-3 text-sm text-[#F5F3EF]/75 outline-none transition-colors focus:border-[#8A9A86]/50"
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
                className="resize-none border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-[#F5F3EF]/30 outline-none transition-colors focus:border-[#8A9A86]/50"
              />
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={contactStatus === "loading"}
                  className="bg-[#8A9A86] px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#6a7a66] disabled:opacity-60"
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
