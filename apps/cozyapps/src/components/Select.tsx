import { Select as BaseSelect } from "@base-ui-components/react/select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@cozystack/ui"

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  id?: string
  className?: string
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  id,
  className,
}: SelectProps) {
  return (
    <BaseSelect.Root
      value={value}
      onValueChange={(next) => onChange(String(next))}
      disabled={disabled}
    >
      <BaseSelect.Trigger
        id={id}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition-colors",
          "hover:border-slate-400 focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-100",
          "data-[popup-open]:border-blue-400 data-[popup-open]:ring-2 data-[popup-open]:ring-blue-100",
          "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
          className,
        )}
      >
        <BaseSelect.Value>
          {(label) =>
            label ? (
              <span className="truncate">{String(label)}</span>
            ) : (
              <span className="truncate text-slate-400">{placeholder ?? "Select…"}</span>
            )
          }
        </BaseSelect.Value>
        <BaseSelect.Icon className="shrink-0 text-slate-400">
          <ChevronDown className="size-4" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner sideOffset={4} className="z-50">
          <BaseSelect.Popup className="max-h-72 min-w-[var(--anchor-width)] overflow-y-auto rounded-md border border-slate-200 bg-white p-1 text-sm shadow-lg">
            {options.map((opt) => (
              <BaseSelect.Item
                key={opt.value}
                value={opt.value}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 outline-none",
                  "data-[highlighted]:bg-slate-100",
                  "data-[selected]:font-medium data-[selected]:text-blue-700",
                )}
              >
                <span className="flex size-4 shrink-0 items-center justify-center">
                  <BaseSelect.ItemIndicator>
                    <Check className="size-3.5 text-blue-600" />
                  </BaseSelect.ItemIndicator>
                </span>
                <BaseSelect.ItemText>{opt.label}</BaseSelect.ItemText>
              </BaseSelect.Item>
            ))}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  )
}
