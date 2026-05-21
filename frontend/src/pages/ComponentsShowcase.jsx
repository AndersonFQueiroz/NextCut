import { Phone, User } from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'

export default function ComponentsShowcase() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#080808] px-4 py-10 text-stone-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(120,18,34,0.22),transparent_45%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1),rgba(0,0,0,0.6))]" />

      <div className="relative z-10 w-full max-w-[460px]">
        <Card className="bg-[#111111] border border-[#242424] rounded-xl shadow-2xl shadow-black/70">
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-red-600">Componentes</p>
          <h1 className="mt-3 font-serif text-3xl font-bold uppercase tracking-[0.25em] text-stone-50">NextCut</h1>
          <p className="mt-2 text-sm text-stone-400">Base visual do painel administrativo.</p>

          <div className="mt-8 space-y-5">
            <Input admin label="Nome" name="demo-name" placeholder="Digite seu nome" icon={<User className="h-4 w-4" />} />
            <Input
              admin
              label="Telefone"
              name="demo-phone"
              placeholder="(00) 00000-0000"
              error="Este campo e obrigatorio."
              icon={<Phone className="h-4 w-4" />}
            />
            <Button variant="danger" fullWidth>
              Acao principal
            </Button>
            <Button variant="secondary" fullWidth>
              Acao secundaria
            </Button>
          </div>
        </Card>
      </div>
    </main>
  )
}
