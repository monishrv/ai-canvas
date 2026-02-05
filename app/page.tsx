"use client"

import dynamic from "next/dynamic"

const FlowchartCanvas = dynamic(() => import("@/components/flowchart-canvas"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="text-muted-foreground">Loading canvas...</div>
    </div>
  ),
})

export default function Home() {
  return <FlowchartCanvas />
}
