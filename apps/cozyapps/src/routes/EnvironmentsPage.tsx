import { Link } from "react-router"
import { Plus } from "lucide-react"
import { Button } from "@cozystack/ui"
import { useApplications, useEnvironments } from "../lib/mock-store.ts"
import { EnvironmentCard } from "../components/EnvironmentCard.tsx"
import { Breadcrumb } from "../components/Breadcrumb.tsx"
import { PageHeader } from "../components/PageHeader.tsx"

export function EnvironmentsPage() {
  const envs = useEnvironments()
  const apps = useApplications()
  const readyCount = envs.filter((e) => e.status === "Ready").length
  const appsByEnv = new Map<string, typeof apps>()
  for (const app of apps) {
    const bucket = appsByEnv.get(app.environment) ?? []
    bucket.push(app)
    appsByEnv.set(app.environment, bucket)
  }

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: "Environments" }]} />
      <PageHeader
        title="Environments"
        actions={
          <Link to="/environments/create">
            <Button variant="primary" size="lg">
              <Plus className="size-4" />
              Create Environment
            </Button>
          </Link>
        }
      />
      {envs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
          You don't have any environments yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {envs.map((env) => (
              <EnvironmentCard key={env.name} env={env} apps={appsByEnv.get(env.name) ?? []} />
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400">
            {envs.length} environments · {readyCount} ready
          </p>
        </>
      )}
    </div>
  )
}
