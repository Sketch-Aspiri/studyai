interface StudyProgressProps {
  current: number
  total: number
}

export function StudyProgress({ current, total }: StudyProgressProps) {
  const percent = total > 0 ? ((current) / total) * 100 : 0

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-500 mb-2">
        <span>
          Carta {current} de {total}
        </span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
