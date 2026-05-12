import { useId, useMemo, useRef, useState } from "react"
import { Link, useParams } from "react-router"
import { Archive, Boxes, Gauge, RefreshCw, Trash2 } from "lucide-react"
import { Button, Section, StatusBadge } from "@cozystack/ui"
import { addAction, findApplication, useApplications } from "../lib/mock-store.ts"
import { applicationStatusTone } from "../lib/status.ts"
import { formatDateTime } from "../lib/humanize.ts"
import { nowIso } from "../lib/clock.ts"
import { generateMetrics } from "../lib/metrics.ts"
import { Breadcrumb } from "../components/Breadcrumb.tsx"
import { DescriptionTable } from "../components/DescriptionTable.tsx"
import { EnvironmentPill } from "../components/EnvironmentPill.tsx"
import { ActionsMenu } from "../components/ActionsMenu.tsx"
import { Modal } from "../components/Modal.tsx"
import { MetricStatCard } from "../components/MetricStatCard.tsx"
import { UsageBar } from "../components/UsageBar.tsx"
import { LogsViewer } from "../components/LogsViewer.tsx"
import { ChangesTimeline, SyncStateBadge } from "../components/ChangesTimeline.tsx"
import { TopologySection } from "../components/TopologySection.tsx"
import { generateTopology } from "../lib/topology.ts"

export function ApplicationDetailsPage() {
  // Subscribe to the store so mutations (status changes, new actions) re-render.
  useApplications()
  const { name } = useParams<{ name: string }>()
  const app = name ? findApplication(name) : undefined

  const [backupOpen, setBackupOpen] = useState(false)
  const [backupName, setBackupName] = useState("")
  const actionIdBase = useId()
  const actionCounter = useRef(0)
  const metrics = useMemo(() => (app ? generateMetrics(app) : null), [app])
  const topology = useMemo(() => (app ? generateTopology(app) : []), [app])

  if (!app || !metrics) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Application not found.{" "}
        <Link to="/apps" className="text-blue-600 hover:underline">
          Back to My Applications
        </Link>
      </div>
    )
  }

  const submitBackup = () => {
    actionCounter.current += 1
    addAction({
      id: `${actionIdBase}-${actionCounter.current}`,
      name: backupName.trim() || "backup",
      applicationName: app.name,
      status: "Pending",
      createdAt: nowIso(),
    })
    setBackupOpen(false)
    setBackupName("")
  }

  const configRows = Object.entries(app.config).map(([key, value]) => ({
    key,
    value: String(value),
  }))

  const uptimePct = (metrics.uptime.last24h * 100).toFixed(3)
  const uptimeTone =
    metrics.uptime.last24h >= 0.999
      ? "ok"
      : metrics.uptime.last24h >= 0.99
        ? "neutral"
        : "warn"
  const restartsTone =
    metrics.restarts24h === 0 ? "neutral" : metrics.restarts24h > 3 ? "error" : "warn"
  const podsTone =
    metrics.pods.ready === metrics.pods.total
      ? "ok"
      : metrics.pods.ready === 0
        ? "error"
        : "warn"

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: "Applications", to: "/apps" }, { label: app.name }]} />

      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">{app.name}</h1>
          <StatusBadge tone={applicationStatusTone(app.status)}>{app.status}</StatusBadge>
          <SyncStateBadge state={metrics.syncState} />
        </div>
        <ActionsMenu
          dividerBeforeIndex={2}
          items={[
            {
              label: "Restart",
              icon: <RefreshCw className="size-4" />,
              onSelect: () => {
                /* mock: nothing for now */
              },
            },
            {
              label: "Create Backup",
              icon: <Archive className="size-4" />,
              onSelect: () => setBackupOpen(true),
            },
            {
              label: "Delete",
              icon: <Trash2 className="size-4" />,
              danger: true,
              onSelect: () => {
                /* mock: nothing for now */
              },
            },
          ]}
        />
      </div>

      <div className="space-y-5">
        <Section title="Health & Capacity">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricStatCard
              icon={<Gauge className="size-3" />}
              label="Uptime · 24h"
              value={`${uptimePct}%`}
              tone={uptimeTone}
              hint={`7d ${(metrics.uptime.last7d * 100).toFixed(2)}% · 30d ${(metrics.uptime.last30d * 100).toFixed(2)}%`}
            />
            <MetricStatCard
              icon={<Boxes className="size-3" />}
              label="Pods ready"
              value={`${metrics.pods.ready}/${metrics.pods.total}`}
              tone={podsTone}
            />
            <MetricStatCard
              icon={<RefreshCw className="size-3" />}
              label="Restarts · 24h"
              value={metrics.restarts24h}
              tone={restartsTone}
            />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <UsageBar
              label="CPU"
              used={metrics.resources.cpuUsed}
              total={metrics.resources.cpuTotal}
              unit=" cores"
              digits={2}
            />
            <UsageBar
              label="Memory"
              used={metrics.resources.memUsedGb}
              total={metrics.resources.memTotalGb}
              unit=" GB"
              digits={2}
            />
            <UsageBar
              label="Storage"
              used={metrics.resources.storageUsedGb}
              total={metrics.resources.storageTotalGb}
              unit=" GB"
              digits={1}
            />
          </div>
        </Section>

        <Section
          title="Topology"
          description="What actually runs in the cluster — atoms and the k8s objects they own"
          actions={
            <span className="text-xs text-slate-500">
              {topology.length} atoms ·{" "}
              {topology.reduce((sum, a) => sum + a.resources.length, 0)} objects
            </span>
          }
        >
          <TopologySection topology={topology} />
        </Section>

        <Section
          title="Changes"
          description="Every spec edit, drift fix and upstream output bump shows up here"
          actions={
            <span className="text-xs text-slate-500">
              <span className="font-medium text-slate-700">
                {metrics.reconcileRuns.filter((r) => r.result === "changed").length}
              </span>{" "}
              changes ·{" "}
              {metrics.reconcileRuns.filter((r) => r.result === "noop").length} no-op
            </span>
          }
        >
          <ChangesTimeline runs={metrics.reconcileRuns} />
        </Section>

        <Section title="Logs">
          <LogsViewer logs={metrics.logs} />
        </Section>

        <Section title="Status">
          <DescriptionTable
            rows={[
              {
                key: "Status",
                value: (
                  <StatusBadge tone={applicationStatusTone(app.status)}>{app.status}</StatusBadge>
                ),
              },
              {
                key: "Environment",
                value: <EnvironmentPill name={app.environment} />,
              },
              { key: "Template", value: app.template },
              ...(app.domain
                ? [
                    {
                      key: "Domain",
                      value: (
                        <a
                          href={`https://${app.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {app.domain}
                        </a>
                      ),
                    },
                  ]
                : []),
              { key: "Created", value: formatDateTime(app.createdAt) },
            ]}
          />
        </Section>

        <Section
          title="Configuration"
          actions={
            <Button variant="outline" size="sm" disabled title="Coming soon">
              Edit
            </Button>
          }
        >
          <DescriptionTable rows={configRows} />
        </Section>
      </div>

      <Modal
        open={backupOpen}
        onOpenChange={setBackupOpen}
        title="Create Backup"
        description={`Create a backup of ${app.template}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setBackupOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submitBackup}>
              Create Backup
            </Button>
          </>
        }
      >
        <label className="block">
          <span className="block text-sm font-medium text-slate-700">
            Backup name <span className="text-red-500">*</span>
          </span>
          <input
            type="text"
            value={backupName}
            onChange={(e) => setBackupName(e.target.value)}
            placeholder="before-update"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
          <p className="mt-1 text-xs text-slate-500">A short name to identify this backup</p>
        </label>
      </Modal>
    </div>
  )
}
