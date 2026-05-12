import { ATOMS, type AtomDef } from "./atoms.ts"
import { isCompatible, paramTypeToPortType, type PortType } from "./port-types.ts"

/**
 * Direction of the drag the user just released:
 * - "from-source": started at an output handle, looking for a downstream node.
 * - "from-target": started at an input handle, looking for an upstream node.
 */
export type DragDirection = "from-source" | "from-target"

export interface SuggestionTarget {
  atom: AtomDef
  /** Handle id on the spawned node — input/output key or param-handle id. */
  handle: string
  handleLabel: string
  /**
   * What we matched on the spawned node:
   *  - "input"  : an entry from atom.inputs
   *  - "output" : an entry from atom.outputs (used only in from-target mode)
   *  - "param"  : an exposable param slot (used only in from-source mode)
   */
  kind: "input" | "output" | "param"
}

export function collectSuggestions(
  portType: PortType,
  direction: DragDirection,
): SuggestionTarget[] {
  const matches: SuggestionTarget[] = []

  for (const atom of ATOMS) {
    let best: SuggestionTarget | null = null

    if (direction === "from-source") {
      for (const port of atom.inputs) {
        if (isCompatible(portType, port.type)) {
          best = { atom, handle: port.key, handleLabel: port.label, kind: "input" }
          break
        }
      }
      if (!best) {
        for (const param of atom.params) {
          const pt = paramTypeToPortType(param.type)
          if (isCompatible(portType, pt)) {
            best = { atom, handle: param.key, handleLabel: param.label, kind: "param" }
            break
          }
        }
      }
    } else {
      for (const port of atom.outputs) {
        if (isCompatible(port.type, portType)) {
          best = { atom, handle: port.key, handleLabel: port.label, kind: "output" }
          break
        }
      }
    }

    if (best) matches.push(best)
  }

  return matches
}
