'use client'

import { forwardRef } from 'react'
import type {
  HomeContent, AboutContent, Service,
  SiteSetting, ProjectNewsItem, Partner, Certificate,
} from '@/generated/prisma/client'

import { WORLD_W, WORLD_H, type NodeId } from './engine/NodeRegistry'
import { waypointToWorld } from './engine/CameraResolver'
import { HeroNode }     from './nodes/HeroNode'
import { AboutNode }    from './nodes/AboutNode'
import { ServicesNode } from './nodes/ServicesNode'
import { ProjectsNode } from './nodes/ProjectsNode'
import { ContactNode }  from './nodes/ContactNode'

// ── Props ────────────────────────────────────────────────────────────────────

export interface WorldContainerProps {
  activeNodeId: NodeId
  lang:         string
  home:         HomeContent | null
  about:        AboutContent | null
  services:     Service[]
  certificates: Certificate[]
  partners:     Partner[]
  settings:     SiteSetting | null
  projects:     ProjectNewsItem[]
}

// ── Positioning helper ────────────────────────────────────────────────────────

function nodeStyle(
  waypoint: [number, number],
  isActive: boolean,
): React.CSSProperties {
  const { x, y } = waypointToWorld(waypoint)
  return {
    position:   'absolute',
    left:       x,
    top:        y,
    transform:  'translate(-50%, -50%)',
    width:      800,
    zIndex:     isActive ? 2 : 1,
    opacity:    isActive ? 1 : 0.3,
    transition: 'opacity 0.7s ease',
  }
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * The spatial world layer.
 *
 * ALL nodes are UNCONDITIONALLY mounted — no conditional rendering.
 * Nodes exist at fixed world-space coordinates derived from their waypoints.
 * ScrollEngineV2 translates this container via GSAP to move the camera.
 *
 * activeNodeId controls only visual depth emphasis (opacity/zIndex).
 * It does NOT gate mounting or unmounting of any node.
 */
export const WorldContainer = forwardRef<HTMLDivElement, WorldContainerProps>(
  function WorldContainer(
    { activeNodeId, lang, home, about, services, certificates, partners, settings, projects },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className="absolute top-0 left-0"
        style={{ width: WORLD_W, height: WORLD_H, willChange: 'transform' }}
      >

        {/* HERO — always mounted at waypoint [14, 84] */}
        <div style={nodeStyle([14, 84], activeNodeId === 'hero')}>
          <HeroNode data={home} settings={settings} lang={lang} />
        </div>

        {/* ABOUT — always mounted at waypoint [50, 70] */}
        <div style={nodeStyle([50, 70], activeNodeId === 'about')}>
          <AboutNode data={about} lang={lang} />
        </div>

        {/* SERVICES — always mounted at waypoint [72, 30] */}
        <div style={nodeStyle([72, 30], activeNodeId === 'services')}>
          <ServicesNode data={services} certificates={certificates} lang={lang} />
        </div>

        {/* PROJECTS — always mounted at waypoint [42, 18] */}
        <div style={nodeStyle([42, 18], activeNodeId === 'projects')}>
          <ProjectsNode data={projects} lang={lang} />
        </div>

        {/* CONTACT — always mounted at waypoint [80, 9] */}
        <div style={nodeStyle([80, 9], activeNodeId === 'contact')}>
          <ContactNode settings={settings} partners={partners} lang={lang} />
        </div>

      </div>
    )
  },
)
