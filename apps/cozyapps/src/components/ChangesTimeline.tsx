import { useState } from "react"
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Hand,
  Network,
  Sparkles,
  XCircle,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@cozystack/ui"
import type {
  ReconcileResult,
  ReconcileRun,
  ReconcileTrigger,
} from "../lib/metrics.ts"
import { timeAgo } from "../lib/humanize.ts"

const TRIGGER_ICON: Record<ReconcileTrigger, LucideIcon> = {
  cron: CalendarClock,
  "spec-change": Sparkles,
  "upstream-change": Network,
  manual: Hand,
}

const TRIGGER_LABEL: Record<ReconcileTrigger, string> = {
  cron: "Cron",
  "spec-change": "Spec change",
  "upstream-change": "Upstream change",
  manual: "Manual",
}

const RESULT_TONE: Record<ReconcileResult, string> = {
  changed: "bg-blue-50 text-blue-700 ring-blue-200",
  noop: "bg-slate-50 text-slate-500 ring-slate-200",
  failed: "bg-red-50 text-red-700 ring-red-200",
}

const RESULT_DOT: Record<ReconcileResult, string> = {
  changed: "bg-blue-500",
  noop: "bg-slate-300",
  failed: "bg-red-500",
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms} ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.round(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`
}

interface ChangesTimelineProps {
  runs: ReconcileRun[]
}

export function ChangesTimeline({ runs }: ChangesTimelineProps) {
  if (runs.length === 0) {
    return <p className="text-sm italic text-slate-400">No changes yet.</p>
  }
  return (
    <ul className="flex flex-col">
      {runs.map((run) => (
        <RunRow key={run.id} run={run} />
      ))}
    </ul>
  )
}

function RunRow({ run }: { run: ReconcileRun }) {
  const [open, setOpen] = useState(false)
  const Icon = TRIGGER_ICON[run.trigger]
  const hasDetails = run.outputDiffs.length > 0
  return (
    <li className="border-b border-slate-100 last:border-b-0">
      <button
        type="button"
        onClick={() => hasDetails && setOpen((v) => !v)}
        disabled={!hasDetails}
        className={cn(
          "flex w-full items-center gap-3 px-1 py-2.5 text-left transition-colors",
          hasDetails && "cursor-pointer hover:bg-slate-50",
        )}
      >
        <span className="relative flex size-4 items-center justify-center">
          <span
            className={cn("inline-block size-2 rounded-full", RESULT_DOT[run.result])}
          />
        </span>
        <Icon className="size-3.5 shrink-0 text-slate-400" />
        <span className="font-mono text-xs text-slate-500">
          {timeAgo(run.startedAt)}
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
            RESULT_TONE[run.result],
          )}
        >
          {run.result === "changed" ? "changed" : run.result === "failed" ? "failed" : "noop"}
        </span>
        <span className="text-xs text-slate-500">{TRIGGER_LABEL[run.trigger]}</span>
        <span className="flex-1 truncate text-xs text-slate-500">
          {run.outputDiffs.length > 0 ? (
            <span className="font-mono">
              {run.outputDiffs[0].atom}.{run.outputDiffs[0].port}
              {run.outputDiffs.length > 1 && (
                <span className="text-slate-400">
                  {" "}
                  +{run.outputDiffs.length - 1} more
                </span>
              )}
            </span>
          ) : run.result === "noop" ? (
            <span className="italic text-slate-400">nothing changed</span>
          ) : null}
        </span>
        <span className="font-mono text-[11px] text-slate-400">
          {formatDuration(run.durationMs)}
        </span>
        {hasDetails && (
          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 text-slate-300 transition-transform",
              open && "rotate-180",
            )}
          />
        )}
      </button>
      {open && hasDetails && (
        <div className="ml-7 mr-2 mb-3 space-y-1 rounded-md border border-slate-100 bg-slate-50/60 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Output diffs
          </div>
          <ul className="space-y-1.5">
            {run.outputDiffs.map((d, idx) => (
              <li
                key={`${run.id}-${idx}`}
                className="flex flex-wrap items-center gap-2 font-mono text-xs"
              >
                <span className="rounded bg-white px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-slate-500 ring-1 ring-slate-200">
                  {d.atom}
                </span>
                <span className="text-slate-400">.{d.port}</span>
                <span className="rounded bg-red-50 px-1.5 py-0.5 text-red-700 line-through ring-1 ring-red-100">
                  {d.before}
                </span>
                <ArrowRight className="size-3 text-slate-300" />
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700 ring-1 ring-emerald-100">
                  {d.after}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  )
}

export function SyncStateBadge({
  state,
}: {
  state: "in-sync" | "drift" | "reconciling" | "failed"
}) {
  const meta = {
    "in-sync": {
      label: "In sync",
      Icon: CheckCircle2,
      cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      iconCls: "text-emerald-500",
    },
    drift: {
      label: "Drift detected",
      Icon: Zap,
      cls: "bg-amber-50 text-amber-700 ring-amber-200",
      iconCls: "text-amber-500",
    },
    reconciling: {
      label: "Reconciling",
      Icon: Sparkles,
      cls: "bg-blue-50 text-blue-700 ring-blue-200",
      iconCls: "text-blue-500 animate-pulse",
    },
    failed: {
      label: "Reconcile failed",
      Icon: XCircle,
      cls: "bg-red-50 text-red-700 ring-red-200",
      iconCls: "text-red-500",
    },
  }[state]
  const { label, Icon, cls, iconCls } = meta
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1",
        cls,
      )}
    >
      <Icon className={cn("size-3.5", iconCls)} />
      {label}
    </span>
  )
}
