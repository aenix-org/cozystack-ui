import { useState } from "react"
import {
  AlertTriangle,
  Box,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  XCircle,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@cozystack/ui"
import type {
  AtomStatus,
  AtomTopology,
  Substatus,
  SubstatusState,
} from "../lib/topology.ts"
import { findAtom } from "../lib/builder/atoms.ts"

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

const SUBSTATUS_META: Record<
  SubstatusState,
  { Icon: LucideIcon; iconCls: string; rowCls: string }
> = {
  ok: { Icon: CheckCircle2, iconCls: "text-emerald-500", rowCls: "text-slate-700" },
  warn: { Icon: AlertTriangle, iconCls: "text-amber-500", rowCls: "text-amber-800" },
  error: { Icon: XCircle, iconCls: "text-red-500", rowCls: "text-red-800" },
  info: { Icon: Loader2, iconCls: "text-blue-500 animate-spin", rowCls: "text-blue-800" },
  unknown: { Icon: Clock, iconCls: "text-slate-400", rowCls: "text-slate-500" },
}

function humanCheckedAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  if (diffMs < 60_000) return `${Math.round(diffMs / 1000)}s ago`
  return `${Math.round(diffMs / 60_000)}m ago`
}

interface TopologySectionProps {
  topology: AtomTopology[]
}

export function TopologySection({ topology }: TopologySectionProps) {
  if (topology.length === 0) {
    return <p className="text-sm italic text-slate-400">Nothing materialised yet.</p>
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
  const [open, setOpen] = useState(atom.status !== "healthy")
  const def = findAtom(atom.atomType)
  const AtomIcon = def?.icon ?? Box
  const meta = STATUS_META[atom.status]
  const okCount = atom.substatuses.filter((s) => s.state === "ok").length
  const totalCount = atom.substatuses.length
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
          {totalCount > 0 && (
            <span className="font-mono text-[11px] text-slate-500">
              {okCount}/{totalCount} conditions
            </span>
          )}
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
      {open && atom.substatuses.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/40 px-4 py-2.5">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Conditions
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              checked {humanCheckedAgo(atom.lastChecked)}
            </span>
          </div>
          <ul className="space-y-1">
            {atom.substatuses.map((s) => (
              <SubstatusRow key={s.type} sub={s} />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function SubstatusRow({ sub }: { sub: Substatus }) {
  const meta = SUBSTATUS_META[sub.state]
  const Icon = meta.Icon
  return (
    <li className={cn("flex items-start gap-2 text-[11px]", meta.rowCls)}>
      <Icon className={cn("mt-0.5 size-3.5 shrink-0", meta.iconCls)} />
      <span className="w-32 shrink-0 truncate font-mono text-[11px] font-medium">
        {sub.type}
      </span>
      {sub.reason && (
        <span className="w-44 shrink-0 truncate font-mono text-[10px] text-slate-500">
          {sub.reason}
        </span>
      )}
      <span className="flex-1 truncate">{sub.message ?? ""}</span>
    </li>
  )
}
