import type { LucideIcon } from "lucide-react"
import {
  ArrowRightCircle,
  Box,
  Container,
  Database,
  FileText,
  FormInput,
  Globe,
  HardDrive,
  KeyRound,
  Layers,
  Network,
  Package,
  ShieldCheck,
  UserCircle2,
} from "lucide-react"
import type { ParamDef } from "../types.ts"
import type { PortType } from "./port-types.ts"

export interface PortDef {
  key: string
  label: string
  type: PortType
  /** Accept many incoming/outgoing connections — k8s envFrom-style fan-in. */
  multi?: boolean
}

export type AtomCategory =
  | "Inputs"
  | "K8s Primitives"
  | "Managed Services"
  | "Outputs"

export interface AtomDef {
  type: string
  displayName: string
  category: AtomCategory
  description: string
  icon: LucideIcon
  accentBg: string
  accentFg: string
  inputs: PortDef[]
  outputs: PortDef[]
  params: ParamDef[]
}

export const ATOMS: AtomDef[] = [
  // ─── Inputs ────────────────────────────────────────────────────────────
  {
    type: "user-input",
    displayName: "User Input",
    category: "Inputs",
    description: "Values the launching user fills in via the deploy form",
    icon: FormInput,
    accentBg: "bg-slate-100",
    accentFg: "text-slate-700",
    inputs: [],
    outputs: [
      { key: "host", label: "host", type: "ingress-host" },
      { key: "name", label: "name", type: "string" },
      { key: "image", label: "image", type: "image-ref" },
    ],
    params: [
      {
        key: "fields",
        label: "Field list",
        type: "string",
        defaultValue: "host, name, image",
        hint: "Comma-separated form fields presented to the user",
      },
    ],
  },

  // ─── K8s Primitives ───────────────────────────────────────────────────
  {
    type: "container",
    displayName: "Container",
    category: "K8s Primitives",
    description: "Deployment — pulls env from Secrets/ConfigMaps, mounts PVCs",
    icon: Container,
    accentBg: "bg-emerald-50",
    accentFg: "text-emerald-600",
    inputs: [
      { key: "image", label: "image", type: "image-ref" },
      { key: "envFromSecret", label: "envFrom (secret)", type: "secret-ref", multi: true },
      { key: "envFromConfig", label: "envFrom (config)", type: "configmap-ref", multi: true },
      { key: "volumes", label: "volumes", type: "pvc-ref", multi: true },
      { key: "serviceAccount", label: "serviceAccount", type: "serviceaccount-ref" },
    ],
    outputs: [{ key: "workload", label: "workload", type: "workload-ref" }],
    params: [
      {
        key: "image",
        label: "Image (literal)",
        type: "string",
        placeholder: "wordpress:6.4",
        hint: "Used when no image-ref is connected",
      },
      { key: "port", label: "Container port", type: "number", defaultValue: 80 },
      { key: "replicas", label: "Replicas", type: "number", defaultValue: 1 },
    ],
  },
  {
    type: "service",
    displayName: "Service",
    category: "K8s Primitives",
    description: "Cluster-internal endpoint that selects a workload by label",
    icon: Network,
    accentBg: "bg-emerald-50",
    accentFg: "text-emerald-600",
    inputs: [{ key: "selector", label: "selector", type: "workload-ref" }],
    outputs: [{ key: "ref", label: "ref", type: "service-ref" }],
    params: [
      { key: "name", label: "Name", type: "string", placeholder: "backend", required: true },
      { key: "port", label: "Port", type: "number", defaultValue: 8080 },
      {
        key: "type",
        label: "Type",
        type: "enum",
        options: ["ClusterIP", "NodePort", "LoadBalancer"],
        defaultValue: "ClusterIP",
      },
    ],
  },
  {
    type: "secret",
    displayName: "Secret",
    category: "K8s Primitives",
    description: "Opaque Kubernetes Secret with arbitrary key/value pairs",
    icon: KeyRound,
    accentBg: "bg-pink-50",
    accentFg: "text-pink-600",
    inputs: [],
    outputs: [{ key: "ref", label: "ref", type: "secret-ref" }],
    params: [
      { key: "name", label: "Name", type: "string", placeholder: "my-secret", required: true },
      {
        key: "keys",
        label: "Keys",
        type: "string",
        placeholder: "username, password",
        hint: "Comma-separated list of keys",
      },
    ],
  },
  {
    type: "configmap",
    displayName: "ConfigMap",
    category: "K8s Primitives",
    description: "Non-sensitive configuration data mounted as env or files",
    icon: FileText,
    accentBg: "bg-cyan-50",
    accentFg: "text-cyan-600",
    inputs: [],
    outputs: [{ key: "ref", label: "ref", type: "configmap-ref" }],
    params: [
      { key: "name", label: "Name", type: "string", placeholder: "app-config", required: true },
      {
        key: "keys",
        label: "Keys",
        type: "string",
        placeholder: "LOG_LEVEL, FEATURE_X",
        hint: "Comma-separated list of keys",
      },
    ],
  },
  {
    type: "pvc",
    displayName: "PersistentVolumeClaim",
    category: "K8s Primitives",
    description: "Persistent storage volume",
    icon: HardDrive,
    accentBg: "bg-orange-50",
    accentFg: "text-orange-600",
    inputs: [],
    outputs: [{ key: "claim", label: "claim", type: "pvc-ref" }],
    params: [
      { key: "name", label: "Name", type: "string", placeholder: "data", required: true },
      {
        key: "size",
        label: "Size",
        type: "enum",
        options: ["1 GB", "10 GB", "50 GB", "100 GB", "500 GB"],
        defaultValue: "10 GB",
      },
      {
        key: "storageClass",
        label: "Storage class",
        type: "string",
        placeholder: "standard",
      },
      {
        key: "accessMode",
        label: "Access mode",
        type: "enum",
        options: ["ReadWriteOnce", "ReadOnlyMany", "ReadWriteMany"],
        defaultValue: "ReadWriteOnce",
      },
    ],
  },
  {
    type: "service-account",
    displayName: "ServiceAccount",
    category: "K8s Primitives",
    description: "Identity for pods to authenticate against the API",
    icon: UserCircle2,
    accentBg: "bg-yellow-50",
    accentFg: "text-yellow-600",
    inputs: [],
    outputs: [{ key: "sa", label: "sa", type: "serviceaccount-ref" }],
    params: [
      {
        key: "name",
        label: "Name",
        type: "string",
        placeholder: "workload-sa",
        required: true,
      },
    ],
  },
  {
    type: "ingress",
    displayName: "Ingress",
    category: "K8s Primitives",
    description: "HTTP/S router — accepts a backend Service, a host and a TLS Secret",
    icon: Globe,
    accentBg: "bg-indigo-50",
    accentFg: "text-indigo-600",
    inputs: [
      { key: "backend", label: "backend", type: "service-ref" },
      { key: "host", label: "host", type: "ingress-host" },
      { key: "tls", label: "tls", type: "tls-secret-ref" },
    ],
    outputs: [{ key: "url", label: "public url", type: "string" }],
    params: [
      { key: "path", label: "Path prefix", type: "string", defaultValue: "/" },
      { key: "rateLimit", label: "Rate limit (req/s)", type: "number", defaultValue: 100 },
    ],
  },
  {
    type: "tls-cert",
    displayName: "TLS Cert",
    category: "K8s Primitives",
    description: "Let's Encrypt Certificate (cert-manager) — produces a kubernetes.io/tls Secret",
    icon: ShieldCheck,
    accentBg: "bg-rose-50",
    accentFg: "text-rose-600",
    inputs: [{ key: "host", label: "host", type: "ingress-host" }],
    outputs: [{ key: "secret", label: "secret", type: "tls-secret-ref" }],
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

  // ─── Managed Services ─────────────────────────────────────────────────
  {
    type: "postgres",
    displayName: "Postgres",
    category: "Managed Services",
    description: "Managed PostgreSQL cluster — emits a Secret with credentials and a Service",
    icon: Database,
    accentBg: "bg-blue-50",
    accentFg: "text-blue-600",
    inputs: [],
    outputs: [
      { key: "credentials", label: "credentials", type: "secret-ref" },
      { key: "service", label: "service", type: "service-ref" },
    ],
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
    category: "Managed Services",
    description: "Managed Redis — emits a Secret with password and a Service",
    icon: Database,
    accentBg: "bg-red-50",
    accentFg: "text-red-600",
    inputs: [],
    outputs: [
      { key: "credentials", label: "credentials", type: "secret-ref" },
      { key: "service", label: "service", type: "service-ref" },
    ],
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
    displayName: "S3 / MinIO Bucket",
    category: "Managed Services",
    description: "Object storage — emits a Secret with access keys and a Service endpoint",
    icon: HardDrive,
    accentBg: "bg-orange-50",
    accentFg: "text-orange-600",
    inputs: [],
    outputs: [
      { key: "credentials", label: "credentials", type: "secret-ref" },
      { key: "service", label: "service", type: "service-ref" },
    ],
    params: [
      {
        key: "region",
        label: "Region",
        type: "enum",
        options: ["eu-central-1", "eu-west-1", "us-east-1"],
        defaultValue: "eu-central-1",
      },
      { key: "versioning", label: "Versioning", type: "boolean", defaultValue: true },
    ],
  },
  {
    type: "helm-chart",
    displayName: "Helm Chart",
    category: "Managed Services",
    description: "Install a Helm chart — surfaces the primary Service it creates",
    icon: Package,
    accentBg: "bg-emerald-50",
    accentFg: "text-emerald-600",
    inputs: [{ key: "values", label: "values", type: "any", multi: true }],
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

  // ─── Outputs ──────────────────────────────────────────────────────────
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
  "K8s Primitives",
  "Managed Services",
  "Outputs",
]

const CATEGORY_ICONS: Record<AtomCategory, LucideIcon> = {
  Inputs: FormInput,
  "K8s Primitives": Box,
  "Managed Services": Database,
  Outputs: Layers,
}

export function categoryIcon(category: AtomCategory): LucideIcon {
  return CATEGORY_ICONS[category]
}

export function findAtom(type: string): AtomDef | undefined {
  return ATOMS.find((a) => a.type === type)
}
