import { cn } from "@cozystack/ui"

interface UsageBarProps {
  label: string
  used: number
  total: number
  unit?: string
  /** Round used/total when rendering (default: 2 decimals). */
  digits?: number
}

function toneFor(pct: number): { bar: string; text: string } {
  if (pct >= 0.9) return { bar: "bg-red-500", text: "text-red-600" }
  if (pct >= 0.75) return { bar: "bg-amber-500", text: "text-amber-600" }
  return { bar: "bg-emerald-500", text: "text-emerald-600" }
}

function fmt(value: number, digits: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export function UsageBar({ label, used, total, unit, digits = 2 }: UsageBarProps) {
  const pct = total > 0 ? Math.min(1, used / total) : 0
  const tone = toneFor(pct)
  const pctLabel = `${Math.round(pct * 100)}%`
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <span className={cn("font-mono text-xs font-semibold", tone.text)}>{pctLabel}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full transition-all", tone.bar)}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <div className="mt-2 flex items-baseline justify-between font-mono text-xs text-slate-600">
        <span className="font-medium text-slate-900">
          {fmt(used, digits)}
          {unit ?? ""}
        </span>
        <span className="text-slate-400">
          / {fmt(total, digits)}
          {unit ?? ""}
        </span>
      </div>
    </div>
  )
}
