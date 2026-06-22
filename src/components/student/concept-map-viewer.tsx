"use client"

import { useMemo } from "react"
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  MarkerType,
  type Node,
  type Edge,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import Dagre from "@dagrejs/dagre"

export interface ConceptMapData {
  nodes: Array<{ id: string; label: string; type: "main" | "sub" | "detail" }>
  edges: Array<{ source: string; target: string; label?: string }>
}

const NODE_SIZES = {
  main: { w: 200, h: 60 },
  sub: { w: 175, h: 50 },
  detail: { w: 155, h: 42 },
} as const

const NODE_STYLE: Record<string, React.CSSProperties> = {
  main: {
    background: "#4F46E5",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13,
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    lineHeight: 1.3,
  },
  sub: {
    background: "#7C3AED",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 12,
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    lineHeight: 1.3,
  },
  detail: {
    background: "#F9FAFB",
    color: "#111827",
    border: "1px solid #E5E7EB",
    borderRadius: 6,
    fontSize: 11,
    padding: "0 10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    lineHeight: 1.3,
  },
}

function buildLayoutedGraph(data: ConceptMapData): { nodes: Node[]; edges: Edge[] } {
  const g = new Dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: "TB", nodesep: 60, ranksep: 80, marginx: 40, marginy: 40 })

  data.nodes.forEach((n) => {
    const { w, h } = NODE_SIZES[n.type] ?? NODE_SIZES.detail
    g.setNode(n.id, { width: w, height: h })
  })
  data.edges.forEach((e) => g.setEdge(e.source, e.target))

  Dagre.layout(g)

  const nodes: Node[] = data.nodes.map((n) => {
    const pos = g.node(n.id)
    const { w, h } = NODE_SIZES[n.type] ?? NODE_SIZES.detail
    return {
      id: n.id,
      position: { x: pos.x - w / 2, y: pos.y - h / 2 },
      data: { label: n.label },
      style: { ...NODE_STYLE[n.type ?? "detail"], width: w, height: h },
    }
  })

  const edges: Edge[] = data.edges.map((e, i) => ({
    id: `e-${i}`,
    source: e.source,
    target: e.target,
    label: e.label,
    labelStyle: { fontSize: 10, fill: "#6B7280" },
    style: { stroke: "#D1D5DB", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#D1D5DB", width: 16, height: 16 },
  }))

  return { nodes, edges }
}

interface ConceptMapViewerProps {
  content: ConceptMapData
}

export function ConceptMapViewer({ content }: ConceptMapViewerProps) {
  const { nodes, edges } = useMemo(() => buildLayoutedGraph(content), [content])

  return (
    <div className="rounded-[--radius-md] border border-border overflow-hidden" style={{ height: 480 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Controls showInteractive={false} />
        <MiniMap nodeColor={(n) => (n.style?.background as string) ?? "#E5E7EB"} nodeStrokeWidth={0} />
        <Background color="#F3F4F6" />
      </ReactFlow>
    </div>
  )
}
