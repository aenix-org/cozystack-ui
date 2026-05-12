import type { Application } from "./types.ts"

export type LogLevel = "info" | "warn" | "error" | "debug"

export interface LogLine {
  ts: string
  level: LogLevel
  message: string
}

export interface ApplicationMetrics {
  uptime: {
    last24h: number
    last7d: number
    last30d: number
  }
  resources: {
    cpuUsed: number
    cpuTotal: number
    memUsedGb: number
    memTotalGb: number
    storageUsedGb: number
    storageTotalGb: number
  }
  pods: {
    ready: number
    total: number
  }
  network: {
    inMbps: number
    outMbps: number
  }
  restarts24h: number
  cost: {
    monthlyUsd: number
    sparkline7d: number[]
  }
  delivery: {
    deploysPerWeek: number
    deploys7d: number[]
    lastDeployAt: string
  }
  logs: LogLine[]
}

/** Seeded RNG — deterministic from a string seed (FNV-1a + mulberry32). */
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

function range(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min)
}

function rangeInt(rng: () => number, min: number, max: number): number {
  return Math.floor(range(rng, min, max + 1))
}

function round(value: number, digits = 2): number {
  const m = 10 ** digits
  return Math.round(value * m) / m
}

const LOG_TEMPLATES: Record<LogLevel, string[]> = {
  info: [
    "Server started on port 8080",
    "Database connection pool initialised (size=10)",
    "Cache warmed up, 1842 entries loaded",
    "Health check passed",
    "Reloaded configuration from /etc/app/config.yaml",
    "Accepted connection from 10.0.0.{ip} on :8080",
    "Background job completed in {ms}ms",
    "Replica readiness updated: {ready}/{total}",
    "Metrics scrape ok ({n} series)",
    "Garbage collection cycle finished in {ms}ms",
  ],
  warn: [
    "Slow query detected ({ms}ms, table=sessions)",
    "Cache miss rate climbed to {pct}% over last 5m",
    "Approaching memory soft limit (used={pct}%)",
    "Retrying upstream call (attempt 2/3)",
    "Deprecated API call from client v1.2.x",
  ],
  error: [
    "Failed to reach upstream redis at redis.svc:6379 — connection refused",
    "5xx burst: {n} requests failed in 60s",
    "Pod restarted: OOMKilled (last memory={mb}MB)",
    "TLS handshake failed for client 10.0.0.{ip}",
  ],
  debug: [
    "Resolved DNS for postgres.svc in {ms}ms",
    "Cache entry evicted: key={n}",
    "Worker pool idle, {n} threads parked",
  ],
}

function fillTemplate(template: string, rng: () => number): string {
  return template
    .replace("{ms}", String(rangeInt(rng, 4, 950)))
    .replace("{pct}", String(rangeInt(rng, 12, 92)))
    .replace("{ip}", String(rangeInt(rng, 2, 250)))
    .replace("{n}", String(rangeInt(rng, 1, 4096)))
    .replace("{mb}", String(rangeInt(rng, 128, 2048)))
    .replace("{ready}", String(rangeInt(rng, 1, 3)))
    .replace("{total}", "3")
}

function pickLevel(rng: () => number): LogLevel {
  const r = rng()
  if (r < 0.7) return "info"
  if (r < 0.88) return "debug"
  if (r < 0.97) return "warn"
  return "error"
}

function generateLogs(rng: () => number, count: number, baseTs: number): LogLine[] {
  const logs: LogLine[] = []
  let ts = baseTs
  for (let i = 0; i < count; i += 1) {
    const level = pickLevel(rng)
    const templates = LOG_TEMPLATES[level]
    const template = templates[Math.floor(rng() * templates.length)]
    ts -= rangeInt(rng, 250, 12_000)
    logs.push({
      ts: new Date(ts).toISOString(),
      level,
      message: fillTemplate(template, rng),
    })
  }
  return logs.reverse()
}

export function generateMetrics(app: Application, now: number = Date.now()): ApplicationMetrics {
  const rng = seedFrom(app.name)
  const cpuTotal = [1, 2, 4, 8][rangeInt(rng, 0, 3)]
  const memTotalGb = [1, 2, 4, 8, 16][rangeInt(rng, 0, 4)]
  const storageTotalGb = [10, 20, 50, 100][rangeInt(rng, 0, 3)]
  const totalPods = rangeInt(rng, 1, 4)
  const readyPods =
    app.status === "Stopped"
      ? 0
      : app.status === "Installing" || app.status === "Starting"
        ? rangeInt(rng, 0, totalPods - 1)
        : totalPods

  const uptimeBase = app.status === "Running" ? 0.998 : 0.94
  const uptime24h = round(uptimeBase + rng() * (1 - uptimeBase) * 0.6, 4)
  const uptime7d = round(uptime24h - range(rng, 0, 0.004), 4)
  const uptime30d = round(uptime7d - range(rng, 0, 0.006), 4)

  const deploys7d: number[] = []
  for (let i = 0; i < 7; i += 1) deploys7d.push(rangeInt(rng, 0, 5))
  const sparkline7d: number[] = []
  for (let i = 0; i < 7; i += 1) sparkline7d.push(round(range(rng, 0.6, 1.4), 2))

  const monthlyUsd = round(
    cpuTotal * 6 + memTotalGb * 2.5 + storageTotalGb * 0.12 + range(rng, 2, 18),
    2,
  )

  return {
    uptime: { last24h: uptime24h, last7d: uptime7d, last30d: uptime30d },
    resources: {
      cpuUsed: round(range(rng, 0.1, cpuTotal * 0.85), 2),
      cpuTotal,
      memUsedGb: round(range(rng, 0.1, memTotalGb * 0.78), 2),
      memTotalGb,
      storageUsedGb: round(range(rng, 0.4, storageTotalGb * 0.62), 2),
      storageTotalGb,
    },
    pods: { ready: readyPods, total: totalPods },
    network: {
      inMbps: round(range(rng, 0.1, 12), 2),
      outMbps: round(range(rng, 0.2, 18), 2),
    },
    restarts24h: rangeInt(rng, 0, app.status === "Failed" ? 8 : 2),
    cost: { monthlyUsd, sparkline7d },
    delivery: {
      deploysPerWeek: deploys7d.reduce((a, b) => a + b, 0),
      deploys7d,
      lastDeployAt: new Date(now - rangeInt(rng, 10, 6 * 24 * 60) * 60 * 1000).toISOString(),
    },
    logs: generateLogs(rng, 40, now),
  }
}
