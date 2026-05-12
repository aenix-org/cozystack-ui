import type { ReactNode } from "react"

export interface DescriptionRow {
  key: string
  value: ReactNode
}

interface DescriptionTableProps {
  rows: DescriptionRow[]
}

export function DescriptionTable({ rows }: DescriptionTableProps) {
  return (
    <dl className="divide-y divide-slate-100">
      {rows.map(({ key, value }) => (
        <div key={key} className="grid grid-cols-[160px_1fr] gap-4 py-2.5">
          <dt className="text-sm text-slate-500">{key}</dt>
          <dd className="text-sm text-slate-900">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
