/**
 * Port types are the contract between atoms. They mirror Kubernetes primitives
 * — Secret, ConfigMap, Service, PVC, ServiceAccount — plus a few scalars and
 * specialised aliases. An atom declares what it produces (outputs) and what it
 * references (inputs); the edges between atoms are object references in the
 * generated manifests (`metadata.name`-by-name).
 */
export type PortType =
  // k8s object references
  | "secret-ref"
  | "tls-secret-ref"
  | "configmap-ref"
  | "service-ref"
  | "pvc-ref"
  | "serviceaccount-ref"
  | "workload-ref"
  // string-ish literals that carry semantic meaning at the manifest level
  | "image-ref"
  | "ingress-host"
  // primitive scalars (exposed param plumbing, literals from user input)
  | "string"
  | "number"
  | "boolean"
  // universal sink/source
  | "any"

interface PortTypeMeta {
  label: string
  /** Tailwind background utility for the port handle dot. */
  color: string
  /** Hex/oklch for SVG edge strokes (Tailwind can't apply to react-flow SVG). */
  stroke: string
}

export const PORT_TYPE: Record<PortType, PortTypeMeta> = {
  "secret-ref": { label: "Secret", color: "bg-pink-500", stroke: "#ec4899" },
  "tls-secret-ref": { label: "TLS Secret", color: "bg-rose-500", stroke: "#f43f5e" },
  "configmap-ref": { label: "ConfigMap", color: "bg-cyan-500", stroke: "#06b6d4" },
  "service-ref": { label: "Service", color: "bg-emerald-500", stroke: "#10b981" },
  "pvc-ref": { label: "PVC", color: "bg-orange-500", stroke: "#f97316" },
  "serviceaccount-ref": { label: "ServiceAccount", color: "bg-yellow-500", stroke: "#eab308" },
  "workload-ref": { label: "Workload", color: "bg-teal-500", stroke: "#14b8a6" },
  "image-ref": { label: "Image", color: "bg-indigo-500", stroke: "#6366f1" },
  "ingress-host": { label: "Host", color: "bg-violet-500", stroke: "#8b5cf6" },
  string: { label: "String", color: "bg-slate-400", stroke: "#94a3b8" },
  number: { label: "Number", color: "bg-sky-500", stroke: "#0ea5e9" },
  boolean: { label: "Boolean", color: "bg-purple-500", stroke: "#a855f7" },
  any: { label: "Any", color: "bg-slate-300", stroke: "#cbd5e1" },
}

/**
 * Subtyping graph — a TLS Secret is also a Secret (you can feed it anywhere
 * a generic Secret is accepted), but the reverse is not safe. Edges go from
 * the specialised type to the more general ancestors it satisfies.
 */
const PORT_ANCESTORS: Partial<Record<PortType, PortType[]>> = {
  "tls-secret-ref": ["secret-ref"],
}

export function isCompatible(source: PortType, target: PortType): boolean {
  if (source === target) return true
  if (source === "any" || target === "any") return true
  const ancestors = PORT_ANCESTORS[source] ?? []
  return ancestors.includes(target)
}

/** Bridge ParamDef.type → PortType when a param is exposed as an input. */
export function paramTypeToPortType(paramType: "string" | "number" | "boolean" | "enum"): PortType {
  switch (paramType) {
    case "number":
      return "number"
    case "boolean":
      return "boolean"
    case "enum":
    case "string":
    default:
      return "string"
  }
}
