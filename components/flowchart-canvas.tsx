"use client"

console.log("[v0] flowchart-canvas.tsx loading")

import { useState, useRef } from "react"
import { Tldraw, createShapeId, Editor } from "tldraw"
import "tldraw/tldraw.css"

interface FlowchartNode {
  id: string
  label: string
}

interface FlowchartEdge {
  source: string
  target: string
  label?: string
}

interface FlowchartData {
  nodes: FlowchartNode[]
  edges: FlowchartEdge[]
}

export default function FlowchartCanvas() {
  console.log("[v0] FlowchartCanvas component rendered")
  const [inputText, setInputText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const editorRef = useRef<Editor | null>(null)

  const handleMount = (editor: Editor) => {
    editorRef.current = editor
  }

  const makeRichText = (text: string) => {
    if (typeof text !== "string") return undefined

    const value = text.trim()
    if (!value) return undefined

    return {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: value }],
        },
      ],
    }
  }

  const drawFlowchart = ({ nodes, edges }: FlowchartData) => {
    const editor = editorRef.current
    if (!editor) return

    const currentIds = Array.from(editor.getCurrentPageShapeIds())
    if (currentIds.length > 0) {
      editor.deleteShapes(currentIds)
    }

    const positionMap: Record<string, { cx: number; cy: number }> = {}
    let x = 100
    let y = 100
    const yGap = 150
    const nodeWidth = 200
    const nodeHeight = 60

    // Draw nodes
    if (Array.isArray(nodes)) {
      nodes.forEach((node) => {
        const shapeId = createShapeId()

        positionMap[node.id] = {
          cx: x + nodeWidth / 2,
          cy: y + nodeHeight / 2,
        }

        const richText = makeRichText(node.label)

        editor.createShape({
          id: shapeId,
          type: "geo",
          x,
          y,
          props: {
            geo: "rectangle",
            w: nodeWidth,
            h: nodeHeight,
            fill: "none",
            ...(richText ? { richText } : {}),
          },
        })

        y += yGap
      })
    }

    // Draw edges
    if (Array.isArray(edges)) {
      edges.forEach((edge) => {
        const from = positionMap[edge.source]
        const to = positionMap[edge.target]
        if (!from || !to) return

        const richText = edge.label ? makeRichText(edge.label) : undefined

        editor.createShape({
          type: "arrow",
          props: {
            start: { x: from.cx, y: from.cy },
            end: { x: to.cx, y: to.cy },
            ...(richText ? { richText } : {}),
          },
        })
      })
    }

    editor.zoomToFit()
  }

  async function handleGenerate() {
    if (!inputText.trim() || isGenerating) return

    setIsGenerating(true)

    try {
      const response = await fetch("/api/flowchart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(errText || "Request failed")
      }

      const data = await response.json()
      console.log("BACKEND DATA:", data)

      const file = data.files?.find(
        (f: { content: string }) =>
          typeof f.content === "string" && f.content.trim().startsWith("{")
      )

      if (!file) {
        console.error("FILES RETURNED BY V0:", data.files)
        throw new Error("No JSON file returned from v0")
      }

      let instructions: FlowchartData
      try {
        instructions = JSON.parse(file.content)
      } catch {
        console.error("RAW FILE CONTENT:", file.content)
        throw new Error("Failed to parse flowchart JSON")
      }

      drawFlowchart(instructions)
    } catch (err) {
      console.error("Generate flowchart failed:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0">
      <div className="absolute bottom-[60px] left-4 z-[1000] bg-card p-3 rounded-lg w-80 shadow-lg border border-border">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Describe your process (e.g. Login system)"
          className="w-full h-24 resize-none mb-2 p-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={isGenerating}
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !inputText.trim()}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? "Generating..." : "Generate Flowchart"}
        </button>
      </div>
      <Tldraw onMount={handleMount} persistenceKey="flowchart-ai" />
    </div>
  )
}
