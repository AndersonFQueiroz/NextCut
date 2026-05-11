import ComponentsShowcase from './pages/ComponentsShowcase'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <h1 className="text-xl font-bold">NextCut</h1>
          <p className="text-sm text-slate-600">Setup frontend — componentes base</p>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <ComponentsShowcase />
      </main>
    </div>
  )
}
