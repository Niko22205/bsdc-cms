'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import type { HomeContent, SiteSetting } from '@/generated/prisma/client'

import { NODE_MAP, type MapNode }         from './engine/NodeRegistry'
import { resolveActiveNode }              from './engine/ActiveNodeResolver'
import { ExpeditionPath, type ExpeditionPathHandle } from './path/ExpeditionPath'
import { HeroNode }                       from './nodes/HeroNode'

// ── Config ────────────────────────────────────────────────────────────────────

/** Total scrollable height in vh units. Each node gets equal scroll budget. */
const SCROLL_HEIGHT_VH = 500

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  home:     HomeContent | null
  settings: SiteSetting | null
  lang:     string
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ScrollEngineV2({ home, settings, lang }: Props) {
  const [activeNode, setActiveNode] = useState<MapNode>(NODE_MAP[0])

  // Refs — no re-renders for continuous values
  const scrollDriverRef  = useRef<HTMLDivElement>(null)
  const pathRef          = useRef<ExpeditionPathHandle>(null)
  const progressRef      = useRef(0)

  // ── Scroll controller ─────────────────────────────────────────────────────

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const trigger = ScrollTrigger.create({
      trigger:  scrollDriverRef.current,
      start:    'top top',
      end:      'bottom bottom',
      scrub:    true,       // lock 1:1 with scroll — no lag on path draw
      onUpdate(self) {
        const p = self.progress
        progressRef.current = p

        // Path draw — direct DOM write, zero React overhead
        pathRef.current?.setProgress(p)

        // Active node — state update only on threshold crossing
        const next = resolveActiveNode(p)
        setActiveNode(prev => (prev.id === next.id ? prev : next))
      },
    })

    return () => { trigger.kill() }
  }, [])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Fixed viewport — all visuals live here ──────────────────────── */}
      <div className="fixed inset-0 overflow-hidden bg-[#8A9A86]">

        {/* Engineering grid */}
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

        {/* Expedition SVG path */}
        <ExpeditionPath ref={pathRef} />

        {/* ── Node content layer ────────────────────────────────────────── */}
        {activeNode.id === 'hero' && (
          <HeroNode data={home} settings={settings} lang={lang} />
        )}

        {/* ── Navigation — node labels on right edge ────────────────────── */}
        <nav className="fixed right-6 top-1/2 z-10 flex -translate-y-1/2 flex-col items-end gap-4">
          {NODE_MAP.map(node => {
            const isActive = node.id === activeNode.id
            return (
              <button
                key={node.id}
                type="button"
                aria-label={node.label[lang === 'bg' ? 'bg' : 'en']}
                onClick={() => {
                  // Scroll to node's target position in the scroll driver
                  const el = scrollDriverRef.current
                  if (!el) return
                  const totalPx = el.getBoundingClientRect().height || window.innerHeight * (SCROLL_HEIGHT_VH / 100)
                  window.scrollTo({ top: node.at * totalPx, behavior: 'smooth' })
                }}
                className="flex items-center gap-2 transition-opacity"
                style={{ opacity: isActive ? 1 : 0.3 }}
              >
                <span
                  className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#4A5343] transition-all"
                  style={{ opacity: isActive ? 1 : 0 }}
                >
                  {node.label[lang === 'bg' ? 'bg' : 'en']}
                </span>
                <div
                  className="rounded-full bg-[#4A5343] transition-all"
                  style={{
                    width:  isActive ? 8 : 6,
                    height: isActive ? 24 : 6,
                  }}
                />
              </button>
            )
          })}
        </nav>

        {/* ── Progress readout (dev) ────────────────────────────────────── */}
        <div className="fixed bottom-6 left-8 z-10 flex items-baseline gap-1.5">
          <span className="font-mono text-[11px] font-light text-[#1A221E]/40">
            {activeNode.id}
          </span>
        </div>

      </div>

      {/* ── Scroll driver — provides scrollable height for GSAP ─────────── */}
      <div ref={scrollDriverRef} style={{ height: `${SCROLL_HEIGHT_VH}vh` }} />
    </>
  )
}
