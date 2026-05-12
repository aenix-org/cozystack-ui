import type { LucideIcon } from "lucide-react"
import {
  ArrowRightCircle,
  Box,
  Container,
  Database,
  FormInput,
  Globe,
  HardDrive,
  KeyRound,
  Layers,
  Package,
  ShieldCheck,
} from "lucide-react"
import type { ParamDef } from "../types.ts"
import type { PortType } from "./port-types.ts"

export interface PortDef {
  key: string
  label: string
  type: PortType
}

export type AtomCategory = "Inputs" | "Storage" | "Compute" | "Network" | "Secrets" | "Outputs"

export interface AtomDef {
  /** Stable identifier used as React Flow `node.type`. */
  type: string
  displayName: string
  category: AtomCategory
  description: string
  icon: LucideIcon
  /** Soft background tint, applied to the node header. */
  accentBg: string
  /** Solid color, used for icon and category tag. */
  accentFg: string
  inputs: PortDef[]
  outputs: PortDef[]
  /** Configurable parameters surfaced in the inspector. */
  params: ParamDef[]
}

export const ATOMS: AtomDef[] = [
  {
    type: "user-input",
    displayName: "User Input",
    category: "Inputs",
    description: "Values the user fills in when launching the app",
    icon: FormInput,
    accentBg: "bg-slate-100",
    accentFg: "text-slate-700",
    inputs: [],
    outputs: [
      { key: "name", label: "name", type: "string" },
      { key: "domain", label: "domain", type: "domain" },
      { key: "size", label: "size", type: "string" },
    ],
    params: [
      {
        key: "fields",
        label: "Field list",
        type: "string",
        defaultValue: "name, domain, size",
        hint: "Comma-separated form fields exposed to the launching user",
      },
    ],
  },
  {
    type: "postgres",
    displayName: "Postgres",
    category: "Storage",
    description: "Managed PostgreSQL instance with daily backups",
    icon: Database,
    accentBg: "bg-blue-50",
    accentFg: "text-blue-600",
    inputs: [],
    outputs: [{ key: "conn", label: "connection", type: "postgres-conn" }],
    params: [
      {
        key: "version",
        label: "Version",
        type: "enum",
        options: ["14", "15", "16"],
        defaultValue: "15",
      },
      {
        key: "storage",
        label: "Storage",
        type: "enum",
        options: ["10 GB", "20 GB", "50 GB", "100 GB"],
        defaultValue: "10 GB",
      },
      { key: "replicas", label: "Replicas", type: "number", defaultValue: 1 },
    ],
  },
  {
    type: "redis",
    displayName: "Redis",
    category: "Storage",
    description: "In-memory key-value cache",
    icon: Database,
    accentBg: "bg-red-50",
    accentFg: "text-red-600",
    inputs: [],
    outputs: [{ key: "conn", label: "connection", type: "redis-conn" }],
    params: [
      {
        key: "memory",
        label: "Memory",
        type: "enum",
        options: ["256 MB", "1 GB", "4 GB"],
        defaultValue: "1 GB",
      },
      { key: "persistence", label: "Persistence", type: "boolean", defaultValue: false },
    ],
  },
  {
    type: "s3-bucket",
    displayName: "S3 Bucket",
    category: "Storage",
    description: "Object storage with S3-compatible API",
    icon: HardDrive,
    accentBg: "bg-orange-50",
    accentFg: "text-orange-600",
    inputs: [],
    outputs: [{ key: "creds", label: "credentials", type: "s3-creds" }],
    params: [
      {
        key: "region",
        label: "Region",
        type: "enum",
        options: ["eu-central-1", "eu-west-1", "us-east-1"],
        defaultValue: "eu-central-1",
      },
      {
        key: "versioning",
        label: "Versioning",
        type: "boolean",
        defaultValue: true,
      },
    ],
  },
  {
    type: "container",
    displayName: "Container",
    category: "Compute",
    description: "Long-running container with auto-restart",
    icon: Container,
    accentBg: "bg-emerald-50",
    accentFg: "text-emerald-600",
    inputs: [
      { key: "db", label: "database", type: "postgres-conn" },
      { key: "cache", label: "cache", type: "redis-conn" },
      { key: "storage", label: "storage", type: "s3-creds" },
    ],
    outputs: [{ key: "service", label: "service", type: "service-ref" }],
    params: [
      {
        key: "image",
        label: "Image",
        type: "string",
        placeholder: "wordpress:6.4",
        required: true,
      },
      { key: "port", label: "Port", type: "number", defaultValue: 80 },
      {
        key: "replicas",
        label: "Replicas",
        type: "number",
        defaultValue: 1,
        hint: "Number of running instances",
      },
    ],
  },
  {
    type: "helm-chart",
    displayName: "Helm Chart",
    category: "Compute",
    description: "Install a Helm chart with custom values",
    icon: Package,
    accentBg: "bg-emerald-50",
    accentFg: "text-emerald-600",
    inputs: [{ key: "values", label: "values", type: "any" }],
    outputs: [{ key: "service", label: "service", type: "service-ref" }],
    params: [
      {
        key: "chart",
        label: "Chart",
        type: "string",
        placeholder: "bitnami/wordpress",
        required: true,
      },
      { key: "version", label: "Version", type: "string", placeholder: "17.0.4" },
    ],
  },
  {
    type: "ingress",
    displayName: "Ingress",
    category: "Network",
    description: "HTTP/S router with rate limiting and TLS",
    icon: Globe,
    accentBg: "bg-indigo-50",
    accentFg: "text-indigo-600",
    inputs: [
      { key: "service", label: "service", type: "service-ref" },
      { key: "domain", label: "domain", type: "domain" },
      { key: "tls", label: "tls cert", type: "secret-ref" },
    ],
    outputs: [{ key: "url", label: "public url", type: "url" }],
    params: [
      { key: "path", label: "Path prefix", type: "string", defaultValue: "/" },
      { key: "rateLimit", label: "Rate limit (req/s)", type: "number", defaultValue: 100 },
    ],
  },
  {
    type: "tls-cert",
    displayName: "TLS Cert",
    category: "Network",
    description: "Let's Encrypt certificate via cert-manager",
    icon: ShieldCheck,
    accentBg: "bg-violet-50",
    accentFg: "text-violet-600",
    inputs: [{ key: "domain", label: "domain", type: "domain" }],
    outputs: [{ key: "secret", label: "secret", type: "secret-ref" }],
    params: [
      {
        key: "issuer",
        label: "Issuer",
        type: "enum",
        options: ["letsencrypt-prod", "letsencrypt-staging"],
        defaultValue: "letsencrypt-prod",
      },
    ],
  },
  {
    type: "secret",
    displayName: "Secret",
    category: "Secrets",
    description: "Materialised Kubernetes Secret",
    icon: KeyRound,
    accentBg: "bg-pink-50",
    accentFg: "text-pink-600",
    inputs: [{ key: "value", label: "value", type: "any" }],
    outputs: [{ key: "ref", label: "ref", type: "secret-ref" }],
    params: [
      { key: "name", label: "Name", type: "string", placeholder: "db-credentials", required: true },
    ],
  },
  {
    type: "output",
    displayName: "Application Output",
    category: "Outputs",
    description: "Surface a value back to the launching user",
    icon: ArrowRightCircle,
    accentBg: "bg-slate-100",
    accentFg: "text-slate-700",
    inputs: [{ key: "value", label: "value", type: "any" }],
    outputs: [],
    params: [
      { key: "label", label: "Label", type: "string", placeholder: "Public URL", required: true },
    ],
  },
]

export const CATEGORY_ORDER: AtomCategory[] = [
  "Inputs",
  "Storage",
  "Compute",
  "Network",
  "Secrets",
  "Outputs",
]

const CATEGORY_ICONS: Record<AtomCategory, LucideIcon> = {
  Inputs: FormInput,
  Storage: Database,
  Compute: Box,
  Network: Globe,
  Secrets: KeyRound,
  Outputs: Layers,
}

export function categoryIcon(category: AtomCategory): LucideIcon {
  return CATEGORY_ICONS[category]
}

export function findAtom(type: string): AtomDef | undefined {
  return ATOMS.find((a) => a.type === type)
}
