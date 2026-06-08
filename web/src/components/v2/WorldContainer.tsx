'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'
import type {
  HomeContent, AboutContent, Service, Certificate,
  SiteSetting, ProjectNewsItem, Partner,
} from '@/generated/prisma/client'

import { HeroNode }         from './nodes/HeroNode'
import { AboutNode }        from './nodes/AboutNode'
import { CertificatesNode } from './nodes/CertificatesNode'
import { PartnersNode }     from './nodes/PartnersNode'
import { ServicesHubNode }  from './nodes/ServicesHubNode'
import { ProjectsNode }     from './nodes/ProjectsNode'
import { ContactNode }      from './nodes/ContactNode'
import { FooterNode }       from './nodes/FooterNode'

// ── Handle ────────────────────────────────────────────────────────────────────

export interface WorldContainerHandle {
  world: HTMLDivElement | null
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface WorldContainerProps {
  lang:         string
  home:         HomeContent | null
  about:        AboutContent | null
  services:     Service[]
  certificates: Certificate[]
  partners:     Partner[]
  settings:     SiteSetting | null
  projects:     ProjectNewsItem[]
}

// ── World canvas ──────────────────────────────────────────────────────────────
//
// 8000 × 2400 — single continuous dark field.
// Objects are placed at absolute positions within this space.
// The camera cubic bezier curves through the world revealing them in turn.
//
// Camera path (approximate centers):
//   t=0.00 → (700,  700) — near Hero
//   t=0.22 → (2250, 1080) — near About
//   t=0.50 → (4000, 1075) — between Services/Certificates/Partners
//   t=0.72 → (5800, 1000) — near Projects
//   t=0.85 → (6600, 1100) — near Contact
//   t=1.00 → (7300, 1300) — near Footer
//
// Objects are deliberately at DIFFERENT heights (above/below camera path)
// so the world reads as spatially layered, not a horizontal timeline.

export const WORLD_W = 8000
export const WORLD_H = 2400

// Object bounding boxes — positions in world px
const OBJ = {
  hero:         { left:  150, top:  250, width: 1100, height:  700 },
  about:        { left: 1500, top:  620, width: 1050, height:  660 },
  certificates: { left: 2550, top: 1320, width:  900, height:  560 },
  services:     { left: 3050, top:  220, width: 1450, height:  780 },
  partners:     { left: 4150, top: 1150, width: 1100, height:  580 },
  projects:     { left: 4850, top:  200, width: 1250, height:  720 },
  contact:      { left: 5900, top:  720, width: 1150, height:  700 },
  footer:       { left: 6800, top: 1550, width:  950, height:  480 },
} as const

// ── Component ─────────────────────────────────────────────────────────────────

export const WorldContainer = forwardRef<WorldContainerHandle, WorldContainerProps>(
  function WorldContainer(
    { lang, home, about, services, certificates, partners, settings, projects },
    ref,
  ) {
    const worldDivRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => ({
      get world() { return worldDivRef.current },
    }))

    return (
      <div
        ref={worldDivRef}
        className="absolute top-0 left-0"
        style={{ width: WORLD_W, height: WORLD_H, willChange: 'transform' }}
      >

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <div style={{ position: 'absolute', ...OBJ.hero }}>
          <HeroNode data={home} settings={settings} lang={lang} />
        </div>

        {/* ── ABOUT ────────────────────────────────────────────────────── */}
        <div style={{ position: 'absolute', ...OBJ.about }}>
          <AboutNode data={about} lang={lang} />
        </div>

        {/* ── CERTIFICATES — below camera path ─────────────────────────── */}
        <div style={{ position: 'absolute', ...OBJ.certificates }}>
          <CertificatesNode data={certificates} lang={lang} />
        </div>

        {/* ── SERVICES HUB — above camera path ─────────────────────────── */}
        <div style={{ position: 'absolute', ...OBJ.services }}>
          <ServicesHubNode data={services} lang={lang} />
        </div>

        {/* ── PARTNERS — below camera path ─────────────────────────────── */}
        <div style={{ position: 'absolute', ...OBJ.partners }}>
          <PartnersNode data={partners} lang={lang} />
        </div>

        {/* ── PROJECTS — above camera path ─────────────────────────────── */}
        <div style={{ position: 'absolute', ...OBJ.projects }}>
          <ProjectsNode data={projects} lang={lang} />
        </div>

        {/* ── CONTACT ──────────────────────────────────────────────────── */}
        <div style={{ position: 'absolute', ...OBJ.contact }}>
          <ContactNode settings={settings} partners={partners} lang={lang} />
        </div>

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <div style={{ position: 'absolute', ...OBJ.footer }}>
          <FooterNode settings={settings} lang={lang} />
        </div>

      </div>
    )
  },
)
