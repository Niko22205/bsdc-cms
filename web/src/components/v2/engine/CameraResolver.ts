import { NODE_MAP, WORLD_W, WORLD_H, waypointToWorld, worldToCamera } from './NodeRegistry'
import { resolveActiveNode, resolveNextNode, resolveLocalProgress } from './ActiveNodeResolver'

/**
 * Computes the WorldContainer translate (x, y) for a given scroll progress.
 *
 * Linearly interpolates between the active node's camera position and the
 * next node's camera position using local segment progress.
 *
 * Pure function — called on every GSAP tick, zero side effects.
 */
export function computeCamera(
  progress: number,
  vpW: number,
  vpH: number,
): { x: number; y: number } {
  const active = resolveActiveNode(progress)
  const next   = resolveNextNode(progress)
  const lp     = resolveLocalProgress(progress)

  const aw = waypointToWorld(active.waypoint)
  const from = worldToCamera(aw.x, aw.y, vpW, vpH)

  if (!next) return from

  const nw = waypointToWorld(next.waypoint)
  const to = worldToCamera(nw.x, nw.y, vpW, vpH)

  return {
    x: from.x + (to.x - from.x) * lp,
    y: from.y + (to.y - from.y) * lp,
  }
}

/** Returns world-space pixel bounds for a node (centered on its waypoint). */
export { WORLD_W, WORLD_H, waypointToWorld }
