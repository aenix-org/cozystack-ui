import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { Info } from "lucide-react"
import { Button } from "@cozystack/ui"
import { addEnvironment } from "../lib/mock-store.ts"
import type { EnvironmentStatus } from "../lib/types.ts"
import { Breadcrumb } from "../components/Breadcrumb.tsx"
import { PageHeader } from "../components/PageHeader.tsx"
import { FormField, inputClass } from "../components/FormField.tsx"
import { CardRadioGroup, type CardOption } from "../components/CardRadioGroup.tsx"
import { ResourcePill } from "../components/ResourcePill.tsx"

const NAME_RE = /^[a-z]([-a-z0-9]*[a-z0-9])?$/

type SizeValue = "auto" | "small" | "medium" | "large"

interface SizeDef {
  value: SizeValue
  title: string
  description: string
  cpuPerNode: number
  ramPerNode: number
}

const SIZE_OPTIONS: SizeDef[] = [
  {
    value: "auto",
    title: "Auto",
    description: "Recommended for typical workloads",
    cpuPerNode: 4,
    ramPerNode: 8,
  },
  {
    value: "small",
    title: "Small",
    description: "Light workloads and previews",
    cpuPerNode: 2,
    ramPerNode: 4,
  },
  {
    value: "medium",
    title: "Medium",
    description: "Production-grade single-tenant apps",
    cpuPerNode: 4,
    ramPerNode: 8,
  },
  {
    value: "large",
    title: "Large",
    description: "Heavier workloads and multiple apps",
    cpuPerNode: 8,
    ramPerNode: 16,
  },
]

const SIZE_CARDS: CardOption<SizeValue>[] = SIZE_OPTIONS.map((opt) => ({
  value: opt.value,
  title: opt.title,
  description: opt.description,
  badges: (
    <>
      <ResourcePill icon="cpu">{opt.cpuPerNode} CPU</ResourcePill>
      <ResourcePill icon="ram">{opt.ramPerNode} GB</ResourcePill>
    </>
  ),
}))

export function EnvironmentCreatePage() {
  const [name, setName] = useState("")
  const [maxNodes, setMaxNodes] = useState("")
  const [nodeSize, setNodeSize] = useState<SizeValue>("auto")
  const [nameError, setNameError] = useState<string | undefined>(undefined)
  const navigate = useNavigate()

  const submit = () => {
    if (!NAME_RE.test(name)) {
      setNameError("Use lowercase letters, digits and dashes; start with a letter.")
      return
    }
    const size = SIZE_OPTIONS.find((s) => s.value === nodeSize) ?? SIZE_OPTIONS[0]
    const nodes = maxNodes ? Number(maxNodes) : 2
    addEnvironment({
      name,
      status: "Provisioning" as EnvironmentStatus,
      nodes,
      cpu: size.cpuPerNode * nodes,
      ramGb: size.ramPerNode * nodes,
      createdAt: new Date().toISOString(),
    })
    navigate("/environments")
  }

  return (
    <div className="p-6">
      <Breadcrumb
        items={[{ label: "Environments", to: "/environments" }, { label: "Create" }]}
      />
      <PageHeader
        title="Create Environment"
        description="Provisioning takes about 5–10 minutes"
      />

      <div className="max-w-xl space-y-6">
        <h2 className="border-b border-slate-200 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Basic
        </h2>
        <FormField
          label="Environment name"
          required
          hint="Used as identifier. Lowercase letters, digits and dashes."
          error={nameError}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (nameError) setNameError(undefined)
            }}
            placeholder="development"
            className={inputClass}
          />
        </FormField>

        <h2 className="border-b border-slate-200 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Resources
        </h2>
        <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
          <Info className="mt-0.5 size-4 shrink-0" />
          Leave empty for automatic sizing based on your workload. You can adjust resources later.
        </div>
        <FormField label="Max nodes" hint="Maximum number of worker nodes">
          <input
            type="number"
            min={1}
            value={maxNodes}
            onChange={(e) => setMaxNodes(e.target.value)}
            placeholder="auto"
            className={inputClass}
          />
        </FormField>
        <FormField label="Node size">
          <CardRadioGroup value={nodeSize} onChange={setNodeSize} options={SIZE_CARDS} />
        </FormField>

        <div className="flex items-center gap-3 border-t border-slate-200 pt-5">
          <Button variant="primary" size="lg" onClick={submit}>
            Create Environment
          </Button>
          <Link to="/environments">
            <Button variant="outline" size="lg">
              Cancel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
