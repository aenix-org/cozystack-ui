import { Navigate, Route, Routes } from "react-router"
import { AppShell, type HeaderTab } from "@cozystack/ui"

const TABS: HeaderTab[] = [
  { id: "apps", label: "Apps", to: "/apps", highlight: true },
]

export default function App() {
  return (
    <AppShell
      sections={[]}
      tabs={TABS}
      version={import.meta.env.VITE_APP_VERSION}
      signOutUrl="#"
    >
      <Routes>
        <Route path="/" element={<Navigate to="/apps" replace />} />
        <Route path="/apps" element={<div className="p-6 text-sm text-slate-500">Cozy User Apps — scaffolded.</div>} />
      </Routes>
    </AppShell>
  )
}
