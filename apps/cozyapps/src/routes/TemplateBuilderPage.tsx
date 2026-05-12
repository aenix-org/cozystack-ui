import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router"
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type EdgeTypes,
  type FinalConnectionState,
  type Node,
  type NodeTypes,
  type OnConnect,
  type OnConnectEnd,
  type OnConnectStart,
  type ReactFlowInstance,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Play, Sparkles, Square, Trash2, Upload } from "lucide-react"
import { Button } from "@cozystack/ui"
import { Breadcrumb } from "../components/Breadcrumb.tsx"
import { AtomNode } from "../components/builder/AtomNode.tsx"
import { AtomEdge } from "../components/builder/AtomEdge.tsx"
import { AtomPalette } from "../components/builder/AtomPalette.tsx"
import { AtomInspector } from "../components/builder/AtomInspector.tsx"
import { AtomSuggestPopup } from "../components/builder/AtomSuggestPopup.tsx"
import type { DragDirection, SuggestionTarget } from "../lib/builder/suggestions.ts"
import {
  PublishDialog,
  type PublishedTemplateDraft,
} from "../components/builder/PublishDialog.tsx"
import { addTemplate } from "../lib/mock-store.ts"
import {
  ATOMS,
  effectiveOutputs,
  findAtom,
  type AtomDef,
} from "../lib/builder/atoms.ts"
import {
  DEFAULT_USER_INPUT_FIELDS,
  fieldToParam,
} from "../lib/builder/dynamic-fields.ts"
import {
  isCompatible,
  paramTypeToPortType,
  type PortType,
} from "../lib/builder/port-types.ts"
import {
  ATOM_EDGE_MARKERS,
  isParamHandle,
  paramHandleId,
  paramKeyFromHandle,
  type AtomNodeData,
} from "../lib/builder/types.ts"
import { presetWordpress } from "../lib/builder/preset.ts"
import { topologicalLevels } from "../lib/builder/run-preview.ts"
import type { ApplicationTemplate } from "../lib/types.ts"

const nodeTypes: NodeTypes = { atom: AtomNode }
const edgeTypes: EdgeTypes = { atom: AtomEdge }

const DRAG_MIME = "application/x-cozyapps-atom"

type BuilderNode = Node<AtomNodeData>

function makeNodeId(atomType: string, existing: BuilderNode[]): string {
  let counter = 1
  let candidate = `${atomType}-${counter}`
  while (existing.some((n) => n.id === candidate)) {
    counter += 1
    candidate = `${atomType}-${counter}`
  }
  return candidate
}

function defaultParams(atom: AtomDef): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const p of atom.params) {
    if (p.defaultValue !== undefined) out[p.key] = p.defaultValue
  }
  return out
}

export function TemplateBuilderPage() {
  return (
    <ReactFlowProvider>
      <BuilderInner />
    </ReactFlowProvider>
  )
}

function BuilderInner() {
  const preset = useMemo(() => presetWordpress(), [])
  const [nodes, setNodes, onNodesChange] = useNodesState<BuilderNode>(
    preset.nodes as BuilderNode[],
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(preset.edges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [publishOpen, setPublishOpen] = useState(false)
  const [running, setRunning] = useState(false)
  const [pendingSpawn, setPendingSpawn] = useState<{
    originNodeId: string
    originHandle: string
    portType: PortType
    direction: DragDirection
    screenX: number
    screenY: number
    flowPosition: { x: number; y: number }
  } | null>(null)
  const connectStart = useRef<{
    nodeId: string
    handleId: string
    portType: PortType
    direction: DragDirection
  } | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null)
  const rfInstance = useRef<ReactFlowInstance<BuilderNode, Edge> | null>(null)
  const navigate = useNavigate()

  const selectedNode = useMemo(
    () => (selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) ?? null : null),
    [nodes, selectedNodeId],
  )

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return
      const sourceNode = nodes.find((n) => n.id === connection.source)
      const targetNode = nodes.find((n) => n.id === connection.target)
      if (!sourceNode || !targetNode) return
      const sourceAtom = findAtom(sourceNode.data.atomType)
      const targetAtom = findAtom(targetNode.data.atomType)
      if (!sourceAtom || !targetAtom) return
      const sourcePort = effectiveOutputs(sourceAtom, sourceNode.data).find(
        (p) => p.key === connection.sourceHandle,
      )
      if (!sourcePort) return

      let targetType
      let isMulti = false
      if (isParamHandle(connection.targetHandle)) {
        const paramKey = paramKeyFromHandle(connection.targetHandle as string)
        const exposed = targetNode.data.exposed ?? []
        if (!exposed.includes(paramKey)) return
        const param = targetAtom.params.find((p) => p.key === paramKey)
        if (!param) return
        targetType = paramTypeToPortType(param.type)
      } else {
        const port = targetAtom.inputs.find((p) => p.key === connection.targetHandle)
        if (!port) return
        targetType = port.type
        isMulti = !!port.multi
      }

      if (!isCompatible(sourcePort.type, targetType)) return
      setEdges((eds) => {
        const filtered = isMulti
          ? eds
          : eds.filter(
              (e) =>
                !(e.target === connection.target && e.targetHandle === connection.targetHandle),
            )
        return addEdge(
          {
            ...connection,
            type: "atom",
            data: { portType: sourcePort.type },
            markerEnd: ATOM_EDGE_MARKERS,
          },
          filtered,
        )
      })
    },
    [nodes, setEdges],
  )

  const onConnectStart: OnConnectStart = useCallback(
    (_event, params) => {
      connectStart.current = null
      const { nodeId, handleId, handleType } = params
      if (!nodeId || !handleId || !handleType) return
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return
      const atom = findAtom(node.data.atomType)
      if (!atom) return

      if (handleType === "source") {
        const port = effectiveOutputs(atom, node.data).find((p) => p.key === handleId)
        if (!port) return
        connectStart.current = {
          nodeId,
          handleId,
          portType: port.type,
          direction: "from-source",
        }
      } else {
        let portType: PortType | undefined
        if (isParamHandle(handleId)) {
          const paramKey = paramKeyFromHandle(handleId)
          const param = atom.params.find((p) => p.key === paramKey)
          if (param) portType = paramTypeToPortType(param.type)
        } else {
          const port = atom.inputs.find((p) => p.key === handleId)
          if (port) portType = port.type
        }
        if (!portType) return
        connectStart.current = {
          nodeId,
          handleId,
          portType,
          direction: "from-target",
        }
      }
    },
    [nodes],
  )

  const onConnectEnd: OnConnectEnd = useCallback((event, connectionState: FinalConnectionState) => {
    const ctx = connectStart.current
    connectStart.current = null
    if (!ctx) return
    if (connectionState.toNode) return
    if (!rfInstance.current) return
    const clientX = "clientX" in event ? event.clientX : event.changedTouches?.[0]?.clientX
    const clientY = "clientY" in event ? event.clientY : event.changedTouches?.[0]?.clientY
    if (clientX == null || clientY == null) return
    const flowPosition = rfInstance.current.screenToFlowPosition({ x: clientX, y: clientY })
    setPendingSpawn({
      originNodeId: ctx.nodeId,
      originHandle: ctx.handleId,
      portType: ctx.portType,
      direction: ctx.direction,
      screenX: clientX,
      screenY: clientY,
      flowPosition,
    })
  }, [])

  const spawnFromSuggestion = useCallback(
    (target: SuggestionTarget) => {
      if (!pendingSpawn) return
      setNodes((current) => {
        const id = makeNodeId(target.atom.type, current)
        const exposedParam = target.kind === "param" ? [target.handle] : []
        const newNode: BuilderNode = {
          id,
          type: "atom",
          position: pendingSpawn.flowPosition,
          data: {
            atomType: target.atom.type,
            params: defaultParams(target.atom),
            exposed: exposedParam,
            status: "idle",
          },
        }

        let newEdge: Edge
        if (pendingSpawn.direction === "from-source") {
          const targetHandle =
            target.kind === "param" ? paramHandleId(target.handle) : target.handle
          newEdge = {
            id: `${pendingSpawn.originNodeId}:${pendingSpawn.originHandle}->${id}:${targetHandle}`,
            source: pendingSpawn.originNodeId,
            sourceHandle: pendingSpawn.originHandle,
            target: id,
            targetHandle,
            type: "atom",
            data: { portType: pendingSpawn.portType },
            markerEnd: ATOM_EDGE_MARKERS,
          }
        } else {
          newEdge = {
            id: `${id}:${target.handle}->${pendingSpawn.originNodeId}:${pendingSpawn.originHandle}`,
            source: id,
            sourceHandle: target.handle,
            target: pendingSpawn.originNodeId,
            targetHandle: pendingSpawn.originHandle,
            type: "atom",
            data: { portType: pendingSpawn.portType },
            markerEnd: ATOM_EDGE_MARKERS,
          }
        }

        setEdges((eds) => [...eds, newEdge])
        return [...current, newNode]
      })
      setPendingSpawn(null)
    },
    [pendingSpawn, setEdges, setNodes],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const atomType = event.dataTransfer.getData(DRAG_MIME)
      if (!atomType) return
      const atom = ATOMS.find((a) => a.type === atomType)
      if (!atom || !rfInstance.current) return
      const position = rfInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      setNodes((current) => {
        const id = makeNodeId(atomType, current)
        const newNode: BuilderNode = {
          id,
          type: "atom",
          position,
          data: {
            atomType,
            params: defaultParams(atom),
            exposed: [],
            fields: atom.hasDynamicFields ? [...DEFAULT_USER_INPUT_FIELDS] : undefined,
            status: "idle",
          },
        }
        return [...current, newNode]
      })
    },
    [setNodes],
  )

  const handlePaletteDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>, atom: AtomDef) => {
      event.dataTransfer.setData(DRAG_MIME, atom.type)
      event.dataTransfer.effectAllowed = "move"
    },
    [],
  )

  const updateSelectedNode = useCallback(
    (next: AtomNodeData) => {
      if (!selectedNodeId) return
      setNodes((current) =>
        current.map((n) => (n.id === selectedNodeId ? { ...n, data: next } : n)),
      )
    },
    [selectedNodeId, setNodes],
  )

  const toggleParamExposure = useCallback(
    (paramKey: string, expose: boolean) => {
      if (!selectedNodeId) return
      const handleId = paramHandleId(paramKey)
      setNodes((current) =>
        current.map((n) => {
          if (n.id !== selectedNodeId) return n
          const exposed = n.data.exposed ?? []
          const nextExposed = expose
            ? exposed.includes(paramKey)
              ? exposed
              : [...exposed, paramKey]
            : exposed.filter((k) => k !== paramKey)
          return { ...n, data: { ...n.data, exposed: nextExposed } }
        }),
      )
      if (!expose) {
        setEdges((current) =>
          current.filter(
            (e) => !(e.target === selectedNodeId && e.targetHandle === handleId),
          ),
        )
      }
    },
    [selectedNodeId, setEdges, setNodes],
  )

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNodeId) return
    setNodes((current) => current.filter((n) => n.id !== selectedNodeId))
    setEdges((current) =>
      current.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId),
    )
    setSelectedNodeId(null)
  }, [selectedNodeId, setNodes, setEdges])

  const resetGraph = useCallback(() => {
    setNodes([])
    setEdges([])
    setSelectedNodeId(null)
  }, [setNodes, setEdges])

  const clearTimers = useCallback(() => {
    for (const t of timers.current) clearTimeout(t)
    timers.current = []
  }, [])

  const stopPreview = useCallback(() => {
    clearTimers()
    setRunning(false)
    setNodes((curr) =>
      curr.map((n) => ({ ...n, data: { ...n.data, status: "idle" } })),
    )
    setEdges((curr) =>
      curr.map((e) => ({ ...e, data: { ...e.data, pulsing: false } })),
    )
  }, [clearTimers, setEdges, setNodes])

  const startPreview = useCallback(() => {
    const levels = topologicalLevels(nodes, edges)
    if (!levels || levels.length === 0) return

    clearTimers()
    setRunning(true)
    setNodes((curr) =>
      curr.map((n) => ({ ...n, data: { ...n.data, status: "queued" } })),
    )
    setEdges((curr) =>
      curr.map((e) => ({ ...e, data: { ...e.data, pulsing: false } })),
    )

    const LEVEL_MS = 1200
    const RUN_MS = 900

    levels.forEach((level, i) => {
      const ids = new Set(level)
      const startAt = i * LEVEL_MS
      timers.current.push(
        setTimeout(() => {
          setNodes((curr) =>
            curr.map((n) =>
              ids.has(n.id) ? { ...n, data: { ...n.data, status: "running" } } : n,
            ),
          )
          setEdges((curr) =>
            curr.map((e) =>
              ids.has(e.target) ? { ...e, data: { ...e.data, pulsing: true } } : e,
            ),
          )
        }, startAt),
      )
      timers.current.push(
        setTimeout(() => {
          setNodes((curr) =>
            curr.map((n) =>
              ids.has(n.id)
                ? { ...n, data: { ...n.data, status: "succeeded" } }
                : n,
            ),
          )
          setEdges((curr) =>
            curr.map((e) =>
              ids.has(e.target) ? { ...e, data: { ...e.data, pulsing: false } } : e,
            ),
          )
        }, startAt + RUN_MS),
      )
    })

    timers.current.push(
      setTimeout(() => setRunning(false), levels.length * LEVEL_MS),
    )
  }, [clearTimers, edges, nodes, setEdges, setNodes])

  useEffect(() => clearTimers, [clearTimers])

  const handlePublish = useCallback(
    (draft: PublishedTemplateDraft) => {
      const userInputNode = nodes.find((n) => n.data.atomType === "user-input")
      const parameters = userInputNode?.data.fields?.length
        ? userInputNode.data.fields.map(fieldToParam)
        : [
            {
              key: "name",
              label: "Name",
              type: "string" as const,
              placeholder: draft.slug,
              required: true,
            },
          ]
      const template: ApplicationTemplate = {
        slug: draft.slug,
        displayName: draft.displayName,
        version: "0.1.0",
        subtitle: draft.subtitle,
        description: `Custom template assembled with ${nodes.length} atoms and ${edges.length} connections.`,
        categories: [draft.category],
        icon: draft.icon,
        iconBg: "rgba(59,130,246,0.10)",
        maintainer: "You",
        lastUpdated: "just now",
        resources: { cpu: 1, ramGb: 1, storageGb: 5 },
        includedFeatures: nodes
          .map((n) => findAtom(n.data.atomType)?.displayName)
          .filter((x): x is string => Boolean(x)),
        actions: [{ name: "Restart", description: "Restart the application" }],
        parameters,
      }
      addTemplate(template)
      setPublishOpen(false)
      navigate(`/store/${draft.slug}`)
    },
    [edges.length, navigate, nodes],
  )

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-6 py-3">
        <Breadcrumb
          items={[
            { label: "Applications", to: "/apps" },
            { label: "App Store", to: "/store" },
            { label: "Create Template" },
          ]}
        />
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
              <Sparkles className="size-5 text-blue-500" />
              Template Builder
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Drag atoms from the palette, wire their ports, and publish.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetGraph} disabled={running}>
              <Trash2 className="size-3.5" />
              Clear
            </Button>
            {running ? (
              <Button variant="outline" size="lg" onClick={stopPreview}>
                <Square className="size-4" />
                Stop
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                onClick={startPreview}
                disabled={nodes.length === 0}
              >
                <Play className="size-4" />
                Run Preview
              </Button>
            )}
            <Button
              variant="primary"
              size="lg"
              onClick={() => setPublishOpen(true)}
              disabled={nodes.length === 0 || running}
            >
              <Upload className="size-4" />
              Publish to Store
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <AtomPalette onDragStart={handlePaletteDragStart} />
        <div ref={reactFlowWrapper} className="relative flex-1 bg-slate-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onInit={(instance) => {
              rfInstance.current = instance as ReactFlowInstance<BuilderNode, Edge>
            }}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={{ type: "atom", markerEnd: ATOM_EDGE_MARKERS }}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            proOptions={{ hideAttribution: true }}
            minZoom={0.3}
            maxZoom={1.5}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="#cbd5e1" />
            <Controls position="bottom-left" showInteractive={false} />
            <MiniMap
              position="bottom-right"
              maskColor="rgba(241,245,249,0.7)"
              nodeColor="#cbd5e1"
              nodeStrokeWidth={3}
              pannable
              zoomable
            />
          </ReactFlow>
        </div>
        {selectedNode && (
          <AtomInspector
            nodeId={selectedNode.id}
            data={selectedNode.data}
            onChange={updateSelectedNode}
            onExposeChange={toggleParamExposure}
            onDelete={deleteSelectedNode}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>

      <PublishDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        onPublish={handlePublish}
      />

      {pendingSpawn && (
        <AtomSuggestPopup
          screenX={pendingSpawn.screenX}
          screenY={pendingSpawn.screenY}
          portType={pendingSpawn.portType}
          direction={pendingSpawn.direction}
          onPick={spawnFromSuggestion}
          onClose={() => setPendingSpawn(null)}
        />
      )}
    </div>
  )
}
