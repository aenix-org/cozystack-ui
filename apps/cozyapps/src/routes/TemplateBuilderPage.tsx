import { Breadcrumb } from "../components/Breadcrumb.tsx"
import { PageHeader } from "../components/PageHeader.tsx"

export function TemplateBuilderPage() {
  return (
    <div className="flex h-full flex-col p-6">
      <Breadcrumb
        items={[
          { label: "Applications", to: "/apps" },
          { label: "App Store", to: "/store" },
          { label: "Create Template" },
        ]}
      />
      <PageHeader
        title="Template Builder"
        description="Compose your application as a graph of typed building blocks"
      />
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-sm text-slate-400">
        Canvas placeholder
      </div>
    </div>
  )
}
