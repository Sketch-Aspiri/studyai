import { db } from "./db"
import type { User } from "@supabase/supabase-js"

/**
 * Upserts the user row in public.users.
 * Guards against the case where the Supabase trigger that syncs
 * auth.users → public.users didn't run (common in dev or after DB resets).
 */
export async function ensureUser(user: User): Promise<void> {
  await db.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email!,
      name:
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        null,
      avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    },
    update: {},
  })
}
