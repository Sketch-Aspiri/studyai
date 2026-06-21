import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { ToastProvider } from '@/components/ui/Toast'
import { HomePage } from '@/pages/HomePage'
import { UploadPage } from '@/pages/UploadPage'
import { DeckPage } from '@/pages/DeckPage'
import { StudyPage } from '@/pages/StudyPage'
import { SettingsPage } from '@/pages/SettingsPage'

function Header() {
  const location = useLocation()
  if (location.pathname.includes('/study')) return null

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-gray-900 text-lg tracking-tight">
          Flash<span className="text-indigo-500">Cards</span>
        </Link>
        <Link
          to="/settings"
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="Configuración"
        >
          <Settings size={18} />
        </Link>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/deck/:id" element={<DeckPage />} />
              <Route path="/deck/:id/study" element={<StudyPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </ToastProvider>
    </BrowserRouter>
  )
}
