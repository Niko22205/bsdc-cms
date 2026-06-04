"use client"

import {
  useEffect,
  useRef,
  useState,
} from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion"
import { MapPin, Phone, Mail, Clock, Shield, Waves, Scan, ClipboardCheck, Layers, Building2, Award } from "lucide-react"
import type {
  HomeContent,
  AboutContent,
  Service,
  Certificate,
  Partner,
  SiteSetting,
  ProjectNewsItem,
} from "@/generated/prisma/client"

import TreasureMap from "./about/TreasureMap"

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
  { accent: "#B87333", bg: "#07111f", activities: [], cards: [] },
  { accent: "#00c8e8", bg: "#040e1a", activities: [], cards: [] },
  { accent: "#38bdf8", bg: "#040c18", activities: [], cards: [] },
  { accent: "#B87333", bg: "#0c0e14", activities: [], cards: [] },
  { accent: "#9ca3af", bg: "#0a0b0d", activities: [], cards: [] },
  { accent: "#60a5fa", bg: "#061020", activities: [], cards: [] },
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

// Why-us icons cycle by index — CMS items may change, icons rotate gracefully
const WHY_US_ICONS = [Shield, Waves, Scan, ClipboardCheck, Layers, Building2]


// ── 3D Cylindrical card ───────────────────────────────────────────────────────

interface ProjectCard3DProps {
  project:        ProjectNewsItem
  index:          number
  totalItems:     number
  activeProgress: MotionValue<number>
  onCardClick:    (index: number) => void
}

function ProjectCard3D({ project, index, totalItems, activeProgress, onCardClick }: ProjectCard3DProps) {
  const DEGREES_PER_CARD = 20.5
  const RADIUS           = -1100

  function wrappedDistance(latest: number): number {
    if (totalItems === 0) return 0
    let d = index - latest
    const half = totalItems / 2
    while (d >  half) d -= totalItems
    while (d <= -half) d += totalItems
    return d
  }

  const transformStr = useTransform(activeProgress, (latest) => {
    if (totalItems === 0) return `rotateY(0deg) translateZ(${RADIUS}px)`
    const d = wrappedDistance(latest)
    return `rotateY(${d * DEGREES_PER_CARD}deg) translateZ(${RADIUS}px)`
  })

  const zIndexVal = useTransform(activeProgress, (latest) =>
    Math.round(1000 - Math.abs(wrappedDistance(latest)) * 100)
  )

  const opacityVal = useTransform(activeProgress, (latest) => {
    const absDist = Math.abs(wrappedDistance(latest))
    if (absDist > 4.6) return 0
    if (absDist > 3.8) return 1 - (absDist - 3.8)
    return 1
  })

  const overlayOpacity = useTransform(activeProgress, (latest) => {
    if (totalItems === 0) return 0
    let d = index - latest
    const half = totalItems / 2
    while (d >  half) d -= totalItems
    while (d <= -half) d += totalItems
    return Math.min(0.35, Math.abs(d) * 0.08)
  })

  return (
    <motion.div
      onClick={() => onCardClick(index)}
      style={{
        position:           "absolute",
        left:               "50%",
        top:                "54%",
        width:              "360px",
        height:             "510px",
        marginLeft:         "-180px",
        marginTop:          "-255px",
        transformStyle:     "preserve-3d",
        transform:          transformStr,
        zIndex:             zIndexVal,
        opacity:            opacityVal,
        backfaceVisibility: "hidden",
        borderRadius:       "20px",
        overflow:           "hidden",
        border:             "1px solid rgba(255,255,255,0.05)",
        boxShadow:          "0 25px 60px -15px rgba(0,0,0,0.9)",
        cursor:             "pointer",
        userSelect:         "none",
      }}
    >
      {/* Ambient depth overlay — centre card: 0% dark, edges: up to 35% */}
      <motion.div
        style={{
          position:       "absolute",
          inset:          0,
          zIndex:         10,
          pointerEvents:  "none",
          background:     "black",
          opacity:        overlayOpacity,
        }}
      />
      {project.featuredImageUrl ? (
        <img
          src={project.featuredImageUrl}
          alt={project.title}
          draggable={false}
          style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#0f172a,#1e3a5f)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "monospace", letterSpacing: "0.1em" }}>
            {project.title}
          </span>
        </div>
      )}
    </motion.div>
  )
}

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

  const { hero: heroStats, about: aboutStats } = parseStats(about?.statistics)

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

      // Scene 2: cream bg fades to dark #040507 at 50% scroll
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



  // Interactive pixel-perfect exit drag — wheel and touch both drive the modal transform directly
  useEffect(() => {
    if (!selectedProject) return
    const scrollContainer = modalScrollRef.current
    if (!scrollContainer) return

    let touchStartYPos = 0
    let isDraggingExit = false

    currentExitRef.current = 0

    const applyExitStyle = (delta: number) => {
      const innerContent = modalContentRef.current
      if (!innerContent) return
      if (delta === 0) {
        innerContent.style.transform = ''
        innerContent.style.opacity = ''
        innerContent.style.transition = ''
      } else {
        innerContent.style.transition = 'none'
        innerContent.style.transform = `translateY(-${delta}px)`
      }
    }

    const snapBack = () => {
      if (rafExitRef.current !== null) { cancelAnimationFrame(rafExitRef.current); rafExitRef.current = null }
      currentExitRef.current = 0
      if (modalContentRef.current) {
        modalContentRef.current.style.transition = 'transform 0.4s cubic-bezier(0.25,1,0.5,1), opacity 0.4s cubic-bezier(0.25,1,0.5,1)'
        modalContentRef.current.style.transform = 'translateY(0)'
        modalContentRef.current.style.opacity = '1'
      }
      exitDeltaRef.current = 0
      isDraggingExit = false
    }

    const startExitRaf = () => {
      if (rafExitRef.current !== null) return
      const tick = () => {
        const target = exitDeltaRef.current
        currentExitRef.current += (target - currentExitRef.current) * 0.18
        if (Math.abs(target - currentExitRef.current) < 0.5) currentExitRef.current = target

        if (currentExitRef.current >= window.innerHeight) {
          rafExitRef.current = null
          exitDeltaRef.current = 0
          currentExitRef.current = 0
          if (gsapCtxRef.current) { gsapCtxRef.current.revert(); gsapCtxRef.current = null }
          additionalScrollRef.current = 0
          setSelectedProject(null)
          setLightboxSrc(null)
          return
        }

        applyExitStyle(currentExitRef.current)
        rafExitRef.current = Math.abs(target - currentExitRef.current) > 0.1
          ? requestAnimationFrame(tick)
          : null
      }
      rafExitRef.current = requestAnimationFrame(tick)
    }

    const handleWheel = (e: WheelEvent) => {
      if (isClosingRef.current) { e.preventDefault(); return }
      const { scrollTop, clientHeight, scrollHeight } = scrollContainer

      // Reverse scroll while mid-drag — shrink the accumulated delta
      if (exitDeltaRef.current > 0 && e.deltaY < 0) {
        e.preventDefault()
        exitDeltaRef.current = Math.max(0, exitDeltaRef.current + e.deltaY)
        if (exitDeltaRef.current <= 0) { snapBack() } else { startExitRaf() }
        return
      }

      // Scroll position is source of truth: only the portion of deltaY that exceeds maxScroll counts
      const maxScroll = scrollHeight - clientHeight
      const overscrollDelta = Math.max(0, e.deltaY - Math.max(0, maxScroll - scrollTop))

      if (e.deltaY <= 0 || overscrollDelta === 0) return
      e.preventDefault()

      exitDeltaRef.current += overscrollDelta
      startExitRaf()
    }

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYPos = e.touches[0].clientY
      isDraggingExit = false
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isClosingRef.current) { e.preventDefault(); return }
      const { scrollTop, clientHeight, scrollHeight } = scrollContainer
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 30
      const swipeUp = touchStartYPos - e.touches[0].clientY

      if (!isAtBottom && exitDeltaRef.current === 0) return

      if (swipeUp > 0) {
        e.preventDefault()
        isDraggingExit = true
        exitDeltaRef.current = Math.max(0, swipeUp)
        startExitRaf()
      } else if (isDraggingExit) {
        e.preventDefault()
        exitDeltaRef.current = Math.max(0, swipeUp)
        if (exitDeltaRef.current <= 0) { snapBack() } else { startExitRaf() }
      }
    }

    const handleTouchEnd = () => {
      if (!isDraggingExit) return
      const totalHeight = window.innerHeight
      if (exitDeltaRef.current >= totalHeight * 0.5) {
        exitDeltaRef.current = 0
        closeModalRef.current()
      } else {
        snapBack()
      }
    }

    scrollContainer.addEventListener('wheel', handleWheel, { passive: false })
    scrollContainer.addEventListener('touchstart', handleTouchStart, { passive: true })
    scrollContainer.addEventListener('touchmove', handleTouchMove, { passive: false })
    scrollContainer.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      if (rafExitRef.current !== null) { cancelAnimationFrame(rafExitRef.current); rafExitRef.current = null }
      scrollContainer.removeEventListener('wheel', handleWheel)
      scrollContainer.removeEventListener('touchstart', handleTouchStart)
      scrollContainer.removeEventListener('touchmove', handleTouchMove)
      scrollContainer.removeEventListener('touchend', handleTouchEnd)
    }
  }, [selectedProject]) // eslint-disable-line react-hooks/exhaustive-deps

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

    // After sd-image entrance ends (~1.2s), clear GSAP inline transform so
    // CSS animations (dam-drift) can take over without being blocked by inline style
    tl.call(() => gsap.set('.sd-image', { clearProps: 'transform' }), [], 1.25)

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
      gsap.fromTo(".about-eyebrow",    { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, delay })
      gsap.fromTo(".about-title",      { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, delay: delay + 0.1 })
      gsap.fromTo(".about-text",       { y: 30,  opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay: delay + 0.2 })
      gsap.fromTo(".about-image",      { x: 80,  opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, delay: delay + 0.1 })
      gsap.fromTo(".about-stats",      { y: 20,  opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: delay + 0.3 })
      // Expedition map path draw
      gsap.fromTo(".about-map-path",
        { attr: { strokeDashoffset: "1000" } },
        { attr: { strokeDashoffset: "0" }, duration: 2.8, ease: "power2.inOut", delay: delay + 0.3 },
      )
      // Markers staggered after path starts drawing
      gsap.fromTo(".about-map-marker",
        { opacity: 0 },
        { opacity: 1, duration: 0.45, stagger: 0.32, ease: "power2.out", delay: delay + 0.8 },
      )

      // Counter animation for about-specific stats
      aboutRef.current?.querySelectorAll("[data-stat-value]").forEach((statEl) => {
        const raw = statEl.getAttribute("data-stat-value") ?? ""
        if (raw === "24/7") return
        const suffix = raw.includes("+") ? "+" : raw.includes("м") ? "м" : ""
        const num = parseInt(raw.replace(/\D/g, ""))
        if (isNaN(num)) return
        const counter = { val: num > 50 ? num - 10 : 0 }
        gsap.to(counter, {
          val: num,
          duration: 2,
          delay: delay + 0.4,
          ease: "power2.out",
          onUpdate() { statEl.textContent = Math.round(counter.val) + suffix },
        })
      })
    }

    if (sceneIndex === 2) {
      if (servicesEntranceFired.current) return
      servicesEntranceFired.current = true
      gsap.fromTo(".services-menu", { x: -100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, delay: delay + 0.4 })
    }

    if (sceneIndex === 3) {
      gsap.fromTo(".arc-header", { y: 22, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.07, duration: 0.65, delay: delay + 0.1, ease: "power3.out" })
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
    }

    const current = currentSceneRef.current
    if (isAnimating.current) return
    if (next < 0 || next >= totalScenes) return
    if (next === current) return

    if (current === 1) aboutEntranceFired.current = false
    if (current === 2) {
      servicesEntranceFired.current = false
      activeIdxRef.current = 0
      setActiveIdx(0)
      scrollPosRef.current = 0
      scrollVelRef.current = 0
      setScrollPos(0)
      if (rafIdRef.current) { cancelAnimationFrame(rafIdRef.current); rafIdRef.current = null }
    }
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

    // Reset next scene's animated elements to hidden BEFORE dissolve starts
    if (next === 1) {
      gsap.set('.about-eyebrow,.about-title,.about-text,.about-image,.about-stats', { opacity: 0, y: 20, x: 0 })
      aboutScrollRef.current?.scrollTo({ top: 0 })
    }
    if (next === 2) {
      gsap.set('.services-menu', { opacity: 0, x: -100 })
    }
    if (next === 3) gsap.set('.arc-header', { opacity: 0, y: 22 })
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

    // Set initial z-index
    sceneRefs.forEach((ref, i) => {
      if (ref.current) ref.current.style.zIndex = i === 0 ? '10' : '1'
    })

    // GSAP owns initial hidden state for non-hero animated elements
    gsap.set('.about-eyebrow, .about-title, .about-text, .about-image, .about-stats', { opacity: 0, y: 20 })
    gsap.set('.services-menu', { opacity: 0, x: -100 })
    gsap.set('.arc-header', { opacity: 0, y: 22 })
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


  // ── Event listeners ───────────────────────────────────────────────────────

  useEffect(() => {
    function handleWheel(e: WheelEvent) {
      if (selectedProjectRef.current) return
      if (activeServiceRef.current) return
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

      // On Services scene: left panel scrolls scenes, right panel scrolls services only
      if (currentSceneRef.current === 2) {
        const isDesktop   = window.innerWidth >= 768
        const onRightPanel = isDesktop && e.clientX >= window.innerWidth * 0.44

        if (onRightPanel) {
          // Physics scroll — accumulate velocity, RAF loop handles position
          scrollVelRef.current += e.deltaY * 0.00035
          scrollVelRef.current = Math.max(-0.05, Math.min(0.05, scrollVelRef.current))
          if (!rafIdRef.current) {
            const svcCount = services.length
            const animate = () => {
              scrollVelRef.current *= 0.955
              scrollPosRef.current = Math.max(0, Math.min(svcCount - 1, scrollPosRef.current + scrollVelRef.current))
              const rounded = Math.round(scrollPosRef.current)
              if (rounded !== activeIdxRef.current) {
                activeIdxRef.current = rounded
                setActiveIdx(rounded)
              }
              setScrollPos(scrollPosRef.current)
              if (Math.abs(scrollVelRef.current) > 0.002) {
                rafIdRef.current = requestAnimationFrame(animate)
              } else {
                scrollVelRef.current = 0
                rafIdRef.current = null
              }
            }
            rafIdRef.current = requestAnimationFrame(animate)
          }
          return
        }

        if (!isDesktop) {
          // Mobile — keep discrete nav with scene exit at boundaries
          if (e.deltaY > 30) {
            if (activeIdxRef.current === services.length - 1) goToScene(3)
            else {
              const n = activeIdxRef.current + 1
              activeIdxRef.current = n
              setActiveIdx(n)
              scrollPosRef.current = n
              setScrollPos(n)
            }
            return
          } else if (e.deltaY < -30) {
            if (activeIdxRef.current === 0) goToScene(1)
            else {
              const n = activeIdxRef.current - 1
              activeIdxRef.current = n
              setActiveIdx(n)
              scrollPosRef.current = n
              setScrollPos(n)
            }
            return
          }
        }

        // Left panel on desktop — fall through to global scene navigation below
      }

      if (e.deltaY > 50)  goToScene(currentSceneRef.current + 1)
      else if (e.deltaY < -50) goToScene(currentSceneRef.current - 1)
    }
    function handleTouchStart(e: TouchEvent) { touchStartY.current = e.touches[0].clientY }
    function handleTouchEnd(e: TouchEvent) {
      if (activeServiceRef.current) return
      if (selectedProjectRef.current) { setSelectedProject(null); return }
      const delta = touchStartY.current - e.changedTouches[0].clientY
      if (currentSceneRef.current === 2) {
        if (delta > 50) {
          if (activeIdxRef.current === services.length - 1) goToScene(3)
          else { const n = activeIdxRef.current + 1; activeIdxRef.current = n; setActiveIdx(n); scrollPosRef.current = n; setScrollPos(n) }
        } else if (delta < -50) {
          if (activeIdxRef.current === 0) goToScene(1)
          else { const n = activeIdxRef.current - 1; activeIdxRef.current = n; setActiveIdx(n); scrollPosRef.current = n; setScrollPos(n) }
        }
        return
      }
      if (delta > 50) goToScene(currentSceneRef.current + 1)
      else if (delta < -50) goToScene(currentSceneRef.current - 1)
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (activeServiceRef.current) {
          setActiveService(null)
        }
        if (selectedProjectRef.current) {
          setSelectedProject(null)
          return
        }
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

    handleWheelRef.current = handleWheel
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
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
        className="fixed right-8 bottom-8 z-[510] flex h-12 w-12 cursor-pointer items-center justify-center border border-white/25 bg-black/70 text-white/70 backdrop-blur-sm transition-all hover:border-white/50 hover:bg-black/90 hover:text-white"
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
        <div className="animate-bsdc-panel-in fixed inset-0 z-[500] flex overflow-hidden pointer-events-auto" style={{ background: "#07111f" }}>
          {CloseBtn}{BackBtn}

          {/* LEFT — full-height atmospheric image */}
          <div className="relative hidden w-[45%] flex-shrink-0 md:block">
            {imgSrc
              ? <img src={imgSrc} alt={svc.title} className="sd-image absolute inset-0 h-full w-full object-cover object-center" style={{ filter: "brightness(0.45) saturate(0.7)" }} />
              : <div className="absolute inset-0 bg-[#030a14]" />
            }
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 60%, #07111f 100%)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.7) 100%)" }} />
            <div className="absolute bottom-0 left-0 top-0 w-[3px]" style={{ background: "linear-gradient(to bottom, transparent, #B87333, transparent)" }} />
            <div className="absolute bottom-14 left-8 font-mono text-[10px] tracking-[0.35em] text-[#B87333]/50 uppercase">BSDC · {lang === "bg" ? "ОТ 2001" : "SINCE 2001"}</div>
          </div>

          {/* RIGHT — content panel, scrollable */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <div className="flex min-h-full flex-col px-10 py-14 lg:px-16 lg:py-20">

              <div className="sd-eyebrow mb-5 flex items-center gap-3">
                <div className="h-px w-10 bg-[#B87333]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.45em] text-[#B87333]">
                  {lang === "bg" ? "Индустриален водолазен отдел" : "Industrial Diving Division"}
                </span>
              </div>

              <h2 className="sd-title mb-8 text-4xl font-black leading-[1.0] tracking-tight text-white lg:text-5xl">
                {svc.title}
              </h2>

              {svc.content && (
                <div
                  className="sd-desc mb-10 max-w-2xl text-base leading-[1.8] text-slate-300 [&_p]:mb-4"
                  dangerouslySetInnerHTML={{ __html: svc.content }}
                />
              )}

              <div className="mb-10">
                <div className="mb-5 flex items-center gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#B87333]">
                    {lang === "bg" ? "Операции" : "Operations"}
                  </span>
                  <div className="h-px flex-1" style={{ background: "linear-gradient(to right, rgba(184,115,51,0.4), transparent)" }} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {meta.activities.map((act, i) => (
                    <div key={i} className="sd-card flex items-start gap-4 py-4 px-5" style={{ borderLeft: "2px solid rgba(184,115,51,0.25)", background: "rgba(184,115,51,0.04)" }}>
                      <svg className="mt-1 flex-shrink-0" width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <rect x="4" y="0.5" width="5" height="5" transform="rotate(45 4 0.5)" fill="#B87333" fillOpacity="0.7" />
                      </svg>
                      <span className="text-sm leading-snug text-slate-200">{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-10">
                {meta.cards.map((card, i) => (
                  <div key={i} className="sd-stat relative p-5 overflow-hidden" style={{ background: "rgba(184,115,51,0.06)", border: "1px solid rgba(184,115,51,0.2)" }}>
                    <div className="font-mono text-4xl font-black leading-none text-white">{card.value}</div>
                    <div className="mt-2 text-[11px] font-bold uppercase tracking-wider text-[#B87333]">{card.title}</div>
                    <div className="mt-0.5 text-[10px] text-slate-500">{card.sub}</div>
                    <div className="absolute right-0 bottom-0 h-6 w-6" style={{ background: "linear-gradient(315deg, rgba(184,115,51,0.3) 0%, transparent 70%)" }} />
                  </div>
                ))}
              </div>

              {galleryImages.length > 0 && (
                <div className="flex gap-2 pb-24">
                  {galleryImages.map((src, i) => (
                    <div key={i} className="sd-row relative h-40 flex-1 cursor-pointer overflow-hidden" style={{ border: "1px solid rgba(184,115,51,0.2)" }} onClick={() => setLightboxSrc(src)}>
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
        <div className="animate-bsdc-panel-in fixed inset-0 z-[500] flex flex-col overflow-hidden pointer-events-auto" style={{ background: "#040e1a" }}>
          {CloseBtn}{BackBtn}

          {/* Terminal scanline bg */}
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,200,232,0.015) 4px, rgba(0,200,232,0.015) 5px)" }} />

          <div className="relative flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <div className="flex min-h-full flex-col px-10 py-14 lg:px-16">

              {/* TOP SECTION: text left + monitor frame right */}
              <div className="flex flex-col gap-8 mb-12 lg:flex-row lg:items-start lg:gap-14">

                {/* LEFT: title + description */}
                <div className="flex-1">
                  <div className="sd-eyebrow mb-4 font-mono text-[9px] tracking-[0.5em] text-[#00c8e8]/50 uppercase">
                    {lang === "bg" ? "МІСІЯ БРИФ" : "MISSION BRIEF"}
                  </div>
                  <h2 className="sd-title mb-6 text-3xl font-black leading-tight text-white lg:text-5xl">
                    {svc.title}
                  </h2>
                  {svc.content && (
                    <div
                      className="sd-desc mb-8 text-sm leading-[1.85] text-slate-400 [&_p]:mb-3"
                      dangerouslySetInnerHTML={{ __html: svc.content }}
                    />
                  )}
                  {/* Stats below description */}
                  <div className="grid grid-cols-3 gap-3">
                    {meta.cards.map((card, i) => (
                      <div key={i} className="sd-stat p-4" style={{ border: "1px solid rgba(0,200,232,0.2)", background: "rgba(0,200,232,0.04)" }}>
                        <div className="font-mono text-2xl font-black text-[#00c8e8]">{card.value}</div>
                        <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/55">{card.title}</div>
                        <div className="text-[9px] text-slate-600">{card.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT: framed LIVE FEED monitor (compact, atmospheric) */}
                {imgSrc && (
                  <div className="lg:w-[40%] lg:flex-shrink-0">
                    {/* Monitor outer bezel — click to view full image */}
                    <div className="relative cursor-pointer overflow-hidden" style={{ border: "2px solid rgba(0,200,232,0.3)", aspectRatio: "4/3", boxShadow: "0 0 40px rgba(0,200,232,0.08), inset 0 0 20px rgba(0,0,0,0.6)" }} onClick={() => imgSrc && setLightboxSrc(imgSrc)}>
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
                          background: "linear-gradient(to right, transparent 0%, rgba(0,200,232,0.7) 40%, rgba(0,200,232,0.9) 50%, rgba(0,200,232,0.7) 60%, transparent 100%)",
                          animation: "rov-scanline 3.2s linear 1.1s infinite",
                        }}
                      />
                      {/* Screen vignette */}
                      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.65) 100%)" }} />
                      {/* HUD top bar */}
                      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2" style={{ background: "rgba(0,200,232,0.08)", borderBottom: "1px solid rgba(0,200,232,0.2)" }}>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#00c8e8] animate-pulse" />
                          <span className="font-mono text-[8px] font-bold tracking-[0.35em] text-[#00c8e8]">LIVE · REC</span>
                          <span className="font-mono text-[9px] text-[#00c8e8]/80 leading-none" style={{ animation: "cursor-blink 1.1s step-start infinite" }}>▌</span>
                        </div>
                        <span className="font-mono text-[8px] text-[#00c8e8]/50">LBV-ROV</span>
                      </div>
                      {/* HUD corner marks */}
                      {(["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"] as const).map((pos, i) => (
                        <div key={i} className={`absolute ${pos} h-3 w-3`} style={{ border: "1.5px solid rgba(0,200,232,0.45)", borderRadius: 0, ...(i === 0 ? { borderRight: "none", borderBottom: "none" } : i === 1 ? { borderLeft: "none", borderBottom: "none" } : i === 2 ? { borderRight: "none", borderTop: "none" } : { borderLeft: "none", borderTop: "none" }) }} />
                      ))}
                      {/* HUD bottom info */}
                      <div className="absolute bottom-0 left-0 right-0 px-3 py-2" style={{ background: "rgba(0,0,0,0.6)", borderTop: "1px solid rgba(0,200,232,0.15)" }}>
                        <span className="font-mono text-[8px] text-[#00c8e8]/50">DEPTH — · VIS HD · GPS –</span>
                      </div>
                    </div>
                    {/* Monitor label */}
                    <div className="mt-2 text-center font-mono text-[9px] tracking-[0.4em] text-[#00c8e8]/30 uppercase">
                      {lang === "bg" ? "Видеопоток в реално време" : "Live video feed"}
                    </div>
                  </div>
                )}
              </div>

              {/* MISSION SCOPE — numbered log entries, full width */}
              <div className="mb-10">
                <div className="mb-4 flex items-center gap-4">
                  <span className="font-mono text-[9px] tracking-[0.5em] text-[#00c8e8]/50 uppercase">
                    {lang === "bg" ? "Обхват на мисията" : "Mission scope"}
                  </span>
                  <div className="h-px flex-1 bg-[#00c8e8]/10" />
                </div>
                <div className="grid gap-0 sm:grid-cols-2">
                  {meta.activities.map((act, i) => (
                    <div
                      key={i}
                      className="sd-row flex items-baseline gap-4 py-3.5 px-4"
                      style={{ borderBottom: "1px solid rgba(0,200,232,0.08)", background: i % 2 === 0 ? "rgba(0,200,232,0.02)" : "transparent" }}
                    >
                      <span className="flex-shrink-0 font-mono text-[11px] font-bold text-[#00c8e8]/35">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-sm leading-snug text-slate-300">{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gallery */}
              {galleryImages.length > 0 && (
                <div className="flex gap-2 pb-24">
                  {galleryImages.map((src, i) => (
                    <div key={i} className="sd-row relative h-32 flex-1 cursor-pointer overflow-hidden" style={{ border: "1px solid rgba(0,200,232,0.15)" }} onClick={() => setLightboxSrc(src)}>
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
        <div className="animate-bsdc-panel-in fixed inset-0 z-[500] flex flex-col overflow-hidden pointer-events-auto" style={{ background: "#040c18" }}>
          {CloseBtn}{BackBtn}

          {/* BANNER — sonar grid + rings, image faint background */}
          <div className="relative flex-shrink-0 overflow-hidden" style={{ height: "34vh" }}>
            {imgSrc
              ? <img src={imgSrc} alt={svc.title} className="sd-image absolute inset-0 h-full w-full object-cover object-top" style={{ filter: "brightness(0.4) saturate(0.5)" }} />
              : <div className="absolute inset-0 bg-[#020a14]" />
            }
            <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(56,189,248,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.06) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              {[80, 160, 240, 320].map((r, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: r * 2,
                    height: r * 2,
                    border: `1px solid rgba(56,189,248,${0.14 - i * 0.03})`,
                    animation: `sonar-ping 4s ease-out ${i * 0.9}s infinite`,
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 20%, #040c18 100%)" }} />
            <div className="absolute bottom-0 left-0 right-0 px-10 pb-8 lg:px-16">
              <div className="sd-eyebrow mb-2 flex items-center gap-3">
                <div className="h-px w-8 bg-[#38bdf8]" />
                <span className="font-mono text-[10px] tracking-[0.4em] text-[#38bdf8]">
                  {lang === "bg" ? "ХИДРОГРАФСКИ ОТДЕЛ" : "HYDROGRAPHIC DIVISION"}
                </span>
              </div>
              <h2 className="sd-title text-4xl font-black leading-none text-white lg:text-5xl">{svc.title}</h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <div className="px-10 pt-8 pb-20 lg:px-16">
              <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">

                <div className="lg:w-[45%]">
                  {svc.content && (
                    <div
                      className="sd-desc mb-8 text-sm leading-[1.9] text-slate-400 [&_p]:mb-4"
                      dangerouslySetInnerHTML={{ __html: svc.content }}
                    />
                  )}
                  <table className="w-full text-sm">
                    <tbody>
                      {meta.cards.map((card, i) => (
                        <tr key={i} className="sd-stat" style={{ borderBottom: "1px solid rgba(56,189,248,0.1)" }}>
                          <td className="py-3 font-bold text-white/70 w-1/2">{card.title}</td>
                          <td className="py-3 font-mono font-black text-right" style={{ color: "#38bdf8" }}>{card.value}</td>
                          <td className="py-3 pl-3 text-xs text-slate-500">{card.sub}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="font-mono text-[10px] tracking-[0.4em] text-[#38bdf8]/60 uppercase">
                      {lang === "bg" ? "Обхват на услугата" : "Service scope"}
                    </span>
                    <div className="h-px flex-1 bg-[#38bdf8]/15" />
                  </div>
                  <div className="flex flex-col gap-1">
                    {meta.activities.map((act, i) => (
                      <div key={i} className="sd-row flex gap-5 py-3.5" style={{ borderBottom: "1px solid rgba(56,189,248,0.08)" }}>
                        <div className="w-6 flex-shrink-0 font-mono text-xs font-bold text-[#38bdf8]/35 pt-0.5">{String(i + 1).padStart(2, "0")}</div>
                        <div className="text-sm leading-snug text-slate-300">{act}</div>
                      </div>
                    ))}
                  </div>
                  {galleryImages.length > 0 && (
                    <div className="mt-6 flex gap-2">
                      {galleryImages.map((src, i) => (
                        <div key={i} className="sd-row relative h-36 flex-1 cursor-pointer overflow-hidden" style={{ border: "1px solid rgba(56,189,248,0.15)" }} onClick={() => setLightboxSrc(src)}>
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
        <div className="animate-bsdc-panel-in fixed inset-0 z-[500] overflow-hidden pointer-events-auto" style={{ background: "#0c0e14" }}>
          {CloseBtn}{BackBtn}

          {imgSrc && (
            <div className="absolute inset-0">
              <img src={imgSrc} alt="" className="sd-image h-full w-full object-cover object-center" style={{ filter: "brightness(0.22) saturate(0.45)", animation: "dam-drift 18s ease-in-out 1.3s infinite" }} />
            </div>
          )}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 60% 40%, rgba(184,115,51,0.12) 0%, transparent 60%), linear-gradient(to bottom, rgba(12,14,20,0.7) 0%, rgba(12,14,20,0.25) 50%, rgba(12,14,20,0.85) 100%)" }} />

          <div className="absolute inset-0 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <div className="flex min-h-full flex-col justify-center px-8 py-14 lg:px-16">

              <div className="sd-eyebrow mb-4 flex items-center gap-3">
                <div className="h-px w-8 bg-[#B87333]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.45em] text-[#B87333]">
                  {lang === "bg" ? "Управление · Експлоатация" : "Operations · Management"}
                </span>
              </div>

              <h2 className="sd-title mb-10 max-w-2xl text-5xl font-black leading-[1.0] tracking-tight text-white lg:text-6xl">
                {svc.title}
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
                {meta.activities.map((act, i) => (
                  <div key={i} className="sd-card p-5 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
                    <div className="mb-3 font-mono text-xs font-bold" style={{ color: "#B87333" }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <p className="text-sm leading-snug text-white/85">{act}</p>
                  </div>
                ))}
              </div>

              {svc.content && (
                <div
                  className="sd-desc mb-8 p-7 text-sm leading-[1.85] text-slate-300 backdrop-blur-sm [&_p]:mb-3"
                  style={{ background: "rgba(12,14,20,0.6)", border: "1px solid rgba(255,255,255,0.06)", maxWidth: "52rem" }}
                  dangerouslySetInnerHTML={{ __html: svc.content }}
                />
              )}

              <div className="flex flex-wrap gap-4 mb-10">
                {meta.cards.map((card, i) => (
                  <div key={i} className="sd-stat flex-1 min-w-[140px] p-5 backdrop-blur-sm" style={{ background: "rgba(184,115,51,0.07)", border: "1px solid rgba(184,115,51,0.22)" }}>
                    <div className="font-mono text-3xl font-black text-white">{card.value}</div>
                    <div className="mt-1 text-[11px] font-bold uppercase tracking-wider" style={{ color: "#B87333" }}>{card.title}</div>
                    <div className="text-[10px] text-slate-500">{card.sub}</div>
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
        <div className="animate-bsdc-panel-in fixed inset-0 z-[500] flex flex-col overflow-hidden pointer-events-auto" style={{ background: "#0a0b0d" }}>
          {CloseBtn}{BackBtn}

          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(156,163,175,0.1) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.7) 100%)" }} />

          <div className="relative flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <div className="px-10 pt-14 pb-24 lg:px-16">

              <div className="flex flex-col gap-8 mb-12 lg:flex-row lg:items-start lg:gap-12">
                <div className="lg:flex-1">
                  <div className="sd-eyebrow mb-3 flex items-center gap-3">
                    <div className="h-px w-8 bg-[#9ca3af]" />
                    <span className="font-mono text-[10px] tracking-[0.45em] text-[#9ca3af]/60 uppercase">
                      {lang === "bg" ? "Строителство · СМР" : "Civil & Maritime Works"}
                    </span>
                  </div>
                  <h2 className="sd-title mb-5 text-4xl font-black leading-[1.0] text-white lg:text-5xl">{svc.title}</h2>
                  {svc.content && (
                    <div
                      className="sd-desc text-sm leading-[1.85] text-slate-400 [&_p]:mb-3"
                      dangerouslySetInnerHTML={{ __html: svc.content }}
                    />
                  )}
                </div>
                {imgSrc && (
                  <div className="relative h-64 w-full overflow-hidden lg:h-72 lg:w-[38%] lg:flex-shrink-0" style={{ transform: "rotate(-1.5deg)", border: "1px solid rgba(156,163,175,0.2)", boxShadow: "8px 8px 0 rgba(0,0,0,0.4)" }}>
                    <img src={imgSrc} alt={svc.title} className="sd-image h-full w-full object-cover" style={{ filter: "brightness(0.75) saturate(0.7)" }} />
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2" style={{ background: "rgba(0,0,0,0.7)" }}>
                      <span className="font-mono text-[9px] tracking-widest text-[#9ca3af]/70 uppercase">
                        {lang === "bg" ? "Снимка от обект" : "Site photograph"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-10">
                <div className="mb-5 flex items-center gap-4">
                  <span className="font-mono text-[10px] tracking-[0.4em] text-[#9ca3af]/60 uppercase">
                    {lang === "bg" ? "Технически обхват" : "Technical scope"}
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {meta.activities.map((act, i) => (
                    <div key={i} className="sd-card flex items-start gap-4 px-5 py-4" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderLeft: "3px solid rgba(156,163,175,0.35)" }}>
                      <span className="flex-shrink-0 font-mono text-[11px] font-bold text-[#9ca3af]/40 w-7">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-sm leading-snug text-slate-300">{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-10 flex flex-wrap gap-0">
                {meta.cards.map((card, i) => (
                  <div key={i} className="sd-stat flex-1 min-w-[150px] px-6 py-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRight: i < meta.cards.length - 1 ? "none" : undefined }}>
                    <div className="font-mono text-3xl font-black text-white">{card.value}</div>
                    <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#9ca3af]/70">{card.title}</div>
                    <div className="text-[10px] text-slate-600">{card.sub}</div>
                  </div>
                ))}
              </div>

              {galleryImages.length > 0 && (
                <div className="flex gap-2">
                  {galleryImages.map((src, i) => (
                    <div key={i} className="sd-row relative h-40 flex-1 cursor-pointer overflow-hidden" style={{ border: "1px solid rgba(156,163,175,0.15)" }} onClick={() => setLightboxSrc(src)}>
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
      const courseColors = ["#60a5fa", "#34d399", "#a78bfa", "#fb923c", "#f472b6", "#fbbf24"]
      return (
        <div className="animate-bsdc-panel-in fixed inset-0 z-[500] flex flex-col overflow-hidden pointer-events-auto" style={{ background: "#061020" }}>
          {CloseBtn}{BackBtn}

          {/* POSTER HEADER */}
          <div className="relative flex-shrink-0 overflow-hidden" style={{ height: "38vh", minHeight: 240 }}>
            {imgSrc
              ? <img src={imgSrc} alt={svc.title} className="sd-image absolute inset-0 h-full w-full object-cover object-center" />
              : <div className="absolute inset-0 bg-[#030d1a]" />
            }
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #061020 0%, rgba(6,16,32,0.6) 40%, rgba(0,0,0,0.2) 70%, transparent 100%)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(6,16,32,0.8) 0%, transparent 50%)" }} />
            <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "linear-gradient(to right, #60a5fa, #3b82f6, transparent)" }} />
            <div className="absolute bottom-0 left-0 right-0 px-10 pb-10 lg:px-16">
              <div className="sd-eyebrow mb-3 flex items-center gap-3">
                <div className="h-px w-8 bg-[#60a5fa]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.45em] text-[#60a5fa]">
                  {lang === "bg" ? "Обучение · Сертификация" : "Training · Certification"}
                </span>
              </div>
              <h2 className="sd-title mb-2 text-4xl font-black leading-[1.0] text-white lg:text-6xl">{svc.title}</h2>
              {svc.shortDescription && (
                <p className="max-w-xl text-base text-slate-300/70">{svc.shortDescription}</p>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <div className="px-10 pt-10 pb-24 lg:px-16">
              {svc.content && (
                <div
                  className="sd-desc mb-10 max-w-3xl text-sm leading-[1.9] text-slate-400 [&_p]:mb-3"
                  dangerouslySetInnerHTML={{ __html: svc.content }}
                />
              )}
              <div className="mb-8">
                <div className="mb-5 flex items-center gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#60a5fa]/70">
                    {lang === "bg" ? "Модули на обучението" : "Training modules"}
                  </span>
                  <div className="h-px flex-1" style={{ background: "rgba(96,165,250,0.2)" }} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {meta.activities.map((act, i) => {
                    const col = courseColors[i % courseColors.length]
                    return (
                      <div key={i} className="sd-card group relative overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-0.5" style={{ background: `${col}0c`, border: `1px solid ${col}28` }}>
                        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(to right, ${col}, transparent)` }} />
                        <div className="mb-3 font-mono text-xs font-bold" style={{ color: col }}>{String(i + 1).padStart(2, "0")}</div>
                        <p className="text-sm leading-snug text-white/85">{act}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {meta.cards.map((card, i) => (
                  <div key={i} className="sd-stat p-5" style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.18)" }}>
                    <div className="font-mono text-4xl font-black text-white">{card.value}</div>
                    <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[#60a5fa]/80">{card.title}</div>
                    <div className="text-[10px] text-slate-500">{card.sub}</div>
                  </div>
                ))}
              </div>
              {galleryImages.length > 0 && (
                <div className="flex gap-2">
                  {galleryImages.map((src, i) => (
                    <div key={i} className="sd-row relative h-44 flex-1 cursor-pointer overflow-hidden" style={{ border: "1px solid rgba(96,165,250,0.12)" }} onClick={() => setLightboxSrc(src)}>
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
          <div className="absolute inset-0 flex bg-[#07111f]">

            {/* LEFT — scrollable content panel */}
            <div
              ref={aboutScrollRef}
              className="flex h-full w-full flex-col overflow-y-auto md:w-[48%]"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="flex flex-col justify-center px-8 py-12 md:px-11">

                {/* Eyebrow */}
                <div className="about-eyebrow mb-4 flex items-center gap-3">
                  <div className="h-px w-8 bg-[#B87333]" />
                  <span className="text-[11px] uppercase tracking-[0.3em] text-[#B87333]">
                    {about?.subtitle ?? "BSDC"}
                  </span>
                </div>

                {/* Title */}
                <h2 className="about-title mb-5 text-3xl font-black leading-tight text-white md:text-[2.2rem]">
                  {about?.title ?? "За нас"}
                </h2>

                {/* Story text */}
                <div
                  className="about-text mb-5 text-[13px] leading-relaxed text-slate-300"
                  dangerouslySetInnerHTML={{
                    __html: (about?.content ?? "").replace(/\n\n+/g, "<br><br>"),
                  }}
                />

                {/* Stats — about-specific only (20+, 50+, 24/7 — hero shows 2001/300м/6+) */}
                {aboutStats.length > 0 && (
                  <div className="about-stats mb-6 grid grid-cols-3 gap-2">
                    {aboutStats.map((stat, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center rounded border border-white/[0.07] bg-white/[0.03] px-2 py-2.5 text-center"
                      >
                        <div
                          data-stat-value={stat.value}
                          className="text-lg font-black text-white md:text-xl"
                        >
                          {stat.value}
                        </div>
                        <div className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-slate-400">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Why Us — 2-col icon list */}
                {whyUsItems.length > 0 && (
                  <div className="mb-5">
                    <div className="mb-2.5 flex items-center gap-2">
                      <div className="h-px w-5 bg-[#B87333]" />
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[#B87333]">
                        {whyUsSection.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      {whyUsItems.map((item, i) => {
                        const Icon = WHY_US_ICONS[i % WHY_US_ICONS.length]
                        return (
                          <div key={i} className="flex items-start gap-2">
                            <Icon size={13} className="mt-[2px] flex-shrink-0 text-[#B87333]" />
                            <span className="text-[12px] leading-snug text-slate-300">{item.title}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Certificates — document cards */}
                {certificates.length > 0 && (
                  <div className="mb-5">
                    <div className="mb-2.5 flex items-center gap-2">
                      <div className="h-px w-5 bg-[#B87333]" />
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[#B87333]">
                        Сертификати
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {certificates.slice(0, 6).map((cert) => (
                        <div
                          key={cert.id}
                          className="relative border border-[#B87333]/30 bg-[#B87333]/[0.04] px-3 py-2.5"
                        >
                          {/* Corner fold accent */}
                          <div
                            className="pointer-events-none absolute right-0 top-0 h-0 w-0"
                            style={{
                              borderStyle: "solid",
                              borderWidth: "0 10px 10px 0",
                              borderColor: "transparent rgba(184,115,51,0.35) transparent transparent",
                            }}
                          />
                          <div className="mb-1 flex items-start gap-1.5">
                            <Award size={11} className="mt-[1px] flex-shrink-0 text-[#B87333]" />
                            <span className="text-[11px] font-semibold leading-tight text-slate-100">
                              {cert.title}
                            </span>
                          </div>
                          {cert.issuer && (
                            <div className="pl-[19px] text-[10px] leading-snug text-slate-400">
                              {cert.issuer}
                            </div>
                          )}
                          {cert.issueDate && (
                            <div className="mt-1 pl-[19px] text-[9px] uppercase tracking-widest text-[#B87333]/60">
                              {new Date(cert.issueDate).getFullYear()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobile-only timeline list (map hidden on mobile) */}
                {timelineItems.length > 0 && (
                  <div className="mt-2 md:hidden">
                    <div className="mb-2.5 flex items-center gap-2">
                      <div className="h-px w-5 bg-[#B87333]" />
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[#B87333]">
                        {timelineSection.label}
                      </span>
                    </div>
                    <ul className="space-y-3 border-l border-[#B87333]/25 pl-4">
                      {timelineItems.map((item, i) => (
                        <li key={i} className="relative">
                          <div className="absolute -left-[17px] top-1.5 h-2.5 w-2.5 rounded-full border border-[#B87333] bg-[#B87333]/30" />
                          {item.year && (
                            <div className="text-[10px] font-bold uppercase tracking-widest text-[#B87333]">
                              {item.year}
                            </div>
                          )}
                          <div className="text-[12px] font-semibold text-white">{item.label}</div>
                          <div className="text-[11px] leading-snug text-slate-400">{item.desc}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            </div>

            {/* RIGHT — expedition map (desktop only) */}
            <div className="about-image relative hidden h-full overflow-hidden md:block md:w-[52%]">
              {/* Image background */}
              {about?.imageUrl ? (
                <img
                  src={about.imageUrl}
                  alt="About BSDC"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
              ) : (
                <div className="absolute inset-0 bg-[#040c18]" />
              )}

              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#07111f] via-[#07111f]/45 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#07111f]/20 via-transparent to-[#07111f]/55" />

              {/* Expedition map SVG overlay */}
              {timelineItems.length > 0 && (
                <TreasureMap items={timelineItems} />
              )}

              {/* Section label — bottom-right corner */}
              <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2">
                <div className="h-px w-5 bg-[#B87333]/50" />
                <span className="text-[9px] uppercase tracking-[0.35em] text-[#B87333]/60">
                  {timelineSection.label}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ── SERVICES — Mission Control ───────────────────────────────────── */}
        <div ref={servicesRef} className="absolute inset-0" style={{ willChange: "opacity, transform" }}>

          {/* Deep ocean atmosphere */}
          <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(145deg, #020c1a 0%, #04101f 45%, #020812 100%)" }} />
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 90% 80% at 35% 55%, rgba(6,20,45,0.6) 0%, transparent 65%)" }} />
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 140% 140% at 50% 50%, transparent 30%, rgba(0,0,0,0.72) 100%)" }} />

          {/* Layout */}
          <div className="absolute inset-0 flex flex-col md:flex-row">

            {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
            <div className="services-menu relative z-10 flex w-full flex-shrink-0 flex-col justify-center overflow-hidden px-7 py-6 md:w-[42%] md:px-14 md:py-0">
              {/* Panel gradient */}
              <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to right, rgba(2,8,20,0.98) 0%, rgba(2,8,20,0.90) 75%, rgba(2,8,20,0.50) 100%)" }} />
              {/* Left copper rule */}
              <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-px" style={{ background: "linear-gradient(to bottom, transparent 5%, rgba(184,115,51,0.5) 35%, rgba(184,115,51,0.7) 50%, rgba(184,115,51,0.5) 65%, transparent 95%)" }} />

              <div className="relative z-10 flex flex-col justify-center">

                {/* Eyebrow */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-px w-8 bg-[#B87333]" />
                  <span className="text-[9px] font-semibold uppercase tracking-[0.45em] text-[#B87333]">
                    {lang === "bg" ? "BSDC · ОПЕРАЦИИ" : "BSDC · OPERATIONS"}
                  </span>
                </div>

                {/* Counter */}
                <div className="svc-counter mb-2 font-mono text-[11px] tracking-[0.22em] text-slate-600">
                  {String(activeIdx + 1).padStart(2, "0")}
                  <span className="mx-2 text-slate-800">/</span>
                  {String(services.length).padStart(2, "0")}
                </div>

                {/* Animated text block */}
                <div className="svc-text-block">
                  <h2 className="mb-4 text-[1.85rem] font-black leading-[1.05] tracking-tight text-white md:text-[2.3rem]">
                    {services[activeIdx]?.title ?? ""}
                  </h2>

                  {services[activeIdx]?.shortDescription && (
                    <p className="mb-5 line-clamp-3 text-[13px] leading-relaxed text-slate-300/70">
                      {services[activeIdx].shortDescription}
                    </p>
                  )}

                  {/* Activity chips */}
                  {(services[activeIdx]?.activities?.length ?? 0) > 0 && (
                    <div className="mb-5 flex flex-wrap gap-1.5">
                      {services[activeIdx].activities.slice(0, 4).map((act, j) => (
                        <span
                          key={j}
                          className="border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.09em] text-slate-400"
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Technical metadata */}
                  {Array.isArray(services[activeIdx]?.statCards) && (services[activeIdx].statCards as StatCard[]).length > 0 && (
                    <div className="mb-7 grid grid-cols-3 gap-2">
                      {(services[activeIdx].statCards as StatCard[]).map((card, j) => (
                        <div
                          key={j}
                          className="bg-white/[0.025] p-3"
                          style={{
                            borderLeft: `2px solid ${(services[activeIdx]?.accentColor ?? "#B87333")}38`,
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                          }}
                        >
                          <div className="mb-0.5 text-[9px] uppercase tracking-[0.2em] text-slate-700">{card.title}</div>
                          <div className="text-base font-black leading-none text-white">{card.value}</div>
                          <div className="text-[10px] leading-snug text-slate-500">{card.sub}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigation row */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={activeIdx === 0}
                    onClick={() => { if (activeIdx > 0) { const n = activeIdx - 1; activeIdxRef.current = n; setActiveIdx(n) } }}
                    className="flex h-9 w-9 items-center justify-center border border-white/10 text-slate-500 transition-all hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M8.5 2.5L4 6.5l4.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {services.map((_, j) => (
                      <button
                        key={j}
                        type="button"
                        onClick={() => { activeIdxRef.current = j; setActiveIdx(j) }}
                        className="h-0.5 transition-all duration-300"
                        style={{
                          width: j === activeIdx ? "28px" : "8px",
                          background: j === activeIdx
                            ? (services[activeIdx]?.accentColor ?? "#B87333")
                            : "rgba(255,255,255,0.18)",
                        }}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={activeIdx === services.length - 1}
                    onClick={() => { if (activeIdx < services.length - 1) { const n = activeIdx + 1; activeIdxRef.current = n; setActiveIdx(n) } }}
                    className="flex h-9 w-9 items-center justify-center border border-white/10 text-slate-500 transition-all hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M4.5 2.5L9 6.5l-4.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => services[activeIdx] && setActiveService(services[activeIdx])}
                    className="ml-1 flex items-center gap-2 border border-white/12 bg-white/[0.04] px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-slate-300 transition-all hover:border-white/25 hover:bg-white/[0.07] hover:text-white"
                  >
                    {lang === "bg" ? "Детайли" : "Details"}
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M1.5 5.5h8M6.5 2l3 3.5-3 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                {/* Compact service list — desktop only */}
                <div className="mt-6 hidden flex-col border-t border-white/[0.05] pt-4 md:flex">
                  {services.map((svc, i) => (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => { activeIdxRef.current = i; setActiveIdx(i) }}
                      className={`flex items-center gap-3 py-1.5 text-left transition-colors ${i === activeIdx ? "text-white" : "text-slate-600 hover:text-slate-400"}`}
                    >
                      <div
                        className="h-px flex-shrink-0 transition-all duration-300"
                        style={{
                          width: i === activeIdx ? "22px" : "9px",
                          background: i === activeIdx
                            ? (svc.accentColor ?? "#B87333")
                            : "rgba(255,255,255,0.12)",
                        }}
                      />
                      <span className="text-[10px] uppercase tracking-[0.1em] leading-snug">{svc.title}</span>
                    </button>
                  ))}
                </div>

              </div>
            </div>

            {/* ── RIGHT PANEL — vertical spiral staircase / tornado ────────── */}
            <div
              className="relative min-h-[55vw] flex-1 md:min-h-0"
              style={{
                perspective: "1200px",
                perspectiveOrigin: "50% 50%",
                overflow: "hidden",
              }}
              onMouseMove={(e) => {
                if (!innerGroupRef.current) return
                const rect = e.currentTarget.getBoundingClientRect()
                const x = (e.clientX - rect.left - rect.width / 2) / rect.width
                const y = (e.clientY - rect.top - rect.height / 2) / rect.height
                innerGroupRef.current.style.transform =
                  `translateX(-50%) translateY(-50%) rotateY(${x * 7}deg) rotateX(${-y * 5}deg)`
              }}
              onMouseLeave={() => {
                if (!innerGroupRef.current) return
                innerGroupRef.current.style.transform =
                  "translateX(-50%) translateY(-50%) rotateY(0deg) rotateX(0deg)"
              }}
            >
              {/* Atmospheric gradient */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(ellipse 80% 90% at 55% 50%, rgba(6,18,40,0.4) 0%, rgba(2,8,18,0.82) 100%)" }}
              />

              {/* Top/bottom fade — softens the spiral ends */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-32" style={{ background: "linear-gradient(to bottom, rgba(2,8,18,0.9) 0%, transparent 100%)" }} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32" style={{ background: "linear-gradient(to top, rgba(2,8,18,0.9) 0%, transparent 100%)" }} />

              {/* 3D pivot — zero-size anchor at viewport center */}
              <div
                ref={innerGroupRef}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "0",
                  height: "0",
                  transformStyle: "preserve-3d",
                  transform: "translateX(-50%) translateY(-50%)",
                  transition: "transform 0.3s ease",
                }}
              >
                {services.map((svc, i) => {
                  // Float slot from continuous scrollPos — no snapping, no wrapping
                  const slot    = i - scrollPos
                  const absSlot = Math.abs(slot)

                  // Cylinder geometry clamped to visible range (sin/cos would cycle for |slot|>3)
                  const ANGLE_DEG = 42
                  const R         = 580
                  const eff       = Math.max(-2.5, Math.min(2.5, slot))
                  const theta     = eff * ANGLE_DEG * (Math.PI / 180)
                  const translateX = R * Math.sin(theta)
                  const translateZ = R * (Math.cos(theta) - 1)
                  // Vertical: large step so all visible cards fill the panel height
                  const translateY = slot * 195
                  const rotateY    = -eff * ANGLE_DEG

                  const scale      = absSlot > 2 ? 0.3 : Math.max(0.55, 1 - absSlot * 0.10)
                  const opacity    = absSlot > 2 ? 0 : Math.max(0.22, 1 - absSlot * 0.20)
                  // Proximity to center (1 = exact center, 0 = 0.5+ slots away) — drives glow/border
                  const proximity  = Math.max(0, 1 - absSlot * 2)
                  const meta    = resolveServiceMeta(svc, i)
                  const imgSrc  = svc.featuredImageUrl ?? svc.images?.[0] ?? null

                  return (
                    <div
                      key={svc.id}
                      style={{
                        position: "absolute",
                        width: "420px",
                        height: "268px",
                        marginLeft: "-210px",
                        marginTop: "-134px",
                        transform: `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                        opacity,
                        zIndex: 10 - absSlot,
                        backfaceVisibility: "hidden",
                        overflow: "hidden",
                        cursor: "pointer",
                        transition: "opacity 0.25s ease, filter 0.25s ease",
                        filter: `grayscale(${(1 - proximity) * 22}%) brightness(${Math.max(0.5, 0.5 + proximity * 0.5)})`,
                        borderRadius: "3px",
                      }}
                      onClick={() => {
                        if (proximity > 0.85) {
                          setActiveService(svc); setExpandedAct(null)
                        } else {
                          // Animate to clicked card via RAF
                          scrollVelRef.current = 0
                          const target = i
                          const animateTo = () => {
                            const diff = target - scrollPosRef.current
                            if (Math.abs(diff) < 0.01) {
                              scrollPosRef.current = target
                              setScrollPos(target)
                              activeIdxRef.current = target
                              setActiveIdx(target)
                              rafIdRef.current = null
                              return
                            }
                            scrollPosRef.current += diff * 0.18
                            const rounded = Math.round(scrollPosRef.current)
                            if (rounded !== activeIdxRef.current) {
                              activeIdxRef.current = rounded
                              setActiveIdx(rounded)
                            }
                            setScrollPos(scrollPosRef.current)
                            rafIdRef.current = requestAnimationFrame(animateTo)
                          }
                          if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
                          rafIdRef.current = requestAnimationFrame(animateTo)
                        }
                      }}
                    >
                      {/* Image */}
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt=""
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(145deg, ${meta.bg} 0%, #07111f 100%)` }} />
                      )}

                      {/* Overlay */}
                      {/* Gradient overlay — lightens toward center */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: `linear-gradient(to top, rgba(0,0,0,${0.88 - proximity * 0.06}) 0%, rgba(0,0,0,${0.35 - proximity * 0.27}) 100%)`,
                        }}
                      />

                      {/* Card label — fades in as card approaches center */}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: proximity > 0.3 ? "18px 22px" : "12px 16px", opacity: proximity > 0.01 ? 1 : 0.6 }}>
                        {proximity > 0.3 && (
                          <div
                            style={{
                              fontFamily: "monospace",
                              fontSize: "10px",
                              fontWeight: 900,
                              letterSpacing: "0.3em",
                              color: meta.accent,
                              marginBottom: "6px",
                              textTransform: "uppercase",
                              opacity: proximity,
                            }}
                          >
                            {String(i + 1).padStart(2, "0")} — {lang === "bg" ? "АКТИВНА ОПЕРАЦИЯ" : "ACTIVE OPERATION"}
                          </div>
                        )}
                        <div style={{ color: "white", fontWeight: proximity > 0.3 ? 800 : 600, fontSize: proximity > 0.3 ? "1.15rem" : "0.78rem", lineHeight: 1.2, marginBottom: proximity > 0.3 ? "10px" : 0 }}>
                          {svc.title}
                        </div>
                        {proximity > 0.3 && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              color: meta.accent,
                              fontSize: "10px",
                              fontWeight: 600,
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              opacity: proximity,
                            }}
                          >
                            {lang === "bg" ? "Виж услугата" : "View service"}
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                              <path d="M1.5 5.5h8M6.5 2l3 3.5-3 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Copper border — fades in with proximity */}
                      {proximity > 0.05 && (
                        <div style={{ position: "absolute", inset: 0, border: `1px solid rgba(184,115,51,${proximity * 0.6})`, pointerEvents: "none" }} />
                      )}

                      {/* HUD corner brackets — fade in with proximity */}
                      {proximity > 0.2 && (
                        <>
                          <div style={{ position: "absolute", top: 10, left: 10, width: 16, height: 16, borderTop: `2px solid ${meta.accent}`, borderLeft: `2px solid ${meta.accent}`, opacity: proximity, pointerEvents: "none" }} />
                          <div style={{ position: "absolute", top: 10, right: 10, width: 16, height: 16, borderTop: `2px solid ${meta.accent}`, borderRight: `2px solid ${meta.accent}`, opacity: proximity, pointerEvents: "none" }} />
                          <div style={{ position: "absolute", bottom: 10, left: 10, width: 16, height: 16, borderBottom: `2px solid ${meta.accent}`, borderLeft: `2px solid ${meta.accent}`, opacity: proximity, pointerEvents: "none" }} />
                          <div style={{ position: "absolute", bottom: 10, right: 10, width: 16, height: 16, borderBottom: `2px solid ${meta.accent}`, borderRight: `2px solid ${meta.accent}`, opacity: proximity, pointerEvents: "none" }} />
                        </>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* HUD labels */}
              <div className="pointer-events-none absolute right-7 top-7 flex items-center gap-2">
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: services[activeIdx]?.accentColor ?? "#B87333",
                    boxShadow: `0 0 7px ${services[activeIdx]?.accentColor ?? "#B87333"}`,
                  }}
                />
                <span className="font-mono text-[8px] uppercase tracking-[0.35em] text-slate-700">
                  MISSION CONTROL
                </span>
              </div>
              <div className="pointer-events-none absolute bottom-7 right-7 font-mono text-[8px] uppercase tracking-[0.28em] text-slate-800">
                {lang === "bg" ? "BSDC — ПОДВОДНИ ОПЕРАЦИИ" : "BSDC — UNDERWATER OPS"}
              </div>
            </div>

          </div>
        </div>

        {/* ── PROJECTS ─────────────────────────────────────────────────────── */}
        <div
          ref={projectsRef}
          className="absolute inset-0 overflow-hidden select-none flex flex-col"
          style={{ willChange: "opacity, transform", background: "#000000" }}
        >
          {/* Header */}
          <div className="arc-header shrink-0 pointer-events-none pt-24 pb-6 px-8 text-center z-10">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.35em] text-[#B87333]">
              {lang === "bg" ? "ПОРТФОЛИО" : "PORTFOLIO"}
            </p>
            <h2 className="mb-3 text-4xl font-black leading-none tracking-tight text-white md:text-5xl">
              {lang === "bg" ? "Проекти & Новини" : "Projects & News"}
            </h2>
            <p className="mx-auto max-w-lg text-sm leading-relaxed text-white/40">
              {lang === "bg"
                ? "Реализирани обекти, инспекции и технически интервенции в подводни съоръжения"
                : "Completed structures, inspections, and technical interventions in underwater facilities"}
            </p>
          </div>

          {/* Filter buttons */}
          <div className="arc-header shrink-0 flex flex-wrap items-center justify-center gap-2 pb-4 px-4 z-10 pointer-events-auto">
            {(["ALL", "PROJECT", "NEWS"] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setProjectFilter(f)}
                className="proj-filter-btn px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-all duration-200 border"
                style={{
                  borderColor: projectFilter === f ? "#B87333" : "rgba(255,255,255,0.15)",
                  color: projectFilter === f ? "#B87333" : "rgba(255,255,255,0.45)",
                  background: projectFilter === f ? "rgba(184,115,51,0.1)" : "transparent",
                }}
              >
                {f === "ALL" ? (lang === "bg" ? "Всички" : "All") : f === "PROJECT" ? (lang === "bg" ? "Проекти" : "Projects") : (lang === "bg" ? "Новини" : "News")}
              </button>
            ))}
            {uniqueCategories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(categoryFilter === cat ? "ALL" : cat)}
                className="proj-filter-btn px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-all duration-200 border"
                style={{
                  borderColor: categoryFilter === cat ? "#38bdf8" : "rgba(255,255,255,0.1)",
                  color: categoryFilter === cat ? "#38bdf8" : "rgba(255,255,255,0.35)",
                  background: categoryFilter === cat ? "rgba(56,189,248,0.08)" : "transparent",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Active card typography — static, never moves */}
          <div className="arc-header shrink-0 h-36 flex flex-col items-center justify-center text-center px-4 z-30 pointer-events-none">
            <AnimatePresence mode="wait">
              {filteredProjects[projActiveIndex] && (
                <motion.div
                  key={filteredProjects[projActiveIndex].id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="flex flex-col items-center"
                >
                  {filteredProjects[projActiveIndex].category && (
                    <span className="mb-1.5 inline-block px-2.5 py-0.5 text-[9px] font-bold tracking-widest uppercase text-[#B87333] border border-[#B87333]/30 bg-[#B87333]/8">
                      {filteredProjects[projActiveIndex].category}
                    </span>
                  )}
                  <h2 className="text-xl font-black tracking-tight text-white leading-tight max-w-3xl text-center md:text-2xl">
                    {filteredProjects[projActiveIndex].title}
                  </h2>
                  {filteredProjects[projActiveIndex].excerpt && (
                    <p className="mt-1 text-xs text-white/40 max-w-md line-clamp-2 leading-relaxed">
                      {filteredProjects[projActiveIndex].excerpt}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedProject(filteredProjects[projActiveIndex])}
                    className="proj-modal-btn pointer-events-auto mt-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B87333] hover:text-[#d4a060] border-b border-[#B87333]/25 hover:border-[#B87333]/60 transition-all pb-0.5"
                  >
                    {lang === "bg" ? "Прочети повече →" : "Read more →"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cylindrical IMAX carousel — pointer events on this container */}
          <div
            ref={carouselContainerRef}
            onPointerDown={handleCarouselPointerDown}
            onPointerMove={handleCarouselPointerMove}
            onPointerUp={handleCarouselPointerUp}
            onPointerLeave={handleCarouselPointerLeave}
            style={{
              flex: 1,
              minHeight: 0,
              position: "relative",
              perspective: "750px",
              transformStyle: "preserve-3d",
              cursor: "grab",
              overflow: "hidden",
              background: "#050505",
            }}
          >
            {filteredProjects.length === 0 ? (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <p style={{ color: "rgba(255,255,255,0.18)", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                  {lang === "bg" ? "Няма резултати" : "No results"}
                </p>
              </div>
            ) : (
              filteredProjects.map((project, index) => (
                <ProjectCard3D
                  key={`${project.id}-${index}`}
                  project={project}
                  index={index}
                  totalItems={filteredProjects.length}
                  activeProgress={activeProgress}
                  onCardClick={(targetIndex) => {
                    const current = dragProgress.get()
                    const count   = filteredProjects.length
                    const wrapped = ((Math.round(current) % count) + count) % count
                    if (wrapped === targetIndex) {
                      setSelectedProject(project)
                    } else {
                      dragProgress.set(targetIndex)
                    }
                  }}
                />
              ))
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
            style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.6)', background: 'rgba(184,115,51,0.1)', border: '1px solid rgba(184,115,51,0.3)', padding: '10px 18px' }}
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
              background: 'rgba(4,5,7,0.22)',
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
              <div ref={modalContentRef} className="bg-[#040507]">

              {/* ── SCENE 1: HERO ── */}
              <div className="modal-hero" style={{ position: 'relative', height: '140vh' }}>
                <img
                  ref={heroImgRef}
                  src={selectedProject.featuredImageUrl ?? ''}
                  alt=""
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transformOrigin: 'center center' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #040507 0%, rgba(4,5,7,0.3) 50%, transparent 100%)' }} />
                <div
                  className="modal-hero-content"
                  style={{ position: 'sticky', top: 'calc(100vh - 160px)', left: 0, right: 0, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', pointerEvents: 'none', padding: '0 64px 48px 64px', zIndex: 10 }}
                >
                  <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 4.5rem)', fontWeight: 700, color: 'white', lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0, maxWidth: '55%' }}>
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
                <div className="modal-scene-2-bg absolute inset-0" style={{ background: '#040507', opacity: 0 }} />
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
                            <p style={{ color: '#B87333', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', margin: '0 0 16px 0', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>ОБОРУДВАНЕ</p>
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
                            <p style={{ color: '#B87333', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', margin: '0 0 16px 0', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>ДЕЙНОСТИ</p>
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
                            <span style={{ color: '#B87333', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', minWidth: '130px', flexShrink: 0 }}>ЛОКАЦИЯ</span>
                            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>{selectedProject.location}</span>
                          </div>
                        )}
                        {selectedProject.client && (
                          <div style={{ display: 'flex', gap: '48px', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <span style={{ color: '#B87333', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', minWidth: '130px', flexShrink: 0 }}>ВЪЗЛОЖИТЕЛ</span>
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
              <div className="modal-scene-4" style={{ opacity: 0, background: '#040507', minHeight: '100vh', padding: '120px 64px' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '80px', alignItems: 'start' }}>

                  {/* Sidebar: label + pagination */}
                  <div>
                    <p style={{ color: '#B87333', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '32px' }}>СВЪРЗАНИ ПРОЕКТИ</p>
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
                          <p style={{ color: '#B87333', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '12px', fontFamily: 'monospace', margin: '0 0 12px 0' }}>
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
