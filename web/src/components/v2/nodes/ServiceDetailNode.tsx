'use client'

import { useRef, useCallback } from 'react'
import gsap from 'gsap'
import type { Service } from '@/generated/prisma/client'

interface Props {
  service: Service
  lang:    string
  onExit:  () => void
}

interface StatCard { label: string; value: string }
function parseStatCards(raw: unknown): StatCard[] {
  if (!raw || !Array.isArray(raw)) return []
  return raw as StatCard[]
}

export function ServiceDetailNode({ service, lang, onExit }: Props) {
  const isBg      = lang === 'bg'
  const accent    = service.accentColor ?? 'rgba(138,154,134,0.60)'
  const statCards = parseStatCards(service.statCards)

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
        overflow: 'hidden', background: '#08100d',
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
        <line x1={0.4} y1={0} x2={0.4} y2={100} stroke={accent} strokeWidth={0.28} opacity={0.35} />
        <line x1={5} y1={36} x2={95} y2={36} stroke="rgba(138,154,134,0.07)" strokeWidth={0.08} />
        <path d="M 2 2 L 2 5 M 2 2 L 5 2" stroke="rgba(138,154,134,0.22)" strokeWidth={0.16} fill="none" />
        <path d="M 98 98 L 98 95 M 98 98 L 95 98" stroke="rgba(138,154,134,0.22)" strokeWidth={0.16} fill="none" />
      </svg>

      {/* EXIT BUTTON — top right */}
      <button
        onClick={onExit}
        aria-label={isBg ? 'Назад' : 'Return'}
        style={{
          position: 'absolute', top: '6%', right: '5%',
          background: 'none',
          border: '1px solid rgba(138,154,134,0.18)',
          padding: '0.6vh 1.2vw',
          cursor: 'pointer',
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: 'clamp(8px, 0.72vw, 11px)',
          letterSpacing: '0.36em', textTransform: 'uppercase',
          color: 'rgba(138,154,134,0.45)',
          display: 'flex', alignItems: 'center', gap: '0.5vw',
          transition: 'color 0.2s, border-color 0.2s',
          zIndex: 2,
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.color = 'rgba(138,154,134,0.80)'
          el.style.borderColor = 'rgba(138,154,134,0.40)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.color = 'rgba(138,154,134,0.45)'
          el.style.borderColor = 'rgba(138,154,134,0.18)'
        }}
      >
        <span style={{ fontSize: '1.1em' }}>←</span>
        <span>{isBg ? 'Назад' : 'Return'}</span>
      </button>

      {/* TITLE ZONE */}
      <div style={{ position: 'absolute', top: '8%', left: '6%', right: '22%' }}>
        <div style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: 'clamp(8px, 0.75vw, 12px)',
          letterSpacing: '0.42em', textTransform: 'uppercase',
          color: 'rgba(138,154,134,0.32)', marginBottom: '1.5vh',
        }}>
          {isBg ? 'Операция' : 'Operation'} · {service.slug.toUpperCase()}
        </div>
        <h2 style={{
          fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
          fontSize: 'clamp(28px, 4vw, 64px)',
          fontWeight: 300, lineHeight: 0.93,
          letterSpacing: '-0.03em',
          color: 'rgba(205,218,200,0.90)',
          margin: 0,
        }}>
          {service.title}
        </h2>
        {service.shortDescription && (
          <p style={{
            marginTop: '1.5vh',
            fontSize: 'clamp(12px, 1vw, 16px)',
            fontWeight: 300, lineHeight: 1.65,
            color: 'rgba(138,154,134,0.55)',
          }}>
            {service.shortDescription}
          </p>
        )}
      </div>

      {/* CONTENT AREA — split columns */}
      <div style={{
        position: 'absolute',
        top: '40%', left: '6%', right: '6%', bottom: '6%',
        display: 'grid',
        gridTemplateColumns: service.images.length > 0 ? '1fr 1fr' : '1fr',
        gap: '3vw',
        overflow: 'hidden',
      }}>

        {/* LEFT: content + activities + stat cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5vh', overflow: 'hidden' }}>

          {/* Stat cards */}
          {statCards.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(statCards.length, 3)}, 1fr)`,
              gap: '1px', background: 'rgba(138,154,134,0.08)',
              flexShrink: 0,
            }}>
              {statCards.map((card, i) => (
                <div key={i} style={{ padding: '2vh 1.2vw', background: '#08100d' }}>
                  <div style={{
                    fontSize: 'clamp(24px, 2.8vw, 44px)',
                    fontWeight: 300, letterSpacing: '-0.03em',
                    color: 'rgba(205,218,200,0.85)', lineHeight: 1, marginBottom: '0.6vh',
                  }}>
                    {card.value}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontSize: 'clamp(8px, 0.68vw, 11px)',
                    letterSpacing: '0.34em', textTransform: 'uppercase',
                    color: 'rgba(138,154,134,0.36)',
                  }}>
                    {card.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Content text */}
          {service.content && (
            <div style={{
              borderLeft: `2px solid ${accent}`,
              paddingLeft: '1.2vw', opacity: 0.75, flexShrink: 0,
            }}>
              <p style={{
                fontSize: 'clamp(12px, 1vw, 16px)',
                fontWeight: 300, lineHeight: 1.85,
                color: 'rgba(138,154,134,0.65)', margin: 0,
              }}>
                {service.content}
              </p>
            </div>
          )}

          {/* Activities */}
          {service.activities.length > 0 && (
            <div style={{ flexShrink: 0 }}>
              <div style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: 'clamp(8px, 0.70vw, 11px)',
                letterSpacing: '0.42em', textTransform: 'uppercase',
                color: 'rgba(138,154,134,0.28)',
                marginBottom: '1.5vh',
                paddingBottom: '1vh',
                borderBottom: '1px solid rgba(138,154,134,0.07)',
              }}>
                {isBg ? '// Дейности' : '// Activities'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1vh' }}>
                {service.activities.map((act, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.8vw' }}>
                    <div style={{
                      width: 3, height: 3, borderRadius: '50%', flexShrink: 0,
                      background: accent, opacity: 0.50,
                    }} />
                    <span style={{
                      fontSize: 'clamp(11px, 0.95vw, 15px)',
                      fontWeight: 300, color: 'rgba(138,154,134,0.60)',
                    }}>
                      {act}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: imagery */}
        {service.images.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2vh', overflow: 'hidden' }}>
            {service.featuredImageUrl && (
              <img
                src={service.featuredImageUrl}
                alt={service.title}
                style={{
                  width: '100%', height: '42%',
                  objectFit: 'cover', display: 'block',
                  filter: 'brightness(0.78)',
                  border: '1px solid rgba(138,154,134,0.10)',
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.7vh', flex: 1, overflow: 'hidden',
            }}>
              {service.images.slice(0, 6).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  style={{
                    width: '100%', aspectRatio: '4/3',
                    objectFit: 'cover', display: 'block',
                    filter: 'brightness(0.72) grayscale(0.25)',
                    border: '1px solid rgba(138,154,134,0.07)',
                    transition: 'filter 0.3s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLImageElement).style.filter = 'brightness(0.88) grayscale(0)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLImageElement).style.filter = 'brightness(0.72) grayscale(0.25)'
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
