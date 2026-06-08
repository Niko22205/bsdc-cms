'use client'

import { useRef, useCallback } from 'react'
import gsap from 'gsap'
import type { Partner } from '@/generated/prisma/client'

interface Props {
  data: Partner[]
  lang: string
}

// Scatter positions for partner markers within the 1400×700 node.
// Expressed as % of node width/height. Not a grid — deliberate spatial placement.
// Range: x 6-88%, y 44-88% (below title zone which occupies top ~40%).
const PARTNER_POS = [
  { x:  6, y: 46 },
  { x: 30, y: 42 },
  { x: 56, y: 48 },
  { x: 80, y: 43 },
  { x: 16, y: 75 },
  { x: 42, y: 80 },
  { x: 66, y: 72 },
  { x: 86, y: 66 },
] as const

export function PartnersNode({ data, lang }: Props) {
  const isBg   = lang === 'bg'
  const geoRef = useRef<SVGSVGElement | null>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!geoRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const nx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)
    const ny = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)
    gsap.to(geoRef.current, {
      x: nx * 4, y: ny * 3,
      duration: 1.4, ease: 'power1.out', overwrite: 'auto',
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!geoRef.current) return
    gsap.to(geoRef.current, {
      x: 0, y: 0,
      duration: 1.8, ease: 'power1.out', overwrite: 'auto',
    })
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%', height: '100%',
        overflow: 'hidden',
        background: '#0a1410',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >

      {/* Structural geometry — cursor-driven */}
      <svg
        ref={geoRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Horizontal divider at title bottom */}
        <line x1={5} y1={38} x2={95} y2={38}
          stroke="rgba(138,154,134,0.07)" strokeWidth={0.08} />
        {/* Right corner mark */}
        <path d="M 97 3 L 97 7 M 97 3 L 93 3"
          stroke="rgba(138,154,134,0.18)" strokeWidth={0.16} fill="none" />
        {/* Left corner mark */}
        <path d="M 3 97 L 3 93 M 3 97 L 7 97"
          stroke="rgba(138,154,134,0.14)" strokeWidth={0.14} fill="none" />
        {/* Sparse network dots — purely spatial reference, very faint */}
        {[[22, 62], [50, 74], [78, 60], [35, 88], [64, 82]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={0.55}
            fill="rgba(138,154,134,0.10)" />
        ))}
      </svg>

      {/* TITLE ZONE */}
      <div style={{ position: 'absolute', top: '8%', left: '6%', right: '20%' }}>
        <div style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: 'clamp(10px, 0.9vw, 14px)',
          letterSpacing: '0.42em', textTransform: 'uppercase',
          color: '#8A9A86', marginBottom: '2vh',
        }}>
          {isBg ? 'Партньори' : 'Partners'}
        </div>
        <h2 style={{
          fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
          fontSize: 'clamp(32px, 4.5vw, 72px)',
          fontWeight: 300, lineHeight: 0.93,
          letterSpacing: '-0.03em',
          color: 'rgba(205,218,200,0.88)',
          margin: 0,
        }}>
          {isBg ? 'Мрежа' : 'Network'}
        </h2>
      </div>

      {/* PARTNER MARKERS — absolute scatter, not grid */}
      {data.map((partner, i) => {
        const pos = PARTNER_POS[i % PARTNER_POS.length]
        return (
          <div
            key={partner.id}
            style={{
              position: 'absolute',
              left:     `${pos.x}%`,
              top:      `${pos.y}%`,
              pointerEvents: 'none',
            }}
          >
            {/* Route marker dot + horizontal line */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6vw', marginBottom: '0.8vh' }}>
              <div style={{
                width:        5,
                height:       5,
                borderRadius: '50%',
                border:       '1px solid rgba(138,154,134,0.35)',
                background:   i === 0 ? 'rgba(138,154,134,0.20)' : 'transparent',
                flexShrink:   0,
              }} />
              <div style={{
                width:        'clamp(12px, 1.2vw, 20px)',
                height:       '0.5px',
                background:   'rgba(138,154,134,0.12)',
                flexShrink:   0,
              }} />
            </div>

            {/* Logo */}
            {partner.logoUrl && (
              <div style={{
                height: 'clamp(18px, 2.2vh, 28px)',
                marginBottom: '0.6vh',
                display: 'flex',
                alignItems: 'center',
              }}>
                <img
                  src={partner.logoUrl}
                  alt={partner.name}
                  style={{
                    maxHeight: '100%',
                    maxWidth:  '80%',
                    objectFit: 'contain',
                    filter:    'brightness(0.62) grayscale(0.55)',
                    opacity:   0.65,
                  }}
                />
              </div>
            )}

            {/* Name */}
            <div style={{
              fontFamily:    'var(--font-geist-mono), monospace',
              fontSize:      'clamp(8px, 0.72vw, 11px)',
              color:         'rgba(138,154,134,0.44)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              lineHeight:    1.3,
              whiteSpace:    'nowrap',
            }}>
              {partner.name}
            </div>
          </div>
        )
      })}

      {data.length === 0 && (
        <div style={{
          position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)',
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: 'clamp(10px, 0.9vw, 14px)',
          letterSpacing: '0.30em', textTransform: 'uppercase',
          color: 'rgba(138,154,134,0.20)',
        }}>
          {isBg ? '— няма данни —' : '— no data —'}
        </div>
      )}

      {/* Node count — bottom right */}
      <div style={{ position: 'absolute', bottom: '3%', right: '5%' }}>
        <span style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: 'clamp(8px, 0.7vw, 11px)',
          letterSpacing: '0.28em', color: 'rgba(138,154,134,0.14)',
        }}>
          {data.length} {isBg ? 'точки' : 'nodes'}
        </span>
      </div>

    </div>
  )
}
