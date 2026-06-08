'use client'

import { useRef, useCallback, useActionState } from 'react'
import gsap from 'gsap'
import type { SiteSetting, Partner } from '@/generated/prisma/client'
import { submitContact } from '@/app/_actions/submitContact'

interface Props {
  settings: SiteSetting | null
  partners: Partner[]
  lang:     string
}

function StatusLine({
  label, value, delay = 0,
}: {
  label: string
  value: string | null | undefined
  delay?: number
}) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: '1vw', alignItems: 'flex-start', marginBottom: '2.2vh' }}>
      <div style={{
        marginTop: '0.5vh', width: 4, height: 4, borderRadius: '50%', flexShrink: 0,
        background: 'rgba(138,154,134,0.60)',
        animation: `v2-indicator-pulse 2.4s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }} />
      <div>
        <div style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: 'clamp(8px, 0.75vw, 12px)',
          letterSpacing: '0.38em', textTransform: 'uppercase',
          color: 'rgba(138,154,134,0.36)', marginBottom: '0.4vh',
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: 'clamp(11px, 1vw, 16px)',
          fontWeight: 300, color: 'rgba(205,218,200,0.76)', lineHeight: 1.5,
        }}>
          {value}
        </div>
      </div>
    </div>
  )
}

export function ContactNode({ settings, lang }: Props) {
  const isBg   = lang === 'bg'
  const [state, action, pending] = useActionState(submitContact, {})
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

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(138,154,134,0.04)',
    border: 'none',
    borderBottom: '1px solid rgba(138,154,134,0.20)',
    padding: '0.8vh 0',
    fontSize: 'clamp(11px, 1vw, 16px)',
    fontFamily: 'var(--font-geist-mono), monospace',
    fontWeight: 300,
    color: 'rgba(205,218,200,0.85)',
    outline: 'none',
    letterSpacing: '0.02em',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-geist-mono), monospace',
    fontSize: 'clamp(8px, 0.75vw, 12px)',
    letterSpacing: '0.38em', textTransform: 'uppercase',
    color: 'rgba(138,154,134,0.40)',
    display: 'block', marginBottom: '0.5vh',
  }

  const errorStyle: React.CSSProperties = {
    fontFamily: 'var(--font-geist-mono), monospace',
    fontSize: 'clamp(8px, 0.7vw, 11px)',
    letterSpacing: '0.25em', color: 'rgba(200,80,80,0.7)',
    textTransform: 'uppercase', marginTop: '0.4vh',
  }

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
        {/* Center divider between panels */}
        <line x1={50} y1={36} x2={50} y2={94}
          stroke="rgba(138,154,134,0.06)" strokeWidth={0.10} />
        {/* Horizontal rule below title */}
        <line x1={5} y1={36} x2={95} y2={36}
          stroke="rgba(138,154,134,0.08)" strokeWidth={0.08} />
        {/* Corner marks */}
        <path d="M 1 1 L 1 4 M 1 1 L 4 1"   stroke="rgba(138,154,134,0.20)" strokeWidth={0.14} fill="none" />
        <path d="M 99 99 L 99 96 M 99 99 L 96 99" stroke="rgba(138,154,134,0.20)" strokeWidth={0.14} fill="none" />
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
          {isBg ? 'Контакти' : 'Contact'}
        </div>
        <h2 style={{
          fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
          fontSize: 'clamp(36px, 5.5vw, 88px)',
          fontWeight: 300, lineHeight: 0.93,
          letterSpacing: '-0.03em',
          color: 'rgba(205,218,200,0.90)',
          margin: 0,
        }}>
          {settings?.companyName ?? 'BSDC'}
        </h2>
      </div>

      {/* TWO-PANEL LAYOUT */}
      <div style={{
        position: 'absolute',
        top: '39%', left: '6%', right: '6%', bottom: '6%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4vw',
      }}>

        {/* LEFT — Location status */}
        <div>
          <div style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: 'clamp(8px, 0.75vw, 12px)',
            letterSpacing: '0.40em', textTransform: 'uppercase',
            color: 'rgba(138,154,134,0.30)',
            marginBottom: '3vh',
            paddingBottom: '1.5vh',
            borderBottom: '1px solid rgba(138,154,134,0.08)',
          }}>
            {isBg ? '// Координати' : '// Location data'}
          </div>

          <StatusLine label={isBg ? 'Адрес'        : 'Address'}     value={settings?.address}      delay={0}   />
          <StatusLine label={isBg ? 'Координати'   : 'Coordinates'} value="N 42.698° · E 23.322°" delay={0.4} />
          <StatusLine label={isBg ? 'Имейл'        : 'Email'}       value={settings?.email}        delay={0.8} />
          <StatusLine label={isBg ? 'Телефон'      : 'Phone'}       value={settings?.phones?.[0]}  delay={1.2} />
          <StatusLine label={isBg ? 'Работно време': 'Hours'}       value={settings?.workingHours} delay={1.6} />

          {/* Terminal bar */}
          <div style={{
            marginTop: '3vh',
            padding: '1vh 1.2vw',
            background: 'rgba(138,154,134,0.04)',
            border: '1px solid rgba(138,154,134,0.10)',
            display: 'flex', alignItems: 'center', gap: '0.8vw',
          }}>
            <div style={{
              width: 3, height: 3, borderRadius: '50%',
              background: '#8A9A86',
              animation: 'v2-indicator-pulse 1.8s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: 'clamp(8px, 0.75vw, 12px)',
              letterSpacing: '0.38em', textTransform: 'uppercase',
              color: 'rgba(138,154,134,0.44)',
            }}>
              {isBg ? 'СИСТЕМА ГОТОВА' : 'SYSTEM READY'}
            </span>
            <span style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: 'clamp(10px, 0.9vw, 14px)',
              color: 'rgba(138,154,134,0.38)',
              animation: 'v2-blink 1.2s step-end infinite',
            }}>
              _
            </span>
          </div>
        </div>

        {/* RIGHT — Form */}
        <div>
          <div style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: 'clamp(8px, 0.75vw, 12px)',
            letterSpacing: '0.40em', textTransform: 'uppercase',
            color: 'rgba(138,154,134,0.30)',
            marginBottom: '3vh',
            paddingBottom: '1.5vh',
            borderBottom: '1px solid rgba(138,154,134,0.08)',
          }}>
            {isBg ? '// Нова задача' : '// New mission'}
          </div>

          {state.success ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw', marginBottom: '1.5vh' }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#8A9A86' }} />
                <span style={{
                  fontFamily: 'var(--font-geist-mono), monospace',
                  fontSize: 'clamp(9px, 0.85vw, 13px)',
                  letterSpacing: '0.38em', textTransform: 'uppercase', color: '#8A9A86',
                }}>
                  {isBg ? 'Предадено' : 'Transmitted'}
                </span>
              </div>
              <p style={{
                fontSize: 'clamp(11px, 1vw, 16px)',
                fontWeight: 300, lineHeight: 1.85,
                color: 'rgba(138,154,134,0.60)', margin: 0,
                fontFamily: 'var(--font-geist-mono), monospace',
              }}>
                {isBg
                  ? '> Заявката е получена. Ще се свържем с вас скоро.'
                  : '> Request received. We will be in touch shortly.'}
              </p>
            </div>
          ) : (
            <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '2.5vh' }}>
              <input type="hidden" name="source" value="spatial-v2" />

              <div>
                <label style={labelStyle}>{`> ${isBg ? 'Вашето име' : 'Your name'}`}</label>
                <input
                  name="name" type="text" required style={fieldStyle}
                  placeholder={isBg ? 'Иван Иванов' : 'John Smith'}
                />
                {state.errors?.name && <p style={errorStyle}>{state.errors.name}</p>}
              </div>

              <div>
                <label style={labelStyle}>{`> ${isBg ? 'Имейл адрес' : 'Email address'}`}</label>
                <input
                  name="email" type="email" required style={fieldStyle}
                  placeholder="office@example.com"
                />
                {state.errors?.email && <p style={errorStyle}>{state.errors.email}</p>}
              </div>

              <div>
                <label style={labelStyle}>{`> ${isBg ? 'Съобщение' : 'Message'}`}</label>
                <textarea
                  name="message" required rows={3}
                  style={{ ...fieldStyle, resize: 'none', lineHeight: 1.7 }}
                  placeholder={isBg ? 'Опишете вашата задача...' : 'Describe your mission...'}
                />
                {state.errors?.message && <p style={errorStyle}>{state.errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={pending}
                style={{
                  alignSelf: 'flex-start',
                  padding: '1vh 2vw',
                  background: pending ? 'rgba(138,154,134,0.06)' : 'rgba(138,154,134,0.10)',
                  color: pending ? 'rgba(138,154,134,0.30)' : '#8A9A86',
                  border: '1px solid rgba(138,154,134,0.22)',
                  fontSize: 'clamp(9px, 0.85vw, 13px)',
                  fontFamily: 'var(--font-geist-mono), monospace',
                  letterSpacing: '0.42em', textTransform: 'uppercase',
                  cursor: pending ? 'default' : 'pointer',
                  transition: 'all 0.25s ease',
                }}
              >
                {pending ? '··· ' : `[ ${isBg ? 'ИЗПРАТИ' : 'SEND'} ]`}
              </button>

            </form>
          )}
        </div>

      </div>

    </div>
  )
}
