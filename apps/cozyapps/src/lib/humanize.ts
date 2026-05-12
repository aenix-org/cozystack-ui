const RTF = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

const UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: "month", ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: "week", ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: "day", ms: 24 * 60 * 60 * 1000 },
  { unit: "hour", ms: 60 * 60 * 1000 },
  { unit: "minute", ms: 60 * 1000 },
  { unit: "second", ms: 1000 },
]

export function timeAgo(iso: string, now: number = Date.now()): string {
  const diff = new Date(iso).getTime() - now
  const absDiff = Math.abs(diff)
  for (const { unit, ms } of UNITS) {
    if (absDiff >= ms || unit === "second") {
      const value = Math.round(diff / ms)
      return RTF.format(value, unit)
    }
  }
  return RTF.format(0, "second")
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}
