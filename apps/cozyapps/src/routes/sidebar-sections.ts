import { LayoutGrid, Store, Server, Settings } from "lucide-react"
import type { SidebarSection } from "@cozystack/ui"

export const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: "Applications",
    items: [
      { label: "My Apps", to: "/apps", icon: LayoutGrid, end: true },
      { label: "App Store", to: "/store", icon: Store },
    ],
  },
  {
    title: "Infrastructure",
    items: [{ label: "Environments", to: "/environments", icon: Server }],
  },
  {
    title: "Account",
    items: [{ label: "Settings", to: "/settings", icon: Settings }],
  },
]
