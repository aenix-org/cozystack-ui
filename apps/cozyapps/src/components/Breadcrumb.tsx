import { Fragment } from "react"
import { Link } from "react-router"
import { ChevronRight } from "lucide-react"

export interface Crumb {
  label: string
  to?: string
}

interface BreadcrumbProps {
  items: Crumb[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="mb-3 flex items-center gap-1 text-xs text-slate-500">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <Fragment key={`${item.label}-${index}`}>
            {item.to && !isLast ? (
              <Link to={item.to} className="hover:text-slate-700">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-slate-700" : ""}>{item.label}</span>
            )}
            {!isLast && <ChevronRight className="size-3 text-slate-300" />}
          </Fragment>
        )
      })}
    </nav>
  )
}
