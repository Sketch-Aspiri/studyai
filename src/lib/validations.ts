import { z } from "zod"

export const createProjectSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  emoji: z.string().optional().default("📁"),
  description: z.string().max(300).optional(),
})

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  emoji: z.string().optional(),
  description: z.string().max(300).optional().nullable(),
})

export const generateResourceSchema = z.object({
  type: z.enum(["SUMMARY", "CONCEPT_MAP", "EXAM", "FLASHCARDS"]),
  document_ids: z.array(z.string()).min(1, "Selecciona al menos un documento"),
  title: z.string().min(1).max(150),
})

export const publishExamSchema = z.object({
  resource_id: z.string().min(1),
  title: z.string().min(1).max(200),
  instructions: z.string().max(1000).optional(),
  time_limit_minutes: z.number().int().min(1).max(180).optional(),
})

export const submitAttemptSchema = z.object({
  student_name: z.string().min(1, "El nombre es requerido").max(200),
  student_email: z.string().email().optional().or(z.literal("")),
  answers: z.array(
    z.object({
      question_id: z.string(),
      selected_index: z.number().int().min(0),
    })
  ).min(1),
  started_at: z.string().datetime(),
})

export const updateProfileSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type GenerateResourceInput = z.infer<typeof generateResourceSchema>
export type PublishExamInput = z.infer<typeof publishExamSchema>
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
