import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getSettings, saveSettings } from '@/services/storageService'
import { useToast } from '@/components/ui/Toast'

export function ApiKeyForm() {
  const { showToast } = useToast()
  const settings = getSettings()
  const [apiKey, setApiKey] = useState(settings.apiKey)
  const [defaultCount, setDefaultCount] = useState(settings.defaultCardCount)
  const [showKey, setShowKey] = useState(false)

  const handleSave = () => {
    if (!apiKey.trim()) {
      showToast('Ingresa una API key válida', 'error')
      return
    }
    saveSettings({ apiKey: apiKey.trim(), defaultCardCount: defaultCount })
    showToast('Configuración guardada')
  }

  const maskedKey =
    apiKey.length > 8
      ? apiKey.slice(0, 7) + '••••••••' + apiKey.slice(-4)
      : apiKey

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Claude API Key
        </label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={showKey ? apiKey : maskedKey}
            onChange={(e) => setApiKey(e.target.value)}
            onFocus={() => setShowKey(true)}
            placeholder="sk-ant-..."
            className="w-full h-10 pl-3 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          />
          <button
            type="button"
            onClick={() => setShowKey((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Obtén tu key en{' '}
          <span className="text-indigo-500">console.anthropic.com/settings/keys</span>. Se
          guarda solo en tu navegador.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cantidad de flashcards por defecto
        </label>
        <select
          value={defaultCount}
          onChange={(e) => setDefaultCount(Number(e.target.value))}
          className="h-10 pl-3 pr-8 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {[10, 20, 30, 50].map((n) => (
            <option key={n} value={n}>
              {n} cards
            </option>
          ))}
        </select>
      </div>

      <Button onClick={handleSave}>Guardar configuración</Button>
    </div>
  )
}
