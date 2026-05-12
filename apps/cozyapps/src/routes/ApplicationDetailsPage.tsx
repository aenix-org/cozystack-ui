import { useId, useMemo, useRef, useState } from "react"
import { Link, useParams } from "react-router"
import {
  Archive,
  Boxes,
  CircleDollarSign,
  Gauge,
  RefreshCw,
  Rocket,
  Trash2,
} from "lucide-react"
import { Button, Section, StatusBadge } from "@cozystack/ui"
import { addAction, findApplication, useApplications } from "../lib/mock-store.ts"
import { applicationStatusTone } from "../lib/status.ts"
import { formatDateTime, timeAgo } from "../lib/humanize.ts"
import { nowIso } from "../lib/clock.ts"
import { generateMetrics } from "../lib/metrics.ts"
import { Breadcrumb } from "../components/Breadcrumb.tsx"
import { DescriptionTable } from "../components/DescriptionTable.tsx"
import { EnvironmentPill } from "../components/EnvironmentPill.tsx"
import { ActionsMenu } from "../components/ActionsMenu.tsx"
import { Modal } from "../components/Modal.tsx"
import { MetricStatCard } from "../components/MetricStatCard.tsx"
import { UsageBar } from "../components/UsageBar.tsx"
import { Sparkline } from "../components/Sparkline.tsx"
import { LogsViewer } from "../components/LogsViewer.tsx"

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
  const maxDeploys = Math.max(1, ...metrics.delivery.deploys7d)

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: "Applications", to: "/apps" }, { label: app.name }]} />

      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">{app.name}</h1>
          <StatusBadge tone={applicationStatusTone(app.status)}>{app.status}</StatusBadge>
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
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
            <MetricStatCard
              icon={<CircleDollarSign className="size-3" />}
              label="Cost · month"
              value={`$${metrics.cost.monthlyUsd.toFixed(2)}`}
              hint={
                <span className="flex items-center gap-2">
                  <Sparkline values={metrics.cost.sparkline7d} width={56} height={16} />
                  7-day spend
                </span>
              }
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

        <Section title="Delivery">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <MetricStatCard
              icon={<Rocket className="size-3" />}
              label="Deploys · 7d"
              value={metrics.delivery.deploysPerWeek}
              hint={`Last ${timeAgo(metrics.delivery.lastDeployAt)}`}
            />
            <div className="md:col-span-2 rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Deploys per day · last 7d
              </div>
              <div className="flex h-16 items-end gap-1.5">
                {metrics.delivery.deploys7d.map((count, idx) => {
                  const h = Math.max(4, (count / maxDeploys) * 56)
                  return (
                    <div
                      key={idx}
                      className="group flex flex-1 flex-col items-center justify-end gap-1"
                    >
                      <span className="text-[10px] text-slate-400 group-hover:text-slate-700">
                        {count}
                      </span>
                      <div
                        className="w-full rounded-sm bg-blue-500/80 group-hover:bg-blue-600"
                        style={{ height: h }}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-400">
                <span>-6d</span>
                <span>today</span>
              </div>
            </div>
          </div>
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
