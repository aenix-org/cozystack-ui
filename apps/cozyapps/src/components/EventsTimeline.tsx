import {
  CheckCircle2,
  Download,
  HardDriveUpload,
  PackageMinus,
  PackagePlus,
  ShieldCheck,
  Wrench,
  XCircle,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@cozystack/ui"
import type { EnvEvent, EventKind } from "../lib/env-details.ts"
import { timeAgo } from "../lib/humanize.ts"

const KIND_ICON: Record<EventKind, { Icon: LucideIcon; cls: string }> = {
  "node-added": { Icon: PackagePlus, cls: "text-emerald-500" },
  "node-drained": { Icon: PackageMinus, cls: "text-amber-500" },
  "controller-upgrade": { Icon: Wrench, cls: "text-blue-500" },
  "app-deploy": { Icon: HardDriveUpload, cls: "text-blue-500" },
  "app-removed": { Icon: PackageMinus, cls: "text-slate-400" },
  "cert-renewed": { Icon: ShieldCheck, cls: "text-emerald-500" },
  "drift-healed": { Icon: CheckCircle2, cls: "text-emerald-500" },
  "reconcile-failed": { Icon: XCircle, cls: "text-red-500" },
}

interface EventsTimelineProps {
  events: EnvEvent[]
}

export function EventsTimeline({ events }: EventsTimelineProps) {
  if (events.length === 0) {
    return <p className="text-sm italic text-slate-400">No events yet.</p>
  }
  return (
    <ul className="flex flex-col">
      {events.map((evt) => {
        const meta = KIND_ICON[evt.kind]
        return (
          <li
            key={evt.id}
            className="flex items-start gap-3 border-b border-slate-100 py-2 last:border-b-0"
          >
            <meta.Icon className={cn("mt-0.5 size-4 shrink-0", meta.cls)} />
            <div className="min-w-0 flex-1">
              <div className="text-sm text-slate-900">{evt.title}</div>
              {evt.detail && (
                <div className="font-mono text-[11px] text-slate-500">{evt.detail}</div>
              )}
            </div>
            <span className="shrink-0 font-mono text-[11px] text-slate-400">
              {timeAgo(evt.ts)}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export { Download }
