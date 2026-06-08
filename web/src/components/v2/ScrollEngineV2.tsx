'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import type {
  HomeContent, AboutContent, Service,
  SiteSetting, ProjectNewsItem, Partner, Certificate,
} from '@/generated/prisma/client'

import { NODE_MAP, type MapNode }       from './engine/NodeRegistry'
import { resolveActiveNode }             from './engine/ActiveNodeResolver'
import { computeCamera, type CameraState } from './engine/CameraResolver'
import { WorldContainer, type WorldContainerHandle } from './WorldContainer'

// ── Config ────────────────────────────────────────────────────────────────────

const SCROLL_HEIGHT_VH = 600   // total scrollable height — 6 × 100vh
const CAMERA_SCRUB     = 1.0   // seconds of scrub inertia

// ── Camera apply ──────────────────────────────────────────────────────────────

function applyCam(world: HTMLElement, cam: CameraState) {
  world.style.transform = `matrix(${cam.scale},0,0,${cam.scale},${cam.tx},${cam.ty})`
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  home:         HomeContent | null
  about:        AboutContent | null
  services:     Service[]
  certificates: Certificate[]
  partners:     Partner[]
  settings:     SiteSetting | null
  projects:     ProjectNewsItem[]
  lang:         string
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ScrollEngineV2({
  home, about, services, certificates, partners, settings, projects, lang,
}: Props) {
  const isBg = lang === 'bg'

  const [activeNode, setActiveNode] = useState<MapNode>(NODE_MAP[0])

  const scrollDriverRef = useRef<HTMLDivElement>(null)
  const worldRef        = useRef<WorldContainerHandle>(null)
  const camStateRef     = useRef<CameraState>({ tx: 0, ty: 0, scale: 0.60 })

  // ── Scroll → camera (single code path, no locks, no state machine) ─────────

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

    const world = worldRef.current?.world
    if (world) {
      world.style.transformOrigin = '0 0'
      const init = computeCamera(0, window.innerWidth, window.innerHeight)
      Object.assign(camStateRef.current, init)
      applyCam(world, init)
    }

    ScrollTrigger.create({
      id:      'v2-main',
      trigger: scrollDriverRef.current,
      start:   'top top',
      end:     'bottom bottom',
      scrub:   CAMERA_SCRUB,
      onUpdate(self) {
        const cam = computeCamera(self.progress, window.innerWidth, window.innerHeight)
        Object.assign(camStateRef.current, cam)
        const w = worldRef.current?.world
        if (w) applyCam(w, cam)
        const nd = resolveActiveNode(self.progress)
        setActiveNode(prev => prev.id === nd.id ? prev : nd)
      },
    })

    return () => { ScrollTrigger.getById('v2-main')?.kill() }
  }, [])

  // ── Nav travel ─────────────────────────────────────────────────────────────

  const travelTo = useCallback((at: number) => {
    const totalPx = window.innerHeight * (SCROLL_HEIGHT_VH / 100)
    gsap.to(window, {
      scrollTo:  { y: at * totalPx },
      duration:  1.8,
      ease:      'power2.inOut',
      overwrite: 'auto',
    })
  }, [])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Fixed viewport — never moves */}
      <div className="fixed inset-0 overflow-hidden" style={{ background: '#060d0a' }}>

        {/* World canvas — the only moving element */}
        <WorldContainer
          ref={worldRef}
          lang={lang}
          home={home}
          about={about}
          services={services}
          certificates={certificates}
          partners={partners}
          settings={settings}
          projects={projects}
        />

        {/* Nav dots — scroll anchors only, not section indicators */}
        <nav
          className="fixed right-5 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-[10px]"
          aria-label={isBg ? 'Навигация' : 'Navigation'}
        >
          {NODE_MAP.map(node => {
            const isActive = node.id === activeNode.id
            return (
              <button
                key={node.id}
                type="button"
                aria-label={node.label[isBg ? 'bg' : 'en']}
                onClick={() => travelTo(node.at)}
                style={{
                  background:     'none',
                  border:         'none',
                  padding:        '4px',
                  cursor:         'pointer',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  opacity:        isActive ? 1 : 0.22,
                  transition:     'opacity 0.5s ease',
                }}
              >
                <div style={{
                  borderRadius: '9999px',
                  background:   '#8A9A86',
                  width:        isActive ? 6 : 4,
                  height:       isActive ? 20 : 4,
                  transition:   'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                }} />
              </button>
            )
          })}
        </nav>

      </div>

      {/* Scroll driver — provides scrollable height for GSAP ScrollTrigger */}
      <div ref={scrollDriverRef} style={{ height: `${SCROLL_HEIGHT_VH}vh` }} />
    </>
  )
}
