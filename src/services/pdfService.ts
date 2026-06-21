import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

const MAX_PAGES = 50
const MAX_CHARS = 12000

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const pagesToRead = Math.min(pdf.numPages, MAX_PAGES)
  const textParts: string[] = []

  for (let i = 1; i <= pagesToRead; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    textParts.push(pageText)
  }

  const fullText = textParts.join('\n\n').trim()

  if (!fullText) {
    throw new Error(
      'Este PDF no contiene texto extraíble. Puede ser un PDF escaneado o protegido.'
    )
  }

  return fullText.length > MAX_CHARS ? fullText.slice(0, MAX_CHARS) : fullText
}
