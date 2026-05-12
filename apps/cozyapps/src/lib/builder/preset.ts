import type { Edge, Node } from "@xyflow/react"
import { ATOM_EDGE_MARKERS, type AtomNodeData } from "./types.ts"

type BuilderNode = Node<AtomNodeData>

interface PresetGraph {
  nodes: BuilderNode[]
  edges: Edge[]
}

const idle: Pick<AtomNodeData, "status" | "exposed"> = { status: "idle", exposed: [] }

export function presetWordpress(): PresetGraph {
  const nodes: BuilderNode[] = [
    {
      id: "input",
      type: "atom",
      position: { x: 0, y: 0 },
      data: {
        atomType: "user-input",
        params: { fields: "host, name, image" },
        ...idle,
      },
    },
    {
      id: "db",
      type: "atom",
      position: { x: 360, y: -160 },
      data: {
        atomType: "postgres",
        params: { version: "15", storage: "10 GB", replicas: 1 },
        ...idle,
      },
    },
    {
      id: "cache",
      type: "atom",
      position: { x: 360, y: 120 },
      data: {
        atomType: "redis",
        params: { memory: "1 GB", persistence: false },
        ...idle,
      },
    },
    {
      id: "app",
      type: "atom",
      position: { x: 740, y: -20 },
      data: {
        atomType: "container",
        params: { image: "wordpress:6.4", port: 80, replicas: 2 },
        ...idle,
      },
    },
    {
      id: "tls",
      type: "atom",
      position: { x: 1120, y: -180 },
      data: {
        atomType: "tls-cert",
        params: { issuer: "letsencrypt-prod" },
        ...idle,
      },
    },
    {
      id: "ingress",
      type: "atom",
      position: { x: 1120, y: 80 },
      data: {
        atomType: "ingress",
        params: { path: "/", rateLimit: 100 },
        ...idle,
      },
    },
    {
      id: "out",
      type: "atom",
      position: { x: 1480, y: 80 },
      data: {
        atomType: "output",
        params: { label: "Public URL" },
        ...idle,
      },
    },
  ]

  const edges: Edge[] = [
    {
      id: "db-secret->app",
      source: "db",
      target: "app",
      sourceHandle: "credentials",
      targetHandle: "envFromSecret",
      type: "atom",
      data: { portType: "secret-ref" },
    },
    {
      id: "cache-secret->app",
      source: "cache",
      target: "app",
      sourceHandle: "credentials",
      targetHandle: "envFromSecret",
      type: "atom",
      data: { portType: "secret-ref" },
    },
    {
      id: "input-host->tls",
      source: "input",
      target: "tls",
      sourceHandle: "host",
      targetHandle: "host",
      type: "atom",
      data: { portType: "ingress-host" },
    },
    {
      id: "app-svc->ingress",
      source: "app",
      target: "ingress",
      sourceHandle: "service",
      targetHandle: "backend",
      type: "atom",
      data: { portType: "service-ref" },
    },
    {
      id: "input-host->ingress",
      source: "input",
      target: "ingress",
      sourceHandle: "host",
      targetHandle: "host",
      type: "atom",
      data: { portType: "ingress-host" },
    },
    {
      id: "tls->ingress",
      source: "tls",
      target: "ingress",
      sourceHandle: "secret",
      targetHandle: "tls",
      type: "atom",
      data: { portType: "tls-secret-ref" },
    },
    {
      id: "ingress->out",
      source: "ingress",
      target: "out",
      sourceHandle: "url",
      targetHandle: "value",
      type: "atom",
      data: { portType: "string" },
    },
  ]

  return {
    nodes,
    edges: edges.map((e) => ({ ...e, markerEnd: ATOM_EDGE_MARKERS })),
  }
}
