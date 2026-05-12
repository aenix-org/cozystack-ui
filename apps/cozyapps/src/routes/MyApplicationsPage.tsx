import { Link } from "react-router"
import { Plus } from "lucide-react"
import { Button } from "@cozystack/ui"
import { useApplications } from "../lib/mock-store.ts"
import { ApplicationCard } from "../components/ApplicationCard.tsx"
import { Breadcrumb } from "../components/Breadcrumb.tsx"
import { PageHeader } from "../components/PageHeader.tsx"

export function MyApplicationsPage() {
  const apps = useApplications()
  const runningCount = apps.filter((a) => a.status === "Running").length

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: "Applications" }]} />
      <PageHeader
        title="My Applications"
        actions={
          <Link to="/store">
            <Button variant="primary" size="lg">
              <Plus className="size-4" />
              Launch New App
            </Button>
          </Link>
        }
      />
      {apps.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
          You don't have any applications yet.{" "}
          <Link to="/store" className="text-blue-600 hover:underline">
            Browse the App Store
          </Link>
          .
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {apps.map((app) => (
              <ApplicationCard key={app.name} app={app} />
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400">
            {apps.length} applications · {runningCount} running
          </p>
        </>
      )}
    </div>
  )
}
