import { MoreHorizontal } from "lucide-react"
import { Button, StatusBadge } from "@cozystack/ui"
import type { Environment } from "../lib/types.ts"
import { environmentStatusTone } from "../lib/status.ts"
import { timeAgo } from "../lib/humanize.ts"
import { ResourcePill } from "./ResourcePill.tsx"

interface EnvironmentCardProps {
  env: Environment
}

export function EnvironmentCard({ env }: EnvironmentCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <span className="flex-1 font-mono text-sm font-medium text-slate-900">{env.name}</span>
        <StatusBadge tone={environmentStatusTone(env.status)}>{env.status}</StatusBadge>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <ResourcePill icon="nodes">{env.nodes} nodes</ResourcePill>
        <ResourcePill icon="cpu">{env.cpu} CPU</ResourcePill>
        <ResourcePill icon="ram">{env.ramGb} GB RAM</ResourcePill>
      </div>
      <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
        <span className="flex-1 text-xs text-slate-400">Created {timeAgo(env.createdAt)}</span>
        <Button size="sm" variant="outline">
          Manage
        </Button>
        <Button size="sm" variant="ghost" aria-label="More actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
    </div>
  )
}
