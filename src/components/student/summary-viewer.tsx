import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface SummaryViewerProps {
  content: string
}

export function SummaryViewer({ content }: SummaryViewerProps) {
  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
