import type { Application } from "./types.ts"

export type AtomStatus = "healthy" | "reconciling" | "drift" | "failed" | "pending"

export type SubstatusState = "ok" | "warn" | "error" | "unknown" | "info"

/**
 * One condition reported by the atom's status workflow. Mirrors the
 * k8s Conditions API — atom-author declares the type set they publish.
 * Pods, Services, Secrets and other materialised objects are intentionally
 * *not* exposed — the atom is a black box whose contract is its
 * outputs (ports) and its published substatuses.
 */
export interface Substatus {
  type: string
  state: SubstatusState
  reason?: string
  message?: string
  lastTransitionAt?: string
}

export interface AtomTopology {
  /** Stable handle (atom slug + counter within app). */
  id: string
  atomType: string
  displayName: string
  /** Aggregate, derived from substatuses (worst wins). */
  status: AtomStatus
  /** Conditions published by the atom's status workflow. */
  substatuses: Substatus[]
  /** When the status workflow last reported. */
  lastChecked: string
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

interface SubstatusTemplate {
  type: string
  ok: { reason: string; message: string }
  bad: { state: SubstatusState; reason: string; message: string }[]
}

const SUBSTATUS_TEMPLATES: Record<string, SubstatusTemplate[]> = {
  container: [
    {
      type: "ImagePullable",
      ok: { reason: "ImageFetched", message: "image fetched from registry" },
      bad: [
        {
          state: "error",
          reason: "ErrImagePull",
          message: "manifest unknown for wordpress:6.4.99",
        },
      ],
    },
    {
      type: "ReplicasReady",
      ok: { reason: "AllReplicasReady", message: "3/3 replicas ready" },
      bad: [
        { state: "warn", reason: "PodNotReady", message: "1/3 pods not ready" },
        { state: "error", reason: "CrashLoopBackOff", message: "2/3 pods restarting" },
      ],
    },
    {
      type: "Progressing",
      ok: { reason: "NewReplicaSetAvailable", message: "rollout complete" },
      bad: [
        { state: "info", reason: "ReplicaSetUpdating", message: "rolling update 2/3 done" },
      ],
    },
    {
      type: "SpecMatches",
      ok: { reason: "InSync", message: "actual state matches spec" },
      bad: [
        { state: "warn", reason: "EnvDrift", message: "env differs from spec on 2 keys" },
      ],
    },
  ],
  postgres: [
    {
      type: "ClusterReady",
      ok: { reason: "ClusterHealthy", message: "all instances streaming WAL" },
      bad: [
        { state: "warn", reason: "ReplicaLag", message: "replica lagging 2.4s behind primary" },
        { state: "error", reason: "PrimaryDown", message: "no primary elected" },
      ],
    },
    {
      type: "BackupOk",
      ok: { reason: "RecentBackup", message: "last backup 4h ago, 1.2 GB" },
      bad: [{ state: "warn", reason: "BackupStale", message: "no backup in last 36h" }],
    },
    {
      type: "StorageHealthy",
      ok: { reason: "VolumesBound", message: "all volumes bound, 64% used" },
      bad: [{ state: "warn", reason: "VolumeNearFull", message: "data volume at 91% capacity" }],
    },
  ],
  redis: [
    {
      type: "Ready",
      ok: { reason: "Serving", message: "accepting connections" },
      bad: [{ state: "error", reason: "NotReady", message: "no endpoints" }],
    },
    {
      type: "MemoryHealthy",
      ok: { reason: "BelowThreshold", message: "memory usage 42%" },
      bad: [
        {
          state: "warn",
          reason: "HighMemory",
          message: "memory usage 87% — eviction approaching",
        },
      ],
    },
  ],
  service: [
    {
      type: "EndpointsReady",
      ok: { reason: "EndpointsPopulated", message: "3 endpoints behind selector" },
      bad: [{ state: "warn", reason: "NoEndpoints", message: "selector matches 0 pods" }],
    },
  ],
  ingress: [
    {
      type: "Admitted",
      ok: { reason: "AcceptedByController", message: "ingress-nginx admitted" },
      bad: [
        {
          state: "warn",
          reason: "ControllerNotReady",
          message: "ingress-nginx not yet reconciled",
        },
      ],
    },
    {
      type: "TLSReady",
      ok: { reason: "CertificateValid", message: "valid for 87 days" },
      bad: [
        {
          state: "warn",
          reason: "CertificateExpiring",
          message: "certificate expires in 5 days",
        },
      ],
    },
  ],
  "tls-cert": [
    {
      type: "Issued",
      ok: { reason: "CertificateReady", message: "issued by letsencrypt-prod" },
      bad: [{ state: "error", reason: "OrderFailed", message: "ACME rate limit reached" }],
    },
    {
      type: "ValidityRemaining",
      ok: { reason: "FarFromExpiry", message: "87 days until renewal" },
      bad: [{ state: "warn", reason: "NearExpiry", message: "5 days until renewal" }],
    },
  ],
  "s3-bucket": [
    {
      type: "BucketReady",
      ok: { reason: "BucketOnline", message: "endpoint reachable" },
      bad: [],
    },
    {
      type: "QuotaHealthy",
      ok: { reason: "BelowQuota", message: "12.4 GB / 100 GB used" },
      bad: [{ state: "warn", reason: "QuotaNearLimit", message: "94% of quota used" }],
    },
  ],
}

const DEFAULT_TEMPLATES: SubstatusTemplate[] = [
  {
    type: "Ready",
    ok: { reason: "Ready", message: "resource is operational" },
    bad: [{ state: "warn", reason: "NotReady", message: "still converging" }],
  },
]

function generateSubstatuses(
  rng: () => number,
  atomType: string,
  status: AtomStatus,
  baseTs: number,
): Substatus[] {
  const templates = SUBSTATUS_TEMPLATES[atomType] ?? DEFAULT_TEMPLATES
  return templates.map((tpl, idx) => {
    const lastTransitionAt = new Date(
      baseTs - rangeInt(rng, 60_000, 30 * 24 * 60 * 60 * 1000),
    ).toISOString()
    if (status === "pending") {
      return {
        type: tpl.type,
        state: "unknown" as const,
        reason: "NotProbed",
        message: "no status reported yet",
        lastTransitionAt,
      }
    }
    if (status === "healthy") {
      return {
        type: tpl.type,
        state: "ok" as const,
        reason: tpl.ok.reason,
        message: tpl.ok.message,
        lastTransitionAt,
      }
    }
    const wantBad = idx === 0 || (tpl.bad.length > 0 && rng() < 0.55)
    if (wantBad && tpl.bad.length > 0) {
      let pool = tpl.bad
      if (status === "failed" && pool.some((b) => b.state === "error")) {
        pool = pool.filter((b) => b.state === "error")
      } else if (status === "drift" && pool.some((b) => b.state === "warn")) {
        pool = pool.filter((b) => b.state === "warn")
      } else if (status === "reconciling" && pool.some((b) => b.state === "info")) {
        pool = pool.filter((b) => b.state === "info")
      }
      const pick = pool[Math.floor(rng() * pool.length)]
      return { type: tpl.type, ...pick, lastTransitionAt }
    }
    return {
      type: tpl.type,
      state: "ok" as const,
      reason: tpl.ok.reason,
      message: tpl.ok.message,
      lastTransitionAt,
    }
  })
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

const ATOM_DISPLAY: Record<string, string> = {
  postgres: "Postgres",
  redis: "Redis",
  "s3-bucket": "S3 / MinIO",
  container: "Container",
  service: "Service",
  ingress: "Ingress",
  "tls-cert": "TLS Cert",
  secret: "Secret",
  configmap: "ConfigMap",
  pvc: "PersistentVolumeClaim",
  "service-account": "ServiceAccount",
}

function deriveAtomStatus(rng: () => number, appStatus: Application["status"]): AtomStatus {
  if (appStatus === "Failed") return rng() < 0.5 ? "failed" : "drift"
  if (appStatus === "Installing" || appStatus === "Starting") return "reconciling"
  if (appStatus === "Stopped") return "pending"
  if (appStatus === "Upgrading") return rng() < 0.5 ? "reconciling" : "healthy"
  if (rng() < 0.08) return "drift"
  return "healthy"
}

export function generateTopology(app: Application): AtomTopology[] {
  const rng = seedFrom(`${app.name}:topology`)
  const atomTypes = TEMPLATE_TO_ATOMS[app.templateSlug] ?? ["container", "service"]
  const result: AtomTopology[] = []
  const counters: Record<string, number> = {}

  for (const atomType of atomTypes) {
    counters[atomType] = (counters[atomType] ?? 0) + 1
    const atomStatus = deriveAtomStatus(rng, app.status)
    const now = Date.now()
    const lastCheckedMs = now - rangeInt(rng, 2_000, 90_000)
    result.push({
      id: `${atomType}-${counters[atomType]}`,
      atomType,
      displayName: ATOM_DISPLAY[atomType] ?? atomType,
      status: atomStatus,
      substatuses: generateSubstatuses(rng, atomType, atomStatus, now),
      lastChecked: new Date(lastCheckedMs).toISOString(),
    })
  }
  return result
}
