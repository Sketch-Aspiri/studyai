import { anthropic } from "@/lib/ai/claude"

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const base64 = buffer.toString("base64")

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64,
            },
          },
          {
            type: "text",
            text: "Extrae todo el texto de este documento. Devuelve únicamente el texto extraído, manteniendo la estructura de párrafos. No añadas comentarios ni explicaciones.",
          },
        ],
      },
    ],
  })

  const block = message.content.find((b) => b.type === "text")
  if (!block || block.type !== "text") throw new Error("Claude no devolvió texto")
  return block.text
}
