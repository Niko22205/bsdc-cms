'use client'

import type { SiteSetting } from '@/generated/prisma/client'

interface Props {
  settings: SiteSetting | null
  lang:     string
}

export function FooterNode({ settings, lang }: Props) {
  const isBg = lang === 'bg'
  const year = new Date().getFullYear()

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      background: '#070e0b',
    }}>

      {/* Structural geometry */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Terminal baseline — bottom edge reference */}
        <line x1={0} y1={92} x2={100} y2={92}
          stroke="rgba(138,154,134,0.10)" strokeWidth={0.10} />
        {/* Top border */}
        <line x1={0} y1={8} x2={100} y2={8}
          stroke="rgba(138,154,134,0.06)" strokeWidth={0.08} />
        {/* Right-angle terminal mark */}
        <path d="M 94 92 L 94 88 M 94 92 L 98 92"
          stroke="rgba(138,154,134,0.22)" strokeWidth={0.18} fill="none" />
        {/* Left terminal cross */}
        <line x1={4}   y1={48}   x2={8}   y2={48}   stroke="rgba(138,154,134,0.14)" strokeWidth={0.12} />
        <line x1={6}   y1={46}   x2={6}   y2={50}   stroke="rgba(138,154,134,0.14)" strokeWidth={0.12} />
      </svg>

      {/* PATH TERMINUS label */}
      <div style={{
        position: 'absolute', top: '14%', left: '8%',
        fontFamily: 'var(--font-geist-mono), monospace',
        fontSize: 'clamp(8px, 0.75vw, 12px)',
        letterSpacing: '0.48em', textTransform: 'uppercase',
        color: 'rgba(138,154,134,0.24)',
      }}>
        {isBg ? '// Край на маршрута' : '// Path terminus'}
      </div>

      {/* Company name — large, low opacity */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '8%',
        transform: 'translateY(-50%)',
      }}>
        <div style={{
          fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
          fontSize: 'clamp(48px, 7vw, 112px)',
          fontWeight: 300, lineHeight: 0.92,
          letterSpacing: '-0.04em',
          color: 'rgba(138,154,134,0.08)',
          userSelect: 'none',
        }}>
          {settings?.companyName ?? 'BSDC'}
        </div>
      </div>

      {/* Right side — info block */}
      <div style={{
        position: 'absolute',
        right: '8%', top: '50%',
        transform: 'translateY(-50%)',
        textAlign: 'right',
        display: 'flex', flexDirection: 'column', gap: '2.4vh',
      }}>
        {settings?.email && (
          <div>
            <div style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: 'clamp(8px, 0.72vw, 11px)',
              letterSpacing: '0.38em', textTransform: 'uppercase',
              color: 'rgba(138,154,134,0.28)', marginBottom: '0.4vh',
            }}>
              {isBg ? 'Имейл' : 'Email'}
            </div>
            <div style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: 'clamp(11px, 1vw, 16px)',
              fontWeight: 300, color: 'rgba(205,218,200,0.52)',
            }}>
              {settings.email}
            </div>
          </div>
        )}

        {settings?.phones?.[0] && (
          <div>
            <div style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: 'clamp(8px, 0.72vw, 11px)',
              letterSpacing: '0.38em', textTransform: 'uppercase',
              color: 'rgba(138,154,134,0.28)', marginBottom: '0.4vh',
            }}>
              {isBg ? 'Телефон' : 'Phone'}
            </div>
            <div style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: 'clamp(11px, 1vw, 16px)',
              fontWeight: 300, color: 'rgba(205,218,200,0.52)',
            }}>
              {settings.phones[0]}
            </div>
          </div>
        )}
      </div>

      {/* Bottom baseline */}
      <div style={{
        position: 'absolute', bottom: '5%', left: '8%', right: '8%',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <span style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: 'clamp(8px, 0.72vw, 11px)',
          letterSpacing: '0.32em', color: 'rgba(138,154,134,0.18)',
        }}>
          N 42.698° · E 23.322°
        </span>
        <span style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: 'clamp(8px, 0.72vw, 11px)',
          letterSpacing: '0.32em', color: 'rgba(138,154,134,0.18)',
        }}>
          © {year} {settings?.companyName ?? 'BSDC'}
        </span>
      </div>

    </div>
  )
}
