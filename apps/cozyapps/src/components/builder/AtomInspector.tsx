import { Link2, Trash2, Unlink, X } from "lucide-react"
import { Button, cn } from "@cozystack/ui"
import { findAtom } from "../../lib/builder/atoms.ts"
import type { ParamDef } from "../../lib/types.ts"
import type { AtomNodeData } from "../../lib/builder/types.ts"
import type { UserInputField } from "../../lib/builder/dynamic-fields.ts"
import { FormField, inputClass } from "../FormField.tsx"
import { Toggle } from "../Toggle.tsx"
import { Select } from "../Select.tsx"
import { FieldsEditor } from "./FieldsEditor.tsx"
import { ConstantEditor } from "./ConstantEditor.tsx"

interface AtomInspectorProps {
  nodeId: string
  data: AtomNodeData
  onChange: (next: AtomNodeData) => void
  onExposeChange: (paramKey: string, expose: boolean) => void
  onDelete: () => void
  onClose: () => void
}

export function AtomInspector({
  nodeId,
  data,
  onChange,
  onExposeChange,
  onDelete,
  onClose,
}: AtomInspectorProps) {
  const atom = findAtom(data.atomType)
  if (!atom) return null
  const Icon = atom.icon
  const exposed = data.exposed ?? []

  const setParam = (key: string, value: unknown) => {
    onChange({ ...data, params: { ...data.params, [key]: value } })
  }

  const renderEditor = (param: ParamDef) => {
    const value = data.params[param.key] ?? param.defaultValue
    if (param.type === "boolean") {
      return (
        <Toggle
          checked={Boolean(value)}
          onCheckedChange={(v) => setParam(param.key, v)}
        />
      )
    }
    if (param.type === "enum") {
      return (
        <Select
          value={String(value ?? "")}
          onChange={(v) => setParam(param.key, v)}
          options={(param.options ?? []).map((opt) => ({ value: opt, label: opt }))}
        />
      )
    }
    if (param.type === "number") {
      return (
        <input
          type="number"
          className={inputClass}
          value={value === undefined ? "" : String(value)}
          placeholder={param.placeholder}
          onChange={(e) =>
            setParam(param.key, e.target.value === "" ? "" : Number(e.target.value))
          }
        />
      )
    }
    return (
      <input
        type="text"
        className={inputClass}
        placeholder={param.placeholder}
        value={String(value ?? "")}
        onChange={(e) => setParam(param.key, e.target.value)}
      />
    )
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-slate-200 bg-white">
      <header
        className={cn(
          "flex items-start gap-3 border-b border-slate-200 px-4 py-3",
          atom.accentBg,
        )}
      >
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-white shadow-xs">
          <Icon className={cn("size-4", atom.accentFg)} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-slate-900">{atom.displayName}</h2>
          <p className="font-mono text-[11px] text-slate-500">#{nodeId}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 hover:bg-white/60 hover:text-slate-700"
          aria-label="Close inspector"
        >
          <X className="size-4" />
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <p className="text-xs leading-relaxed text-slate-500">{atom.description}</p>

        {atom.hasDynamicFields && (
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Form fields
            </h3>
            <FieldsEditor
              fields={data.fields ?? []}
              onChange={(next: UserInputField[]) => onChange({ ...data, fields: next })}
            />
          </section>
        )}

        {atom.hasConstantValue && (
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Constant value
            </h3>
            <ConstantEditor data={data} onChange={onChange} />
          </section>
        )}

        {atom.params.length > 0 ? (
          <div className="space-y-3">
            {atom.params.map((param) => {
              const isExposed = exposed.includes(param.key)
              const inline = !isExposed && param.type === "boolean"
              return (
                <div
                  key={param.key}
                  className="rounded-md border border-slate-200 bg-slate-50/40 p-3"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      {param.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => onExposeChange(param.key, !isExposed)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors",
                        isExposed
                          ? "bg-[#0971EB]/12 text-[#0971EB] hover:bg-[#0971EB]/20"
                          : "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
                      )}
                      title={isExposed ? "Unbind and edit inline" : "Expose as input port"}
                    >
                      {isExposed ? (
                        <>
                          <Unlink className="size-3" />
                          Unbind
                        </>
                      ) : (
                        <>
                          <Link2 className="size-3" />
                          Expose
                        </>
                      )}
                    </button>
                  </div>
                  {isExposed ? (
                    <div className="rounded-md border border-dashed border-[#0971EB]/40 bg-[#01A5FF]/8 px-2 py-1.5 text-xs italic text-[#0971EB]">
                      From upstream — connect a value
                    </div>
                  ) : inline ? (
                    <FormField label="" hint={param.hint} inline>
                      {renderEditor(param)}
                    </FormField>
                  ) : (
                    <>
                      {renderEditor(param)}
                      {param.hint && (
                        <p className="mt-1 text-xs text-slate-500">{param.hint}</p>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        ) : atom.hasDynamicFields || atom.hasConstantValue ? null : (
          <p className="text-xs italic text-slate-400">This atom has no parameters.</p>
        )}

        <div>
          <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Ports
          </h3>
          <ul className="space-y-1 text-xs text-slate-600">
            {atom.inputs.map((p) => (
              <li key={`in-${p.key}`} className="flex items-center gap-2">
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                  in
                </span>
                <span>{p.label}</span>
              </li>
            ))}
            {atom.outputs.map((p) => (
              <li key={`out-${p.key}`} className="flex items-center gap-2">
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                  out
                </span>
                <span>{p.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <footer className="border-t border-slate-200 px-4 py-3">
        <Button variant="destructive" size="sm" onClick={onDelete} className="w-full">
          <Trash2 className="size-3.5" />
          Remove from graph
        </Button>
      </footer>
    </aside>
  )
}
