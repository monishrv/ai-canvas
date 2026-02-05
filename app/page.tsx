"use client"

import dynamic from "next/dynamic"

const FlowchartCanvas = dynamic(
  () => import("@/components/flowchart-canvas").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
        <p style={{ color: "#666" }}>Loading canvas...</p>
      </div>
    ),
  }
)

export default function Home() {
  return <FlowchartCanvas />
}
