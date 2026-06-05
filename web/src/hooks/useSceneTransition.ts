"use client"

import { useEffect } from "react"
import gsap from "gsap"
import type { Service } from "@/generated/prisma/client"

interface SceneTransitionConfig {
  heroRef: React.RefObject<HTMLDivElement | null>
  aboutRef: React.RefObject<HTMLDivElement | null>
  servicesRef: React.RefObject<HTMLDivElement | null>
  projectsRef: React.RefObject<HTMLDivElement | null>
  contactRef: React.RefObject<HTMLDivElement | null>
  aboutScrollRef: React.RefObject<HTMLDivElement | null>
  sceneRefs: React.RefObject<HTMLDivElement | null>[]
  currentSceneRef: React.MutableRefObject<number>
  isAnimating: React.MutableRefObject<boolean>
  aboutEntranceFired: React.MutableRefObject<boolean>
  servicesEntranceFired: React.MutableRefObject<boolean>
  scrollPosRef: React.MutableRefObject<number>
  scrollVelRef: React.MutableRefObject<number>
  rafIdRef: React.MutableRefObject<number | null>
  activeIdxRef: React.MutableRefObject<number>
  activeServiceRef: React.MutableRefObject<Service | null>
  setCurrentScene: (n: number) => void
  setActiveIdx: (n: number) => void
  setScrollPos: (n: number) => void
  setActiveService: (s: Service | null) => void
}

export function useSceneTransition(config: SceneTransitionConfig) {
  const {
    heroRef, aboutRef, servicesRef, projectsRef, contactRef, aboutScrollRef,
    sceneRefs,
    currentSceneRef, isAnimating, aboutEntranceFired, servicesEntranceFired,
    scrollPosRef, scrollVelRef, rafIdRef, activeIdxRef, activeServiceRef,
    setCurrentScene, setActiveIdx, setScrollPos, setActiveService,
  } = config

  const totalScenes = sceneRefs.length

  function triggerSceneEntrance(sceneIndex: number) {
    const delay = 1.0

    if (sceneIndex === 0) {
      const el = heroRef.current
      if (el) {
        gsap.set(el.querySelectorAll(".hero-word"), { x: 0, y: 0, rotation: 0, opacity: 1 })
        const eyebrow = el.querySelector(".hero-eyebrow")
        if (eyebrow) gsap.set(eyebrow, { x: 0, opacity: 1 })
        ;[".hero-sub", ".hero-cta"].forEach((sel) => {
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
      gsap.fromTo(".about-map-path",
        { attr: { strokeDashoffset: "1000" } },
        { attr: { strokeDashoffset: "0" }, duration: 2.8, ease: "power2.inOut", delay: delay + 0.3 },
      )
      gsap.fromTo(".about-map-marker",
        { opacity: 0 },
        { opacity: 1, duration: 0.45, stagger: 0.32, ease: "power2.out", delay: delay + 0.8 },
      )

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
        ;[".hero-sub", ".hero-cta"].forEach((sel) => {
          const node = el.querySelector(sel)
          if (node) gsap.set(node, { opacity: 1 })
        })
        const bg = el.querySelector(".hero-bg-wrapper")
        if (bg) gsap.set(bg, { scale: 1, opacity: 1 })
      }
    }

    if (nextEl) gsap.set(nextEl, { opacity: 0 })

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

  // ── Init: set scene opacity/z-index + hero GSAP entrance ─────────────────
  useEffect(() => {
    sceneRefs.forEach((ref, i) => {
      if (!ref.current) return
      gsap.set(ref.current, { opacity: i === 0 ? 1 : 0, y: 0 })
    })

    sceneRefs.forEach((ref, i) => {
      if (ref.current) ref.current.style.zIndex = i === 0 ? '10' : '1'
    })

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

  return { goToScene }
}
