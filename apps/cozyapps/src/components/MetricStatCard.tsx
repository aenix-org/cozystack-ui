import type { ReactNode } from "react"
import { cn } from "@cozystack/ui"

interface MetricStatCardProps {
  label: ReactNode
  value: ReactNode
  hint?: ReactNode
  tone?: "neutral" | "ok" | "warn" | "error"
  icon?: ReactNode
  className?: string
}

const TONE_VALUE: Record<NonNullable<MetricStatCardProps["tone"]>, string> = {
  neutral: "text-slate-900",
  ok: "text-emerald-600",
  warn: "text-amber-600",
  error: "text-red-600",
}

export function MetricStatCard({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
  className,
}: MetricStatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-4",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {icon}
        {label}
      </div>
      <div className={cn("font-mono text-2xl font-semibold leading-tight", TONE_VALUE[tone])}>
        {value}
      </div>
      {hint && <div className="text-xs text-slate-500">{hint}</div>}
    </div>
  )
}
