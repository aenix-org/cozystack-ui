import { useId } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@cozystack/ui"
import {
  FIELD_TYPE_OPTIONS,
  fieldPortType,
  newField,
  type UserInputField,
  type UserInputFieldType,
} from "../../lib/builder/dynamic-fields.ts"
import { PORT_TYPE } from "../../lib/builder/port-types.ts"
import { inputClass } from "../FormField.tsx"
import { Toggle } from "../Toggle.tsx"

interface FieldsEditorProps {
  fields: UserInputField[]
  onChange: (next: UserInputField[]) => void
}

export function FieldsEditor({ fields, onChange }: FieldsEditorProps) {
  const updateAt = (idx: number, patch: Partial<UserInputField>) => {
    onChange(
      fields.map((f, i) => {
        if (i !== idx) return f
        const merged = { ...f, ...patch }
        if ("type" in patch && patch.type !== "enum") delete merged.options
        return merged
      }),
    )
  }
  const removeAt = (idx: number) => onChange(fields.filter((_, i) => i !== idx))
  const add = () => onChange([...fields, newField(fields)])

  return (
    <div className="space-y-3">
      {fields.length === 0 ? (
        <p className="text-xs italic text-slate-400">
          No fields yet — the deploy form will be empty.
        </p>
      ) : (
        fields.map((field, idx) => (
          <FieldCard
            key={`${field.key}-${idx}`}
            field={field}
            onPatch={(patch) => updateAt(idx, patch)}
            onRemove={() => removeAt(idx)}
          />
        ))
      )}
      <Button variant="outline" size="sm" onClick={add} className="w-full">
        <Plus className="size-3.5" />
        Add field
      </Button>
    </div>
  )
}

interface FieldCardProps {
  field: UserInputField
  onPatch: (patch: Partial<UserInputField>) => void
  onRemove: () => void
}

function FieldCard({ field, onPatch, onRemove }: FieldCardProps) {
  const portType = fieldPortType(field.type)
  const optionsValue = field.options?.join(", ") ?? ""

  return (
    <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50/40 p-3">
      <div className="flex items-center gap-2">
        <span
          className="inline-block size-2 shrink-0 rounded-full"
          style={{ background: PORT_TYPE[portType].stroke }}
        />
        <span className="flex-1 font-mono text-[11px] uppercase tracking-wider text-slate-500">
          {PORT_TYPE[portType].label}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
          aria-label="Remove field"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <LabeledInput label="Key">
          <input
            type="text"
            className={inputClass}
            value={field.key}
            onChange={(e) => onPatch({ key: e.target.value })}
            placeholder="key"
          />
        </LabeledInput>
        <LabeledInput label="Label">
          <input
            type="text"
            className={inputClass}
            value={field.label}
            onChange={(e) => onPatch({ label: e.target.value })}
            placeholder="Label"
          />
        </LabeledInput>
        <LabeledInput label="Type">
          <select
            className={inputClass}
            value={field.type}
            onChange={(e) => onPatch({ type: e.target.value as UserInputFieldType })}
          >
            {FIELD_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </LabeledInput>
        <LabeledInput label="Required" inline>
          <Toggle
            checked={!!field.required}
            onCheckedChange={(v) => onPatch({ required: v })}
          />
        </LabeledInput>
      </div>

      {field.type === "enum" && (
        <LabeledInput label="Options (comma-separated)">
          <input
            type="text"
            className={inputClass}
            value={optionsValue}
            onChange={(e) =>
              onPatch({
                options: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="small, medium, large"
          />
        </LabeledInput>
      )}

      <LabeledInput label="Placeholder">
        <input
          type="text"
          className={inputClass}
          value={field.placeholder ?? ""}
          onChange={(e) => onPatch({ placeholder: e.target.value || undefined })}
          placeholder="(none)"
        />
      </LabeledInput>
      <LabeledInput label="Hint">
        <input
          type="text"
          className={inputClass}
          value={field.hint ?? ""}
          onChange={(e) => onPatch({ hint: e.target.value || undefined })}
          placeholder="Helper text under the input"
        />
      </LabeledInput>

      <FieldPreview field={field} />
    </div>
  )
}

interface LabeledInputProps {
  label: string
  inline?: boolean
  children: React.ReactNode
}

function LabeledInput({ label, inline, children }: LabeledInputProps) {
  const id = useId()
  if (inline) {
    return (
      <div className="flex items-center justify-between gap-2 rounded border border-slate-200 bg-white px-2 py-1">
        <label htmlFor={id} className="text-[11px] font-medium text-slate-600">
          {label}
        </label>
        <div id={id}>{children}</div>
      </div>
    )
  }
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-medium text-slate-600">
        {label}
      </label>
      <div id={id} className="mt-0.5">
        {children}
      </div>
    </div>
  )
}

function FieldPreview({ field }: { field: UserInputField }) {
  return (
    <div className="rounded-md border border-dashed border-blue-200 bg-blue-50/30 p-2">
      <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
        Form preview
      </div>
      <div>
        <span className="block text-sm font-medium text-slate-700">
          {field.label || "Untitled"}
          {field.required && <span className="ml-0.5 text-red-500">*</span>}
        </span>
        {renderPreviewControl(field)}
        {field.hint && <p className="mt-1 text-[11px] text-slate-500">{field.hint}</p>}
      </div>
    </div>
  )
}

function renderPreviewControl(field: UserInputField) {
  if (field.type === "boolean") {
    return (
      <div className="mt-1">
        <Toggle checked={Boolean(field.defaultValue)} onCheckedChange={() => {}} />
      </div>
    )
  }
  if (field.type === "enum") {
    return (
      <select className={`${inputClass} mt-1`} disabled>
        {(field.options ?? []).map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
        {(field.options?.length ?? 0) === 0 && <option>(no options)</option>}
      </select>
    )
  }
  return (
    <input
      type={field.type === "number" ? "number" : "text"}
      className={`${inputClass} mt-1`}
      placeholder={field.placeholder ?? ""}
      disabled
    />
  )
}
