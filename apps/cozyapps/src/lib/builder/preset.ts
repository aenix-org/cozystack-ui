import type { Edge, Node } from "@xyflow/react"
import { ATOM_EDGE_MARKERS, type AtomNodeData } from "./types.ts"

type BuilderNode = Node<AtomNodeData>

interface PresetGraph {
  nodes: BuilderNode[]
  edges: Edge[]
}

const idle: Pick<AtomNodeData, "status"> = { status: "idle" }

export function presetWordpress(): PresetGraph {
  const nodes: BuilderNode[] = [
    {
      id: "input",
      type: "atom",
      position: { x: 0, y: 0 },
      data: {
        atomType: "user-input",
        params: { fields: "site title, domain, admin email" },
        ...idle,
      },
    },
    {
      id: "db",
      type: "atom",
      position: { x: 320, y: -120 },
      data: {
        atomType: "postgres",
        params: { version: "15", storage: "10 GB", replicas: 1 },
        ...idle,
      },
    },
    {
      id: "cache",
      type: "atom",
      position: { x: 320, y: 120 },
      data: {
        atomType: "redis",
        params: { memory: "1 GB", persistence: false },
        ...idle,
      },
    },
    {
      id: "app",
      type: "atom",
      position: { x: 640, y: 0 },
      data: {
        atomType: "container",
        params: { image: "wordpress:6.4", port: 80, replicas: 2 },
        ...idle,
      },
    },
    {
      id: "tls",
      type: "atom",
      position: { x: 960, y: -120 },
      data: {
        atomType: "tls-cert",
        params: { issuer: "letsencrypt-prod" },
        ...idle,
      },
    },
    {
      id: "ingress",
      type: "atom",
      position: { x: 960, y: 120 },
      data: {
        atomType: "ingress",
        params: { path: "/", rateLimit: 100 },
        ...idle,
      },
    },
    {
      id: "out",
      type: "atom",
      position: { x: 1280, y: 120 },
      data: {
        atomType: "output",
        params: { label: "Public URL" },
        ...idle,
      },
    },
  ]

  const edges: Edge[] = [
    {
      id: "db->app",
      source: "db",
      target: "app",
      sourceHandle: "conn",
      targetHandle: "db",
      type: "atom",
      data: { portType: "postgres-conn" },
    },
    {
      id: "cache->app",
      source: "cache",
      target: "app",
      sourceHandle: "conn",
      targetHandle: "cache",
      type: "atom",
      data: { portType: "redis-conn" },
    },
    {
      id: "input->tls",
      source: "input",
      target: "tls",
      sourceHandle: "domain",
      targetHandle: "domain",
      type: "atom",
      data: { portType: "domain" },
    },
    {
      id: "app->ingress",
      source: "app",
      target: "ingress",
      sourceHandle: "service",
      targetHandle: "service",
      type: "atom",
      data: { portType: "service-ref" },
    },
    {
      id: "input->ingress",
      source: "input",
      target: "ingress",
      sourceHandle: "domain",
      targetHandle: "domain",
      type: "atom",
      data: { portType: "domain" },
    },
    {
      id: "tls->ingress",
      source: "tls",
      target: "ingress",
      sourceHandle: "secret",
      targetHandle: "tls",
      type: "atom",
      data: { portType: "secret-ref" },
    },
    {
      id: "ingress->out",
      source: "ingress",
      target: "out",
      sourceHandle: "url",
      targetHandle: "value",
      type: "atom",
      data: { portType: "url" },
    },
  ]

  return {
    nodes,
    edges: edges.map((e) => ({ ...e, markerEnd: ATOM_EDGE_MARKERS })),
  }
}
