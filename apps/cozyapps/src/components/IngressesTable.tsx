import { Link } from "react-router"
import { cn } from "@cozystack/ui"
import type { IngressInfo, IngressStatus } from "../lib/env-details.ts"

const STATUS_TONE: Record<IngressStatus, string> = {
  Admitted: "text-emerald-700 bg-emerald-50 ring-emerald-200",
  Pending: "text-amber-700 bg-amber-50 ring-amber-200",
  Failed: "text-red-700 bg-red-50 ring-red-200",
}

export function IngressesTable({ ingresses }: { ingresses: IngressInfo[] }) {
  if (ingresses.length === 0) {
    return (
      <p className="text-sm italic text-slate-400">
        No Ingresses in this environment.
      </p>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <th className="py-2 pl-2 pr-3">Host</th>
            <th className="py-2 pr-3">Path</th>
            <th className="py-2 pr-3">Backend</th>
            <th className="py-2 pr-3">Class</th>
            <th className="py-2 pr-3">TLS</th>
            <th className="py-2 pr-3">Address</th>
            <th className="py-2 pr-3">Status</th>
            <th className="py-2 pr-2 text-right">Age</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {ingresses.map((ing) => (
            <tr key={ing.name} className="hover:bg-slate-50/60">
              <td className="py-2 pl-2 pr-3 font-mono text-xs">
                <a
                  href={`https://${ing.host}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline"
                >
                  {ing.host}
                </a>
              </td>
              <td className="py-2 pr-3 font-mono text-xs text-slate-600">{ing.paths}</td>
              <td className="py-2 pr-3 text-xs">
                <Link
                  to={`/apps/${ing.backendApp}`}
                  className="font-mono text-blue-600 hover:underline"
                >
                  {ing.backendApp}
                </Link>
              </td>
              <td className="py-2 pr-3 font-mono text-xs text-slate-500">
                {ing.ingressClass}
              </td>
              <td className="py-2 pr-3">
                {ing.tls ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                    TLS
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">—</span>
                )}
              </td>
              <td className="py-2 pr-3 font-mono text-xs text-slate-600">{ing.address}</td>
              <td className="py-2 pr-3">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
                    STATUS_TONE[ing.status],
                  )}
                >
                  {ing.status}
                </span>
              </td>
              <td className="py-2 pr-2 text-right font-mono text-xs text-slate-500">
                {ing.age}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
