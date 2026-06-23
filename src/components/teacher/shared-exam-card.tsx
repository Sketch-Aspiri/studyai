"use client"

import Link from "next/link"
import { useState } from "react"

interface SharedExamCardProps {
  exam: {
    id: string
    title: string
    share_code: string
    is_active: boolean
    attempts_count: number
    avg_score: number | null
    created_at: string
  }
  appUrl: string
}

export function SharedExamCard({ exam, appUrl }: SharedExamCardProps) {
  const shareUrl = `${appUrl}/exam/${exam.share_code}`
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-[--radius-md] border border-border p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/teacher/exams/${exam.id}`}
          className="font-semibold text-foreground hover:text-[--teacher] transition-colors line-clamp-2"
        >
          {exam.title}
        </Link>
        <span
          className="flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            background: exam.is_active ? "rgba(5,150,105,0.1)" : "rgba(107,114,128,0.1)",
            color: exam.is_active ? "var(--teacher)" : "var(--muted)",
          }}
        >
          {exam.is_active ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted">
        <span>✏️ {exam.attempts_count} intento{exam.attempts_count !== 1 ? "s" : ""}</span>
        {exam.avg_score !== null && (
          <span>📊 {exam.avg_score}% promedio</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded bg-surface px-2 py-1 text-xs font-mono text-muted border border-border">
          {exam.share_code}
        </code>
        <button
          onClick={copyLink}
          className="flex-shrink-0 rounded-[--radius-sm] border border-border px-3 py-1 text-xs font-medium text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
        >
          {copied ? "¡Copiado!" : "Copiar link"}
        </button>
      </div>

      <Link
        href={`/teacher/exams/${exam.id}`}
        className="text-xs font-medium hover:underline"
        style={{ color: "var(--teacher)" }}
      >
        Ver resultados →
      </Link>
    </div>
  )
}
