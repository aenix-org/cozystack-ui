import { cn } from "@cozystack/ui"

interface AppIconProps {
  icon: string
  background?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const SIZE_CLASS: Record<NonNullable<AppIconProps["size"]>, string> = {
  sm: "size-9 rounded-md text-lg",
  md: "size-11 rounded-lg text-xl",
  lg: "size-14 rounded-xl text-3xl",
}

export function AppIcon({ icon, background, size = "md", className }: AppIconProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center",
        SIZE_CLASS[size],
        className,
      )}
      style={{ background: background ?? "rgb(241 245 249)" }}
    >
      <span aria-hidden>{icon}</span>
    </div>
  )
}
