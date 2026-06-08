'use client'

import { useState, useRef, useCallback } from 'react'
import gsap from 'gsap'
import type { Service } from '@/generated/prisma/client'

interface Props {
  data: Service[]
  lang: string
}

// Spatial marker positions — scattered within the node's 1450×780 space.
// Not a grid. These read as "reference marks in a field survey."
const MARKER_POS = [
  { x: 38, y: 14 },
  { x: 72, y:  9 },
  { x: 85, y: 48 },
  { x: 52, y: 64 },
  { x: 22, y: 76 },
  { x: 68, y: 85 },
] as const

export function ServicesHubNode({ data, lang }: Props) {
  const isBg = lang === 'bg'
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
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
        position: 'relative', width: '100%', height: '100%',
        overflow: 'hidden', background: '#0a1410',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >

      {/* Minimal structural geometry — cursor-driven */}
      <svg
        ref={geoRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <line x1={0.4} y1={0} x2={0.4} y2={100} stroke="rgba(138,154,134,0.06)" strokeWidth={0.15} />
        <path d="M 2 2 L 2 6 M 2 2 L 6 2" stroke="rgba(138,154,134,0.20)" strokeWidth={0.14} fill="none" />
        <path d="M 98 98 L 98 94 M 98 98 L 94 98" stroke="rgba(138,154,134,0.20)" strokeWidth={0.14} fill="none" />
      </svg>

      {/* Header — upper left */}
      <div style={{ position: 'absolute', top: '6%', left: '5%' }}>
        <div style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: 'clamp(7px, 0.72vw, 11px)',
          letterSpacing: '0.44em', textTransform: 'uppercase',
          color: 'rgba(138,154,134,0.28)', marginBottom: '1vh',
        }}>
          {isBg ? '// Координати' : '// Coordinates'}
        </div>
        <div style={{
          fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
          fontSize: 'clamp(22px, 3vw, 48px)',
          fontWeight: 300, lineHeight: 0.94,
          letterSpacing: '-0.03em',
          color: 'rgba(205,218,200,0.78)',
        }}>
          {isBg ? 'Услуги' : 'Services'}
        </div>
      </div>

      {/* Spatial markers — one per service */}
      {MARKER_POS.map((pos, i) => {
        const svc   = data[i]
        if (!svc) return null
        const isHov = hoveredIdx === i
        const isFar = hoveredIdx !== null && hoveredIdx !== i
        const accent = svc.accentColor ?? 'rgba(138,154,134,0.60)'

        return (
          <div
            key={svc.id}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              position:   'absolute',
              left:       `${pos.x}%`,
              top:        `${pos.y}%`,
              cursor:     'default',
              opacity:    isFar ? 0.14 : isHov ? 1 : 0.68,
              transition: 'opacity 0.35s ease',
              zIndex:     isHov ? 2 : 1,
            }}
          >
            <div style={{
              width:        isHov ? 10 : 6,
              height:       isHov ? 10 : 6,
              borderRadius: '50%',
              background:   isHov ? accent : 'rgba(138,154,134,0.40)',
              border:       `1px solid ${isHov ? accent : 'rgba(138,154,134,0.22)'}`,
              marginBottom: '0.8vh',
              transition:   'all 0.35s ease',
            }} />

            <div style={{
              fontFamily:    'var(--font-geist-mono), monospace',
              fontSize:      'clamp(6px, 0.52vw, 8px)',
              letterSpacing: '0.34em', textTransform: 'uppercase',
              color:         'rgba(138,154,134,0.26)', marginBottom: '0.3vh',
            }}>
              SVC.0{i + 1}
            </div>

            <div style={{
              fontFamily:    'var(--font-geist-mono), monospace',
              fontSize:      'clamp(8px, 0.76vw, 12px)',
              letterSpacing: '0.20em', textTransform: 'uppercase',
              whiteSpace:    'nowrap',
              color:         isHov ? 'rgba(205,218,200,0.90)' : 'rgba(138,154,134,0.58)',
              borderBottom:  isHov ? `1px solid ${accent}` : '1px solid transparent',
              paddingBottom: '0.3vh',
              transition:    'color 0.35s ease',
            }}>
              {svc.title}
            </div>

            {isHov && svc.shortDescription && (
              <div style={{
                fontFamily:   'var(--font-geist-mono), monospace',
                fontSize:     'clamp(7px, 0.58vw, 9px)',
                letterSpacing:'0.12em',
                color:        'rgba(138,154,134,0.38)',
                whiteSpace:   'nowrap',
                marginTop:    '0.5vh',
                maxWidth:     '180px',
                overflow:     'hidden',
                textOverflow: 'ellipsis',
              }}>
                {svc.shortDescription.slice(0, 44)}
              </div>
            )}
          </div>
        )
      })}

      {/* Interaction hint */}
      <div style={{ position: 'absolute', bottom: '5%', right: '5%' }}>
        <span style={{
          fontFamily:    'var(--font-geist-mono), monospace',
          fontSize:      'clamp(7px, 0.62vw, 9px)',
          letterSpacing: '0.36em', textTransform: 'uppercase',
          color:         'rgba(138,154,134,0.13)',
        }}>
          {isBg ? '[ услуги ]' : '[ services ]'}
        </span>
      </div>

    </div>
  )
}
