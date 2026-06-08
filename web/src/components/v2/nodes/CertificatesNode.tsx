'use client'

import { useRef, useCallback } from 'react'
import gsap from 'gsap'
import type { Certificate } from '@/generated/prisma/client'

interface Props {
  data: Certificate[]
  lang: string
}

function formatYear(dt: Date | string | null | undefined): string {
  if (!dt) return ''
  try { return new Date(dt).getFullYear().toString() } catch { return '' }
}

// Distribute N items into 3 column buckets: 0→col0, 1→col1, 2→col2, 3→col0, ...
function distribute<T>(items: T[]): [T[], T[], T[]] {
  const cols: [T[], T[], T[]] = [[], [], []]
  items.forEach((item, i) => cols[i % 3].push(item))
  return cols
}

// Each column has a distinct vertical offset — creates the "physically placed" feel.
// Not a grid. Documents are at different heights, like papers on a table.
const COL_OFFSETS = [0, 88, 44]   // px drop per column

export function CertificatesNode({ data, lang }: Props) {
  const isBg  = lang === 'bg'
  const cols  = distribute(data)
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
        <line x1={0.3} y1={0} x2={0.3} y2={100} stroke="rgba(138,154,134,0.10)" strokeWidth={0.20} />
        <line x1={5} y1={34} x2={95} y2={34}     stroke="rgba(138,154,134,0.07)" strokeWidth={0.08} />
        <path d="M 2 2 L 2 5 M 2 2 L 5 2"   stroke="rgba(138,154,134,0.20)" strokeWidth={0.16} fill="none" />
        <path d="M 98 98 L 98 95 M 98 98 L 95 98" stroke="rgba(138,154,134,0.20)" strokeWidth={0.16} fill="none" />
        {/* Certification seal reference — upper right */}
        <circle cx={87} cy={17} r={6} fill="none" stroke="rgba(138,154,134,0.07)" strokeWidth={0.22} />
        <circle cx={87} cy={17} r={3} fill="none" stroke="rgba(138,154,134,0.11)" strokeWidth={0.14} />
      </svg>

      {/* TITLE ZONE */}
      <div style={{ position: 'absolute', top: '8%', left: '6%', right: '20%' }}>
        <div style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: 'clamp(10px, 0.9vw, 14px)',
          letterSpacing: '0.42em', textTransform: 'uppercase',
          color: '#8A9A86', marginBottom: '2vh',
        }}>
          {isBg ? 'Сертификати' : 'Certificates'}
        </div>
        <h2 style={{
          fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
          fontSize: 'clamp(32px, 4.5vw, 72px)',
          fontWeight: 300, lineHeight: 0.93,
          letterSpacing: '-0.03em',
          color: 'rgba(205,218,200,0.88)',
          margin: 0,
        }}>
          {data.length}
          <span style={{ color: 'rgba(138,154,134,0.38)', fontSize: '0.6em', marginLeft: '0.4em' }}>
            {isBg ? 'документа' : 'documents'}
          </span>
        </h2>
      </div>

      {/* THREE-COLUMN STAGGERED LAYOUT */}
      {/* Each column drops by a different amount — documents feel placed, not arranged. */}
      <div style={{
        position: 'absolute',
        top: '36%', left: '6%', right: '6%', bottom: '4%',
        display: 'flex',
        gap: '2.5vw',
        alignItems: 'flex-start',
        overflow: 'hidden',
      }}>
        {cols.map((colItems, colIdx) => (
          <div
            key={colIdx}
            style={{
              flex: 1,
              marginTop: COL_OFFSETS[colIdx],
              display: 'flex',
              flexDirection: 'column',
              gap: '2.8vh',
            }}
          >
            {colItems.map(cert => {
              const year = formatYear(cert.issueDate)
              return (
                <div key={cert.id} style={{ position: 'relative' }}>
                  {/* Document */}
                  {cert.imageUrl ? (
                    <img
                      src={cert.imageUrl}
                      alt={cert.title}
                      style={{
                        width: '100%',
                        aspectRatio: '210/297',
                        objectFit: 'cover',
                        display: 'block',
                        filter: 'brightness(0.70) grayscale(0.40)',
                        border: '1px solid rgba(138,154,134,0.12)',
                        marginBottom: '1vh',
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      aspectRatio: '210/297',
                      background: 'rgba(138,154,134,0.04)',
                      border: '1px solid rgba(138,154,134,0.09)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1vh',
                    }}>
                      <svg viewBox="0 0 60 80" style={{ width: '55%', height: '55%' }}>
                        {[18, 26, 34, 42, 50, 58].map(y => (
                          <line key={y} x1={8} y1={y} x2={52} y2={y}
                            stroke="rgba(138,154,134,0.14)" strokeWidth={1.2} />
                        ))}
                        <line x1={8} y1={10} x2={34} y2={10}
                          stroke="rgba(138,154,134,0.24)" strokeWidth={1.8} />
                      </svg>
                    </div>
                  )}

                  {/* Certificate meta */}
                  <div style={{
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontSize: 'clamp(9px, 0.76vw, 12px)',
                    color: 'rgba(205,218,200,0.68)',
                    lineHeight: 1.4,
                    marginBottom: '0.4vh',
                  }}>
                    {cert.title}
                  </div>
                  <div style={{ display: 'flex', gap: '0.8vw', alignItems: 'center' }}>
                    {cert.issuer && (
                      <span style={{
                        fontFamily: 'var(--font-geist-mono), monospace',
                        fontSize: 'clamp(8px, 0.66vw, 10px)',
                        color: 'rgba(138,154,134,0.38)',
                        letterSpacing: '0.20em', textTransform: 'uppercase',
                      }}>
                        {cert.issuer}
                      </span>
                    )}
                    {year && (
                      <span style={{
                        fontFamily: 'var(--font-geist-mono), monospace',
                        fontSize: 'clamp(8px, 0.66vw, 10px)',
                        color: 'rgba(138,154,134,0.24)',
                        letterSpacing: '0.18em',
                      }}>
                        {year}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div style={{
          position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)',
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: 'clamp(10px, 0.9vw, 14px)',
          letterSpacing: '0.30em', textTransform: 'uppercase',
          color: 'rgba(138,154,134,0.22)',
        }}>
          {isBg ? '— няма данни —' : '— no data —'}
        </div>
      )}

    </div>
  )
}
