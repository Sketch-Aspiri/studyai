import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { db } from "@/lib/db"
import { FileType } from "@prisma/client"

type RouteParams = { params: Promise<{ projectId: string }> }

const MIME_TO_FILE_TYPE: Record<string, FileType> = {
  "application/pdf": FileType.PDF,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": FileType.DOCX,
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": FileType.PPTX,
  "text/plain": FileType.TXT,
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const FREE_DOC_LIMIT = 3

export async function POST(request: Request, { params }: RouteParams) {
  const { projectId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const project = await db.project.findFirst({
    where: { id: projectId, user_id: user.id, deleted_at: null },
  })
  if (!project) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { subscription_status: true },
  })
  if (!dbUser || dbUser.subscription_status === "FREE") {
    const docCount = await db.document.count({ where: { project_id: projectId } })
    if (docCount >= FREE_DOC_LIMIT) {
      return NextResponse.json(
        { error: `Límite de ${FREE_DOC_LIMIT} documentos por proyecto en el plan Gratuito.` },
        { status: 403 }
      )
    }
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "Archivo requerido" }, { status: 400 })

  const fileType = MIME_TO_FILE_TYPE[file.type]
  if (!fileType) {
    return NextResponse.json(
      { error: "Tipo no soportado. Sube un PDF, DOCX, PPTX o TXT." },
      { status: 400 }
    )
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "El archivo no puede superar los 10 MB." }, { status: 400 })
  }

  // Create DB record to get the ID for the storage path
  const document = await db.document.create({
    data: {
      project_id: projectId,
      user_id: user.id,
      filename: file.name,
      file_url: "",
      file_type: fileType,
      file_size: file.size,
      processing_status: "PENDING",
    },
  })

  const ext = file.name.split(".").pop()?.toLowerCase() ?? fileType.toLowerCase()
  const storagePath = `${user.id}/${projectId}/${document.id}.${ext}`

  const buffer = await file.arrayBuffer()
  const { error: storageError } = await supabaseAdmin.storage
    .from("documents")
    .upload(storagePath, buffer, { contentType: file.type, upsert: false })

  if (storageError) {
    await db.document.delete({ where: { id: document.id } })
    return NextResponse.json({ error: "Error al subir el archivo al storage." }, { status: 500 })
  }

  const updated = await db.document.update({
    where: { id: document.id },
    data: { file_url: storagePath },
  })

  return NextResponse.json(updated, { status: 201 })
}
