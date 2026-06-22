import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"

type RouteParams = { params: Promise<{ resourceId: string }> }

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { resourceId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const resource = await db.resource.findFirst({
    where: { id: resourceId, user_id: user.id },
  })
  if (!resource) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  await db.resource.delete({ where: { id: resourceId } })
  return new NextResponse(null, { status: 204 })
}
