import { ApiKeyForm } from '@/components/ApiKeyForm'

export function SettingsPage() {
  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Configuración</h1>
      <p className="text-gray-500 text-sm mb-8">
        Configura tu API key de Claude para generar flashcards.
      </p>
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <ApiKeyForm />
      </div>
    </div>
  )
}
