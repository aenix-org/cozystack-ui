import { Link } from "react-router"
import type { Application } from "../lib/types.ts"
import { iconBg, iconFor } from "../lib/app-presentation.ts"
import { AppIcon } from "./AppIcon.tsx"
import { StatusDot } from "./StatusDot.tsx"

interface EnvironmentAppMiniCardProps {
  app: Application
}

export function EnvironmentAppMiniCard({ app }: EnvironmentAppMiniCardProps) {
  return (
    <Link
      to={`/apps/${app.name}`}
      className="group flex items-center gap-2.5 rounded-md border border-slate-200 bg-slate-50/70 px-2.5 py-2 transition-colors hover:border-slate-300 hover:bg-white"
    >
      <AppIcon icon={iconFor(app.templateSlug)} background={iconBg(app.templateSlug)} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-slate-900 group-hover:text-blue-700">
          {app.name}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
          <StatusDot status={app.status} />
          {app.status}
        </div>
      </div>
    </Link>
  )
}
