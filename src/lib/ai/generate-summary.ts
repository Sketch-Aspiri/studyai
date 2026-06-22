import { anthropic } from "./claude"
import { RESOURCE_PROMPTS } from "./prompts"

export async function* generateSummary(documentTexts: string[]): AsyncGenerator<string> {
  const combined = documentTexts.join("\n\n---\n\n")

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: RESOURCE_PROMPTS.SUMMARY,
    messages: [
      {
        role: "user",
        content: `Aquí está el material de estudio:\n\n${combined}`,
      },
    ],
  })

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text
    }
  }
}
