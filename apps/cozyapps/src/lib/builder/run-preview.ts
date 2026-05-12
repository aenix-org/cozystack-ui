import type { Edge, Node } from "@xyflow/react"
import type { AtomNodeData } from "./types.ts"

/**
 * Group nodes into execution levels by Kahn's topological sort.
 * Roots (no incoming edges) form level 0, then dependents follow.
 * Returns null when the graph contains a cycle.
 */
export function topologicalLevels(
  nodes: Node<AtomNodeData>[],
  edges: Edge[],
): string[][] | null {
  const incoming = new Map<string, Set<string>>()
  for (const n of nodes) incoming.set(n.id, new Set())
  for (const e of edges) {
    if (!incoming.has(e.target)) incoming.set(e.target, new Set())
    incoming.get(e.target)!.add(e.source)
  }

  const remaining = new Set(nodes.map((n) => n.id))
  const levels: string[][] = []

  while (remaining.size > 0) {
    const level: string[] = []
    for (const id of remaining) {
      const deps = incoming.get(id) ?? new Set()
      let ready = true
      for (const dep of deps) {
        if (remaining.has(dep)) {
          ready = false
          break
        }
      }
      if (ready) level.push(id)
    }
    if (level.length === 0) return null
    levels.push(level)
    for (const id of level) remaining.delete(id)
  }

  return levels
}
