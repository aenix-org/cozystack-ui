import { Link } from "react-router"
import { MoreHorizontal, ExternalLink } from "lucide-react"
import { Button, StatusBadge } from "@cozystack/ui"
import type { Application } from "../lib/types.ts"
import { applicationStatusTone } from "../lib/status.ts"
import { timeAgo } from "../lib/humanize.ts"
import { AppIcon } from "./AppIcon.tsx"
import { EnvironmentPill } from "./EnvironmentPill.tsx"

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
      <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
        <span className="flex-1 text-xs text-slate-400">Launched {timeAgo(app.createdAt)}</span>
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

function iconFor(slug: string): string {
  switch (slug) {
    case "wordpress":
      return "🌐"
    case "minecraft":
      return "🎮"
    case "cs2":
      return "🎯"
    case "static":
      return "📄"
    case "nodejs":
    case "nextjs":
      return "🟢"
    case "drupal":
      return "🟣"
    case "ghost":
      return "👻"
    default:
      return "📦"
  }
}

function iconBg(slug: string): string {
  switch (slug) {
    case "wordpress":
      return "rgb(241 245 249)"
    case "minecraft":
    case "cs2":
      return "rgba(248,113,113,0.10)"
    case "nodejs":
    case "nextjs":
      return "rgba(62,207,142,0.10)"
    case "drupal":
      return "rgba(144,97,249,0.10)"
    default:
      return "rgb(241 245 249)"
  }
}
