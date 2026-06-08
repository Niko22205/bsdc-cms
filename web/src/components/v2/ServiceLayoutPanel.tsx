'use client'

import { useEffect, useRef } from 'react'
import type { Service } from '@/generated/prisma/client'

interface Props {
  service: Service
  lang:    string
  onClose: () => void
}

interface StatCard { label: string; value: string }

function parseStatCards(raw: unknown): StatCard[] {
  if (!raw || !Array.isArray(raw)) return []
  return raw as StatCard[]
}

export function ServiceLayoutPanel({ service, lang, onClose }: Props) {
  const isBg      = lang === 'bg'
  const statCards = parseStatCards(service.statCards)
  const accent    = service.accentColor ?? 'rgba(138,154,134,0.60)'
  const panelRef  = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Prevent body scroll while panel is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: '#070e0b',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        padding: '2.4vh 3vw',
        borderBottom: '1px solid rgba(138,154,134,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        {/* Accent rule */}
        <div style={{
          position: 'absolute', bottom: -1, left: '3vw', width: '12vw', height: 1,
          background: accent, opacity: 0.45,
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.6vw' }}>
          <span style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: 'clamp(8px, 0.72vw, 11px)',
            letterSpacing: '0.42em', textTransform: 'uppercase',
            color: 'rgba(138,154,134,0.30)',
          }}>
            {isBg ? 'Операция' : 'Operation'}
          </span>
          <div style={{ width: 1, height: '1.4vh', background: 'rgba(138,154,134,0.18)' }} />
          <span style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: 'clamp(10px, 0.9vw, 14px)',
            letterSpacing: '0.24em', textTransform: 'uppercase',
            color: 'rgba(138,154,134,0.55)',
          }}>
            {service.slug.toUpperCase()}
          </span>
        </div>

        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            background: 'none', border: '1px solid rgba(138,154,134,0.18)',
            padding: '0.6vh 1.2vw',
            display: 'flex', alignItems: 'center', gap: '0.6vw',
            cursor: 'pointer',
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: 'clamp(9px, 0.82vw, 13px)',
            letterSpacing: '0.38em', textTransform: 'uppercase',
            color: 'rgba(138,154,134,0.50)',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = 'rgba(138,154,134,0.40)'
            el.style.color = 'rgba(138,154,134,0.80)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = 'rgba(138,154,134,0.18)'
            el.style.color = 'rgba(138,154,134,0.50)'
          }}
        >
          <span>×</span>
          <span>{isBg ? 'Затвори' : 'Exit'}</span>
        </button>
      </div>

      {/* ── BODY ────────────────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        style={{
          flex: 1, overflow: 'auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 0,
        }}
      >
        {/* LEFT COLUMN */}
        <div style={{
          padding: '5vh 3vw 5vh 3vw',
          borderRight: '1px solid rgba(138,154,134,0.08)',
          display: 'flex', flexDirection: 'column', gap: '4vh',
        }}>

          {/* Service title */}
          <div>
            <h1 style={{
              fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
              fontSize: 'clamp(40px, 5.5vw, 88px)',
              fontWeight: 300, lineHeight: 0.92,
              letterSpacing: '-0.03em',
              color: 'rgba(205,218,200,0.92)',
              margin: 0,
            }}>
              {service.title}
            </h1>
            {service.shortDescription && (
              <p style={{
                marginTop: '2vh',
                fontSize: 'clamp(13px, 1.1vw, 18px)',
                fontWeight: 300, lineHeight: 1.65,
                color: 'rgba(138,154,134,0.58)',
              }}>
                {service.shortDescription}
              </p>
            )}
          </div>

          {/* Stat cards */}
          {statCards.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(statCards.length, 3)}, 1fr)`,
              gap: '1px',
              background: 'rgba(138,154,134,0.08)',
            }}>
              {statCards.map((card, i) => (
                <div key={i} style={{
                  padding: '2.4vh 1.5vw',
                  background: '#070e0b',
                }}>
                  <div style={{
                    fontSize: 'clamp(28px, 3.2vw, 52px)',
                    fontWeight: 300, letterSpacing: '-0.03em',
                    color: 'rgba(205,218,200,0.85)', lineHeight: 1,
                    marginBottom: '0.8vh',
                  }}>
                    {card.value}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontSize: 'clamp(8px, 0.72vw, 11px)',
                    letterSpacing: '0.36em', textTransform: 'uppercase',
                    color: 'rgba(138,154,134,0.38)',
                  }}>
                    {card.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Full content */}
          {service.content && (
            <div style={{
              borderLeft: `2px solid ${accent}`,
              paddingLeft: '1.5vw',
              opacity: 0.7,
            }}>
              <p style={{
                fontSize: 'clamp(13px, 1.05vw, 17px)',
                fontWeight: 300, lineHeight: 1.88,
                color: 'rgba(138,154,134,0.70)',
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}>
                {service.content}
              </p>
            </div>
          )}

          {/* Activities */}
          {service.activities.length > 0 && (
            <div>
              <div style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: 'clamp(8px, 0.72vw, 11px)',
                letterSpacing: '0.42em', textTransform: 'uppercase',
                color: 'rgba(138,154,134,0.30)',
                marginBottom: '2vh',
                paddingBottom: '1.2vh',
                borderBottom: '1px solid rgba(138,154,134,0.08)',
              }}>
                {isBg ? '// Дейности' : '// Activities'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2vh' }}>
                {service.activities.map((act, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '1vw',
                  }}>
                    <div style={{
                      width: 3, height: 3, borderRadius: '50%', flexShrink: 0,
                      background: accent, opacity: 0.55,
                    }} />
                    <span style={{
                      fontSize: 'clamp(12px, 1vw, 16px)',
                      fontWeight: 300, color: 'rgba(138,154,134,0.62)',
                    }}>
                      {act}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN — imagery */}
        <div style={{
          padding: '5vh 3vw 5vh 3vw',
          display: 'flex', flexDirection: 'column', gap: '2vh',
        }}>

          {/* Featured image */}
          {service.featuredImageUrl && (
            <div style={{ flexShrink: 0 }}>
              <img
                src={service.featuredImageUrl}
                alt={service.title}
                style={{
                  width: '100%',
                  height: '38vh',
                  objectFit: 'cover',
                  display: 'block',
                  filter: 'brightness(0.82)',
                  border: '1px solid rgba(138,154,134,0.10)',
                }}
              />
            </div>
          )}

          {/* Gallery grid */}
          {service.images.length > 0 && (
            <div>
              <div style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: 'clamp(8px, 0.72vw, 11px)',
                letterSpacing: '0.42em', textTransform: 'uppercase',
                color: 'rgba(138,154,134,0.28)',
                marginBottom: '1.6vh',
                paddingBottom: '1vh',
                borderBottom: '1px solid rgba(138,154,134,0.06)',
              }}>
                {isBg ? `// Галерия · ${service.images.length}` : `// Gallery · ${service.images.length}`}
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.8vh',
              }}>
                {service.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    style={{
                      width: '100%', aspectRatio: '4/3',
                      objectFit: 'cover',
                      display: 'block',
                      filter: 'brightness(0.78) grayscale(0.2)',
                      border: '1px solid rgba(138,154,134,0.08)',
                      transition: 'filter 0.3s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLImageElement).style.filter = 'brightness(0.92) grayscale(0)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLImageElement).style.filter = 'brightness(0.78) grayscale(0.2)'
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Bottom watermark */}
          <div style={{ marginTop: 'auto', textAlign: 'right' }}>
            <span style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: 'clamp(8px, 0.7vw, 11px)',
              letterSpacing: '0.28em',
              color: 'rgba(138,154,134,0.12)',
            }}>
              BSDC · {service.slug.toUpperCase()}
            </span>
          </div>

        </div>
      </div>
    </div>
  )
}
