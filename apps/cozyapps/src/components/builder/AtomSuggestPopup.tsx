import { useEffect, useMemo, useRef } from "react"
import { cn } from "@cozystack/ui"
import { PORT_TYPE, type PortType } from "../../lib/builder/port-types.ts"
import {
  collectSuggestions,
  type DragDirection,
  type SuggestionTarget,
} from "../../lib/builder/suggestions.ts"

interface AtomSuggestPopupProps {
  screenX: number
  screenY: number
  portType: PortType
  direction: DragDirection
  onPick: (target: SuggestionTarget) => void
  onClose: () => void
}

export function AtomSuggestPopup({
  screenX,
  screenY,
  portType,
  direction,
  onPick,
  onClose,
}: AtomSuggestPopupProps) {
  const suggestions = useMemo(
    () => collectSuggestions(portType, direction),
    [portType, direction],
  )
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  const verb = direction === "from-source" ? "Connect output" : "Find source for"
  const arrow = direction === "from-source" ? "→" : "←"

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
            <span>{verb}</span>
            <span
              className="inline-block size-2 rounded-full"
              style={{ background: PORT_TYPE[portType].stroke }}
            />
            <span className="font-medium text-slate-700">{PORT_TYPE[portType].label}</span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {direction === "from-source"
              ? "Pick an atom to spawn and connect"
              : "Pick an atom that can produce this value"}
          </p>
        </header>
        <div className="max-h-72 overflow-y-auto py-1">
          {suggestions.length === 0 ? (
            <p className="px-3 py-3 text-xs italic text-slate-400">
              No atoms match this port type.
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
                      {arrow} {s.handleLabel}
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
