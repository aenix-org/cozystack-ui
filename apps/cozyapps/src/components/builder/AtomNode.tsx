import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { cn } from "@cozystack/ui"
import {
  findAtom,
  effectiveOutputs,
  type AtomDef,
  type PortDef,
} from "../../lib/builder/atoms.ts"
import { PORT_TYPE, paramTypeToPortType } from "../../lib/builder/port-types.ts"
import {
  paramHandleId,
  type AtomNodeData,
  type RunStatus,
} from "../../lib/builder/types.ts"

const HEADER_H = 36
const PORT_ROW_H = 24
const PORTS_PAD = 8

/** Y of the row top inside the (relative) body div — header sits above. */
function rowTop(index: number): number {
  return PORTS_PAD + index * PORT_ROW_H
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
    return <Loader2 className="size-3.5 animate-spin text-[#0971EB]" />
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
  const outputs = effectiveOutputs(atom, nodeData)

  return (
    <AtomNodeContent
      atom={atom}
      outputs={outputs}
      status={nodeData.status}
      exposed={nodeData.exposed ?? []}
      selected={!!selected}
    />
  )
}

interface AtomNodeContentProps {
  atom: AtomDef
  outputs: PortDef[]
  status: RunStatus
  exposed: string[]
  selected: boolean
}

function AtomNodeContent({ atom, outputs, status, exposed, selected }: AtomNodeContentProps) {
  const Icon = atom.icon
  const exposedParams = atom.params.filter((p) => exposed.includes(p.key))
  const inputCount = atom.inputs.length
  const exposedCount = exposedParams.length
  const showDivider = inputCount > 0 && exposedCount > 0
  const leftCount = inputCount + exposedCount
  const totalPorts = leftCount + outputs.length
  const dividerExtra = showDivider ? 6 : 0
  const minBodyHeight = Math.max(totalPorts, 1) * PORT_ROW_H + PORTS_PAD * 2 + dividerExtra

  return (
    <div
      className={cn(
        "w-56 rounded-xl border bg-white shadow-sm transition-all hover:shadow-[0_8px_24px_-8px_rgba(9,113,235,0.35)]",
        selected
          ? "border-[#0971EB] ring-2 ring-[#01A5FF]/25"
          : status === "running"
            ? "border-[#01A5FF] ring-2 ring-[#01A5FF]/25"
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
        {atom.inputs.map((port, idx) => (
          <div
            key={`in-${port.key}`}
            className="flex items-center text-xs text-slate-600"
            style={{ position: "absolute", left: 0, right: 0, top: rowTop(idx), height: PORT_ROW_H }}
          >
            <Handle
              type="target"
              position={Position.Left}
              id={port.key}
              style={handleStyle(port.type, PORT_ROW_H / 2)}
            />
            <span className="ml-3 flex min-w-0 items-center gap-1 truncate">
              {port.label}
              {port.multi && (
                <span
                  className="rounded-sm bg-slate-200 px-1 font-mono text-[9px] leading-tight text-slate-600"
                  title="Accepts multiple incoming connections"
                >
                  N
                </span>
              )}
            </span>
            <span className="ml-auto mr-3 font-mono text-[10px] uppercase tracking-wide text-slate-300">
              {PORT_TYPE[port.type].label}
            </span>
          </div>
        ))}
        {showDivider && (
          <div
            className="absolute left-3 right-3 border-t border-dashed border-slate-200"
            style={{ top: rowTop(inputCount) - 3 }}
          />
        )}
        {exposedParams.map((param, idx) => {
          const portType = paramTypeToPortType(param.type)
          return (
            <div
              key={`param-${param.key}`}
              className="flex items-center text-xs text-slate-600"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: rowTop(inputCount + idx) + dividerExtra,
                height: PORT_ROW_H,
              }}
            >
              <Handle
                type="target"
                position={Position.Left}
                id={paramHandleId(param.key)}
                style={handleStyle(portType, PORT_ROW_H / 2)}
              />
              <span className="ml-3 flex items-center gap-1 truncate italic">
                {param.label}
              </span>
              <span className="ml-auto mr-3 font-mono text-[10px] uppercase tracking-wide text-slate-300">
                {PORT_TYPE[portType].label}
              </span>
            </div>
          )
        })}
        {outputs.map((port, idx) => (
          <div
            key={`out-${port.key}`}
            className="flex items-center text-xs text-slate-600"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: rowTop(leftCount + idx) + dividerExtra,
              height: PORT_ROW_H,
            }}
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
        ))}
      </div>
    </div>
  )
}

export const AtomNode = memo(AtomNodeImpl)
