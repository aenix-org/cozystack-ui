import { useState } from "react"
import {
  AlertTriangle,
  Box,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Globe,
  HardDrive,
  KeyRound,
  Loader2,
  Network,
  UserCircle2,
  XCircle,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@cozystack/ui"
import type {
  AtomStatus,
  AtomTopology,
  IngressResource,
  K8sKind,
  K8sResource,
  PodPhase,
  PodResource,
  PvcResource,
  SecretResource,
  ServiceAccountResource,
  ServiceResource,
} from "../lib/topology.ts"
import { findAtom } from "../lib/builder/atoms.ts"

const KIND_ICON: Record<K8sKind, LucideIcon> = {
  Pod: Box,
  Service: Network,
  Secret: KeyRound,
  ConfigMap: FileText,
  PersistentVolumeClaim: HardDrive,
  Ingress: Globe,
  ServiceAccount: UserCircle2,
}

const KIND_LABEL: Record<K8sKind, string> = {
  Pod: "pod",
  Service: "svc",
  Secret: "secret",
  ConfigMap: "cm",
  PersistentVolumeClaim: "pvc",
  Ingress: "ing",
  ServiceAccount: "sa",
}

const STATUS_META: Record<
  AtomStatus,
  { label: string; cls: string; Icon: LucideIcon; iconCls?: string }
> = {
  healthy: {
    label: "Healthy",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Icon: CheckCircle2,
    iconCls: "text-emerald-500",
  },
  reconciling: {
    label: "Reconciling",
    cls: "bg-blue-50 text-blue-700 ring-blue-200",
    Icon: Loader2,
    iconCls: "text-blue-500 animate-spin",
  },
  drift: {
    label: "Drift",
    cls: "bg-amber-50 text-amber-700 ring-amber-200",
    Icon: AlertTriangle,
    iconCls: "text-amber-500",
  },
  failed: {
    label: "Failed",
    cls: "bg-red-50 text-red-700 ring-red-200",
    Icon: XCircle,
    iconCls: "text-red-500",
  },
  pending: {
    label: "Pending",
    cls: "bg-slate-50 text-slate-600 ring-slate-200",
    Icon: Clock,
    iconCls: "text-slate-400",
  },
}

const POD_PHASE_TONE: Record<PodPhase, string> = {
  Running: "text-emerald-600",
  Pending: "text-amber-600",
  Succeeded: "text-slate-500",
  Failed: "text-red-600",
  CrashLoopBackOff: "text-red-600",
}

interface TopologySectionProps {
  topology: AtomTopology[]
}

export function TopologySection({ topology }: TopologySectionProps) {
  if (topology.length === 0) {
    return (
      <p className="text-sm italic text-slate-400">
        Nothing materialised yet.
      </p>
    )
  }
  return (
    <div className="space-y-2">
      {topology.map((atom) => (
        <AtomRow key={atom.id} atom={atom} />
      ))}
    </div>
  )
}

function AtomRow({ atom }: { atom: AtomTopology }) {
  const [open, setOpen] = useState(true)
  const def = findAtom(atom.atomType)
  const AtomIcon = def?.icon ?? Box
  const meta = STATUS_META[atom.status]
  const podCount = atom.resources.filter((r) => r.kind === "Pod").length
  const podReady = atom.resources.filter(
    (r) => r.kind === "Pod" && (r as PodResource).ready === "1/1",
  ).length
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
      >
        <ChevronRight
          className={cn(
            "size-4 shrink-0 text-slate-400 transition-transform",
            open && "rotate-90",
          )}
        />
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md",
            def?.accentBg ?? "bg-slate-100",
          )}
        >
          <AtomIcon className={cn("size-4", def?.accentFg ?? "text-slate-600")} />
        </div>
        <div className="flex flex-1 items-center gap-3">
          <span className="text-sm font-medium text-slate-900">{atom.displayName}</span>
          <span className="font-mono text-[11px] text-slate-400">{atom.id}</span>
          {podCount > 0 && (
            <span className="font-mono text-[11px] text-slate-500">
              {podReady}/{podCount} pods
            </span>
          )}
          <span className="font-mono text-[11px] text-slate-400">
            {atom.resources.length} objects
          </span>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
            meta.cls,
          )}
        >
          <meta.Icon className={cn("size-3", meta.iconCls)} />
          {meta.label}
        </span>
      </button>
      {open && (atom.messages.length > 0 || atom.status !== "healthy") && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-2">
          {atom.messages.length === 0 ? (
            <p className="text-[11px] italic text-slate-500">
              No conditions reported by status workflow.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {atom.messages.map((msg, idx) => (
                <li
                  key={idx}
                  className={cn(
                    "flex items-start gap-1.5 text-[11px]",
                    atom.status === "failed"
                      ? "text-red-700"
                      : atom.status === "drift"
                        ? "text-amber-700"
                        : atom.status === "reconciling"
                          ? "text-blue-700"
                          : "text-slate-600",
                  )}
                >
                  <span className="mt-1 inline-block size-1 shrink-0 rounded-full bg-current opacity-60" />
                  {msg}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-1 font-mono text-[10px] text-slate-400">
            checked {humanCheckedAgo(atom.lastChecked)}
          </p>
        </div>
      )}
      {open && (
        <ul className="divide-y divide-slate-100 border-t border-slate-100">
          {atom.resources.map((r, idx) => (
            <ResourceRow key={`${r.kind}-${r.name}-${idx}`} resource={r} />
          ))}
        </ul>
      )}
    </div>
  )
}

function ResourceRow({ resource }: { resource: K8sResource }) {
  const Icon = KIND_ICON[resource.kind]
  return (
    <li className="flex items-center gap-3 px-4 py-2 font-mono text-xs text-slate-700 hover:bg-slate-50/60">
      <Icon className="size-3.5 shrink-0 text-slate-400" />
      <span className="w-12 shrink-0 text-[10px] uppercase tracking-wider text-slate-400">
        {KIND_LABEL[resource.kind]}
      </span>
      <span className="flex-1 truncate font-medium text-slate-900">{resource.name}</span>
      <ResourceMeta resource={resource} />
    </li>
  )
}

function ResourceMeta({ resource }: { resource: K8sResource }) {
  if (resource.kind === "Pod") return <PodMeta pod={resource} />
  if (resource.kind === "Service") return <ServiceMeta service={resource} />
  if (resource.kind === "Secret" || resource.kind === "ConfigMap")
    return <SecretMeta secret={resource} />
  if (resource.kind === "PersistentVolumeClaim") return <PvcMeta pvc={resource} />
  if (resource.kind === "Ingress") return <IngressMeta ingress={resource} />
  if (resource.kind === "ServiceAccount") return <ServiceAccountMeta sa={resource} />
  return null
}

function PodMeta({ pod }: { pod: PodResource }) {
  return (
    <>
      <span className={cn("w-32 shrink-0 truncate text-[10px]", POD_PHASE_TONE[pod.phase])}>
        {pod.phase}
      </span>
      <span className="w-12 shrink-0 text-right text-slate-600">{pod.ready}</span>
      <span
        className={cn(
          "w-12 shrink-0 text-right",
          pod.restarts > 3
            ? "text-red-600"
            : pod.restarts > 0
              ? "text-amber-600"
              : "text-slate-400",
        )}
      >
        {pod.restarts} ↻
      </span>
      <span className="w-12 shrink-0 text-right text-slate-400">{pod.age}</span>
      <span className="hidden w-48 shrink-0 truncate text-slate-500 md:inline">
        {pod.image}
      </span>
    </>
  )
}

function ServiceMeta({ service }: { service: ServiceResource }) {
  return (
    <>
      <span className="w-24 shrink-0 truncate text-slate-500">{service.type}</span>
      <span className="w-24 shrink-0 truncate text-slate-500">{service.ports}</span>
      <span className="w-12 shrink-0 text-right text-slate-500">
        {service.endpoints}
        <span className="text-slate-400"> ep</span>
      </span>
      <span className="w-12 shrink-0 text-right text-slate-400">{service.age}</span>
    </>
  )
}

function SecretMeta({ secret }: { secret: SecretResource }) {
  return (
    <>
      <span className="w-40 shrink-0 truncate text-slate-500">{secret.subtype ?? "—"}</span>
      <span className="w-16 shrink-0 text-right text-slate-500">{secret.keys} keys</span>
      <span className="w-12 shrink-0 text-right text-slate-400">{secret.age}</span>
    </>
  )
}

function PvcMeta({ pvc }: { pvc: PvcResource }) {
  return (
    <>
      <span className="w-24 shrink-0 truncate text-emerald-600">{pvc.status}</span>
      <span className="w-16 shrink-0 truncate text-slate-500">{pvc.size}</span>
      <span className="w-24 shrink-0 truncate text-slate-500">{pvc.storageClass}</span>
      <span className="w-12 shrink-0 text-right text-slate-400">{pvc.age}</span>
    </>
  )
}

function IngressMeta({ ingress }: { ingress: IngressResource }) {
  return (
    <>
      <span className="flex-1 truncate text-blue-600">{ingress.host}</span>
      {ingress.tls && (
        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
          TLS
        </span>
      )}
      <span className="w-32 shrink-0 truncate text-slate-500">{ingress.address}</span>
      <span className="w-12 shrink-0 text-right text-slate-400">{ingress.age}</span>
    </>
  )
}

function ServiceAccountMeta({ sa }: { sa: ServiceAccountResource }) {
  return <span className="w-12 shrink-0 text-right text-slate-400">{sa.age}</span>
}

function humanCheckedAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  if (diffMs < 60_000) return `${Math.round(diffMs / 1000)}s ago`
  return `${Math.round(diffMs / 60_000)}m ago`
}
