import { NextRequest, NextResponse } from "next/server"
import { v0 } from "v0-sdk"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      )
    }

    const chat = await v0.chats.create({
      message: `
Create exactly ONE file named "flowchart.json".

The file content MUST be valid JSON.
Do NOT include markdown.
Do NOT include explanations.
Do NOT include backticks.

The JSON schema MUST be exactly:

{
  "nodes": [
    { "id": "string", "label": "string" }
  ],
  "edges": [
    { "source": "string", "target": "string", "label": "string" }
  ]
}

Description:
${text}
`,
    })

    if (!chat?.files?.length) {
      return NextResponse.json(
        { error: "No files returned from v0" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      files: chat.latestVersion?.files ?? [],
    })
  } catch (err) {
    console.error("FLOWCHART ERROR:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}
