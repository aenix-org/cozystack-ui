import { useMemo } from "react"
import { Link, useParams } from "react-router"
import { Copy, Download, Globe, Server, ShieldCheck } from "lucide-react"
import { Button, Section, StatusBadge, cn } from "@cozystack/ui"
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

export function EnvironmentDetailsPage() {
  const { name } = useParams<{ name: string }>()
  const environments = useEnvironments()
  const apps = useApplications()
  const env = environments.find((e) => e.name === name)
  const details = useMemo(() => (env ? generateEnvDetails(env) : null), [env])

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
  const { capacity, nodes, network, events, k8sVersion } = details

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

        <Section title="Network & Access">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
              <NetworkField
                icon={<Globe className="size-3.5 text-slate-400" />}
                label="Load balancer"
                value={network.lbAddress}
              />
              <NetworkField
                icon={<Server className="size-3.5 text-slate-400" />}
                label="Wildcard domain"
                value={network.wildcardDomain}
              />
              <NetworkField
                icon={
                  <ShieldCheck
                    className={cn(
                      "size-3.5",
                      network.tlsIssuerOk ? "text-emerald-500" : "text-amber-500",
                    )}
                  />
                }
                label="TLS issuer"
                value={network.tlsIssuer}
                hint={network.tlsIssuerOk ? "ready" : "rate-limited"}
              />
              <NetworkField
                icon={<Globe className="size-3.5 text-slate-400" />}
                label="Egress IP"
                value={network.egressIp}
              />
            </div>
            <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                kubectl access
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-900 p-3 font-mono text-[11px] text-slate-100">
                <div className="text-slate-500"># Use this context</div>
                <div>kubectl --context {network.kubectlContext} get pods</div>
              </div>
              <div className="flex gap-2">
                <Button variant="primary" size="sm">
                  <Download className="size-3.5" />
                  Download kubeconfig
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="size-3.5" />
                  Copy command
                </Button>
              </div>
              <p className="text-[11px] text-slate-500">
                kubeconfig path: <span className="font-mono">{network.kubeconfigPath}</span>
              </p>
            </div>
          </div>
        </Section>

        <Section title="Events" description="Recent activity in the environment">
          <EventsTimeline events={events} />
        </Section>
      </div>
    </div>
  )
}

function NetworkField({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0">{icon}</span>
      <span className="w-32 shrink-0 text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className="flex-1 truncate font-mono text-sm text-slate-900">{value}</span>
      {hint && (
        <span className="shrink-0 text-[11px] text-slate-500 italic">{hint}</span>
      )}
    </div>
  )
}
