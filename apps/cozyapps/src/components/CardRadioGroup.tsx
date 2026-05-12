import type { ReactNode } from "react"
import { RadioGroup } from "@base-ui-components/react/radio-group"
import { Radio } from "@base-ui-components/react/radio"
import { Check } from "lucide-react"
import { cn } from "@cozystack/ui"

export interface CardOption<T extends string> {
  value: T
  title: ReactNode
  description?: ReactNode
  badges?: ReactNode
}

interface CardRadioGroupProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: CardOption<T>[]
  /** Tailwind grid template; defaults to a 2-column grid. */
  gridClassName?: string
}

export function CardRadioGroup<T extends string>({
  value,
  onChange,
  options,
  gridClassName = "grid grid-cols-1 gap-2 sm:grid-cols-2",
}: CardRadioGroupProps<T>) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => onChange(next as T)}
      className={gridClassName}
    >
      {options.map((opt) => (
        <Radio.Root
          key={opt.value}
          value={opt.value}
          className={cn(
            "group relative flex cursor-pointer flex-col gap-1.5 rounded-lg border bg-white p-3 text-left outline-none transition-colors",
            "border-slate-200 hover:border-slate-300",
            "data-[checked]:border-blue-500 data-[checked]:bg-blue-50/40 data-[checked]:ring-1 data-[checked]:ring-blue-500/30",
            "focus-visible:ring-2 focus-visible:ring-blue-400",
          )}
        >
          <Radio.Indicator className="absolute right-2.5 top-2.5 flex size-4 items-center justify-center rounded-full bg-blue-600 text-white">
            <Check className="size-3" strokeWidth={3} />
          </Radio.Indicator>
          <div className="pr-6 text-sm font-medium text-slate-900">{opt.title}</div>
          {opt.description && (
            <div className="text-xs text-slate-500">{opt.description}</div>
          )}
          {opt.badges && <div className="mt-1 flex flex-wrap gap-1.5">{opt.badges}</div>}
        </Radio.Root>
      ))}
    </RadioGroup>
  )
}
