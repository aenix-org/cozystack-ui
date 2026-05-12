import { Link } from "react-router"
import { ArrowRight } from "lucide-react"
import { Button } from "@cozystack/ui"
import type { ApplicationTemplate } from "../lib/types.ts"
import { AppIcon } from "./AppIcon.tsx"
import { CategoryBadge } from "./CategoryBadge.tsx"

interface TemplateCardProps {
  template: ApplicationTemplate
}

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Link
      to={`/store/${template.slug}`}
      className="group flex w-72 flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm"
    >
      <AppIcon icon={template.icon} background={template.iconBg} size="md" />
      <div>
        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">
          {template.displayName}
        </h3>
        <div className="mt-1 flex flex-wrap gap-1">
          {template.categories.map((c) => (
            <CategoryBadge key={c} category={c} />
          ))}
        </div>
      </div>
      <p className="line-clamp-2 flex-1 text-xs text-slate-500">{template.subtitle}</p>
      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-400">v{template.version}</span>
        <Button size="sm" variant="outline">
          Launch
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </Link>
  )
}
