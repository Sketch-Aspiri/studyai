import Anthropic from '@anthropic-ai/sdk'
import type { FlashCard } from '@/types'

const MODEL = 'claude-haiku-4-5-20251001'

function buildPrompt(text: string, count: number): string {
  return `Eres un experto educador. A continuación te presento texto extraído de un PDF de estudio.
Genera exactamente ${count} flashcards para estudiar este material.

Responde ÚNICAMENTE con un array JSON válido con esta estructura exacta:
[
  { "front": "Pregunta o concepto", "back": "Respuesta o explicación" }
]

Sin texto adicional, sin markdown, solo el JSON.

TEXTO DEL PDF:
${text}`
}

export async function generateFlashcards(
  text: string,
  count: number,
  apiKey: string
): Promise<FlashCard[]> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: buildPrompt(text, count) }],
  })

  const block = message.content[0]
  const rawContent = block?.type === 'text' ? block.text : null
  if (!rawContent) throw new Error('Respuesta vacía de Claude.')

  let parsed: Array<{ front: string; back: string }>
  try {
    parsed = JSON.parse(rawContent.trim()) as Array<{ front: string; back: string }>
  } catch {
    throw new Error('Claude no devolvió un JSON válido. Intenta de nuevo.')
  }

  if (!Array.isArray(parsed)) {
    throw new Error('La respuesta de Claude no es un array. Intenta de nuevo.')
  }

  return parsed.map((item) => ({
    id: crypto.randomUUID(),
    front: item.front,
    back: item.back,
    status: 'new' as const,
  }))
}
