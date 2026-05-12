import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { cn } from "@cozystack/ui"
import { findAtom, type AtomDef } from "../../lib/builder/atoms.ts"
import { PORT_TYPE } from "../../lib/builder/port-types.ts"
import type { AtomNodeData, RunStatus } from "../../lib/builder/types.ts"

const HEADER_H = 36
const PORT_ROW_H = 24
const PORTS_PAD = 8

function portTop(index: number): number {
  return HEADER_H + PORTS_PAD + index * PORT_ROW_H + PORT_ROW_H / 2
}

function handleStyle(type: keyof typeof PORT_TYPE, top: number): React.CSSProperties {
  return {
    top,
    width: 10,
    height: 10,
    background: PORT_TYPE[type].stroke,
    border: "2px solid white",
    boxShadow: "0 0 0 1px rgba(15,23,42,0.08)",
  }
}

function StatusIndicator({ status }: { status: RunStatus }) {
  if (status === "running") {
    return <Loader2 className="size-3.5 animate-spin text-blue-500" />
  }
  if (status === "succeeded") {
    return <CheckCircle2 className="size-3.5 text-emerald-500" />
  }
  if (status === "failed") {
    return <XCircle className="size-3.5 text-red-500" />
  }
  if (status === "queued") {
    return <span className="size-1.5 rounded-full bg-slate-400" />
  }
  return null
}

function AtomNodeImpl({ data, selected }: NodeProps) {
  const nodeData = data as AtomNodeData
  const atom = findAtom(nodeData.atomType)
  if (!atom) return null

  return <AtomNodeContent atom={atom} status={nodeData.status} selected={!!selected} />
}

interface AtomNodeContentProps {
  atom: AtomDef
  status: RunStatus
  selected: boolean
}

function AtomNodeContent({ atom, status, selected }: AtomNodeContentProps) {
  const Icon = atom.icon
  const inputCount = atom.inputs.length
  const totalPorts = inputCount + atom.outputs.length
  const minBodyHeight = Math.max(totalPorts, 1) * PORT_ROW_H + PORTS_PAD * 2

  return (
    <div
      className={cn(
        "w-56 rounded-xl border bg-white shadow-sm transition-all",
        selected
          ? "border-blue-400 ring-2 ring-blue-200"
          : status === "running"
            ? "border-blue-300 ring-2 ring-blue-200"
            : status === "succeeded"
              ? "border-emerald-300"
              : status === "failed"
                ? "border-red-300"
                : "border-slate-200",
      )}
    >
      <header
        className={cn(
          "flex items-center gap-2 rounded-t-xl px-3 py-2",
          atom.accentBg,
        )}
        style={{ height: HEADER_H }}
      >
        <Icon className={cn("size-4", atom.accentFg)} />
        <span className="truncate text-sm font-medium text-slate-900">{atom.displayName}</span>
        <span className="ml-auto flex shrink-0 items-center">
          <StatusIndicator status={status} />
        </span>
      </header>
      <div className="relative" style={{ minHeight: minBodyHeight }}>
        {atom.inputs.map((port, idx) => {
          const top = portTop(idx)
          return (
            <div
              key={`in-${port.key}`}
              className="flex items-center text-xs text-slate-600"
              style={{ position: "absolute", left: 0, right: 0, top: top - PORT_ROW_H / 2, height: PORT_ROW_H }}
            >
              <Handle
                type="target"
                position={Position.Left}
                id={port.key}
                style={handleStyle(port.type, PORT_ROW_H / 2)}
              />
              <span className="ml-3 truncate">{port.label}</span>
              <span className="ml-auto mr-3 font-mono text-[10px] uppercase tracking-wide text-slate-300">
                {PORT_TYPE[port.type].label}
              </span>
            </div>
          )
        })}
        {atom.outputs.map((port, idx) => {
          const top = portTop(inputCount + idx)
          return (
            <div
              key={`out-${port.key}`}
              className="flex items-center text-xs text-slate-600"
              style={{ position: "absolute", left: 0, right: 0, top: top - PORT_ROW_H / 2, height: PORT_ROW_H }}
            >
              <span className="ml-3 font-mono text-[10px] uppercase tracking-wide text-slate-300">
                {PORT_TYPE[port.type].label}
              </span>
              <span className="ml-auto mr-3 truncate text-right">{port.label}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={port.key}
                style={handleStyle(port.type, PORT_ROW_H / 2)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const AtomNode = memo(AtomNodeImpl)
