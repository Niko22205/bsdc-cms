/**
 * NODE MAP — single source of truth for all spatial nodes.
 *
 * `at`       — normalized scroll position (0..1) at which the node activates.
 * `waypoint` — SVG viewBox coordinate (0-100 scale) the path passes through.
 *
 * Waypoints follow the expedition path: bottom-left → upper-right snake.
 */

export type NodeId = 'hero' | 'about' | 'services' | 'projects' | 'contact'

export interface MapNode {
  id:       NodeId
  at:       number            // scroll progress 0..1
  waypoint: [number, number]  // SVG viewBox x,y (0-100 each)
  label:    { bg: string; en: string }
}

export const NODE_MAP: MapNode[] = [
  { id: 'hero',     at: 0.00, waypoint: [14, 84], label: { bg: 'Начало',   en: 'Home'     } },
  { id: 'about',    at: 0.25, waypoint: [50, 70], label: { bg: 'За нас',   en: 'About'    } },
  { id: 'services', at: 0.50, waypoint: [72, 30], label: { bg: 'Услуги',   en: 'Services' } },
  { id: 'projects', at: 0.75, waypoint: [42, 18], label: { bg: 'Проекти',  en: 'Projects' } },
  { id: 'contact',  at: 1.00, waypoint: [80,  9], label: { bg: 'Контакти', en: 'Contact'  } },
]

/** Total normalized path length used in strokeDasharray/strokeDashoffset math. */
export const PATH_LENGTH = 1000
