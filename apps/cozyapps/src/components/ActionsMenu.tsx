import type { ReactNode } from "react"
import { Menu } from "@base-ui-components/react/menu"
import { ChevronDown } from "lucide-react"
import { Button } from "@cozystack/ui"

export interface ActionItem {
  label: string
  icon?: ReactNode
  onSelect: () => void
  danger?: boolean
}

interface ActionsMenuProps {
  items: ActionItem[]
  /** Adds a divider before this index (1-based). Use to separate destructive actions. */
  dividerBeforeIndex?: number
}

export function ActionsMenu({ items, dividerBeforeIndex }: ActionsMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <Button variant="outline" size="lg">
            Actions
            <ChevronDown className="size-4" />
          </Button>
        }
      />
      <Menu.Portal>
        <Menu.Positioner sideOffset={6} align="end">
          <Menu.Popup className="z-50 min-w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
            {items.map((item, idx) => (
              <div key={item.label}>
                {dividerBeforeIndex === idx && (
                  <div className="my-1 h-px bg-slate-100" />
                )}
                <Menu.Item
                  onClick={item.onSelect}
                  className={
                    "flex w-full cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-none " +
                    (item.danger
                      ? "text-red-600 data-[highlighted]:bg-red-50"
                      : "text-slate-700 data-[highlighted]:bg-slate-100")
                  }
                >
                  {item.icon}
                  {item.label}
                </Menu.Item>
              </div>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
