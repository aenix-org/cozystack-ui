import { useId } from "react"
import type { AtomNodeData } from "../../lib/builder/types.ts"
import { PORT_TYPE, type PortType } from "../../lib/builder/port-types.ts"
import { inputClass } from "../FormField.tsx"
import { Toggle } from "../Toggle.tsx"
import { Select } from "../Select.tsx"

type ConstantType = "string" | "number" | "boolean" | "image" | "host"

const TYPE_OPTIONS: { value: ConstantType; label: string }[] = [
  { value: "string", label: "String" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "image", label: "Image reference" },
  { value: "host", label: "Hostname / domain" },
]

const TYPE_PLACEHOLDER: Record<ConstantType, string> = {
  string: "production",
  number: "8080",
  boolean: "",
  image: "wordpress:6.4",
  host: "app.example.com",
}

function portTypeOf(type: ConstantType): PortType {
  switch (type) {
    case "number":
      return "number"
    case "boolean":
      return "boolean"
    case "image":
      return "image-ref"
    case "host":
      return "ingress-host"
    default:
      return "string"
  }
}

interface ConstantEditorProps {
  data: AtomNodeData
  onChange: (next: AtomNodeData) => void
}

export function ConstantEditor({ data, onChange }: ConstantEditorProps) {
  const typeId = useId()
  const valueId = useId()
  const valueType = (String(data.params.valueType ?? "string") as ConstantType)
  const portType = portTypeOf(valueType)
  const rawValue = data.params.value
  const meta = PORT_TYPE[portType]

  const setType = (next: ConstantType) => {
    const nextValue =
      next === "boolean"
        ? Boolean(rawValue)
        : next === "number"
          ? typeof rawValue === "number"
            ? rawValue
            : ""
          : typeof rawValue === "string"
            ? rawValue
            : ""
    onChange({
      ...data,
      params: { ...data.params, valueType: next, value: nextValue },
    })
  }

  const setValue = (v: unknown) => {
    onChange({ ...data, params: { ...data.params, value: v } })
  }

  return (
    <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50/40 p-3">
      <div className="flex items-center gap-2">
        <span
          className="inline-block size-2 shrink-0 rounded-full"
          style={{ background: meta.stroke }}
        />
        <span className="flex-1 font-mono text-[11px] uppercase tracking-wider text-slate-500">
          {meta.label}
        </span>
      </div>

      <div>
        <label
          htmlFor={typeId}
          className="block text-[11px] font-medium text-slate-600"
        >
          Type
        </label>
        <div className="mt-0.5">
          <Select
            id={typeId}
            value={valueType}
            onChange={(v) => setType(v as ConstantType)}
            options={TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor={valueId}
          className="block text-[11px] font-medium text-slate-600"
        >
          Value
        </label>
        <div id={valueId} className="mt-0.5">
          {renderWidget(valueType, rawValue, setValue)}
        </div>
      </div>

      <OutputPreview type={valueType} portType={portType} value={rawValue} />
    </div>
  )
}

function renderWidget(
  type: ConstantType,
  value: unknown,
  onChange: (v: unknown) => void,
) {
  if (type === "boolean") {
    return <Toggle checked={Boolean(value)} onCheckedChange={onChange} />
  }
  if (type === "number") {
    return (
      <input
        type="number"
        className={inputClass}
        placeholder={TYPE_PLACEHOLDER.number}
        value={value === undefined || value === "" ? "" : String(value)}
        onChange={(e) =>
          onChange(e.target.value === "" ? "" : Number(e.target.value))
        }
      />
    )
  }
  return (
    <input
      type="text"
      className={inputClass}
      placeholder={TYPE_PLACEHOLDER[type]}
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function OutputPreview({
  type,
  portType,
  value,
}: {
  type: ConstantType
  portType: PortType
  value: unknown
}) {
  const meta = PORT_TYPE[portType]
  const display =
    type === "boolean"
      ? value
        ? "true"
        : "false"
      : value === undefined || value === ""
        ? "(empty)"
        : String(value)
  return (
    <div className="rounded-md border border-dashed border-blue-200 bg-blue-50/30 p-2">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
        Output
      </div>
      <div className="flex items-center gap-2 font-mono text-xs text-slate-800">
        <span
          className="inline-block size-2 shrink-0 rounded-full"
          style={{ background: meta.stroke }}
        />
        <span className="truncate">{display}</span>
      </div>
    </div>
  )
}
