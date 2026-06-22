"use client"

import { useRef, useState } from "react"

interface StreamEvent {
  type: "start" | "chunk" | "done" | "error"
  resource_id?: string
  content?: string
  message?: string
}

export interface StreamState {
  isStreaming: boolean
  content: string
  resourceId: string | null
  error: string | null
}

export function useGenerationStream() {
  const [state, setState] = useState<StreamState>({
    isStreaming: false,
    content: "",
    resourceId: null,
    error: null,
  })
  const abortRef = useRef<AbortController | null>(null)

  async function startStream(
    projectId: string,
    type: string,
    documentIds: string[],
    title: string
  ) {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    setState({ isStreaming: true, content: "", resourceId: null, error: null })

    try {
      const response = await fetch(`/api/projects/${projectId}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, document_ids: documentIds, title }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        const body = (await response.json()) as { error?: string }
        setState({ isStreaming: false, content: "", resourceId: null, error: body.error ?? "Error al generar." })
        return
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const event: StreamEvent = JSON.parse(line.slice(6))

          if (event.type === "chunk" && event.content) {
            setState((prev) => ({ ...prev, content: prev.content + event.content }))
          } else if (event.type === "done" && event.resource_id) {
            setState((prev) => ({ ...prev, isStreaming: false, resourceId: event.resource_id! }))
          } else if (event.type === "error") {
            setState((prev) => ({ ...prev, isStreaming: false, error: event.message ?? "Error desconocido." }))
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setState((prev) => ({ ...prev, isStreaming: false, error: "Error de conexión." }))
      }
    }
  }

  function cancel() {
    abortRef.current?.abort()
    setState((prev) => ({ ...prev, isStreaming: false }))
  }

  function reset() {
    setState({ isStreaming: false, content: "", resourceId: null, error: null })
  }

  return { state, startStream, cancel, reset }
}
