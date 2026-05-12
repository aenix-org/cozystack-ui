export type PortType =
  | "string"
  | "number"
  | "boolean"
  | "postgres-conn"
  | "redis-conn"
  | "s3-creds"
  | "service-ref"
  | "secret-ref"
  | "url"
  | "domain"
  | "any"

interface PortTypeMeta {
  label: string
  /** Tailwind background utility for the port handle dot and the edge stroke. */
  color: string
  /** Hex/oklch for SVG strokes — Tailwind can't be applied to react-flow edge SVG. */
  stroke: string
}

export const PORT_TYPE: Record<PortType, PortTypeMeta> = {
  string: { label: "String", color: "bg-slate-400", stroke: "#94a3b8" },
  number: { label: "Number", color: "bg-sky-500", stroke: "#0ea5e9" },
  boolean: { label: "Boolean", color: "bg-purple-500", stroke: "#a855f7" },
  "postgres-conn": { label: "Postgres", color: "bg-blue-500", stroke: "#3b82f6" },
  "redis-conn": { label: "Redis", color: "bg-red-500", stroke: "#ef4444" },
  "s3-creds": { label: "S3", color: "bg-orange-500", stroke: "#f97316" },
  "service-ref": { label: "Service", color: "bg-emerald-500", stroke: "#10b981" },
  "secret-ref": { label: "Secret", color: "bg-pink-500", stroke: "#ec4899" },
  url: { label: "URL", color: "bg-violet-500", stroke: "#8b5cf6" },
  domain: { label: "Domain", color: "bg-indigo-500", stroke: "#6366f1" },
  any: { label: "Any", color: "bg-slate-300", stroke: "#cbd5e1" },
}

/** Whether a producing port can feed a consuming port. */
export function isCompatible(source: PortType, target: PortType): boolean {
  if (source === target) return true
  if (source === "any" || target === "any") return true
  return false
}
