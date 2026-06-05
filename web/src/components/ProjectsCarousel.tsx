'use client'

import { useState, useRef } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type MotionValue,
} from 'framer-motion'
import type { ProjectNewsItem } from '@/generated/prisma/client'

// ─── constants ────────────────────────────────────────────────────────────────

type DistKey = 1 | 2 | 3 | 4

/** DOM dimensions per slot distance (before CSS scale is applied). */
const DIMS: Record<DistKey, { w: number; h: number }> = {
  1: { w: 72,  h: 170 },
  2: { w: 100, h: 230 },
  3: { w: 138, h: 295 },
  4: { w: 185, h: 360 },
}

const SPACING  = 150   // px between adjacent slot centres
const SPRING   = { type: 'spring', stiffness: 150, damping: 20 } as const
const SLOTS    = [-4, -3, -2, -1, 1, 2, 3, 4] as const

/** Geometric properties for a given slot (signed integer, ±1..±4). */
function slotGeom(slot: number) {
  const dist = Math.abs(slot) as DistKey
  return {
    y:       Math.pow(dist, 1.8) * 10,   // subtle downward arc
    rotateY: slot * -12,                  // lean inward; left cards face right
    scale:   1 - dist * 0.12,
    opacity: Math.max(0, 1 - dist * 0.2),
    zIndex:  50 - dist,
  }
}

const BG_FALLBACK = '#4A5343'

// ─── per-slot card component ──────────────────────────────────────────────────

interface CardProps {
  slot:     number
  project:  ProjectNewsItem
  dragX:    MotionValue<number>
  didDrag:  React.MutableRefObject<boolean>
  onNav:    (slot: number) => void
  onOpen:   (p: ProjectNewsItem) => void
  lang:     string
}

/**
 * Each card lives in a fixed slot on the orbital rail and subscribes to
 * the shared dragX motion value via useTransform — no re-render on drag.
 */
function ProjectCard({ slot, project, dragX, didDrag, onNav, onOpen, lang }: CardProps) {
  const dist   = Math.abs(slot) as DistKey
  const { w, h } = DIMS[dist]
  const { y, rotateY, scale, opacity, zIndex } = slotGeom(slot)
  const isInner = dist === 1

  // Live x driven by the shared motion value — no React re-render during drag
  const x = useTransform(dragX, (dx) => slot * SPACING + dx)

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (didDrag.current) return
    if (isInner) onOpen(project)
    else onNav(slot)
  }

  return (
    <motion.div
      style={{
        position:    'absolute',
        width:       w,
        height:      h,
        left:        '50%',
        top:         '50%',
        marginLeft:  -w / 2,
        marginTop:   -h / 2,
        x,
        y,
        rotateY,
        scale,
        opacity,
        zIndex,
        borderRadius: 8,
        overflow:     'hidden',
        cursor:       isInner ? 'pointer' : 'default',
        userSelect:   'none',
        willChange:   'transform',
      }}
      onClick={handleClick}
    >
      {/* Photo or fallback */}
      {project.featuredImageUrl ? (
        <img                                         // eslint-disable-line @next/next/no-img-element
          src={project.featuredImageUrl}
          alt={project.title}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
          }}
          draggable={false}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: BG_FALLBACK,
        }} />
      )}

      {/* Cinematic bottom gradient */}
      <div style={{
        position:   'absolute',
        inset:      0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.84) 0%, rgba(0,0,0,0.10) 52%, transparent 100%)',
      }} />

      {/* Title + CTA (only on nearest two pairs) */}
      {dist <= 2 && (
        <div style={{
          position: 'absolute',
          bottom:   isInner ? 20 : 8,
          left:     6,
          right:    6,
        }}>
          <div style={{
            fontSize:     isInner ? 10 : 8,
            fontWeight:   300,
            color:        '#fff',
            lineHeight:   1.25,
            whiteSpace:   'nowrap',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
          }}>
            {project.title}
          </div>
          {isInner && (
            <div style={{
              fontSize:      7,
              color:         '#4A5343',
              marginTop:     3,
              letterSpacing: '0.04em',
            }}>
              {lang === 'bg' ? 'Прочети →' : 'Read →'}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

interface Props {
  projects: ProjectNewsItem[]
  onSelect: (p: ProjectNewsItem) => void
  lang?:    string
}

export default function ProjectsCarousel({ projects, onSelect, lang = 'bg' }: Props) {
  const n = projects.length

  const [activeIdx, setActiveIdx] = useState(0)
  const [grabbing,  setGrabbing]  = useState(false)

  // Shared drag motion value — cards subscribe via useTransform, zero re-renders
  const dragX  = useMotionValue(0)

  // Drag state refs (avoid stale closures in pointer handlers)
  const dragging = useRef(false)
  const didDrag  = useRef(false)
  const startX   = useRef(0)
  const startDX  = useRef(0)

  if (n === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 13 }}>
          {lang === 'bg' ? 'Няма проекти' : 'No projects yet'}
        </span>
      </div>
    )
  }

  const activeProject = projects[((activeIdx % n) + n) % n]

  // ── pointer handlers (drag + click) ─────────────────────────────────────────

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current = true
    didDrag.current  = false
    startX.current   = e.clientX
    startDX.current  = dragX.get()
    setGrabbing(true)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return
    const delta = e.clientX - startX.current
    if (Math.abs(delta) > 5) didDrag.current = true
    dragX.set(startDX.current + delta)
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return
    dragging.current = false
    setGrabbing(false)
    const totalDelta = e.clientX - startX.current
    if (didDrag.current) {
      const step   = Math.round(-totalDelta / SPACING)
      const newIdx = ((activeIdx + step) % n + n) % n
      setActiveIdx(newIdx)
    }
    void animate(dragX, 0, SPRING)
  }

  function onPointerLeave() {
    if (!dragging.current) return
    dragging.current = false
    setGrabbing(false)
    void animate(dragX, 0, SPRING)
  }

  // ── card navigation (click on dist > 1) ─────────────────────────────────────

  function handleNav(slot: number) {
    // Brief pre-shift toward clicked direction for motion feel, then spring back
    dragX.set(-slot * SPACING * 0.55)
    const newIdx = ((activeIdx + slot + n * 100) % n)
    setActiveIdx(newIdx)
    void animate(dragX, 0, SPRING)
  }

  // ── render ────────────────────────────────────────────────────────────────────

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        perspective:       '1200px',
        perspectiveOrigin: 'center 50%',
        cursor:            grabbing ? 'grabbing' : 'grab',
        userSelect:        'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
    >
      {/* ── orbital card rail ─────────────────────────────────────────────── */}
      {SLOTS.map((slot) => {
        const projIdx = ((activeIdx + slot + n * 100) % n)
        return (
          <ProjectCard
            key={slot}
            slot={slot}
            project={projects[projIdx]}
            dragX={dragX}
            didDrag={didDrag}
            onNav={handleNav}
            onOpen={onSelect}
            lang={lang}
          />
        )
      })}

      {/* ── centre typography overlay (slot 0 zone, static position) ─────── */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 z-[60]
                   flex flex-col items-center text-center"
        style={{ transform: 'translateY(-50%)' }}
      >
          <div
            className="pointer-events-auto flex flex-col items-center"
            style={{ padding: '0 12px', maxWidth: 260 }}
          >
            <div style={{
              fontSize:      'clamp(0.78rem, 1.9vw, 1.15rem)',
              fontWeight:    300,
              color:         '#1A221E',
              letterSpacing: '-0.01em',
              lineHeight:    1.2,
              textAlign:     'center',
            }}>
              {activeProject.title}
            </div>

            {activeProject.excerpt && (
              <div style={{
                fontSize:   10,
                color:      'rgba(26,34,30,0.55)',
                lineHeight: 1.55,
                marginTop:  7,
                textAlign:  'center',
              }}>
                {activeProject.excerpt.length > 85
                  ? `${activeProject.excerpt.slice(0, 85)}…`
                  : activeProject.excerpt}
              </div>
            )}

            <button
              type="button"
              onClick={() => onSelect(activeProject)}
              style={{
                marginTop:     10,
                fontSize:      8,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color:         '#4A5343',
                background:    'transparent',
                border:        '1px solid rgba(74,83,67,0.35)',
                padding:       '4px 14px',
                cursor:        'pointer',
                transition:    'border-color .15s, color .15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(74,83,67,0.7)'
                e.currentTarget.style.color       = '#a8b8a4'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(74,83,67,0.35)'
                e.currentTarget.style.color       = '#4A5343'
              }}
            >
              {lang === 'bg' ? 'Прочети повече' : 'Read More'}
            </button>
          </div>
      </div>
    </div>
  )
}
