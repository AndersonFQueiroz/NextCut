import { CalendarCheck, Lock, Mail, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import nextCutLogo from '../../novo logo.png'

export function LoginPage() {
  const navigate = useNavigate()

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#080808] px-4 py-10 text-stone-100">
      {/* Luz vermelha centralizada que emana de trás do card */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(110,8,18,0.55),transparent_75%)]" />

      {/* Escurecimento nas bordas para dar profundidade */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.75)_100%)]" />

      <div className="relative z-10 w-full max-w-[460px]">
        <header className="mb-8 flex flex-col items-center text-center">
          <img src={nextCutLogo} alt="Logo NextCut" className="h-48 w-48 object-contain" />
          <p className="mb-2 text-[10px] font-semibold tracking-[0.4em] text-stone-300">sua vez, sem espera.</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-red-600">Painel do barbeiro</p>
        </header>

        <section className="rounded-xl border border-[#8f1728] bg-[#111111] p-6 shadow-[0_0_22px_rgba(143,23,40,0.42),0_0_72px_rgba(120,18,34,0.38)]">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#7a1520]">
              <CalendarCheck className="h-5 w-5 text-stone-100" />
            </span>
            <div>
              <h1 className="font-serif text-xl font-bold tracking-normal text-stone-50">
                Acesso restrito
              </h1>
              <p className="mt-2 text-sm text-stone-400">Veja a agenda e os atendimentos do dia</p>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#aaa]">Usuario</span>
              <span className="relative block">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-red-600">
                  <User className="h-4 w-4" />
                </span>
                <input
                  name="username"
                  placeholder="seu.usuario"
                  className="mt-2 h-12 w-full rounded-lg border border-[#333] bg-[#1e1e1e] px-4 py-3 pl-10 text-sm text-white placeholder:text-[#555] transition focus:border-[#8b1a1a] focus:outline-none"
                />
              </span>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#aaa]">Senha</span>
              <span className="relative block">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-red-600">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="mt-2 h-12 w-full rounded-lg border border-[#333] bg-[#1e1e1e] px-4 py-3 pl-10 text-sm text-white placeholder:text-[#555] transition focus:border-[#8b1a1a] focus:outline-none"
                />
              </span>
            </label>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 text-sm text-stone-400">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-[#333] bg-[#1e1e1e] accent-[#7a1520]" />
              <span>Manter conectado</span>
            </label>
            <a href="#" className="text-red-600 hover:text-stone-100">
              Esqueci minha senha
            </a>
          </div>

          <button
            type="button"
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#9f1d35] px-5 py-3 text-sm font-semibold uppercase tracking-widest text-stone-100 transition hover:bg-[#b42640]"
            onClick={() => navigate('/admin')}
          >
            Entrar no painel
          </button>

          <div className="my-7 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#242424]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-stone-600">ou</span>
            <span className="h-px flex-1 bg-[#242424]" />
          </div>

          <button
            type="button"
            className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[#333] bg-transparent px-5 py-3 text-sm font-semibold uppercase tracking-widest text-stone-100 transition hover:border-[#8b1a1a] hover:bg-[#1e1e1e]"
          >
            <Mail className="h-4 w-4 text-red-600" />
            Entrar com Google
          </button>

          <p className="mt-6 text-center text-sm text-stone-400">
            Acesso exclusivo para profissionais. Solicite credenciais ao gerente.
          </p>
        </section>

        <footer className="mt-7 text-center text-xs text-stone-600">© 2026 NextCut · Painel interno</footer>
      </div>
    </main>
  )
}

export default LoginPage
