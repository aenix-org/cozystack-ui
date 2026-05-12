import { useMemo } from "react"
import { Link } from "react-router"
import { MoreHorizontal, ExternalLink, Activity } from "lucide-react"
import { Button, StatusBadge } from "@cozystack/ui"
import type { Application } from "../lib/types.ts"
import { applicationStatusTone } from "../lib/status.ts"
import { iconBg, iconFor } from "../lib/app-presentation.ts"
import { generateMetrics } from "../lib/metrics.ts"
import { AppIcon } from "./AppIcon.tsx"
import { EnvironmentPill } from "./EnvironmentPill.tsx"
import { Sparkline } from "./Sparkline.tsx"

interface ApplicationCardProps {
  app: Application
}

function primaryAction(app: Application): string {
  if (app.status === "Stopped") return "Start"
  if (app.templateSlug === "minecraft" || app.templateSlug === "cs2") return "Connect"
  return "Open"
}

export function ApplicationCard({ app }: ApplicationCardProps) {
  const primary = primaryAction(app)
  const metrics = useMemo(() => generateMetrics(app), [app])
  const cpuPct = Math.round((metrics.resources.cpuUsed / metrics.resources.cpuTotal) * 100)
  const memPct = Math.round((metrics.resources.memUsedGb / metrics.resources.memTotalGb) * 100)
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-center gap-3">
        <AppIcon icon={iconFor(app.templateSlug)} background={iconBg(app.templateSlug)} />
        <div className="flex flex-1 items-center gap-2">
          <Link
            to={`/apps/${app.name}`}
            className="text-sm font-semibold text-slate-900 hover:text-blue-700"
          >
            {app.name}
          </Link>
          <StatusBadge tone={applicationStatusTone(app.status)}>{app.status}</StatusBadge>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span>{app.template}</span>
        {app.domain && (
          <a
            href={`https://${app.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
          >
            {app.domain}
            <ExternalLink className="size-3" />
          </a>
        )}
      </div>
      <div className="grid grid-cols-4 gap-3 rounded-md border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs">
        <MetricCell label="Uptime" value={`${(metrics.uptime.last24h * 100).toFixed(2)}%`} />
        <MetricCell label="CPU" value={`${cpuPct}%`} />
        <MetricCell label="RAM" value={`${memPct}%`} />
        <MetricCell
          label="Pods"
          value={`${metrics.pods.ready}/${metrics.pods.total}`}
        />
      </div>
      <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
        <span className="flex-1 text-xs text-slate-400">
          <Activity className="mr-1 inline size-3 text-slate-400" />
          {metrics.delivery.deploysPerWeek} deploys / 7d
        </span>
        <Sparkline values={metrics.delivery.deploys7d} width={64} height={18} />
        <EnvironmentPill name={app.environment} />
        <Button size="sm" variant="outline" disabled={app.status === "Installing"}>
          {primary}
        </Button>
        <Link to={`/apps/${app.name}`}>
          <Button size="sm" variant="outline">
            Manage
          </Button>
        </Link>
        <Button size="sm" variant="ghost" aria-label="More actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <span className="font-mono text-sm font-medium text-slate-900">{value}</span>
    </div>
  )
}

