import { FileType } from "@prisma/client"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { extractPdfText } from "./pdf-extractor"
import { extractDocxText } from "./docx-extractor"
import { extractPptxText } from "./pptx-extractor"

export async function extractText(storagePath: string, fileType: FileType): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from("documents")
    .download(storagePath)

  if (error || !data) throw new Error(`No se pudo descargar el archivo: ${error?.message}`)

  const buffer = Buffer.from(await data.arrayBuffer())

  switch (fileType) {
    case FileType.PDF:
      return extractPdfText(buffer)
    case FileType.DOCX:
      return extractDocxText(buffer)
    case FileType.PPTX:
      return extractPptxText(buffer)
    case FileType.TXT:
      return buffer.toString("utf-8").trim()
  }
}
