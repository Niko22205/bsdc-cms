'use client'

import { useRef, useCallback } from 'react'
import gsap from 'gsap'
import type { HomeContent, SiteSetting } from '@/generated/prisma/client'

interface Props {
  data:     HomeContent | null
  settings: SiteSetting | null
  lang:     string
}

// Depth axis — contextual scale for an underwater tech company.
// These are spatial reference marks, not decorative UI.
const DEPTH_MARKS = ['0m', '50m', '100m', '200m', '400m'] as const

export function HeroNode({ data, settings, lang }: Props) {
  const headline    = data?.headline    ?? (lang === 'bg' ? 'Подводни технологии' : 'Underwater Technologies')
  const subheadline = data?.subheadline ?? null
  const companyName = settings?.companyName ?? 'BSDC'
  const isBg        = lang === 'bg'

  const geoRef = useRef<SVGSVGElement | null>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!geoRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const nx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)
    const ny = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)
    gsap.to(geoRef.current, {
      x: nx * 6, y: ny * 5,
      duration: 1.6, ease: 'power1.out', overwrite: 'auto',
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!geoRef.current) return
    gsap.to(geoRef.current, {
      x: 0, y: 0,
      duration: 2.0, ease: 'power1.out', overwrite: 'auto',
    })
  }, [])

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#8A9A86' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >

      {/* ── DEPTH FIELD — static background layer ────────────────────────── */}
      {/* Horizontal strata create environmental depth. Does NOT move with cursor. */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Water column strata — horizontal, faint */}
        {[20, 40, 60, 80].map(y => (
          <line key={y} x1={8} y1={y} x2={96} y2={y}
            stroke="rgba(26,34,30,0.035)" strokeWidth={0.08} />
        ))}
        {/* Left depth axis spine */}
        <line x1={7.8} y1={6} x2={7.8} y2={94}
          stroke="rgba(26,34,30,0.06)" strokeWidth={0.10} />
        {/* Right field edge */}
        <line x1={95} y1={6} x2={95} y2={94}
          stroke="rgba(26,34,30,0.03)" strokeWidth={0.07} />
      </svg>

      {/* ── DEPTH AXIS — left-side depth scale ───────────────────────────── */}
      {/* Five depth marks distributed evenly along the node height.
          Provides environmental context without being decorative. */}
      <div style={{
        position: 'absolute', left: '2.8%', top: '6%', bottom: '6%',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        pointerEvents: 'none',
      }}>
        {DEPTH_MARKS.map(d => (
          <div key={d} style={{ display: 'flex', alignItems: 'center', gap: '0.5vw' }}>
            <span style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: 'clamp(6px, 0.52vw, 8px)',
              letterSpacing: '0.18em',
              color: 'rgba(26,34,30,0.16)',
              flexShrink: 0,
            }}>
              {d}
            </span>
            <div style={{ width: 'clamp(6px, 0.6vw, 10px)', height: '0.5px', background: 'rgba(26,34,30,0.08)' }} />
          </div>
        ))}
      </div>

      {/* ── GEOMETRY LAYER — cursor-driven structural annotations ─────────── */}
      {/* Only this layer moves. Text and depth axis are fixed. */}
      <svg
        ref={geoRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Headline upper bracket */}
        <line x1={8.8} y1={26} x2={16}  y2={26}   stroke="rgba(26,34,30,0.18)" strokeWidth={0.12} />
        <line x1={8.8} y1={24.5} x2={8.8} y2={27.5} stroke="rgba(26,34,30,0.24)" strokeWidth={0.15} />
        {/* Headline lower bracket — spans full headline width */}
        <line x1={8.8} y1={74}   x2={90} y2={74}   stroke="rgba(26,34,30,0.09)" strokeWidth={0.09} />
        <line x1={8.8} y1={72.5} x2={8.8} y2={75.5} stroke="rgba(26,34,30,0.20)" strokeWidth={0.15} />
        <line x1={90}  y1={72.5} x2={90}  y2={75.5} stroke="rgba(26,34,30,0.20)" strokeWidth={0.15} />
        {/* Registration crosshair — upper right, marks breathing zone as deliberate */}
        <line x1={82} y1={14.5} x2={89} y2={14.5}  stroke="rgba(26,34,30,0.20)" strokeWidth={0.14} />
        <line x1={85.5} y1={11} x2={85.5} y2={18}  stroke="rgba(26,34,30,0.20)" strokeWidth={0.14} />
        {/* Diagonal field sweep — compositional tension */}
        <line x1={96} y1={96} x2={28} y2={26}
          stroke="rgba(26,34,30,0.025)" strokeWidth={0.07} strokeDasharray="0.8 1.8" />
      </svg>

      {/* ── COMPANY IDENTITY — top-left anchor ───────────────────────────── */}
      <div style={{ position: 'absolute', top: '6.5%', left: '12%' }}>
        <span style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: 'clamp(9px, 0.9vw, 14px)',
          fontWeight: 300,
          letterSpacing: '0.52em', textTransform: 'uppercase',
          color: 'rgba(26,34,30,0.30)',
        }}>
          {companyName}
        </span>
      </div>

      {/* ── HEADLINE — spatial mass, compositional gravity ────────────────── */}
      {/* Positioned at 26% top so it fills the mid-to-lower zone of the node.
          fontWeight 300 at large scale reads as deliberate engineering mass. */}
      <div style={{
        position: 'absolute',
        top: '26%', left: '12%', right: '8%',
        pointerEvents: 'none',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
          fontSize: 'clamp(56px, 9.5vw, 152px)',
          fontWeight: 300,
          lineHeight: 0.90,
          letterSpacing: '-0.04em',
          color: '#1A221E',
          margin: 0,
        }}>
          {headline}
        </h1>
      </div>

      {/* ── SUB-LABEL — bottom-left counterweight ────────────────────────── */}
      <div style={{ position: 'absolute', bottom: '7%', left: '12%' }}>
        <span style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: 'clamp(10px, 1.1vw, 18px)',
          fontWeight: 300,
          color: 'rgba(26,34,30,0.38)',
          letterSpacing: '0.01em',
          lineHeight: 1,
        }}>
          {subheadline ?? (isBg ? 'Морски изследвания · Est. 2009' : 'Marine Research · Est. 2009')}
        </span>
      </div>

    </div>
  )
}
