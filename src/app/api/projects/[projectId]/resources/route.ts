import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { ResourceType } from "@prisma/client"
import { generateSummary } from "@/lib/ai/generate-summary"
import { generateConceptMap } from "@/lib/ai/generate-concept-map"
import { z } from "zod"

type RouteParams = { params: Promise<{ projectId: string }> }

const bodySchema = z.object({
  type: z.enum(["SUMMARY", "CONCEPT_MAP", "EXAM", "FLASHCARDS"]),
  document_ids: z.array(z.string()).min(1, "Selecciona al menos un documento."),
  title: z.string().min(1).max(150),
})

function encode(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const resources = await db.resource.findMany({
    where: { project_id: projectId, user_id: user.id },
    orderBy: { created_at: "desc" },
  })
  return NextResponse.json(resources)
}

export async function POST(request: Request, { params }: RouteParams) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const project = await db.project.findFirst({
    where: { id: projectId, user_id: user.id, deleted_at: null },
  })
  if (!project) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })

  const body: unknown = await request.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 })
  }
  const { type, document_ids, title } = parsed.data

  if (type === "EXAM" || type === "FLASHCARDS") {
    return NextResponse.json({ error: "Este tipo de recurso estará disponible próximamente." }, { status: 501 })
  }

  const documents = await db.document.findMany({
    where: { id: { in: document_ids }, project_id: projectId, user_id: user.id },
    select: { id: true, processing_status: true, text_content: true, filename: true },
  })

  const pending = documents.filter((d) => d.processing_status !== "COMPLETED")
  if (pending.length > 0) {
    return NextResponse.json(
      { error: "Hay documentos que aún no han sido procesados. Espera a que estén listos." },
      { status: 409 }
    )
  }

  const documentTexts = documents
    .filter((d) => d.text_content)
    .map((d) => `## ${d.filename}\n\n${d.text_content}`)

  if (documentTexts.length === 0) {
    return NextResponse.json({ error: "Los documentos no tienen contenido extraído." }, { status: 422 })
  }

  const stream = new ReadableStream({
    async start(controller) {
      let resourceId: string | null = null

      try {
        const resource = await db.resource.create({
          data: {
            project_id: projectId,
            user_id: user.id,
            type: type as ResourceType,
            title,
            content: {},
            document_ids,
          },
        })
        resourceId = resource.id
        controller.enqueue(encode({ type: "start", resource_id: resource.id }))

        const generator = type === "SUMMARY"
          ? generateSummary(documentTexts)
          : generateConceptMap(documentTexts)

        let fullText = ""
        for await (const chunk of generator) {
          fullText += chunk
          controller.enqueue(encode({ type: "chunk", content: chunk }))
        }

        let savedContent: object
        if (type === "SUMMARY") {
          savedContent = { text: fullText }
        } else {
          try {
            savedContent = JSON.parse(fullText) as object
          } catch {
            throw new Error("La IA devolvió un formato inválido. Intenta de nuevo.")
          }
        }

        await db.resource.update({
          where: { id: resource.id },
          data: { content: savedContent },
        })

        controller.enqueue(encode({ type: "done", resource_id: resource.id }))
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al generar el recurso."
        controller.enqueue(encode({ type: "error", message }))
        if (resourceId) {
          await db.resource.delete({ where: { id: resourceId } }).catch(() => {})
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
