'use client'

import { useRef, useCallback } from 'react'
import gsap from 'gsap'
import type { ProjectNewsItem } from '@/generated/prisma/client'

interface Props {
  data: ProjectNewsItem[]
  lang: string
}

const MAX_VISIBLE = 5

function formatYear(dt: Date | string | null | undefined): string {
  if (!dt) return ''
  try { return new Date(dt).getFullYear().toString() } catch { return '' }
}

export function ProjectsNode({ data, lang }: Props) {
  const isBg    = lang === 'bg'
  const visible = data.slice(0, MAX_VISIBLE)
  const extra   = Math.max(0, data.length - MAX_VISIBLE)

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
        width: '100%',
        height: '100%',
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
        {/* Corner marks — upper-left, upper-right */}
        <path d="M 1 1 L 1 4 M 1 1 L 4 1"   stroke="rgba(138,154,134,0.22)" strokeWidth={0.14} fill="none" />
        <path d="M 99 1 L 99 4 M 99 1 L 96 1" stroke="rgba(138,154,134,0.22)" strokeWidth={0.14} fill="none" />
        {/* Horizontal rule below count headline */}
        <line x1={5} y1={36} x2={95} y2={36}
          stroke="rgba(138,154,134,0.08)" strokeWidth={0.08} />
        {/* Right column separator */}
        <line x1={72} y1={36} x2={72} y2={95}
          stroke="rgba(138,154,134,0.06)" strokeWidth={0.10} />
      </svg>

      {/* TITLE ZONE */}
      <div style={{ position: 'absolute', top: '10%', left: '6%', right: '35%' }}>
        <div style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: 'clamp(10px, 0.9vw, 14px)',
          letterSpacing: '0.42em', textTransform: 'uppercase',
          color: '#8A9A86',
          marginBottom: '2vh',
        }}>
          {isBg ? 'Проекти' : 'Projects'}
        </div>
        <h2 style={{
          fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
          fontSize: 'clamp(36px, 5.5vw, 88px)',
          fontWeight: 300, lineHeight: 0.93,
          letterSpacing: '-0.03em',
          color: 'rgba(205,218,200,0.90)',
          margin: 0,
        }}>
          <span>{data.length}</span>{' '}
          <span style={{ color: 'rgba(138,154,134,0.42)' }}>
            {isBg ? 'обекта' : 'missions'}
          </span>
        </h2>
      </div>

      {/* PROJECT LIST */}
      <div style={{
        position: 'absolute',
        top: '39%', left: '6%',
        width: '65%',
        borderTop: '1px solid rgba(138,154,134,0.10)',
      }}>
        {visible.map((proj, i) => (
          <ProjectEntry
            key={proj.id}
            proj={proj}
            index={i}
            lang={lang}
            isLast={i === visible.length - 1 && extra === 0}
          />
        ))}
        {extra > 0 && (
          <div style={{
            padding: '1.5vh 0',
            borderTop: '1px solid rgba(138,154,134,0.06)',
            display: 'flex', alignItems: 'center', gap: '1vw',
          }}>
            <div style={{ width: '2vw', height: 1, background: 'rgba(138,154,134,0.18)' }} />
            <span style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: 'clamp(9px, 0.82vw, 13px)',
              letterSpacing: '0.3em', textTransform: 'uppercase',
              color: 'rgba(138,154,134,0.32)',
            }}>
              +{extra} {isBg ? 'още' : 'more'}
            </span>
          </div>
        )}
      </div>

      {/* Coordinate mark */}
      <div style={{ position: 'absolute', bottom: '3%', right: '6%' }}>
        <span style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: 'clamp(8px, 0.7vw, 11px)',
          letterSpacing: '0.28em', color: 'rgba(138,154,134,0.16)',
        }}>
          42.698°N · 23.322°E
        </span>
      </div>

    </div>
  )
}

function ProjectEntry({
  proj, index, isLast,
}: {
  proj:   ProjectNewsItem
  index:  number
  lang:   string
  isLast: boolean
}) {
  const num  = String(index + 1).padStart(2, '0')
  const year = formatYear(proj.publishedAt)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '3.5vw 1fr 8vw',
      alignItems: 'start',
      padding: '1.6vh 0',
      borderBottom: isLast ? 'none' : '1px solid rgba(138,154,134,0.06)',
    }}>

      {/* Watermark index */}
      <div style={{
        fontFamily: 'var(--font-geist-mono), monospace',
        fontSize: 'clamp(18px, 2.2vw, 36px)',
        fontWeight: 300, lineHeight: 1,
        color: 'rgba(138,154,134,0.07)',
        paddingTop: '0.2vh',
        letterSpacing: '-0.02em',
        userSelect: 'none',
      }}>
        {num}
      </div>

      {/* Content */}
      <div>
        <div style={{
          fontSize: 'clamp(13px, 1.4vw, 22px)',
          fontWeight: 300, letterSpacing: '-0.01em',
          color: 'rgba(205,218,200,0.84)',
          marginBottom: '0.4vh', lineHeight: 1.2,
        }}>
          {proj.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw', flexWrap: 'wrap' }}>
          {proj.location && (
            <span style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: 'clamp(8px, 0.75vw, 12px)',
              letterSpacing: '0.28em', textTransform: 'uppercase',
              color: 'rgba(138,154,134,0.50)',
            }}>
              {proj.location}
            </span>
          )}
          {proj.location && proj.client && (
            <div style={{ width: 2, height: 2, borderRadius: '50%', background: 'rgba(138,154,134,0.22)', flexShrink: 0 }} />
          )}
          {proj.client && (
            <span style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: 'clamp(8px, 0.75vw, 12px)',
              letterSpacing: '0.25em', textTransform: 'uppercase',
              color: 'rgba(138,154,134,0.36)',
            }}>
              {proj.client}
            </span>
          )}
        </div>
      </div>

      {/* Year + thumbnail */}
      <div style={{ textAlign: 'right' }}>
        {year && (
          <span style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: 'clamp(9px, 0.85vw, 13px)',
            letterSpacing: '0.2em', color: 'rgba(138,154,134,0.34)',
          }}>
            {year}
          </span>
        )}
        {proj.featuredImageUrl && (
          <div style={{ marginTop: '0.6vh' }}>
            <img
              src={proj.featuredImageUrl}
              alt=""
              style={{
                width: '6vw', height: '3.5vh',
                objectFit: 'cover',
                opacity: 0.50,
                filter: 'grayscale(0.7) brightness(0.72)',
                display: 'block',
                marginLeft: 'auto',
                border: '1px solid rgba(138,154,134,0.12)',
              }}
            />
          </div>
        )}
      </div>

    </div>
  )
}
