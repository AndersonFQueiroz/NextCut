// Ícones utilizados na página de entrada do cliente
import { Loader2, Phone, Scissors, User } from 'lucide-react'
// useState guarda estados locais como nome, telefone, loading
import { useState, useEffect } from 'react'
// useNavigate e Link permitem redirecionar para outras páginas
import { useNavigate, Link } from 'react-router-dom'
// Logo utilizado no cabeçalho da página
import nextCutLogo from '../assets/nextcut-logo.png'
// api é a instância axios configurada para chamar o backend
import api from '../services/api'

function maskPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 2) {
    return digits
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function getErrorMessage(error) {
  if (error.response?.status === 409) {
    return 'Telefone já cadastrado na fila'
  }

  if (typeof error.response?.data === 'string') {
    return error.response.data
  }

  return (
    error.userMessage ||
    error.response?.data?.message ||
    error.response?.data?.title ||
    'Nao foi possivel entrar na fila. Verifique os dados e tente novamente.'
  )
}

/**
 * @component ClientEntryPage
 * @description
 * Página inicial pública onde o cliente informa seu nome e telefone para entrar na fila.
 * Se a barbearia estiver fechada (is_open=false retornado pela API), o formulário é bloqueado.
 * 
 * Lógica de Negócio:
 * - Em vez de colocar o cliente direto na fila, este componente dispara a rota /queue/request-otp.
 * - Os dados de estado (nome, telefone) são passados via React Router `state` para a tela 
 *   de verificação OTP (OtpVerificationPage), onde a autenticação real de número ocorre.
 */
export default function ClientEntryPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  // isOpen indica se a barbearia está aceitando clientes; true por padrão para não bloquear sem backend
  const [isOpen, setIsOpen] = useState(true)

  const validate = () => {
    const nextErrors = {}

    if (!name.trim()) {
      nextErrors.name = 'Informe seu nome.'
    }

    if (!phone.trim()) {
      nextErrors.phone = 'Informe seu telefone.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setApiError('')

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      await api.post('/queue/request-otp', {
        clientName: name.trim(),
        clientPhone: phone,
      })

      // Redireciona para a tela de verificação passando os dados via state
      navigate('/verificar', { 
        state: { 
          clientName: name.trim(), 
          clientPhone: phone 
        } 
      })
    } catch (error) {
      setApiError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  // useEffect busca o estado is_open no backend para bloquear o formulário quando fechado
  useEffect(() => {
    let mounted = true

    // Tenta obter a rota pública /queue para ler o is_open quando disponível
    api
      .get('/queue')
      .then((resp) => {
        // payload aceita tanto ApiResponse quanto resposta direta
        const payload = resp.data?.data ?? resp.data
        // Interpreta campos possíveis que indicam se a barbearia está aberta
        const open = Boolean(payload?.is_open ?? payload?.isOpen ?? payload?.open ?? true)
        if (mounted) setIsOpen(open)
      })
      .catch(() => {
        // Em erro, não bloqueia o formulário (fallback seguro)
        if (mounted) setIsOpen(true)
      })

    // Cleanup para evitar setState após componente desmontar
    return () => {
      mounted = false
    }
  }, [])

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10 text-stone-100" style={{ background: '#0a0a0a' }}> {/* Alterado: fundo exato do main */}
      {/* Luz vermelha centralizada — valor aumentado para ficar visível */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at top left, rgba(120,10,25,0.7) 0%, transparent 50%)' }} />

      {/* Escurecimento nas bordas para dar profundidade */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at bottom right, rgba(120,10,25,0.7) 0%, transparent 50%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at bottom left, rgba(80,5,15,0.5) 0%, transparent 40%)' }} />

      <div className="relative z-10 flex w-full max-w-[460px] flex-col items-center">
        <header className="mb-7 flex flex-col items-center gap-3 text-center">
          <img
            src={nextCutLogo}
            alt="Logo NextCut"
            className="h-40 w-40 object-contain sm:h-48 sm:w-48"
            style={{ filter: 'drop-shadow(var(--shadow-wine))' }}
          />
          <p className="font-sans text-xs uppercase tracking-[0.35em] text-[var(--wine-glow)]">Fila digital</p>
        </header>

       {/* Card com fundo sólido escuro igual ao LoginPage do barbeiro para contrastar com o brilho vermelho */}
<section className="w-full rounded-xl border p-8 sm:p-10" style={{
  background: '#111111',
  borderColor: '#8f1728',
  boxShadow: '0 0 22px rgba(143,23,40,0.42), 0 0 72px rgba(120,18,34,0.38)'
}}>
          {/* Quando a barbearia estiver fechada, mostramos um card centralizado avisando o usuário */}
          {!isOpen ? (
            <div className="mb-6 rounded-2xl border p-6 text-center backdrop-blur-sm" style={{ background: 'oklch(0.16 0.01 20 / 0.7)', borderColor: 'oklch(0.42 0.14 17 / 0.3)' }}>
              <p className="text-lg font-semibold" style={{ color: 'oklch(0.86 0.08 25)' }}>Barbearia fechada no momento</p>
            </div>
          ) : null}
          <div className="flex items-start gap-3">
            <span
              className="flex h-10 w-10 flex-none items-center justify-center rounded-lg"
              style={{ background: 'oklch(0.42 0.14 17 / 0.18)' }}
            >
              <Scissors className="h-5 w-5 text-[var(--wine-glow)]" />
            </span>
            <div>
              <h1 className="text-xl font-medium text-[var(--foreground)]" style={{ fontFamily: 'var(--font-display)' }}>
                Entrar na fila
              </h1>
              <p className="mt-1 text-sm" style={{ color: 'oklch(0.65 0.01 20)' }}>
                Informe seus dados para acompanhar sua vez.
              </p>
            </div>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <label className="block space-y-2">
              <span className="block text-xs uppercase tracking-widest" style={{ color: 'oklch(0.65 0.01 20)' }}>
                Nome
              </span>
              <span className="relative block">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--wine-glow)]" />
                <input
                  type="text"
                  name="clientName"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Seu nome"
                  // Desabilita input quando barbearia estiver fechada
                  disabled={!isOpen}
                  className={`h-12 w-full rounded-lg border bg-transparent pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-slate-500 transition-colors focus:border-[oklch(0.55_0.18_18)] ${!isOpen ? 'opacity-50 pointer-events-none' : ''}`}
                  style={{ borderColor: errors.name ? 'oklch(0.58 0.2 25)' : 'oklch(0.3 0.02 20)' }}
                  aria-invalid={Boolean(errors.name)}
                />
              </span>
              {errors.name ? <span className="block text-xs text-red-300">{errors.name}</span> : null}
            </label>

            <label className="block space-y-2">
              <span className="block text-xs uppercase tracking-widest" style={{ color: 'oklch(0.65 0.01 20)' }}>
                Telefone
              </span>
              <span className="relative block">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--wine-glow)]" />
                <input
                  type="tel"
                  name="clientPhone"
                  value={phone}
                  onChange={(event) => setPhone(maskPhone(event.target.value))}
                  placeholder="(00) 00000-0000"
                  // Desabilita input quando barbearia estiver fechada
                  disabled={!isOpen}
                  className={`h-12 w-full rounded-lg border bg-transparent pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-slate-500 transition-colors focus:border-[oklch(0.55_0.18_18)] ${!isOpen ? 'opacity-50 pointer-events-none' : ''}`}
                  style={{ borderColor: errors.phone ? 'oklch(0.58 0.2 25)' : 'oklch(0.3 0.02 20)' }}
                  aria-invalid={Boolean(errors.phone)}
                />
              </span>
              {errors.phone ? <span className="block text-xs text-red-300">{errors.phone}</span> : null}
            </label>

            {apiError ? (
              <div
                className="rounded-lg border px-4 py-3 text-sm"
                style={{
                  background: 'oklch(0.2 0.06 25 / 0.45)',
                  borderColor: 'oklch(0.58 0.2 25 / 0.45)',
                  color: 'oklch(0.86 0.08 25)',
                }}
              >
                {apiError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || !isOpen}
              // Adiciona classes visuais quando desabilitado por fechamento
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-lg font-semibold uppercase tracking-widest text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 ${!isOpen ? 'opacity-50 pointer-events-none' : ''}`}
              style={{ background: 'var(--gradient-wine)', boxShadow: 'var(--shadow-wine)' }}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? 'Entrando...' : 'Entrar na fila'}
            </button>
          </form>
        </section>

        {/* Footer com link discreto para o login do admin (Opção B) */}
        <footer className="mt-8 text-center">
          <Link
            to="/login"
            className="text-[10px] uppercase tracking-[0.2em] transition-opacity hover:opacity-100"
            style={{ color: 'oklch(0.65 0.01 20)', opacity: 0.3 }}
          >
            Área do Profissional
          </Link>
        </footer>
        {/* Botão discreto para voltar à nova landing inicial. */}
        <button type="button" onClick={() => navigate('/')} className="mt-2 text-xs transition-colors hover:text-[var(--wine-glow)]" style={{ color: 'oklch(0.65 0.01 20)' }}>← Voltar ao início</button>
      </div>
    </main>
  )
}
