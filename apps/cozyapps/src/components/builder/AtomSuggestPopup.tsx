import { useEffect, useMemo, useRef } from "react"
import { cn } from "@cozystack/ui"
import { PORT_TYPE, type PortType } from "../../lib/builder/port-types.ts"
import {
  collectSuggestions,
  type SuggestionTarget,
} from "../../lib/builder/suggestions.ts"

interface AtomSuggestPopupProps {
  screenX: number
  screenY: number
  sourcePortType: PortType
  onPick: (target: SuggestionTarget) => void
  onClose: () => void
}

export function AtomSuggestPopup({
  screenX,
  screenY,
  sourcePortType,
  onPick,
  onClose,
}: AtomSuggestPopupProps) {
  const suggestions = useMemo(() => collectSuggestions(sourcePortType), [sourcePortType])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={ref}
        className="fixed z-50 w-72 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl"
        style={{ top: screenY, left: screenX }}
      >
        <header className="border-b border-slate-100 px-3 py-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Drop on</span>
            <span
              className="inline-block size-2 rounded-full"
              style={{ background: PORT_TYPE[sourcePortType].stroke }}
            />
            <span className="font-medium text-slate-700">
              {PORT_TYPE[sourcePortType].label}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Pick an atom to spawn and connect
          </p>
        </header>
        <div className="max-h-72 overflow-y-auto py-1">
          {suggestions.length === 0 ? (
            <p className="px-3 py-3 text-xs italic text-slate-400">
              No atoms accept this port type.
            </p>
          ) : (
            suggestions.map((s) => {
              const Icon = s.atom.icon
              return (
                <button
                  key={s.atom.type}
                  type="button"
                  onClick={() => onPick(s)}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50"
                >
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-md",
                      s.atom.accentBg,
                    )}
                  >
                    <Icon className={cn("size-3.5", s.atom.accentFg)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-slate-800">
                      {s.atom.displayName}
                    </div>
                    <div className="truncate text-[11px] text-slate-500">
                      → {s.targetLabel}
                      {s.kind === "param" && (
                        <span className="ml-1 text-blue-600">(exposes param)</span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
