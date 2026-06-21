interface GeneratingLoaderProps {
  phase: 'reading' | 'generating'
}

export function GeneratingLoader({ phase }: GeneratingLoaderProps) {
  const message =
    phase === 'reading'
      ? 'Leyendo PDF...'
      : 'Generando flashcards con Claude...'

  const sub =
    phase === 'reading'
      ? 'Extrayendo el texto del documento'
      : 'Esto puede tomar unos segundos'

  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-200 rounded-full" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-900">{message}</p>
        <p className="text-sm text-gray-500 mt-1">{sub}</p>
      </div>
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-400 rounded-full animate-pulse" style={{ width: '60%' }} />
      </div>
    </div>
  )
}
