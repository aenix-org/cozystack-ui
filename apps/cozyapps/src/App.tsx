import { Navigate, Route, Routes } from "react-router"
import { AppShell, type HeaderTab } from "@cozystack/ui"
import { SIDEBAR_SECTIONS } from "./routes/sidebar-sections.ts"
import { MyApplicationsPage } from "./routes/MyApplicationsPage.tsx"
import { ApplicationDetailsPage } from "./routes/ApplicationDetailsPage.tsx"
import { AppStorePage } from "./routes/AppStorePage.tsx"
import { TemplateDetailsPage } from "./routes/TemplateDetailsPage.tsx"
import { TemplateBuilderPage } from "./routes/TemplateBuilderPage.tsx"
import { LaunchFormPage } from "./routes/LaunchFormPage.tsx"
import { EnvironmentsPage } from "./routes/EnvironmentsPage.tsx"
import { EnvironmentDetailsPage } from "./routes/EnvironmentDetailsPage.tsx"
import { EnvironmentCreatePage } from "./routes/EnvironmentCreatePage.tsx"

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
        <Route path="/store/new" element={<TemplateBuilderPage />} />
        <Route path="/store/:template" element={<TemplateDetailsPage />} />
        <Route path="/store/:template/launch" element={<LaunchFormPage />} />
        <Route path="/environments" element={<EnvironmentsPage />} />
        <Route path="/environments/create" element={<EnvironmentCreatePage />} />
        <Route path="/environments/:name" element={<EnvironmentDetailsPage />} />
      </Routes>
    </AppShell>
  )
}
