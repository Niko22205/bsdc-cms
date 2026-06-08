'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type {
  HomeContent, AboutContent, Service,
  SiteSetting, ProjectNewsItem, Partner, Certificate,
} from '@/generated/prisma/client'

import { NODE_MAP, type MapNode }      from './engine/NodeRegistry'
import { resolveActiveNode }           from './engine/ActiveNodeResolver'
import { computeCamera }               from './engine/CameraResolver'
import { ExpeditionPath, type ExpeditionPathHandle } from './path/ExpeditionPath'
import { WorldContainer }              from './WorldContainer'

// ── Config ────────────────────────────────────────────────────────────────────

const SCROLL_HEIGHT_VH = 500

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

/**
 * CAMERA DRIVER.
 *
 * Responsibilities:
 *   1. Own the single GSAP ScrollTrigger (one source of scroll truth).
 *   2. On every tick: compute camera position → gsap.set(world, {x, y}).
 *   3. On node threshold crossing: update activeNodeId React state (depth cue only).
 *   4. Render WorldContainer (all nodes, always) + ExpeditionPath (fixed overlay).
 *
 * Does NOT contain any content or node-specific logic.
 * Does NOT conditionally mount or unmount nodes.
 */
export default function ScrollEngineV2({
  home, about, services, certificates, partners, settings, projects, lang,
}: Props) {

  const [activeNode, setActiveNode] = useState<MapNode>(NODE_MAP[0])

  const scrollDriverRef = useRef<HTMLDivElement>(null)
  const worldRef        = useRef<HTMLDivElement>(null)
  const pathRef         = useRef<ExpeditionPathHandle>(null)

  // ── Scroll controller ─────────────────────────────────────────────────────

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Set initial camera position before first scroll tick
    const vpW = window.innerWidth
    const vpH = window.innerHeight
    const init = computeCamera(0, vpW, vpH)
    if (worldRef.current) gsap.set(worldRef.current, init)

    const trigger = ScrollTrigger.create({
      trigger: scrollDriverRef.current,
      start:   'top top',
      end:     'bottom bottom',
      scrub:   true,
      onUpdate(self) {
        const p   = self.progress
        const vpW = window.innerWidth
        const vpH = window.innerHeight

        // ── Camera — direct DOM write, zero React ──────────────────
        const cam = computeCamera(p, vpW, vpH)
        if (worldRef.current) gsap.set(worldRef.current, cam)

        // ── Path draw — direct DOM write, zero React ───────────────
        pathRef.current?.setProgress(p)

        // ── Node activation — React state, fires ≤4 times total ───
        const next = resolveActiveNode(p)
        setActiveNode(prev => (prev.id === next.id ? prev : next))
      },
    })

    return () => { trigger.kill() }
  }, [])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Fixed viewport (camera) — never moves ──────────────────────── */}
      <div className="fixed inset-0 overflow-hidden bg-[#8A9A86]">

        {/* Engineering grid — static reference plane */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: [
              'linear-gradient(rgba(26,34,30,0.05) 1px, transparent 1px)',
              'linear-gradient(90deg, rgba(26,34,30,0.05) 1px, transparent 1px)',
            ].join(', '),
            backgroundSize: '60px 60px',
          }}
        />

        {/* WorldContainer — spatial canvas, moved by GSAP camera */}
        <WorldContainer
          ref={worldRef}
          activeNodeId={activeNode.id}
          lang={lang}
          home={home}
          about={about}
          services={services}
          certificates={certificates}
          partners={partners}
          settings={settings}
          projects={projects}
        />

        {/* Expedition path — fixed map overlay, does NOT move with world */}
        <ExpeditionPath ref={pathRef} />

        {/* Node navigation — fixed HUD */}
        <nav className="fixed right-6 top-1/2 z-10 flex -translate-y-1/2 flex-col items-end gap-4">
          {NODE_MAP.map(node => {
            const isActive = node.id === activeNode.id
            return (
              <button
                key={node.id}
                type="button"
                aria-label={node.label[lang === 'bg' ? 'bg' : 'en']}
                onClick={() => {
                  const el = scrollDriverRef.current
                  if (!el) return
                  const totalPx = window.innerHeight * (SCROLL_HEIGHT_VH / 100)
                  window.scrollTo({ top: node.at * totalPx, behavior: 'smooth' })
                }}
                className="flex items-center gap-2"
                style={{ opacity: isActive ? 1 : 0.3, transition: 'opacity 0.4s ease' }}
              >
                <span
                  className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#4A5343]"
                  style={{ opacity: isActive ? 1 : 0, transition: 'opacity 0.4s ease' }}
                >
                  {node.label[lang === 'bg' ? 'bg' : 'en']}
                </span>
                <div
                  className="rounded-full bg-[#4A5343]"
                  style={{
                    width:      isActive ? 8 : 6,
                    height:     isActive ? 24 : 6,
                    transition: 'all 0.4s ease',
                  }}
                />
              </button>
            )
          })}
        </nav>

        {/* Active node label — bottom left HUD */}
        <div className="fixed bottom-6 left-8 z-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#4A5343]/40">
            {activeNode.label[lang === 'bg' ? 'bg' : 'en']}
          </span>
        </div>

      </div>

      {/* ── Scroll driver — makes page scrollable for GSAP ST ──────────── */}
      <div ref={scrollDriverRef} style={{ height: `${SCROLL_HEIGHT_VH}vh` }} />
    </>
  )
}
