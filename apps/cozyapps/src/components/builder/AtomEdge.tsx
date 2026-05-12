import { memo } from "react"
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react"
import { PORT_TYPE, type PortType } from "../../lib/builder/port-types.ts"

interface AtomEdgeData {
  portType?: PortType
  pulsing?: boolean
  [key: string]: unknown
}

function AtomEdgeImpl({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })
  const ed = data as AtomEdgeData | undefined
  const stroke = ed?.portType ? PORT_TYPE[ed.portType].stroke : "#94a3b8"
  const baseWidth = selected ? 2.5 : 1.75

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke,
          strokeWidth: baseWidth,
          strokeDasharray: ed?.pulsing ? "8 4" : undefined,
        }}
      />
      {ed?.pulsing && (
        <circle r={4} fill={stroke}>
          <animateMotion dur="1.4s" repeatCount="indefinite" path={path} />
        </circle>
      )}
      <EdgeLabelRenderer>{null}</EdgeLabelRenderer>
    </>
  )
}

export const AtomEdge = memo(AtomEdgeImpl)
