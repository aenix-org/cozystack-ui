import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { cn } from "@cozystack/ui"
import { TEMPLATES } from "../lib/mocks/templates.ts"
import type { TemplateCategory } from "../lib/types.ts"
import { TemplateCard } from "../components/TemplateCard.tsx"
import { Breadcrumb } from "../components/Breadcrumb.tsx"
import { PageHeader } from "../components/PageHeader.tsx"

type Filter = "all" | TemplateCategory

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "cms", label: "CMS" },
  { id: "nodejs", label: "Node.js" },
  { id: "php", label: "PHP" },
  { id: "static", label: "Static" },
  { id: "game", label: "Games" },
]

export function AppStorePage() {
  const [filter, setFilter] = useState<Filter>("all")
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const lower = search.toLowerCase().trim()
    return TEMPLATES.filter((t) => {
      if (filter !== "all" && !t.categories.includes(filter)) return false
      if (!lower) return true
      return (
        t.displayName.toLowerCase().includes(lower) ||
        t.subtitle.toLowerCase().includes(lower)
      )
    })
  }, [filter, search])

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: "Applications", to: "/apps" }, { label: "App Store" }]} />
      <PageHeader title="App Store" />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search apps…"
            className="h-9 w-64 rounded-md border border-slate-300 bg-white pl-8 pr-3 text-sm outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                filter === id
                  ? "bg-blue-50 font-medium text-blue-700"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
          No apps match your filters.
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {filtered.map((t) => (
            <TemplateCard key={t.slug} template={t} />
          ))}
        </div>
      )}
    </div>
  )
}
