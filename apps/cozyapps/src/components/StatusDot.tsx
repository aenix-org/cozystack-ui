import { cn } from "@cozystack/ui"
import type { ApplicationStatus } from "../lib/types.ts"
import { applicationStatusTone } from "../lib/status.ts"

const TONE_CLASS = {
  ok: "bg-emerald-500",
  info: "bg-blue-500",
  warn: "bg-amber-500",
  error: "bg-red-500",
  muted: "border border-slate-300 bg-transparent",
} as const

interface StatusDotProps {
  status: ApplicationStatus
  className?: string
}

export function StatusDot({ status, className }: StatusDotProps) {
  const tone = applicationStatusTone(status)
  return <span className={cn("inline-block size-1.5 shrink-0 rounded-full", TONE_CLASS[tone], className)} />
}
