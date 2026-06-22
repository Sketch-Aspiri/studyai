import type { ResourceType } from "@prisma/client"

export const RESOURCE_PROMPTS: Record<ResourceType, string> = {
  SUMMARY: `Eres un asistente académico experto. Crea un resumen completo y bien estructurado del material de estudio proporcionado.

El resumen debe:
- Estar en el mismo idioma que el material original
- Usar formato Markdown: encabezados (##, ###), listas (- ), negrita (**) para términos clave
- Capturar todos los conceptos y puntos principales
- Tener secciones claras y jerarquizadas
- Ser entre 400 y 1000 palabras según la complejidad del material

Devuelve ÚNICAMENTE el resumen en Markdown. Sin introducción ni explicación adicional.`,

  CONCEPT_MAP: `Eres un asistente académico experto. Crea un mapa conceptual del material de estudio proporcionado.

Devuelve ÚNICAMENTE el siguiente JSON válido, sin texto adicional:
{
  "nodes": [
    { "id": "1", "label": "Concepto Principal", "type": "main" },
    { "id": "2", "label": "Sub-concepto", "type": "sub" },
    { "id": "3", "label": "Detalle", "type": "detail" }
  ],
  "edges": [
    { "source": "1", "target": "2", "label": "incluye" }
  ]
}

Reglas:
- Tipos de nodos: "main" (1-2 nodos centrales), "sub" (3-6 secundarios), "detail" (detalles)
- Entre 8 y 15 nodos en total
- Entre 7 y 14 conexiones
- Las etiquetas de los nodos deben ser concisas (máx 4 palabras)`,

  EXAM: `Eres un asistente académico experto. Crea un examen de opción múltiple del material de estudio proporcionado.

Devuelve ÚNICAMENTE el siguiente JSON válido, sin texto adicional:
{
  "questions": [
    {
      "id": "q1",
      "question": "¿Cuál es...?",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct_index": 0,
      "explanation": "La respuesta correcta es A porque..."
    }
  ]
}

Reglas:
- Exactamente 10 preguntas: 3 fáciles, 5 medias, 2 difíciles
- Las opciones incorrectas deben ser plausibles
- La explicación debe ser clara y didáctica
- El índice correct_index es 0-3 (posición en el array options)`,

  FLASHCARDS: `Eres un asistente académico experto. Crea un conjunto de flashcards del material de estudio proporcionado.

Devuelve ÚNICAMENTE el siguiente JSON válido, sin texto adicional:
{
  "flashcards": [
    {
      "id": "f1",
      "front": "¿Qué es la fotosíntesis?",
      "back": "Proceso por el cual las plantas convierten luz solar, agua y CO₂ en glucosa y oxígeno.",
      "category": "Biología Celular"
    }
  ]
}

Reglas:
- Entre 12 y 20 flashcards cubriendo los conceptos más importantes
- El frente: pregunta concisa o término clave
- El reverso: respuesta completa pero directa (máx 3 oraciones)
- Agrupa conceptos relacionados bajo la misma categoría`,
}
