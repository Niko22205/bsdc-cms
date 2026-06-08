'use client'

import type { Service, Certificate } from '@/generated/prisma/client'

interface Props {
  data:            Service[]
  certificates:    Certificate[]
  lang:            string
  onServiceSelect: (svc: Service) => void
}

const MAX_VISIBLE = 6

export function ServicesNode({ data, certificates, lang, onServiceSelect }: Props) {
  const isBg    = lang === 'bg'
  const visible = data.slice(0, MAX_VISIBLE)
  const extra   = Math.max(0, data.length - MAX_VISIBLE)

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      background: '#0a1410',
    }}>

      {/* Structural geometry */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <line x1={68} y1={0} x2={68} y2={100}
          stroke="rgba(138,154,134,0.06)" strokeWidth={0.12} />
        <line x1={5} y1={38} x2={95} y2={38}
          stroke="rgba(138,154,134,0.08)" strokeWidth={0.08} />
        <line x1={82}   y1={18}   x2={87}   y2={18}   stroke="rgba(138,154,134,0.18)" strokeWidth={0.14} />
        <line x1={84.5} y1={15.5} x2={84.5} y2={20.5} stroke="rgba(138,154,134,0.18)" strokeWidth={0.14} />
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
          {isBg ? 'Услуги' : 'Services'}
        </div>
        <h2 style={{
          fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
          fontSize: 'clamp(36px, 5.5vw, 88px)',
          fontWeight: 300, lineHeight: 0.93,
          letterSpacing: '-0.03em',
          color: 'rgba(205,218,200,0.90)',
          margin: 0, marginBottom: '1vh',
        }}>
          {isBg ? 'Нашите операции' : 'Our operations'}
        </h2>
        {certificates.length > 0 && (
          <span style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: 'clamp(9px, 0.82vw, 13px)',
            letterSpacing: '0.32em', color: 'rgba(138,154,134,0.40)',
            textTransform: 'uppercase',
          }}>
            {isBg ? `${certificates.length} сертификата` : `${certificates.length} certifications`}
          </span>
        )}
      </div>

      {/* Interaction hint */}
      <div style={{
        position: 'absolute', top: '10%', right: '5%',
        fontFamily: 'var(--font-geist-mono), monospace',
        fontSize: 'clamp(8px, 0.72vw, 11px)',
        letterSpacing: '0.30em', textTransform: 'uppercase',
        color: 'rgba(138,154,134,0.22)',
        textAlign: 'right',
      }}>
        {isBg ? '[ клик за детайли ]' : '[ click to expand ]'}
      </div>

      {/* SERVICE LIST */}
      <div style={{
        position: 'absolute',
        top: '41%', left: '6%',
        width: '61%',
        borderTop: '1px solid rgba(138,154,134,0.10)',
      }}>
        {visible.map((svc, i) => (
          <ServiceRow
            key={svc.id}
            svc={svc}
            index={i}
            isLast={i === visible.length - 1 && extra === 0}
            onClick={() => onServiceSelect(svc)}
          />
        ))}
        {extra > 0 && (
          <div style={{
            padding: '1.8vh 0',
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

    </div>
  )
}

function ServiceRow({
  svc, index, isLast, onClick,
}: {
  svc:     Service
  index:   number
  isLast:  boolean
  onClick: () => void
}) {
  const num    = String(index + 1).padStart(2, '0')
  const accent = svc.accentColor ?? 'rgba(138,154,134,0.40)'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick()}
      style={{
        display: 'grid',
        gridTemplateColumns: '4vw 1fr auto',
        alignItems: 'center',
        padding: '1.8vh 0',
        borderBottom: isLast ? 'none' : '1px solid rgba(138,154,134,0.06)',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
        outline: 'none',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(138,154,134,0.04)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = 'transparent'
      }}
    >
      {/* Left accent strip */}
      <div style={{
        position: 'absolute', left: '-1.4vw', top: 0, bottom: 0, width: 2,
        background: accent, opacity: 0.55,
      }} />

      {/* Index */}
      <span style={{
        fontFamily: 'var(--font-geist-mono), monospace',
        fontSize: 'clamp(9px, 0.82vw, 13px)',
        letterSpacing: '0.2em',
        color: 'rgba(138,154,134,0.26)',
      }}>
        {num}
      </span>

      {/* Title + description */}
      <div>
        <div style={{
          fontSize: 'clamp(14px, 1.5vw, 24px)',
          fontWeight: 300, letterSpacing: '-0.01em',
          color: 'rgba(205,218,200,0.85)',
          marginBottom: svc.shortDescription ? '0.3vh' : 0,
          lineHeight: 1.2,
        }}>
          {svc.title}
        </div>
        {svc.shortDescription && (
          <div style={{
            fontSize: 'clamp(10px, 0.9vw, 14px)',
            fontWeight: 300, lineHeight: 1.5,
            color: 'rgba(138,154,134,0.44)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            maxWidth: '38vw',
          }}>
            {svc.shortDescription}
          </div>
        )}
      </div>

      {/* Arrow + activity count */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
        gap: '0.4vh', paddingLeft: '1vw',
      }}>
        {svc.activities.length > 0 && (
          <span style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: 'clamp(8px, 0.75vw, 12px)',
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: 'rgba(138,154,134,0.28)',
            lineHeight: 1.4,
          }}>
            {svc.activities.length}
            <br />
            <span style={{ fontSize: '0.7em' }}>ACT</span>
          </span>
        )}
        <span style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: 'clamp(10px, 0.9vw, 14px)',
          color: 'rgba(138,154,134,0.30)',
        }}>
          →
        </span>
      </div>

    </div>
  )
}
