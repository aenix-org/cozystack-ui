import { Link } from "react-router"
import { Globe } from "lucide-react"
import { cn } from "@cozystack/ui"
import type { LbStatus, LoadBalancerInfo } from "../lib/env-details.ts"

const STATUS_TONE: Record<LbStatus, string> = {
  Active: "text-emerald-700 bg-emerald-50 ring-emerald-200",
  Pending: "text-amber-700 bg-amber-50 ring-amber-200",
  Failed: "text-red-700 bg-red-50 ring-red-200",
}

export function LoadBalancersTable({ lbs }: { lbs: LoadBalancerInfo[] }) {
  if (lbs.length === 0) {
    return (
      <p className="text-sm italic text-slate-400">
        No LoadBalancer services in this environment.
      </p>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <th className="py-2 pl-2 pr-3">Name</th>
            <th className="py-2 pr-3">External</th>
            <th className="py-2 pr-3">Ports</th>
            <th className="py-2 pr-3">Backend</th>
            <th className="py-2 pr-3">Status</th>
            <th className="py-2 pr-2 text-right">Age</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {lbs.map((lb) => (
            <tr key={lb.name} className="hover:bg-slate-50/60">
              <td className="py-2 pl-2 pr-3 font-mono text-xs font-medium text-slate-900">
                {lb.name}
              </td>
              <td className="py-2 pr-3 font-mono text-xs">
                <span className="inline-flex items-center gap-1">
                  <Globe className="size-3 text-slate-400" />
                  {lb.externalIp}
                </span>
              </td>
              <td className="py-2 pr-3 font-mono text-xs text-slate-600">{lb.ports}</td>
              <td className="py-2 pr-3 text-xs">
                <Link
                  to={`/apps/${lb.backendApp}`}
                  className="font-mono text-blue-600 hover:underline"
                >
                  {lb.backendApp}
                </Link>
              </td>
              <td className="py-2 pr-3">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
                    STATUS_TONE[lb.status],
                  )}
                >
                  {lb.status}
                </span>
              </td>
              <td className="py-2 pr-2 text-right font-mono text-xs text-slate-500">
                {lb.age}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
