import { useMemo } from "react"
import { cn } from "@cozystack/ui"
import {
  ATOMS,
  CATEGORY_ORDER,
  categoryIcon,
  type AtomDef,
} from "../../lib/builder/atoms.ts"

interface AtomPaletteProps {
  onDragStart: (event: React.DragEvent<HTMLDivElement>, atom: AtomDef) => void
}

export function AtomPalette({ onDragStart }: AtomPaletteProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, AtomDef[]>()
    for (const atom of ATOMS) {
      const bucket = map.get(atom.category) ?? []
      bucket.push(atom)
      map.set(atom.category, bucket)
    }
    return CATEGORY_ORDER.flatMap((category) => {
      const items = map.get(category)
      if (!items) return []
      return [{ category, items }]
    })
  }, [])

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <header className="px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Atoms
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">Drag onto the canvas</p>
      </header>
      <div className="flex-1 overflow-y-auto pb-3">
        {grouped.map(({ category, items }) => {
          const CategoryIcon = categoryIcon(category)
          return (
            <section key={category} className="mb-2">
              <div className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <CategoryIcon className="size-3" />
                {category}
              </div>
              <div className="space-y-1 px-2">
                {items.map((atom) => {
                  const Icon = atom.icon
                  return (
                    <div
                      key={atom.type}
                      draggable
                      onDragStart={(e) => onDragStart(e, atom)}
                      className={cn(
                        "group flex cursor-grab items-center gap-2 rounded-md border border-transparent px-2 py-1.5 transition-colors",
                        "hover:border-slate-200 hover:bg-slate-50 active:cursor-grabbing",
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-md",
                          atom.accentBg,
                        )}
                      >
                        <Icon className={cn("size-3.5", atom.accentFg)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm text-slate-800">{atom.displayName}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </aside>
  )
}
