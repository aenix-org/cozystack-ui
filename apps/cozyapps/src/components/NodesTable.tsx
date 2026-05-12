import { Crown, Server } from "lucide-react"
import { cn } from "@cozystack/ui"
import type { NodeInfo, NodeStatus } from "../lib/env-details.ts"

const STATUS_TONE: Record<NodeStatus, string> = {
  Ready: "text-emerald-700 bg-emerald-50 ring-emerald-200",
  NotReady: "text-red-700 bg-red-50 ring-red-200",
  SchedulingDisabled: "text-amber-700 bg-amber-50 ring-amber-200",
}

interface NodesTableProps {
  nodes: NodeInfo[]
}

export function NodesTable({ nodes }: NodesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <th className="py-2 pl-2 pr-3">Name</th>
            <th className="py-2 pr-3">Role</th>
            <th className="py-2 pr-3">Status</th>
            <th className="py-2 pr-3">Version</th>
            <th className="py-2 pr-3 text-right">CPU</th>
            <th className="py-2 pr-3 text-right">Memory</th>
            <th className="py-2 pr-3 text-right">Pods</th>
            <th className="py-2 pr-2 text-right">Age</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {nodes.map((n) => (
            <tr key={n.name} className="hover:bg-slate-50/60">
              <td className="py-2 pl-2 pr-3">
                <span className="flex items-center gap-1.5 font-mono text-xs">
                  {n.role === "control-plane" ? (
                    <Crown className="size-3.5 text-amber-500" />
                  ) : (
                    <Server className="size-3.5 text-slate-400" />
                  )}
                  <span className="font-medium text-slate-900">{n.name}</span>
                </span>
              </td>
              <td className="py-2 pr-3 text-xs text-slate-500">
                {n.role === "control-plane" ? "control-plane" : "worker"}
              </td>
              <td className="py-2 pr-3">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
                    STATUS_TONE[n.status],
                  )}
                >
                  {n.status}
                </span>
              </td>
              <td className="py-2 pr-3 font-mono text-xs text-slate-500">{n.k8sVersion}</td>
              <td className="py-2 pr-3 text-right font-mono text-xs text-slate-700">
                {n.cpuUsed.toFixed(1)}{" "}
                <span className="text-slate-400">/ {n.cpuTotal}</span>
              </td>
              <td className="py-2 pr-3 text-right font-mono text-xs text-slate-700">
                {n.memUsedGb.toFixed(1)}{" "}
                <span className="text-slate-400">/ {n.memTotalGb} GB</span>
              </td>
              <td className="py-2 pr-3 text-right font-mono text-xs text-slate-700">
                {n.pods}{" "}
                <span className="text-slate-400">/ {n.podCapacity}</span>
              </td>
              <td className="py-2 pr-2 text-right font-mono text-xs text-slate-500">
                {n.age}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
