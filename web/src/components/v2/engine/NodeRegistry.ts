/**
 * NODE MAP — single source of truth for all spatial nodes.
 *
 * `at`       — normalized scroll position (0..1) at which this node is the camera target.
 * `waypoint` — SVG viewBox coordinate (0-100 scale). Also used to derive world position.
 *
 * World position = (waypoint / 100) × WORLD_W/H.
 * Camera centers the viewport on that world coordinate.
 */

export type NodeId = 'hero' | 'about' | 'services' | 'projects' | 'contact'

export interface MapNode {
  id:       NodeId
  at:       number            // scroll progress 0..1 at which camera targets this node
  waypoint: [number, number]  // SVG viewBox x,y (0-100 each) — drives BOTH path AND world position
  label:    { bg: string; en: string }
}

export const NODE_MAP: MapNode[] = [
  { id: 'hero',     at: 0.00, waypoint: [14, 84], label: { bg: 'Начало',   en: 'Home'     } },
  { id: 'about',    at: 0.25, waypoint: [50, 70], label: { bg: 'За нас',   en: 'About'    } },
  { id: 'services', at: 0.50, waypoint: [72, 30], label: { bg: 'Услуги',   en: 'Services' } },
  { id: 'projects', at: 0.75, waypoint: [42, 18], label: { bg: 'Проекти',  en: 'Projects' } },
  { id: 'contact',  at: 1.00, waypoint: [80,  9], label: { bg: 'Контакти', en: 'Contact'  } },
]

/** World canvas dimensions in px. Nodes are distributed across this space. */
export const WORLD_W = 3000
export const WORLD_H = 2000

/** Normalized path length for strokeDasharray/strokeDashoffset math. */
export const PATH_LENGTH = 1000

/** Convert a node's waypoint to its absolute world-space pixel position. */
export function waypointToWorld(waypoint: [number, number]): { x: number; y: number } {
  return {
    x: (waypoint[0] / 100) * WORLD_W,
    y: (waypoint[1] / 100) * WORLD_H,
  }
}

/**
 * Compute the WorldContainer translate needed to center a given world position
 * inside a viewport of (vpW × vpH).
 *
 * Formula: place world origin so that worldPos lands at viewport center.
 *   containerX = vpW/2 − worldX
 *   containerY = vpH/2 − worldY
 */
export function worldToCamera(
  worldX: number,
  worldY: number,
  vpW: number,
  vpH: number,
): { x: number; y: number } {
  return { x: vpW / 2 - worldX, y: vpH / 2 - worldY }
}
