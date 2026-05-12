import { useMemo, useState } from "react"
import { cn } from "@cozystack/ui"
import type { LogLevel, LogLine } from "../lib/metrics.ts"

const LEVEL_COLOR: Record<LogLevel, string> = {
  info: "text-sky-300",
  debug: "text-slate-400",
  warn: "text-amber-300",
  error: "text-red-400",
}

const LEVEL_BG: Record<LogLevel, string> = {
  info: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  debug: "bg-slate-500/15 text-slate-300 ring-slate-500/30",
  warn: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  error: "bg-red-500/15 text-red-300 ring-red-500/30",
}

const FILTERS: { value: LogLevel | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "info", label: "Info" },
  { value: "debug", label: "Debug" },
  { value: "warn", label: "Warn" },
  { value: "error", label: "Error" },
]

interface LogsViewerProps {
  logs: LogLine[]
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(
    2,
    "0",
  )}:${String(d.getSeconds()).padStart(2, "0")}`
}

export function LogsViewer({ logs }: LogsViewerProps) {
  const [filter, setFilter] = useState<LogLevel | "all">("all")
  const visible = useMemo(
    () => (filter === "all" ? logs : logs.filter((l) => l.level === filter)),
    [logs, filter],
  )
  const counts = useMemo(() => {
    const out: Record<LogLevel, number> = { info: 0, debug: 0, warn: 0, error: 0 }
    for (const l of logs) out[l.level] += 1
    return out
  }, [logs])

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-900">
      <header className="flex items-center gap-2 border-b border-slate-800 bg-slate-900 px-4 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Logs
        </span>
        <span className="text-[11px] text-slate-500">last {logs.length} entries</span>
        <div className="ml-auto flex flex-wrap gap-1">
          {FILTERS.map((f) => {
            const active = filter === f.value
            const count =
              f.value === "all" ? logs.length : counts[f.value as LogLevel]
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={cn(
                  "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset transition-colors",
                  active
                    ? "bg-blue-500/20 text-blue-200 ring-blue-500/40"
                    : "text-slate-400 ring-slate-700 hover:bg-slate-800",
                )}
              >
                {f.label}
                <span className="font-mono text-[10px] opacity-70">{count}</span>
              </button>
            )
          })}
        </div>
      </header>
      <div className="max-h-80 overflow-y-auto font-mono text-[12px] leading-relaxed">
        {visible.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-slate-500">No log entries match.</div>
        ) : (
          <ul className="divide-y divide-slate-800/60">
            {visible.map((line, idx) => (
              <li
                key={`${line.ts}-${idx}`}
                className="flex items-start gap-3 px-4 py-1.5 hover:bg-slate-800/40"
              >
                <span className="shrink-0 text-slate-500">{formatTime(line.ts)}</span>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center rounded px-1.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset",
                    LEVEL_BG[line.level],
                  )}
                >
                  {line.level}
                </span>
                <span className={cn("truncate", LEVEL_COLOR[line.level])}>{line.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
