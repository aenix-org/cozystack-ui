export type RunStatus = "idle" | "queued" | "running" | "succeeded" | "failed"

export interface AtomNodeData {
  atomType: string
  params: Record<string, unknown>
  status: RunStatus
  [key: string]: unknown
}

export const STATUS_RING: Record<RunStatus, string> = {
  idle: "ring-slate-200",
  queued: "ring-slate-300",
  running: "ring-blue-400 ring-2 animate-pulse",
  succeeded: "ring-emerald-400 ring-2",
  failed: "ring-red-400 ring-2",
}

export const STATUS_TONE_TEXT: Record<RunStatus, string> = {
  idle: "text-slate-400",
  queued: "text-slate-500",
  running: "text-blue-600",
  succeeded: "text-emerald-600",
  failed: "text-red-600",
}
