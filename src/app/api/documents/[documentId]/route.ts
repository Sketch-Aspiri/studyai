import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { db } from "@/lib/db"

type RouteParams = { params: Promise<{ documentId: string }> }

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { documentId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const document = await db.document.findFirst({
    where: { id: documentId, user_id: user.id },
  })
  if (!document) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  // Remove from storage if path is set
  if (document.file_url) {
    await supabaseAdmin.storage.from("documents").remove([document.file_url])
  }

  await db.document.delete({ where: { id: documentId } })

  return new NextResponse(null, { status: 204 })
}
