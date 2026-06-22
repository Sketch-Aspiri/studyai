import { unzipSync } from "fflate"

// PPTX is a ZIP archive; slides live at ppt/slides/slide*.xml
// Text is in <a:t> elements within each slide's XML.
export function extractPptxText(buffer: Buffer): string {
  const zip = unzipSync(new Uint8Array(buffer))
  const decoder = new TextDecoder("utf-8")

  const slideKeys = Object.keys(zip)
    .filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)![0])
      const numB = parseInt(b.match(/\d+/)![0])
      return numA - numB
    })

  const texts: string[] = []

  for (const key of slideKeys) {
    const xml = decoder.decode(zip[key])
    const matches = xml.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g)
    for (const match of matches) {
      const text = match[1].trim()
      if (text) texts.push(text)
    }
    texts.push("\n")
  }

  return texts.join(" ").replace(/\s*\n\s*/g, "\n").trim()
}
