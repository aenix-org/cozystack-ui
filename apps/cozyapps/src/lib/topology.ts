import type { Application } from "./types.ts"

export type AtomStatus = "healthy" | "reconciling" | "drift" | "failed" | "pending"

export type K8sKind =
  | "Pod"
  | "Service"
  | "Secret"
  | "ConfigMap"
  | "PersistentVolumeClaim"
  | "Ingress"
  | "ServiceAccount"

export type PodPhase = "Running" | "Pending" | "Succeeded" | "Failed" | "CrashLoopBackOff"

export interface PodResource {
  kind: "Pod"
  name: string
  phase: PodPhase
  ready: string
  restarts: number
  age: string
  image: string
  node: string
}

export interface ServiceResource {
  kind: "Service"
  name: string
  type: "ClusterIP" | "NodePort" | "LoadBalancer"
  ports: string
  endpoints: number
  age: string
}

export interface SecretResource {
  kind: "Secret" | "ConfigMap"
  name: string
  subtype?: string
  keys: number
  age: string
}

export interface PvcResource {
  kind: "PersistentVolumeClaim"
  name: string
  status: "Bound" | "Pending"
  size: string
  storageClass: string
  age: string
}

export interface IngressResource {
  kind: "Ingress"
  name: string
  host: string
  tls: boolean
  address: string
  age: string
}

export interface ServiceAccountResource {
  kind: "ServiceAccount"
  name: string
  age: string
}

export type K8sResource =
  | PodResource
  | ServiceResource
  | SecretResource
  | PvcResource
  | IngressResource
  | ServiceAccountResource

export interface AtomTopology {
  /** Stable handle (atom slug + counter within app). */
  id: string
  atomType: string
  displayName: string
  /** Reported by the atom's status workflow. */
  status: AtomStatus
  /** Conditions / human-readable detail from the status workflow. Empty when healthy. */
  messages: string[]
  /** When the status workflow last reported. */
  lastChecked: string
  resources: K8sResource[]
}

const KIND_ORDER: K8sKind[] = [
  "Pod",
  "Service",
  "Ingress",
  "Secret",
  "ConfigMap",
  "PersistentVolumeClaim",
  "ServiceAccount",
]

export function sortResources(resources: K8sResource[]): K8sResource[] {
  return [...resources].sort((a, b) => {
    const order = KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind)
    if (order !== 0) return order
    return a.name.localeCompare(b.name)
  })
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

const POD_HASH_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789"
function podHash(rng: () => number, len: number): string {
  let out = ""
  for (let i = 0; i < len; i += 1) {
    out += POD_HASH_ALPHABET[Math.floor(rng() * POD_HASH_ALPHABET.length)]
  }
  return out
}

const AGES = [
  "12s",
  "47s",
  "3m",
  "12m",
  "47m",
  "1h",
  "3h",
  "6h",
  "1d",
  "2d",
  "5d",
  "12d",
  "23d",
]

function age(rng: () => number): string {
  return AGES[Math.floor(rng() * AGES.length)]
}

const NODES = [
  "worker-eu-1",
  "worker-eu-2",
  "worker-eu-3",
  "worker-us-east-1",
  "worker-us-east-2",
]

function node(rng: () => number): string {
  return NODES[Math.floor(rng() * NODES.length)]
}

function podPhase(rng: () => number, status: AtomStatus): PodPhase {
  if (status === "failed") return rng() < 0.5 ? "CrashLoopBackOff" : "Failed"
  if (status === "reconciling" || status === "pending")
    return rng() < 0.6 ? "Pending" : "Running"
  return "Running"
}

interface AtomSpec {
  type: string
  displayName: string
  build: (
    rng: () => number,
    appName: string,
    atomStatus: AtomStatus,
    counter: { value: number },
  ) => K8sResource[]
}

function pods(
  rng: () => number,
  appName: string,
  prefix: string,
  count: number,
  image: string,
  atomStatus: AtomStatus,
): PodResource[] {
  const replicaSetHash = podHash(rng, 9)
  const out: PodResource[] = []
  const phase = podPhase(rng, atomStatus)
  for (let i = 0; i < count; i += 1) {
    const podSuffix = podHash(rng, 5)
    const isPodReady = phase === "Running" && (atomStatus === "healthy" || rng() > 0.3)
    out.push({
      kind: "Pod",
      name: `${appName}-${prefix}-${replicaSetHash}-${podSuffix}`,
      phase: i === count - 1 && atomStatus === "drift" ? "Pending" : phase,
      ready: isPodReady ? "1/1" : "0/1",
      restarts: atomStatus === "failed" ? rangeInt(rng, 4, 12) : rangeInt(rng, 0, 2),
      age: age(rng),
      image,
      node: node(rng),
    })
  }
  return out
}

const ATOM_SPECS: Record<string, AtomSpec> = {
  postgres: {
    type: "postgres",
    displayName: "Postgres",
    build: (rng, appName, atomStatus) => {
      const replicas = rangeInt(rng, 1, 3)
      const list: K8sResource[] = []
      const podName = `${appName}-pg`
      for (let i = 0; i < replicas; i += 1) {
        list.push({
          kind: "Pod",
          name: `${podName}-${i}`,
          phase: podPhase(rng, atomStatus),
          ready: atomStatus === "healthy" ? "2/2" : i === replicas - 1 ? "1/2" : "2/2",
          restarts: atomStatus === "failed" ? rangeInt(rng, 1, 4) : 0,
          age: age(rng),
          image: "ghcr.io/cloudnative-pg/postgresql:15.4",
          node: node(rng),
        })
      }
      list.push({
        kind: "Service",
        name: `${appName}-pg-rw`,
        type: "ClusterIP",
        ports: "5432/TCP",
        endpoints: 1,
        age: age(rng),
      })
      if (replicas > 1) {
        list.push({
          kind: "Service",
          name: `${appName}-pg-ro`,
          type: "ClusterIP",
          ports: "5432/TCP",
          endpoints: replicas - 1,
          age: age(rng),
        })
      }
      list.push({
        kind: "Secret",
        name: `${appName}-pg-app`,
        subtype: "Opaque",
        keys: 5,
        age: age(rng),
      })
      list.push({
        kind: "PersistentVolumeClaim",
        name: `${appName}-pg-storage-0`,
        status: "Bound",
        size: "10Gi",
        storageClass: "standard",
        age: age(rng),
      })
      return list
    },
  },
  redis: {
    type: "redis",
    displayName: "Redis",
    build: (rng, appName, atomStatus) => [
      ...pods(rng, appName, "redis", 1, "redis:7.2-alpine", atomStatus),
      {
        kind: "Service",
        name: `${appName}-redis`,
        type: "ClusterIP",
        ports: "6379/TCP",
        endpoints: 1,
        age: age(rng),
      },
      {
        kind: "Secret",
        name: `${appName}-redis-auth`,
        subtype: "Opaque",
        keys: 1,
        age: age(rng),
      },
    ],
  },
  container: {
    type: "container",
    displayName: "Container",
    build: (rng, appName, atomStatus) => {
      const replicas = rangeInt(rng, 2, 3)
      return pods(rng, appName, "app", replicas, "wordpress:6.4", atomStatus)
    },
  },
  service: {
    type: "service",
    displayName: "Service",
    build: (rng, appName) => [
      {
        kind: "Service",
        name: appName,
        type: "ClusterIP",
        ports: "80/TCP",
        endpoints: rangeInt(rng, 1, 3),
        age: age(rng),
      },
    ],
  },
  ingress: {
    type: "ingress",
    displayName: "Ingress",
    build: (rng, appName) => [
      {
        kind: "Ingress",
        name: appName,
        host: `${appName}.example.com`,
        tls: true,
        address: `203.0.113.${rangeInt(rng, 10, 240)}`,
        age: age(rng),
      },
    ],
  },
  "tls-cert": {
    type: "tls-cert",
    displayName: "TLS Cert",
    build: (rng, appName) => [
      {
        kind: "Secret",
        name: `${appName}-tls`,
        subtype: "kubernetes.io/tls",
        keys: 2,
        age: age(rng),
      },
    ],
  },
  "s3-bucket": {
    type: "s3-bucket",
    displayName: "S3 / MinIO",
    build: (rng, appName) => [
      {
        kind: "Secret",
        name: `${appName}-s3`,
        subtype: "Opaque",
        keys: 3,
        age: age(rng),
      },
      {
        kind: "Service",
        name: `${appName}-s3`,
        type: "ClusterIP",
        ports: "9000/TCP",
        endpoints: 1,
        age: age(rng),
      },
    ],
  },
}

const TEMPLATE_TO_ATOMS: Record<string, string[]> = {
  wordpress: ["postgres", "redis", "container", "service", "tls-cert", "ingress"],
  drupal: ["postgres", "container", "service", "tls-cert", "ingress"],
  ghost: ["container", "service", "tls-cert", "ingress"],
  nodejs: ["container", "service", "tls-cert", "ingress"],
  nextjs: ["container", "service", "tls-cert", "ingress"],
  static: ["container", "service", "tls-cert", "ingress"],
  minecraft: ["container", "service"],
  cs2: ["container", "service"],
}

function deriveAtomStatus(rng: () => number, appStatus: Application["status"]): AtomStatus {
  if (appStatus === "Failed") return rng() < 0.5 ? "failed" : "drift"
  if (appStatus === "Installing" || appStatus === "Starting") return "reconciling"
  if (appStatus === "Stopped") return "pending"
  if (appStatus === "Upgrading") return rng() < 0.5 ? "reconciling" : "healthy"
  if (rng() < 0.08) return "drift"
  return "healthy"
}

const STATUS_MESSAGES: Record<AtomStatus, string[][]> = {
  healthy: [[]],
  reconciling: [
    ["Applying new image tag v6.4.2", "Rolling restart: 1/3 pods updated"],
    ["Scaling replicas 1 → 2", "Waiting for endpoints to converge"],
    ["Issuing new certificate from letsencrypt-prod"],
    ["Provisioning storage volume"],
  ],
  drift: [
    ["Actual state diverges from spec on env vars"],
    ["One pod runs an older image digest", "ReplicaSet has 2 revisions, expected 1"],
    ["Service selector matches 0 pods — orphaned endpoint slice"],
    ["TLS secret missing — kubernetes.io/tls handle stale"],
  ],
  failed: [
    ["Pod CrashLoopBackOff for 12m", "Last termination reason: OOMKilled at 1.8 GB"],
    ["Image pull failed: manifest unknown for wordpress:6.4.99"],
    ["PVC stuck in Pending — no matching StorageClass"],
    ["Certificate request denied by ACME (rate limit)"],
  ],
  pending: [["Awaiting first reconcile"]],
}

function pickMessages(rng: () => number, status: AtomStatus): string[] {
  const bucket = STATUS_MESSAGES[status]
  return bucket[Math.floor(rng() * bucket.length)]
}

export function generateTopology(app: Application): AtomTopology[] {
  const rng = seedFrom(`${app.name}:topology`)
  const atomTypes = TEMPLATE_TO_ATOMS[app.templateSlug] ?? ["container", "service"]
  const result: AtomTopology[] = []
  const counters: Record<string, number> = {}

  for (const atomType of atomTypes) {
    const spec = ATOM_SPECS[atomType]
    if (!spec) continue
    counters[atomType] = (counters[atomType] ?? 0) + 1
    const atomStatus = deriveAtomStatus(rng, app.status)
    const resources = sortResources(spec.build(rng, app.name, atomStatus, { value: 0 }))
    const lastCheckedMs = Date.now() - rangeInt(rng, 2_000, 90_000)
    result.push({
      id: `${atomType}-${counters[atomType]}`,
      atomType,
      displayName: spec.displayName,
      status: atomStatus,
      messages: pickMessages(rng, atomStatus),
      lastChecked: new Date(lastCheckedMs).toISOString(),
      resources,
    })
  }
  return result
}
