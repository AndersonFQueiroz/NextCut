import { Navigate, Route, Routes } from 'react-router-dom'
import ComponentsShowcase from './pages/ComponentsShowcase'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <div className="min-h-screen bg-slate-100 text-slate-900">
            <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
              <div className="mx-auto max-w-3xl px-4 py-6">
                <h1 className="text-xl font-bold">NextCut</h1>
                <p className="text-sm text-slate-600">Setup frontend - componentes base</p>
              </div>
            </header>
            <main className="mx-auto max-w-3xl px-4 py-8">
              <ComponentsShowcase />
            </main>
          </div>
        }
      />
    </Routes>
  )
}
