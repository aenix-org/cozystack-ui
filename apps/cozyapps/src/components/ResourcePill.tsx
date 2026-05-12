import { Cpu, MemoryStick, HardDrive, Server, type LucideIcon } from "lucide-react"
import { cn } from "@cozystack/ui"

interface ResourcePillProps {
  icon?: "cpu" | "ram" | "storage" | "nodes"
  children: React.ReactNode
  className?: string
}

const ICON_MAP: Record<NonNullable<ResourcePillProps["icon"]>, LucideIcon> = {
  cpu: Cpu,
  ram: MemoryStick,
  storage: HardDrive,
  nodes: Server,
}

export function ResourcePill({ icon, children, className }: ResourcePillProps) {
  const Icon = icon ? ICON_MAP[icon] : null
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600",
        className,
      )}
    >
      {Icon && <Icon className="size-3.5 text-slate-400" />}
      {children}
    </span>
  )
}
