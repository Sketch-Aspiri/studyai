import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { ProjectsClient } from "@/components/student/projects-client"

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const projects = await db.project.findMany({
    where: { user_id: user!.id, deleted_at: null },
    include: { _count: { select: { documents: true, resources: true } } },
    orderBy: { updated_at: "desc" },
  })

  return <ProjectsClient projects={projects} />
}
