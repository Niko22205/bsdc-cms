"use client"

import { useEffect } from "react"
import gsap from "gsap"
import type { ProjectNewsItem } from "@/generated/prisma/client"

interface ExitScrollConfig {
  selectedProject: ProjectNewsItem | null
  modalScrollRef: React.RefObject<HTMLDivElement | null>
  modalContentRef: React.RefObject<HTMLDivElement | null>
  isClosingRef: React.MutableRefObject<boolean>
  rafExitRef: React.MutableRefObject<number | null>
  exitDeltaRef: React.MutableRefObject<number>
  currentExitRef: React.MutableRefObject<number>
  gsapCtxRef: React.MutableRefObject<gsap.Context | null>
  additionalScrollRef: React.MutableRefObject<number>
  closeModalRef: React.MutableRefObject<() => void>
  setSelectedProject: (p: ProjectNewsItem | null) => void
  setLightboxSrc: (s: string | null) => void
}

export function useExitScroll(config: ExitScrollConfig) {
  const {
    selectedProject,
    modalScrollRef, modalContentRef,
    isClosingRef, rafExitRef, exitDeltaRef, currentExitRef,
    gsapCtxRef, additionalScrollRef,
    closeModalRef, setSelectedProject, setLightboxSrc,
  } = config

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

      if (exitDeltaRef.current > 0 && e.deltaY < 0) {
        e.preventDefault()
        exitDeltaRef.current = Math.max(0, exitDeltaRef.current + e.deltaY)
        if (exitDeltaRef.current <= 0) { snapBack() } else { startExitRaf() }
        return
      }

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
}
