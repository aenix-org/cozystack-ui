import { Switch } from "@base-ui-components/react/switch"
import { cn } from "@cozystack/ui"

interface ToggleProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id?: string
  className?: string
}

export function Toggle({ checked, onCheckedChange, id, className }: ToggleProps) {
  return (
    <Switch.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors",
        checked ? "bg-blue-600" : "bg-slate-300",
        className,
      )}
    >
      <Switch.Thumb
        className={cn(
          "block size-4 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-0.5",
        )}
      />
    </Switch.Root>
  )
}
