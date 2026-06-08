'use client'

import { useRef, useCallback } from 'react'
import gsap from 'gsap'
import type { AboutContent } from '@/generated/prisma/client'

interface Props {
  data: AboutContent | null
  lang: string
}

interface Stat   { value: string; label: string }
interface TlItem { year: string; event: string }

function parseStats(raw: unknown): Stat[] {
  if (!raw || !Array.isArray(raw)) return []
  return (raw as Stat[]).slice(0, 4)
}

function parseTimeline(raw: unknown): TlItem[] {
  if (!raw || !Array.isArray(raw)) return []
  return (raw as TlItem[]).slice(0, 5)
}

export function AboutNode({ data, lang }: Props) {
  const isBg     = lang === 'bg'
  const title    = data?.title    ?? (isBg ? 'За нас' : 'About BSDC')
  const subtitle = data?.subtitle ?? null
  const content  = data?.content  ? String(data.content).slice(0, 240) : null
  const stats    = parseStats(data?.statistics)
  const timeline = parseTimeline(data?.timeline)

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

      {/* Structural geometry — cursor-driven */}
      <svg
        ref={geoRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <line x1={0.3} y1={0} x2={0.3} y2={100} stroke="rgba(138,154,134,0.12)" strokeWidth={0.18} />
        {[25, 50, 75].map(y => (
          <line key={y} x1={0.3} y1={y} x2={1.8} y2={y} stroke="rgba(138,154,134,0.18)" strokeWidth={0.10} />
        ))}
        <line x1={5} y1={46} x2={95} y2={46} stroke="rgba(138,154,134,0.07)" strokeWidth={0.08} />
        <line x1={88}   y1={12}   x2={93}   y2={12}   stroke="rgba(138,154,134,0.18)" strokeWidth={0.14} />
        <line x1={90.5} y1={9.5}  x2={90.5} y2={14.5} stroke="rgba(138,154,134,0.18)" strokeWidth={0.14} />
      </svg>

      {/* TITLE ZONE — Tier 1 */}
      <div style={{ position: 'absolute', top: '8%', left: '7%', right: '8%' }}>
        <div style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: 'clamp(9px, 0.85vw, 13px)',
          letterSpacing: '0.42em', textTransform: 'uppercase',
          color: '#8A9A86', marginBottom: '2vh',
        }}>
          {isBg ? 'За нас' : 'About'}
        </div>
        <h2 style={{
          fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
          fontSize: 'clamp(40px, 6vw, 96px)',
          fontWeight: 300, lineHeight: 0.92,
          letterSpacing: '-0.04em',
          color: 'rgba(205,218,200,0.92)',
          margin: 0,
        }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{
            fontSize: 'clamp(12px, 1vw, 16px)',
            fontWeight: 300, lineHeight: 1.6,
            color: 'rgba(138,154,134,0.50)', margin: 0, marginTop: '1.5vh',
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* STATS — Tier 2, content-width flex */}
      {stats.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '52%', left: '7%', right: '7%',
          display: 'flex', gap: 0,
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              paddingRight: 'clamp(18px, 2.8vw, 44px)',
              paddingLeft:  i > 0 ? 'clamp(18px, 2.8vw, 44px)' : 0,
              borderLeft:   i > 0 ? '1px solid rgba(138,154,134,0.10)' : 'none',
              flexShrink: 0,
            }}>
              <div style={{
                fontSize: 'clamp(24px, 3.2vw, 52px)',
                fontWeight: 300, letterSpacing: '-0.04em',
                color: 'rgba(205,218,200,0.82)', lineHeight: 1,
              }}>
                {s.value}
              </div>
              <div style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: 'clamp(8px, 0.70vw, 11px)',
                letterSpacing: '0.32em', textTransform: 'uppercase',
                color: 'rgba(138,154,134,0.40)', marginTop: '0.8vh',
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONTENT TEXT — fallback when no stats */}
      {content && !stats.length && (
        <div style={{
          position: 'absolute', top: '54%', left: '7%', right: '7%',
          borderLeft: '2px solid rgba(138,154,134,0.18)', paddingLeft: '1.2vw',
        }}>
          <p style={{
            fontSize: 'clamp(11px, 0.95vw, 15px)',
            fontWeight: 300, lineHeight: 1.85,
            color: 'rgba(138,154,134,0.55)', margin: 0,
          }}>
            {content}
          </p>
        </div>
      )}

      {/* TIMELINE — Tier 3, bottom strip */}
      {timeline.length > 0 && (
        <div style={{
          position: 'absolute', bottom: '7%', left: '7%', right: '7%',
          display: 'flex',
          borderTop: '1px solid rgba(138,154,134,0.07)',
          paddingTop: '2vh',
        }}>
          {timeline.map((item, i, arr) => (
            <div key={i} style={{ flex: 1, paddingRight: '1vw', position: 'relative' }}>
              {i < arr.length - 1 && (
                <div style={{
                  position: 'absolute', top: '0.4vh', left: '55%', right: '-0.5vw',
                  height: 1, background: 'rgba(138,154,134,0.10)',
                }} />
              )}
              <div style={{
                width: 3, height: 3, borderRadius: '50%',
                border: '1px solid rgba(138,154,134,0.36)',
                marginBottom: '0.8vh',
                background: i === 0 ? 'rgba(138,154,134,0.22)' : 'transparent',
              }} />
              <div style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: 'clamp(8px, 0.75vw, 12px)',
                letterSpacing: '0.20em', color: 'rgba(138,154,134,0.48)', marginBottom: '0.4vh',
              }}>
                {item.year}
              </div>
              <div style={{
                fontSize: 'clamp(9px, 0.72vw, 11px)',
                fontWeight: 300, lineHeight: 1.4, color: 'rgba(138,154,134,0.32)',
              }}>
                {item.event}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ position: 'absolute', bottom: '2.5%', right: '7%' }}>
        <span style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: 'clamp(7px, 0.62vw, 10px)',
          letterSpacing: '0.28em', color: 'rgba(138,154,134,0.13)',
        }}>
          42.698°N · 23.322°E
        </span>
      </div>

    </div>
  )
}
