import type { Environment } from "../types.ts"

export const INITIAL_ENVIRONMENTS: Environment[] = [
  {
    name: "production",
    status: "Ready",
    nodes: 3,
    cpu: 12,
    ramGb: 48,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    name: "staging",
    status: "Ready",
    nodes: 2,
    cpu: 8,
    ramGb: 32,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]
