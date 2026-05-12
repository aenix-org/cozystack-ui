import { Navigate, Route, Routes } from "react-router"
import { AppShell, type HeaderTab } from "@cozystack/ui"
import { SIDEBAR_SECTIONS } from "./routes/sidebar-sections.ts"
import { MyApplicationsPage } from "./routes/MyApplicationsPage.tsx"
import { ApplicationDetailsPage } from "./routes/ApplicationDetailsPage.tsx"
import { AppStorePage } from "./routes/AppStorePage.tsx"
import { TemplateDetailsPage } from "./routes/TemplateDetailsPage.tsx"
import { EnvironmentsPage } from "./routes/EnvironmentsPage.tsx"

const TABS: HeaderTab[] = [
  { id: "apps", label: "Apps", to: "/apps", highlight: true },
]

export default function App() {
  return (
    <AppShell
      sections={SIDEBAR_SECTIONS}
      tabs={TABS}
      version={import.meta.env.VITE_APP_VERSION}
      signOutUrl="#"
    >
      <Routes>
        <Route path="/" element={<Navigate to="/apps" replace />} />
        <Route path="/apps" element={<MyApplicationsPage />} />
        <Route path="/apps/:name" element={<ApplicationDetailsPage />} />
        <Route path="/store" element={<AppStorePage />} />
        <Route path="/store/:template" element={<TemplateDetailsPage />} />
        <Route path="/environments" element={<EnvironmentsPage />} />
      </Routes>
    </AppShell>
  )
}
