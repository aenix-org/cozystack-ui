import { cn } from "@cozystack/ui"
import type { TemplateCategory } from "../lib/types.ts"

interface CategoryBadgeProps {
  category: TemplateCategory
  className?: string
}

const CATEGORY_LABEL: Record<TemplateCategory, string> = {
  cms: "cms",
  nodejs: "nodejs",
  php: "php",
  static: "static",
  game: "game",
}

const CATEGORY_TONE: Record<TemplateCategory, string> = {
  cms: "bg-blue-50 text-blue-700 ring-blue-200",
  nodejs: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  php: "bg-violet-50 text-violet-700 ring-violet-200",
  static: "bg-amber-50 text-amber-700 ring-amber-200",
  game: "bg-red-50 text-red-700 ring-red-200",
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ring-1",
        CATEGORY_TONE[category],
        className,
      )}
    >
      {CATEGORY_LABEL[category]}
    </span>
  )
}
