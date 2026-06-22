# StudyAI

Plataforma SaaS multiusuario de recursos de estudio generados con IA (Claude). Dos roles: Estudiante (genera recursos propios) y Maestro (genera exámenes y los comparte con alumnos).

## Commands

- `pnpm dev` — Start dev server (localhost:3000)
- `pnpm build` — Production build
- `pnpm lint` — ESLint
- `pnpm test` — Vitest
- `pnpm test:e2e` — Playwright
- `pnpm db:migrate` — Crear y correr migración Prisma
- `pnpm db:generate` — Regenerar tipos Prisma
- `pnpm db:push` — Push schema sin migración (dev only)
- `pnpm db:studio` — Prisma Studio

## Installing packages

IMPORTANT: Always use `pnpm add --ignore-scripts` when adding new packages. The project is in OneDrive, which causes an EPERM error with pnpm's atomic rename when scripts run. Example:
```
pnpm add <package> --ignore-scripts
```

## Tech Stack

Next.js 16 (App Router) + TypeScript strict + Tailwind v4 + shadcn/ui (@base-ui/react) + Supabase (DB + Storage + Auth) + Prisma + Anthropic SDK + Stripe + Upstash Redis + React Flow

## Architecture

### Route Groups
- `(marketing)/` — Público: landing, pricing. Sin auth.
- `(student)/` — App estudiante. Requiere auth + role=STUDENT.
- `(teacher)/` — App maestro. Requiere auth + role=TEACHER.
- `exam/[shareCode]/` — Examen público compartido por maestro. Sin login requerido.
- `onboarding/` — Selección de rol post-registro.
- `api/` — API routes: proyectos, documentos, recursos (SSE), shared-exams, teacher, Stripe.

### Directory Structure
- `src/components/ui/` — shadcn/ui. NO modificar directamente.
- `src/components/student/` — Componentes exclusivos del estudiante.
- `src/components/teacher/` — Componentes exclusivos del maestro.
- `src/components/shared/` — Compartidos por ambos roles.
- `src/lib/supabase/` — client.ts (browser), server.ts (SSR), middleware.ts.
- `src/lib/ai/` — claude.ts, prompts.ts, generate-{tipo}.ts por cada recurso.
- `src/lib/file-processing/` — extract-text.ts + extractores por tipo de archivo.
- `src/lib/db.ts` — Prisma singleton. Importar SOLO desde aquí.
- `src/lib/rate-limiter.ts` — Upstash: verificar límites antes de llamar a Claude.
- `src/types/index.ts` — Tipos globales: ResourceType, ExamData, FlashcardsData, etc.

### Data Flow
- Lectura: Server Components → Prisma directo. Sin API calls innecesarios.
- Mutaciones: Server Actions o API routes. Nunca queries desde Client Components.
- Generación IA: POST /api/projects/[id]/resources → ReadableStream SSE.
- Auth: middleware.ts verifica sesión + rol y redirige según corresponda.

### AI Resources (4 types)
- `SUMMARY` — Claude genera Markdown. Render con react-markdown.
- `CONCEPT_MAP` — Claude genera JSON {nodes, edges}. Render con @xyflow/react.
- `EXAM` — Claude genera JSON {questions[]}. UI interactiva con auto-corrección.
- `FLASHCARDS` — Claude genera JSON {flashcards[]}. Flip animation con CSS puro.

## Key Patterns

- Server Components por defecto. "use client" solo cuando hay hooks, eventos, o browser APIs.
- TODOS los API routes obtienen user_id de la sesión Supabase (nunca del body/params).
- Verificar ownership antes de leer o escribir cualquier recurso.
- Verificar firma de Stripe en webhook SIEMPRE con `stripe.webhooks.constructEvent()`.
- Verificar rate limit ANTES de llamar a la API de Anthropic.
- Para agregar nuevo tipo de recurso: enum ResourceType → prompts.ts → generate-{tipo}.ts → {tipo}-viewer.tsx → generation-panel.tsx

## Design System

### Colors
- Primary (estudiante): #4F46E5 (Indigo 600)
- Primary hover: #4338CA
- Teacher accent: #059669 (Emerald 600)
- Background: #FFFFFF | Surface: #F9FAFB | Text: #111827
- Muted: #6B7280 | Border: #E5E7EB
- Success: #10B981 | Warning: #F59E0B | Destructive: #EF4444

### Typography
- Todo: Inter (next/font) — H1:36/700, H2:24/600, H3:18/600, Body:15/400
- Código: JetBrains Mono 13px

### Style
- Border radius: 6px inputs, 8px cards, 12px modals
- Transiciones: 150ms ease | Shadows: shadow-sm en cards
- Flashcard flip: CSS perspective + rotateY (clases en globals.css: .flashcard-scene, .flashcard-card, .is-flipped)

## Environment Variables

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Supabase pooler (Prisma runtime) |
| `DIRECT_URL` | Supabase direct (migraciones) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (segura para cliente) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (NUNCA al cliente) |
| `ANTHROPIC_API_KEY` — Claude API (NUNCA al cliente) |
| `STRIPE_SECRET_KEY` | Stripe secret (NUNCA al cliente) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key |
| `STRIPE_WEBHOOK_SECRET` | Verificar firma de webhooks |
| `STRIPE_PRO_PRICE_ID` | ID del precio Pro |
| `UPSTASH_REDIS_REST_URL` | URL Upstash Redis |
| `UPSTASH_REDIS_REST_TOKEN` | Token Upstash Redis |
| `NEXT_PUBLIC_APP_URL` | URL de la app |

## Reglas No Negociables

1. NUNCA exponer API keys al cliente: ANTHROPIC_API_KEY, STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY.
2. SIEMPRE verificar user_id de la sesión Supabase en API routes. Nunca del body.
3. SIEMPRE verificar ownership antes de devolver o modificar cualquier recurso.
4. SIEMPRE verificar firma de Stripe con constructEvent() antes de procesar webhook.
5. SIEMPRE verificar rate limit ANTES de llamar a la API de Anthropic.
6. TypeScript strict. Nunca usar `any`. Usar `unknown` + narrowing.
7. Validar todos los inputs de API con Zod antes de tocar la DB.
8. Instalar paquetes con `pnpm add --ignore-scripts` (OneDrive + pnpm EPERM workaround).
