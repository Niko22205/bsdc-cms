import { NODE_MAP, type MapNode } from './NodeRegistry'

// Returns whichever nav anchor is nearest to the current scroll progress.
// Pure function — safe to call on every scroll tick.
export function resolveActiveNode(progress: number): MapNode {
  let closest = NODE_MAP[0]
  let minDist = Math.abs(progress - closest.at)
  for (const node of NODE_MAP) {
    const d = Math.abs(progress - node.at)
    if (d < minDist) { minDist = d; closest = node }
  }
  return closest
}
