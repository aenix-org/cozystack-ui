import { ATOMS, type AtomDef } from "./atoms.ts"
import { isCompatible, paramTypeToPortType, type PortType } from "./port-types.ts"

export interface SuggestionTarget {
  atom: AtomDef
  /** Where on the new atom the source will land. */
  targetHandle: string
  targetLabel: string
  /** Whether this match is a structural input or an exposed param slot. */
  kind: "input" | "param"
}

export function collectSuggestions(sourcePortType: PortType): SuggestionTarget[] {
  const matches: SuggestionTarget[] = []
  for (const atom of ATOMS) {
    let best: SuggestionTarget | null = null
    for (const port of atom.inputs) {
      if (isCompatible(sourcePortType, port.type)) {
        best = { atom, targetHandle: port.key, targetLabel: port.label, kind: "input" }
        break
      }
    }
    if (!best) {
      for (const param of atom.params) {
        const portType = paramTypeToPortType(param.type)
        if (isCompatible(sourcePortType, portType)) {
          best = {
            atom,
            targetHandle: param.key,
            targetLabel: param.label,
            kind: "param",
          }
          break
        }
      }
    }
    if (best) matches.push(best)
  }
  return matches
}
