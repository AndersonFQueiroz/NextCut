import { Scissors, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'

export function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#080808] px-4 py-10 text-stone-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(120,18,34,0.22),transparent_45%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1),rgba(0,0,0,0.6))]" />

      <div className="relative z-10 w-full max-w-[460px]">
        <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.4em] text-red-600">
          Painel administrador
        </p>

        <Card className="bg-[#111111] border border-[#242424] rounded-xl shadow-2xl shadow-black/70">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#7a1520]">
              <Scissors className="h-5 w-5 text-stone-100" />
            </span>
            <div>
              <h1 className="font-serif text-3xl font-bold uppercase tracking-[0.25em] text-stone-50">NextCut</h1>
              <p className="mt-2 text-sm text-stone-400">Gerenciamento da fila de atendimento.</p>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-[#242424] bg-[#111111] p-4">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-red-600">
              <Users className="h-4 w-4" />
              <span>Fila atual</span>
            </div>
            <p className="mt-3 text-xl font-semibold text-stone-100">Rotas configuradas</p>
            <p className="mt-2 text-sm text-stone-400">
              A rota /admin esta funcionando e pronta para receber a tela completa de gerenciamento.
            </p>
          </div>

          <Button variant="secondary" fullWidth className="mt-8 h-12" onClick={() => navigate('/login')}>
            Voltar ao login
          </Button>
        </Card>
      </div>
    </main>
  )
}
