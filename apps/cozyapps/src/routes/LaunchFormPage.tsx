import { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { Rocket } from "lucide-react"
import { Button } from "@cozystack/ui"
import { findTemplate } from "../lib/mocks/templates.ts"
import { addApplication, useEnvironments } from "../lib/mock-store.ts"
import type { ParamDef } from "../lib/types.ts"
import { Breadcrumb } from "../components/Breadcrumb.tsx"
import { PageHeader } from "../components/PageHeader.tsx"
import { DynamicForm } from "../components/DynamicForm.tsx"
import { FormField, inputClass } from "../components/FormField.tsx"

const NAME_RE = /^[a-z]([-a-z0-9]*[a-z0-9])?$/

export function LaunchFormPage() {
  const { template: slug } = useParams<{ template: string }>()
  const template = slug ? findTemplate(slug) : undefined
  const environments = useEnvironments()
  const navigate = useNavigate()

  const initialValues = useMemo(() => {
    const out: Record<string, unknown> = {}
    template?.parameters.forEach((p: ParamDef) => {
      if (p.defaultValue !== undefined) out[p.key] = p.defaultValue
    })
    return out
  }, [template])

  const [name, setName] = useState("")
  const [environment, setEnvironment] = useState(environments[0]?.name ?? "")
  const [values, setValues] = useState<Record<string, unknown>>(initialValues)
  const [nameError, setNameError] = useState<string | undefined>(undefined)

  if (!template) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Template not found.{" "}
        <Link to="/store" className="text-blue-600 hover:underline">
          Back to App Store
        </Link>
      </div>
    )
  }

  const submit = () => {
    if (!NAME_RE.test(name)) {
      setNameError("Use lowercase letters, digits and dashes; start with a letter.")
      return
    }
    addApplication({
      name,
      template: template.displayName,
      templateSlug: template.slug,
      status: "Installing",
      environment,
      createdAt: new Date().toISOString(),
      config: humanizeConfig(template.parameters, values),
    })
    navigate("/apps")
  }

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: "Applications", to: "/apps" },
          { label: "App Store", to: "/store" },
          { label: template.displayName, to: `/store/${template.slug}` },
          { label: "Launch" },
        ]}
      />
      <PageHeader
        title={`Launch ${template.displayName}`}
        description="Your application will be ready in a couple of minutes"
      />

      <div className="max-w-xl space-y-6">
        <h2 className="border-b border-slate-200 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Basic
        </h2>
        <div className="space-y-4">
          <FormField
            label="App name"
            required
            hint="Used as your app's identifier. Lowercase letters, digits and dashes."
            error={nameError}
          >
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError(undefined)
              }}
              placeholder={`my-${template.slug}`}
              className={inputClass}
            />
          </FormField>
          <FormField label="Environment" required hint="Where your application will run">
            <select
              className={inputClass}
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
            >
              {environments.map((env) => (
                <option key={env.name} value={env.name}>
                  {env.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <DynamicForm params={template.parameters} values={values} onChange={setValues} />

        <div className="flex items-center gap-3 border-t border-slate-200 pt-5">
          <Button variant="primary" size="lg" onClick={submit}>
            <Rocket className="size-4" />
            Launch {template.displayName}
          </Button>
          <Link to={`/store/${template.slug}`}>
            <Button variant="outline" size="lg">
              Cancel
            </Button>
          </Link>
        </div>
        <p className="text-xs text-slate-400">
          You can change these settings later from the app dashboard.
        </p>
      </div>
    </div>
  )
}

function humanizeConfig(
  params: ParamDef[],
  values: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const p of params) {
    if (!(p.key in values) && p.defaultValue === undefined) continue
    const raw = values[p.key] ?? p.defaultValue
    out[p.label] = p.type === "boolean" ? (raw ? "Yes" : "No") : raw
  }
  return out
}
