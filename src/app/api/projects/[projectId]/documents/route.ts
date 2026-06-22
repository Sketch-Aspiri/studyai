import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { db } from "@/lib/db"
import { ensureUser } from "@/lib/ensure-user"
import { FileType } from "@prisma/client"
import { extractText } from "@/lib/file-processing/extract-text"

type RouteParams = { params: Promise<{ projectId: string }> }

const MIME_TO_FILE_TYPE: Record<string, FileType> = {
  "application/pdf": FileType.PDF,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": FileType.DOCX,
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": FileType.PPTX,
  "text/plain": FileType.TXT,
}

const MAX_FILE_SIZE = 10 * 1024 * 1024
const FREE_DOC_LIMIT = 3

export async function POST(request: Request, { params }: RouteParams) {
  const { projectId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  await ensureUser(user)

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

  // Create record with PENDING status to get the ID for the storage path
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

  // Auto-create private bucket if it doesn't exist yet
  const { data: buckets } = await supabaseAdmin.storage.listBuckets()
  if (!buckets?.find((b) => b.name === "documents")) {
    await supabaseAdmin.storage.createBucket("documents", { public: false })
  }

  const buffer = await file.arrayBuffer()
  const { error: storageError } = await supabaseAdmin.storage
    .from("documents")
    .upload(storagePath, buffer, { contentType: file.type, upsert: false })

  if (storageError) {
    await db.document.delete({ where: { id: document.id } })
    console.error("[Storage upload error]", storageError)
    return NextResponse.json(
      { error: `Error al subir al storage: ${storageError.message}` },
      { status: 500 }
    )
  }

  await db.document.update({ where: { id: document.id }, data: { file_url: storagePath } })

  // Extract text — update status to PROCESSING, then COMPLETED or FAILED
  await db.document.update({
    where: { id: document.id },
    data: { processing_status: "PROCESSING" },
  })

  try {
    const textContent = await extractText(storagePath, fileType)
    const completed = await db.document.update({
      where: { id: document.id },
      data: { text_content: textContent, processing_status: "COMPLETED" },
    })
    return NextResponse.json(completed, { status: 201 })
  } catch {
    const failed = await db.document.update({
      where: { id: document.id },
      data: { processing_status: "FAILED" },
    })
    return NextResponse.json(failed, { status: 201 })
  }
}
