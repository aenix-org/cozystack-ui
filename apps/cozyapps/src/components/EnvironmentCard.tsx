import { Link } from "react-router"
import { MoreHorizontal } from "lucide-react"
import { Button, StatusBadge, cn } from "@cozystack/ui"
import type { Application, Environment } from "../lib/types.ts"
import { environmentStatusTone } from "../lib/status.ts"
import { timeAgo } from "../lib/humanize.ts"
import { tierBarClass } from "../lib/app-presentation.ts"
import { ResourcePill } from "./ResourcePill.tsx"
import { EnvironmentAppMiniCard } from "./EnvironmentAppMiniCard.tsx"

interface EnvironmentCardProps {
  env: Environment
  apps: Application[]
}

export function EnvironmentCard({ env, apps }: EnvironmentCardProps) {
  return (
    <div className="relative flex flex-col gap-3 overflow-hidden rounded-lg border border-slate-200 bg-white p-4 pl-5">
      <span className={cn("absolute left-0 top-0 h-full w-1", tierBarClass(env.name))} />
      <div className="flex items-center gap-2">
        <Link
          to={`/environments/${env.name}`}
          className="flex-1 truncate font-mono text-sm font-medium text-slate-900 hover:text-blue-700"
        >
          {env.name}
        </Link>
        <StatusBadge tone={environmentStatusTone(env.status)}>{env.status}</StatusBadge>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <ResourcePill icon="nodes">{env.nodes} nodes</ResourcePill>
        <ResourcePill icon="cpu">{env.cpu} CPU</ResourcePill>
        <ResourcePill icon="ram">{env.ramGb} GB RAM</ResourcePill>
      </div>

      <div>
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Applications ({apps.length})
        </div>
        {apps.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-400">
            No applications deployed
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {apps.map((app) => (
              <EnvironmentAppMiniCard key={app.name} app={app} />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
        <span className="flex-1 text-xs text-slate-400">Created {timeAgo(env.createdAt)}</span>
        <Link to={`/environments/${env.name}`}>
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
