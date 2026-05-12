import { useMemo } from "react"
import { Link, useParams } from "react-router"
import { Section, StatusBadge, cn } from "@cozystack/ui"
import { useApplications, useEnvironments } from "../lib/mock-store.ts"
import { environmentStatusTone } from "../lib/status.ts"
import { timeAgo } from "../lib/humanize.ts"
import { tierBarClass } from "../lib/app-presentation.ts"
import { generateEnvDetails } from "../lib/env-details.ts"
import { Breadcrumb } from "../components/Breadcrumb.tsx"
import { PageHeader } from "../components/PageHeader.tsx"
import { UsageBar } from "../components/UsageBar.tsx"
import { ResourcePill } from "../components/ResourcePill.tsx"
import { ApplicationCard } from "../components/ApplicationCard.tsx"
import { NodesTable } from "../components/NodesTable.tsx"
import { EventsTimeline } from "../components/EventsTimeline.tsx"
import { LoadBalancersTable } from "../components/LoadBalancersTable.tsx"
import { IngressesTable } from "../components/IngressesTable.tsx"

export function EnvironmentDetailsPage() {
  const { name } = useParams<{ name: string }>()
  const environments = useEnvironments()
  const apps = useApplications()
  const env = environments.find((e) => e.name === name)
  const details = useMemo(
    () => (env ? generateEnvDetails(env, apps) : null),
    [env, apps],
  )

  if (!env || !details) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Environment not found.{" "}
        <Link to="/environments" className="text-blue-600 hover:underline">
          Back to Environments
        </Link>
      </div>
    )
  }

  const envApps = apps.filter((a) => a.environment === env.name)
  const { capacity, nodes, loadBalancers, ingresses, events, k8sVersion } = details

  return (
    <div className="relative p-6">
      <span
        className={cn(
          "absolute left-0 top-0 h-full w-1",
          tierBarClass(env.name),
        )}
      />
      <Breadcrumb items={[{ label: "Environments", to: "/environments" }, { label: env.name }]} />
      <PageHeader
        title={
          <>
            <span className="font-mono">{env.name}</span>
            <StatusBadge tone={environmentStatusTone(env.status)}>{env.status}</StatusBadge>
            <span className="font-mono text-xs text-slate-400">{k8sVersion}</span>
          </>
        }
        description={`Created ${timeAgo(env.createdAt)} · ${env.nodes} worker nodes`}
      />

      <div className="space-y-5">
        <Section
          title="Capacity & Nodes"
          actions={
            <div className="flex flex-wrap gap-1.5">
              <ResourcePill icon="nodes">{env.nodes} nodes</ResourcePill>
              <ResourcePill icon="cpu">{env.cpu} CPU</ResourcePill>
              <ResourcePill icon="ram">{env.ramGb} GB RAM</ResourcePill>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <UsageBar
              label="CPU"
              used={capacity.cpuUsed}
              total={capacity.cpuTotal}
              unit=" cores"
              digits={1}
            />
            <UsageBar
              label="Memory"
              used={capacity.memUsedGb}
              total={capacity.memTotalGb}
              unit=" GB"
              digits={1}
            />
            <UsageBar
              label="Storage"
              used={capacity.storageUsedGb}
              total={capacity.storageTotalGb}
              unit=" GB"
              digits={0}
            />
            <UsageBar
              label="Pods"
              used={capacity.podsUsed}
              total={capacity.podsCapacity}
              digits={0}
            />
          </div>
          <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <NodesTable nodes={nodes} />
          </div>
        </Section>

        <Section
          title="Applications"
          description={`${envApps.length} deployed in this environment`}
        >
          {envApps.length === 0 ? (
            <p className="text-sm italic text-slate-400">No applications deployed here yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {envApps.map((app) => (
                <ApplicationCard key={app.name} app={app} />
              ))}
            </div>
          )}
        </Section>

        <Section
          title="Load Balancers"
          description="Services of type LoadBalancer exposed in this environment"
          actions={<span className="text-xs text-slate-500">{loadBalancers.length}</span>}
        >
          <LoadBalancersTable lbs={loadBalancers} />
        </Section>

        <Section
          title="Ingresses"
          description="HTTP/S routes admitted by the ingress controller"
          actions={<span className="text-xs text-slate-500">{ingresses.length}</span>}
        >
          <IngressesTable ingresses={ingresses} />
        </Section>

        <Section title="Events" description="Recent activity in the environment">
          <EventsTimeline events={events} />
        </Section>
      </div>
    </div>
  )
}
