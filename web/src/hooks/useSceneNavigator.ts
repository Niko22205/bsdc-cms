"use client"

import { useEffect } from "react"
import type { Service, ProjectNewsItem } from "@/generated/prisma/client"

type ContactStatus = "idle" | "loading" | "success" | "error"

interface SceneNavigatorConfig {
  goToScene: (n: number) => void
  selectedProjectRef: React.MutableRefObject<ProjectNewsItem | null>
  activeServiceRef: React.MutableRefObject<Service | null>
  isAnimating: React.MutableRefObject<boolean>
  currentSceneRef: React.MutableRefObject<number>
  aboutScrollRef: React.RefObject<HTMLDivElement | null>
  servicesCount: number
  scrollVelRef: React.MutableRefObject<number>
  scrollPosRef: React.MutableRefObject<number>
  rafIdRef: React.MutableRefObject<number | null>
  activeIdxRef: React.MutableRefObject<number>
  touchStartY: React.MutableRefObject<number>
  setActiveIdx: (n: number) => void
  setScrollPos: (n: number) => void
  setActiveService: (s: Service | null) => void
  setSelectedProject: (p: ProjectNewsItem | null) => void
  setShowContactModal: (v: boolean) => void
  setContactStatus: (v: ContactStatus) => void
}

export function useSceneNavigator(config: SceneNavigatorConfig) {
  const {
    goToScene,
    selectedProjectRef, activeServiceRef, isAnimating, currentSceneRef,
    aboutScrollRef, servicesCount, scrollVelRef, scrollPosRef, rafIdRef, activeIdxRef,
    touchStartY, setActiveIdx, setScrollPos, setActiveService, setSelectedProject,
    setShowContactModal, setContactStatus,
  } = config

  useEffect(() => {
    function handleWheel(e: WheelEvent) {
      if (selectedProjectRef.current) return
      if (activeServiceRef.current) return
      e.preventDefault()
      if (isAnimating.current) return

      if (currentSceneRef.current === 1) {
        const el = aboutScrollRef.current
        if (el) {
          const atTop    = el.scrollTop <= 2
          const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4
          if (e.deltaY > 50 && !atBottom) { el.scrollBy({ top: e.deltaY, behavior: "smooth" }); return }
          if (e.deltaY < -50 && !atTop)   { el.scrollBy({ top: e.deltaY, behavior: "smooth" }); return }
        }
      }

      if (currentSceneRef.current === 2) {
        const isDesktop    = window.innerWidth >= 768
        const onRightPanel = isDesktop && e.clientX >= window.innerWidth * 0.44

        if (onRightPanel) {
          scrollVelRef.current += e.deltaY * 0.00035
          scrollVelRef.current = Math.max(-0.05, Math.min(0.05, scrollVelRef.current))
          if (!rafIdRef.current) {
            const svcCount = servicesCount
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
          if (e.deltaY > 30) {
            if (activeIdxRef.current === servicesCount - 1) goToScene(3)
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
          if (activeIdxRef.current === servicesCount - 1) goToScene(3)
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
}
