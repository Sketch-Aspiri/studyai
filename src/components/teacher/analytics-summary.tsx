interface AnalyticsSummaryProps {
  totalAttempts: number
  avgScore: number | null
  passRate: number | null
}

export function AnalyticsSummary({ totalAttempts, avgScore, passRate }: AnalyticsSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {[
        { label: "Total intentos", value: totalAttempts, icon: "✏️", suffix: "" },
        {
          label: "Puntaje promedio",
          value: avgScore !== null ? `${avgScore}%` : "—",
          icon: "📊",
          suffix: "",
          color: avgScore !== null ? (avgScore >= 60 ? "#10B981" : "#EF4444") : undefined,
        },
        {
          label: "Tasa de aprobación",
          value: passRate !== null ? `${passRate}%` : "—",
          icon: "✅",
          suffix: "",
          color: passRate !== null ? (passRate >= 60 ? "#10B981" : "#EF4444") : undefined,
        },
      ].map((stat) => (
        <div key={stat.label} className="bg-white rounded-[--radius-md] border border-border p-5">
          <div className="text-2xl mb-2">{stat.icon}</div>
          <div
            className="text-2xl font-semibold"
            style={{ color: stat.color ?? "var(--foreground)" }}
          >
            {stat.value}
          </div>
          <div className="text-sm text-muted">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
