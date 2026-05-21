import { Loader2, Phone, Scissors, User } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import nextCutLogo from '../assets/nextcut-logo.png'
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

  return (
    error.userMessage ||
    'Nao foi possivel entrar na fila. Verifique os dados e tente novamente.'
  )
}

export default function ClientEntryPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      await api.post('/queue/join', {
        clientName: name.trim(),
        clientPhone: phone,
      })

      sessionStorage.setItem('nextcut.clientPhone', phone)
      navigate(`/fila?phone=${encodeURIComponent(phone)}`, { state: { phone } })
    } catch (error) {
      setApiError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden px-4 py-8 text-[var(--foreground)]"
      style={{ background: 'var(--gradient-dark)' }}
    >
      <div className="absolute left-0 top-0 h-full w-1" style={{ background: 'var(--gradient-wine)' }} />
      <div className="absolute right-0 top-0 h-full w-1" style={{ background: 'var(--gradient-wine)' }} />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <header className="mb-7 flex flex-col items-center gap-3 text-center">
          <img
            src={nextCutLogo}
            alt="Logo NextCut"
            className="h-40 w-40 object-contain sm:h-48 sm:w-48"
            style={{ filter: 'drop-shadow(var(--shadow-wine))' }}
          />
          <p className="font-sans text-xs uppercase tracking-[0.35em] text-[var(--wine-glow)]">Fila digital</p>
        </header>

        <section
          className="w-full rounded-2xl border p-6 shadow-2xl backdrop-blur-sm sm:p-8"
          style={{
            background: 'oklch(0.16 0.01 20 / 0.7)',
            borderColor: 'oklch(0.42 0.14 17 / 0.3)',
            boxShadow: 'var(--shadow-wine)',
          }}
        >
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
                  className="h-12 w-full rounded-lg border bg-transparent pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-slate-500 transition-colors focus:border-[oklch(0.55_0.18_18)]"
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
                  className="h-12 w-full rounded-lg border bg-transparent pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-slate-500 transition-colors focus:border-[oklch(0.55_0.18_18)]"
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
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg font-semibold uppercase tracking-widest text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
              style={{ background: 'var(--gradient-wine)', boxShadow: 'var(--shadow-wine)' }}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? 'Entrando...' : 'Entrar na fila'}
            </button>
          </form>
        </section>
      </section>
    </main>
  )
}
