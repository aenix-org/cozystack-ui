import { Fragment, useMemo } from "react"
import type { ParamDef } from "../lib/types.ts"
import { FormField, inputClass } from "./FormField.tsx"
import { Toggle } from "./Toggle.tsx"

interface DynamicFormProps {
  params: ParamDef[]
  values: Record<string, unknown>
  onChange: (next: Record<string, unknown>) => void
}

export function DynamicForm({ params, values, onChange }: DynamicFormProps) {
  const grouped = useMemo(() => groupBySection(params), [params])

  const setValue = (key: string, value: unknown) => {
    onChange({ ...values, [key]: value })
  }

  return (
    <div className="space-y-6">
      {grouped.map(({ section, items }) => (
        <Fragment key={section ?? "_default"}>
          {section && (
            <h2 className="border-b border-slate-200 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {section}
            </h2>
          )}
          <div className="space-y-4">
            {items.map((param) => {
              const value = values[param.key] ?? param.defaultValue ?? defaultFor(param.type)
              if (param.type === "boolean") {
                return (
                  <FormField
                    key={param.key}
                    label={param.label}
                    required={param.required}
                    hint={param.hint}
                    inline
                  >
                    <Toggle
                      checked={Boolean(value)}
                      onCheckedChange={(v) => setValue(param.key, v)}
                    />
                  </FormField>
                )
              }
              if (param.type === "enum") {
                return (
                  <FormField
                    key={param.key}
                    label={param.label}
                    required={param.required}
                    hint={param.hint}
                  >
                    <select
                      className={inputClass}
                      value={String(value ?? "")}
                      onChange={(e) => setValue(param.key, e.target.value)}
                    >
                      {param.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </FormField>
                )
              }
              if (param.type === "number") {
                return (
                  <FormField
                    key={param.key}
                    label={param.label}
                    required={param.required}
                    hint={param.hint}
                  >
                    <input
                      type="number"
                      className={inputClass}
                      placeholder={param.placeholder}
                      value={value === undefined ? "" : String(value)}
                      onChange={(e) =>
                        setValue(param.key, e.target.value === "" ? "" : Number(e.target.value))
                      }
                    />
                  </FormField>
                )
              }
              return (
                <FormField
                  key={param.key}
                  label={param.label}
                  required={param.required}
                  hint={param.hint}
                >
                  <input
                    type="text"
                    className={inputClass}
                    placeholder={param.placeholder}
                    value={String(value ?? "")}
                    onChange={(e) => setValue(param.key, e.target.value)}
                  />
                </FormField>
              )
            })}
          </div>
        </Fragment>
      ))}
    </div>
  )
}

function groupBySection(params: ParamDef[]): { section?: string; items: ParamDef[] }[] {
  const map = new Map<string, ParamDef[]>()
  const order: string[] = []
  for (const p of params) {
    const key = p.section ?? ""
    if (!map.has(key)) {
      map.set(key, [])
      order.push(key)
    }
    map.get(key)!.push(p)
  }
  return order.map((key) => ({ section: key || undefined, items: map.get(key)! }))
}

function defaultFor(type: ParamDef["type"]): unknown {
  switch (type) {
    case "boolean":
      return false
    case "number":
      return ""
    default:
      return ""
  }
}
