import { ArrowLeft, Clock, Loader2, LogOut, Phone, Ticket } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import nextCutLogo from '../assets/nextcut-logo.png'
import api from '../services/api'

function getErrorMessage(error) {
  if (typeof error.response?.data === 'string') {
    return error.response.data
  }

  return (
    error.userMessage ||
    error.response?.data?.message ||
    error.response?.data?.title ||
    'Nao foi possivel carregar sua posicao na fila.'
  )
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        background: 'oklch(0.18 0.01 20 / 0.55)',
        borderColor: 'oklch(0.42 0.14 17 / 0.28)',
      }}
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest" style={{ color: 'oklch(0.65 0.01 20)' }}>
        <Icon className="h-4 w-4 text-[var(--wine-glow)]" />
        <span>{label}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{value}</p>
    </div>
  )
}

export default function QueueStatusPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const phone = useMemo(
    () => location.state?.phone || searchParams.get('phone') || sessionStorage.getItem('nextcut.clientPhone') || '',
    [location.state?.phone, searchParams],
  )
  const [queueEntry, setQueueEntry] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(phone))
  const [isLeaving, setIsLeaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!phone) {
      setError('Informe seu telefone para acompanhar a fila.')
      setIsLoading(false)
      return
    }

    let isActive = true

    async function loadStatus() {
      setIsLoading(true)
      setError('')

      try {
        const response = await api.get(`/queue/status/${encodeURIComponent(phone)}`)

        if (isActive) {
          setQueueEntry(response.data)
        }
      } catch (requestError) {
        if (isActive) {
          setError(getErrorMessage(requestError))
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadStatus()

    return () => {
      isActive = false
    }
  }, [phone])

  const handleLeaveQueue = async () => {
    if (!phone) {
      navigate('/entrada')
      return
    }

    setIsLeaving(true)
    setError('')
    setMessage('')

    try {
      await api.post(`/queue/leave/${encodeURIComponent(phone)}`)
      sessionStorage.removeItem('nextcut.clientPhone')
      setQueueEntry(null)
      setMessage('Voce saiu da fila.')
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsLeaving(false)
    }
  }

  const estimatedTime = queueEntry?.position ? `${Math.max(queueEntry.position - 1, 0) * 15} min` : '--'

  return (
    <main
      className="relative min-h-screen overflow-hidden px-4 py-8 text-[var(--foreground)]"
      style={{ background: 'var(--gradient-dark)' }}
    >
      <div className="absolute left-0 top-0 h-full w-1" style={{ background: 'var(--gradient-wine)' }} />
      <div className="absolute right-0 top-0 h-full w-1" style={{ background: 'var(--gradient-wine)' }} />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col justify-center">
        <header className="mb-7 flex flex-col items-center gap-3 text-center">
          <img
            src={nextCutLogo}
            alt="Logo NextCut"
            className="h-36 w-36 object-contain sm:h-44 sm:w-44"
            style={{ filter: 'drop-shadow(var(--shadow-wine))' }}
          />
          <p className="font-sans text-xs uppercase tracking-[0.35em] text-[var(--wine-glow)]">Acompanhe sua vez</p>
        </header>

        <section
          className="w-full rounded-2xl border p-6 shadow-2xl backdrop-blur-sm sm:p-8"
          style={{
            background: 'oklch(0.16 0.01 20 / 0.7)',
            borderColor: 'oklch(0.42 0.14 17 / 0.3)',
            boxShadow: 'var(--shadow-wine)',
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-medium text-[var(--foreground)]" style={{ fontFamily: 'var(--font-display)' }}>
                Status da fila
              </h1>
              <div className="mt-2 flex items-center gap-2 text-sm" style={{ color: 'oklch(0.65 0.01 20)' }}>
                <Phone className="h-4 w-4 text-[var(--wine-glow)]" />
                <span>{phone || 'Telefone nao informado'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/entrada')}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[oklch(0.22_0.01_20_/_0.8)]"
              style={{ background: 'oklch(0.18 0.01 20 / 0.6)', borderColor: 'oklch(0.42 0.14 17 / 0.45)' }}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
          </div>

          {isLoading ? (
            <div className="mt-10 flex items-center justify-center gap-3 py-10 text-sm" style={{ color: 'oklch(0.65 0.01 20)' }}>
              <Loader2 className="h-5 w-5 animate-spin text-[var(--wine-glow)]" />
              Carregando sua posicao...
            </div>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <MetricCard icon={Ticket} label="Senha" value={queueEntry?.ticketNumber ?? '--'} />
              <MetricCard icon={LogOut} label="Posicao" value={queueEntry?.position ? `${queueEntry.position}a` : '--'} />
              <MetricCard icon={Clock} label="Estimativa" value={estimatedTime} />
            </div>
          )}

          {error ? (
            <div
              className="mt-6 rounded-lg border px-4 py-3 text-sm"
              style={{
                background: 'oklch(0.2 0.06 25 / 0.45)',
                borderColor: 'oklch(0.58 0.2 25 / 0.45)',
                color: 'oklch(0.86 0.08 25)',
              }}
            >
              {error}
            </div>
          ) : null}

          {message ? (
            <div
              className="mt-6 rounded-lg border px-4 py-3 text-sm"
              style={{
                background: 'oklch(0.2 0.08 145 / 0.35)',
                borderColor: 'oklch(0.55 0.12 145 / 0.45)',
                color: 'oklch(0.86 0.08 145)',
              }}
            >
              {message}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleLeaveQueue}
            disabled={isLeaving || isLoading}
            className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-lg border font-semibold uppercase tracking-widest text-[var(--foreground)] transition-colors hover:bg-[oklch(0.22_0.01_20_/_0.8)] disabled:cursor-not-allowed disabled:opacity-70"
            style={{ background: 'oklch(0.18 0.01 20 / 0.6)', borderColor: 'oklch(0.42 0.14 17 / 0.5)' }}
          >
            {isLeaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 text-[var(--wine-glow)]" />}
            {isLeaving ? 'Saindo...' : 'Sair da fila'}
          </button>
        </section>
      </section>
    </main>
  )
}
