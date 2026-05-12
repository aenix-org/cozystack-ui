import { MarkerType } from "@xyflow/react"

export type RunStatus = "idle" | "queued" | "running" | "succeeded" | "failed"

export const ATOM_EDGE_MARKERS = {
  type: MarkerType.ArrowClosed,
  width: 14,
  height: 14,
}

import type { UserInputField } from "./dynamic-fields.ts"

export interface AtomNodeData {
  atomType: string
  params: Record<string, unknown>
  /** Param keys promoted to input ports — replace inline editor with a handle. */
  exposed: string[]
  /** Dynamic form fields for atoms with hasDynamicFields (User Input). */
  fields?: UserInputField[]
  status: RunStatus
  [key: string]: unknown
}

/** Handle id prefix used when a param is exposed as an input port. */
export const PARAM_HANDLE_PREFIX = "param:"

export function paramHandleId(paramKey: string): string {
  return `${PARAM_HANDLE_PREFIX}${paramKey}`
}

export function isParamHandle(handleId: string | null | undefined): boolean {
  return !!handleId && handleId.startsWith(PARAM_HANDLE_PREFIX)
}

export function paramKeyFromHandle(handleId: string): string {
  return handleId.slice(PARAM_HANDLE_PREFIX.length)
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
