import type { ReactNode } from "react"

interface FormFieldProps {
  label: ReactNode
  required?: boolean
  hint?: ReactNode
  error?: ReactNode
  children: ReactNode
  /** Renders the children inline next to the label (used for toggles). */
  inline?: boolean
}

export function FormField({
  label,
  required,
  hint,
  error,
  children,
  inline,
}: FormFieldProps) {
  if (inline) {
    return (
      <div className="flex items-start justify-between gap-4 rounded-md border border-slate-200 bg-white px-4 py-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-700">
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </div>
          {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
        </div>
        <div className="shrink-0">{children}</div>
      </div>
    )
  }
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      <div className="mt-1">{children}</div>
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </label>
  )
}

export const inputClass =
  "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-blue-400"
