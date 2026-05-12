import { Link, useParams } from "react-router"
import { Check, Rocket } from "lucide-react"
import { Button, Section } from "@cozystack/ui"
import { findTemplate, useTemplates } from "../lib/mock-store.ts"
import { Breadcrumb } from "../components/Breadcrumb.tsx"
import { AppIcon } from "../components/AppIcon.tsx"
import { CategoryBadge } from "../components/CategoryBadge.tsx"
import { ResourcePill } from "../components/ResourcePill.tsx"
import { DescriptionTable } from "../components/DescriptionTable.tsx"

export function TemplateDetailsPage() {
  useTemplates()
  const { template: slug } = useParams<{ template: string }>()
  const template = slug ? findTemplate(slug) : undefined

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

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: "Applications", to: "/apps" },
          { label: "App Store", to: "/store" },
          { label: template.displayName },
        ]}
      />

      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <AppIcon icon={template.icon} background={template.iconBg} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-900">{template.displayName}</h1>
              {template.categories.map((c) => (
                <CategoryBadge key={c} category={c} />
              ))}
              <span className="font-mono text-xs text-slate-400">v{template.version}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{template.subtitle}</p>
          </div>
        </div>
        <Link to={`/store/${template.slug}/launch`}>
          <Button variant="primary" size="lg">
            <Rocket className="size-4" />
            Launch {template.displayName}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-slate-600">{template.description}</p>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-700">What's included</h2>
            <ul className="space-y-1.5">
              {template.includedFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="size-4 text-emerald-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Available actions</h2>
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
              {template.actions.map((action) => (
                <li key={action.name} className="px-4 py-3">
                  <div className="text-sm font-medium text-slate-900">{action.name}</div>
                  <div className="text-xs text-slate-500">{action.description}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-5">
          <Section title="Details">
            <DescriptionTable
              rows={[
                { key: "Maintained by", value: template.maintainer },
                { key: "Latest version", value: template.version },
                { key: "Last updated", value: template.lastUpdated },
                { key: "Min. storage", value: `${template.resources.storageGb} GB` },
              ]}
            />
          </Section>
          <Section title="Resources">
            <div className="flex flex-wrap gap-2">
              <ResourcePill icon="cpu">{template.resources.cpu} CPU</ResourcePill>
              <ResourcePill icon="ram">{template.resources.ramGb} GB RAM</ResourcePill>
              <ResourcePill icon="storage">{template.resources.storageGb} GB</ResourcePill>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
