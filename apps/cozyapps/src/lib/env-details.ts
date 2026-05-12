import type { Environment } from "./types.ts"

export type NodeRole = "control-plane" | "worker"
export type NodeStatus = "Ready" | "NotReady" | "SchedulingDisabled"

export interface NodeInfo {
  name: string
  role: NodeRole
  status: NodeStatus
  k8sVersion: string
  cpuTotal: number
  cpuUsed: number
  memTotalGb: number
  memUsedGb: number
  pods: number
  podCapacity: number
  age: string
}

export interface EnvCapacity {
  cpuUsed: number
  cpuTotal: number
  memUsedGb: number
  memTotalGb: number
  storageUsedGb: number
  storageTotalGb: number
  podsUsed: number
  podsCapacity: number
}

export interface EnvNetwork {
  lbAddress: string
  wildcardDomain: string
  tlsIssuer: string
  tlsIssuerOk: boolean
  egressIp: string
  kubeconfigPath: string
  kubectlContext: string
}

export type EventKind =
  | "node-added"
  | "node-drained"
  | "controller-upgrade"
  | "app-deploy"
  | "app-removed"
  | "cert-renewed"
  | "drift-healed"
  | "reconcile-failed"

export interface EnvEvent {
  id: string
  ts: string
  kind: EventKind
  title: string
  detail?: string
}

export interface EnvDetails {
  k8sVersion: string
  capacity: EnvCapacity
  nodes: NodeInfo[]
  network: EnvNetwork
  events: EnvEvent[]
}

function seedFrom(seed: string): () => number {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  let s = h >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function rangeInt(rng: () => number, min: number, max: number): number {
  return Math.floor(min + rng() * (max - min + 1))
}

function range(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min)
}

function round(n: number, digits = 2): number {
  const m = 10 ** digits
  return Math.round(n * m) / m
}

const K8S_VERSIONS = ["v1.29.3", "v1.30.1", "v1.30.2"]
const REGIONS = ["eu-central-1", "eu-west-1"]

const EVENT_TEMPLATES: { kind: EventKind; title: string; detail?: string }[] = [
  {
    kind: "controller-upgrade",
    title: "cert-manager upgraded",
    detail: "v1.13.2 → v1.13.3",
  },
  {
    kind: "controller-upgrade",
    title: "ingress-nginx upgraded",
    detail: "v1.9.6 → v1.10.0",
  },
  {
    kind: "cert-renewed",
    title: "Wildcard TLS renewed",
    detail: "*.app.example.com · 90 days",
  },
  {
    kind: "node-added",
    title: "Node joined",
    detail: "worker-eu-3 · 4 CPU / 16 GB",
  },
  {
    kind: "node-drained",
    title: "Node drained",
    detail: "worker-eu-1 · planned maintenance",
  },
  {
    kind: "app-deploy",
    title: "my-blog reconcile changed",
    detail: "image wordpress:6.4.1 → 6.4.2",
  },
  {
    kind: "drift-healed",
    title: "Drift auto-healed",
    detail: "Container.SpecMatches restored on shop",
  },
  {
    kind: "reconcile-failed",
    title: "Reconcile failed on landing",
    detail: "PVC stuck in Pending",
  },
  {
    kind: "app-deploy",
    title: "minecraft-server reconcile changed",
    detail: "replicas 1 → 2",
  },
]

export function generateEnvDetails(env: Environment): EnvDetails {
  const rng = seedFrom(`${env.name}:env-details`)
  const k8sVersion = K8S_VERSIONS[Math.floor(rng() * K8S_VERSIONS.length)]
  const region = REGIONS[Math.floor(rng() * REGIONS.length)]

  const nodes: NodeInfo[] = []
  const cpResv = 2
  const memResv = 4
  nodes.push({
    name: `cp-${env.name}-1`,
    role: "control-plane",
    status: "Ready",
    k8sVersion,
    cpuTotal: cpResv,
    cpuUsed: round(range(rng, 0.3, 1.6)),
    memTotalGb: memResv,
    memUsedGb: round(range(rng, 0.8, 3)),
    pods: rangeInt(rng, 8, 18),
    podCapacity: 110,
    age: nodeAge(rng),
  })
  const workerCount = env.nodes
  const cpuPerWorker = Math.max(2, Math.floor((env.cpu - cpResv) / workerCount))
  const memPerWorker = Math.max(
    2,
    Math.floor((env.ramGb - memResv) / workerCount),
  )
  for (let i = 0; i < workerCount; i += 1) {
    nodes.push({
      name: `worker-${env.name}-${i + 1}`,
      role: "worker",
      status: i === workerCount - 1 && rng() < 0.15 ? "SchedulingDisabled" : "Ready",
      k8sVersion,
      cpuTotal: cpuPerWorker,
      cpuUsed: round(range(rng, cpuPerWorker * 0.2, cpuPerWorker * 0.85)),
      memTotalGb: memPerWorker,
      memUsedGb: round(range(rng, memPerWorker * 0.25, memPerWorker * 0.8)),
      pods: rangeInt(rng, 12, 78),
      podCapacity: 110,
      age: nodeAge(rng),
    })
  }

  const cpuUsed = round(nodes.reduce((s, n) => s + n.cpuUsed, 0))
  const memUsedGb = round(nodes.reduce((s, n) => s + n.memUsedGb, 0))
  const storageTotalGb = workerCount * 200
  const storageUsedGb = round(range(rng, storageTotalGb * 0.18, storageTotalGb * 0.55))
  const podsUsed = nodes.reduce((s, n) => s + n.pods, 0)
  const podsCapacity = nodes.reduce((s, n) => s + n.podCapacity, 0)

  const tier = env.name
  const network: EnvNetwork = {
    lbAddress: `203.0.113.${rangeInt(rng, 10, 240)}`,
    wildcardDomain: `*.${tier}.example.com`,
    tlsIssuer: "letsencrypt-prod",
    tlsIssuerOk: rng() > 0.05,
    egressIp: `198.51.100.${rangeInt(rng, 10, 240)}`,
    kubeconfigPath: `~/.kube/${env.name}.kubeconfig`,
    kubectlContext: `${env.name}@${region}`,
  }

  const eventsCount = 12
  const events: EnvEvent[] = []
  let ts = Date.now()
  for (let i = 0; i < eventsCount; i += 1) {
    ts -= rangeInt(rng, 4 * 60 * 1000, 90 * 60 * 1000)
    const tpl = EVENT_TEMPLATES[Math.floor(rng() * EVENT_TEMPLATES.length)]
    events.push({
      id: `${env.name}-evt-${i}`,
      ts: new Date(ts).toISOString(),
      kind: tpl.kind,
      title: tpl.title,
      detail: tpl.detail,
    })
  }

  return {
    k8sVersion,
    capacity: {
      cpuUsed,
      cpuTotal: env.cpu,
      memUsedGb,
      memTotalGb: env.ramGb,
      storageUsedGb,
      storageTotalGb,
      podsUsed,
      podsCapacity,
    },
    nodes,
    network,
    events,
  }
}

const AGES = ["3h", "1d", "3d", "1w", "2w", "1mo", "3mo"]
function nodeAge(rng: () => number): string {
  return AGES[Math.floor(rng() * AGES.length)]
}
