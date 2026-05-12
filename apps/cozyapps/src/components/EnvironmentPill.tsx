import { cn } from "@cozystack/ui"

interface EnvironmentPillProps {
  name: string
  className?: string
}

export function EnvironmentPill({ name, className }: EnvironmentPillProps) {
  const tone =
    name === "staging"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-violet-50 text-violet-700 ring-violet-200"
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ring-1",
        tone,
        className,
      )}
    >
      {name}
    </span>
  )
}
