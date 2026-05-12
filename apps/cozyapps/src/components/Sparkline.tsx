import { useId, useMemo } from "react"

interface SparklineProps {
  values: number[]
  width?: number
  height?: number
  stroke?: string
  fill?: string
  className?: string
}

export function Sparkline({
  values,
  width = 80,
  height = 24,
  stroke = "#3b82f6",
  fill = "rgba(59,130,246,0.12)",
  className,
}: SparklineProps) {
  const gradientId = useId()
  const { line, area } = useMemo(() => {
    if (values.length < 2) return { line: "", area: "" }
    const min = Math.min(...values)
    const max = Math.max(...values)
    const span = max - min || 1
    const stepX = width / (values.length - 1)
    const points = values.map((v, i) => {
      const x = i * stepX
      const y = height - ((v - min) / span) * (height - 4) - 2
      return [x, y] as const
    })
    const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ")
    const area = `${line} L${width},${height} L0,${height} Z`
    return { line, area }
  }, [values, width, height])

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      {area && <path d={area} fill={`url(#${gradientId})`} />}
      {line && (
        <path d={line} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
      )}
    </svg>
  )
}
