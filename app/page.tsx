"use client"

import dynamic from "next/dynamic"

console.log("[v0] page.tsx loading")

const FlowchartCanvas = dynamic(
  () => {
    console.log("[v0] Dynamic import starting")
    return import("@/components/flowchart-canvas").then((mod) => {
      console.log("[v0] Dynamic import completed", mod)
      return mod.default
    })
  },
  {
    ssr: false,
    loading: () => {
      console.log("[v0] Loading state rendered")
      return (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
          <p style={{ color: "#666" }}>Loading canvas...</p>
        </div>
      )
    },
  }
)

export default function Home() {
  console.log("[v0] Home component rendered")
  return <FlowchartCanvas />
}
