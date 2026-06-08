import { NODE_MAP, type MapNode } from './NodeRegistry'

/**
 * Returns the deepest node whose `at` threshold has been crossed.
 * Pure function — safe to call on every scroll tick.
 */
export function resolveActiveNode(progress: number): MapNode {
  let active = NODE_MAP[0]
  for (const node of NODE_MAP) {
    if (progress >= node.at) active = node
    else break
  }
  return active
}

/**
 * Returns the node immediately ahead of current progress (the next destination).
 * Returns null when at the final node.
 */
export function resolveNextNode(progress: number): MapNode | null {
  for (const node of NODE_MAP) {
    if (node.at > progress) return node
  }
  return null
}

/**
 * Returns local progress (0..1) within the current node segment.
 * Useful for node-level parallax / entrance animations.
 */
export function resolveLocalProgress(progress: number): number {
  const active = resolveActiveNode(progress)
  const next   = resolveNextNode(progress)
  if (!next) return 1
  const span = next.at - active.at
  if (span <= 0) return 0
  return Math.min(1, (progress - active.at) / span)
}
