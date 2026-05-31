import { AlertTriangle, ArrowLeft, Clock, Loader2, LogOut, Phone, Ticket } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import nextCutLogo from '../assets/nextcut-logo.png'
import useQueueSocket from '../hooks/useQueueSocket'
import api from '../services/api'

function getErrorMessage(error) {
  if (typeof error.response?.data === 'string') {
    return error.response.data
  }

  return (
    error.userMessage ||
    error.response?.data?.message ||
    error.response?.data?.title ||
    'Nao foi possivel concluir a acao. Tente novamente em instantes.'
  )
}

function MetricCard({ icon: Icon, label, value, highlight = false }) {
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
      <p className="mt-3 text-2xl font-semibold" style={{ color: highlight ? 'var(--wine-glow)' : 'var(--foreground)' }}>{value}</p>
    </div>
  )
}

function QueueStatusSkeleton() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-3" aria-label="Carregando status da fila">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="rounded-xl border p-4"
          style={{
            background: 'oklch(0.18 0.01 20 / 0.55)',
            borderColor: 'oklch(0.42 0.14 17 / 0.28)',
          }}
        >
          <div className="h-4 w-24 animate-pulse rounded-full" style={{ background: 'oklch(0.42 0.14 17 / 0.35)' }} />
          <div className="mt-4 h-8 w-16 animate-pulse rounded-lg" style={{ background: 'oklch(0.32 0.03 20 / 0.7)' }} />
        </div>
      ))}
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
  const [isLeaving, setIsLeaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { queueEntry, hasSnapshot, isReconnecting } = useQueueSocket(phone)
  const isLoading = Boolean(phone) && !hasSnapshot
  const pageError = !phone ? 'Informe seu telefone para acompanhar a fila.' : error

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
      // Redireciona imediatamente para a tela inicial
      navigate('/entrada')
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      setIsLeaving(false)
    }
  }

  // Se o cliente foi removido pelo admin (ou seja, tem snapshot mas não tem mais entry),
  // redireciona de volta para a tela inicial
  useEffect(() => {
    if (hasSnapshot && !queueEntry && !isLeaving) {
      sessionStorage.removeItem('nextcut.clientPhone')
      navigate('/entrada')
    }
  }, [hasSnapshot, queueEntry, isLeaving, navigate])

  // Usa a estimativa enviada pelo backend/WebSocket quando disponível
  const estimatedTime = queueEntry?.wait_estimate_minutes != null
    ? (queueEntry.wait_estimate_minutes === 0 ? 'Próximo!' : `Aprox. ${queueEntry.wait_estimate_minutes} min`)
    : (queueEntry?.position ? `Aprox. ${Math.max(queueEntry.position - 1, 0) * 15} min` : '--')

  return (
    <main
      className="relative min-h-screen overflow-x-hidden px-4 py-6 text-[var(--foreground)] sm:py-8"
      style={{ background: 'var(--gradient-dark)' }}
    >
      {/* Luz de fundo vermelha e escurecimento nas bordas para manter a mesma camada visual da página inicial */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(110,8,18,0.45),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.75)_100%)]" />
      <div className="absolute left-0 top-0 h-full w-1" style={{ background: 'var(--gradient-wine)' }} />
      <div className="absolute right-0 top-0 h-full w-1" style={{ background: 'var(--gradient-wine)' }} />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col justify-center sm:min-h-[calc(100vh-4rem)]">
        <header className="mb-5 flex flex-col items-center gap-2 text-center sm:mb-7 sm:gap-3">
          <img
            src={nextCutLogo}
            alt="Logo NextCut"
            className="h-28 w-28 object-contain sm:h-44 sm:w-44"
            style={{ filter: 'drop-shadow(var(--shadow-wine))' }}
          />
          <p className="font-sans text-[11px] uppercase tracking-[0.24em] text-[var(--wine-glow)] sm:text-xs sm:tracking-[0.35em]">Acompanhe sua vez</p>
        </header>

        <section
          className="w-full rounded-2xl border p-5 shadow-2xl backdrop-blur-sm sm:p-8"
          style={{
            background: 'oklch(0.16 0.01 20 / 0.7)',
            borderColor: 'oklch(0.42 0.14 17 / 0.3)',
            boxShadow: 'var(--shadow-wine)',
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="break-words text-xl font-medium text-[var(--foreground)]" style={{ fontFamily: 'var(--font-display)' }}>
                {queueEntry?.clientName ? `Olá, ${queueEntry.clientName} - Status da fila` : 'Status da fila'}
              </h1>

              <div className="mt-2 flex min-w-0 items-center gap-2 text-sm" style={{ color: 'oklch(0.65 0.01 20)' }}>
                <Phone className="h-4 w-4 flex-none text-[var(--wine-glow)]" />
                <span className="min-w-0 break-words">{phone || 'Telefone nao informado'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/entrada')}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[oklch(0.22_0.01_20_/_0.8)]"
              style={{ background: 'oklch(0.18 0.01 20 / 0.6)', borderColor: 'oklch(0.42 0.14 17 / 0.45)' }}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
          </div>

          {isReconnecting ? (
            <div
              className="mt-6 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm"
              style={{
                background: 'oklch(0.24 0.08 70 / 0.35)',
                borderColor: 'oklch(0.67 0.16 70 / 0.45)',
                color: 'oklch(0.9 0.1 80)',
              }}
            >
              <AlertTriangle className="h-4 w-4 flex-none" />
              <span>Conexão perdida, reconectando...</span>
            </div>
          ) : null}

          {isLoading ? (
            <QueueStatusSkeleton />
          ) : (
            queueEntry?.status === 'IN_SERVICE' ? (
              <div className="mt-8 rounded-xl p-5 text-center shadow-[var(--shadow-wine)] transition-all sm:p-6" style={{ background: 'var(--gradient-wine)' }}>
                <h2 className="text-xl font-bold uppercase tracking-widest text-white sm:text-2xl">Chegou sua vez!</h2>
                <p className="mt-2 text-sm text-stone-200">
                  O barbeiro já está te aguardando na cadeira.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <MetricCard icon={Ticket} label="Senha" value={queueEntry?.ticketNumber ?? '--'} />
                <MetricCard icon={LogOut} label="Posicao" value={queueEntry?.position ? `${queueEntry.position}a` : '--'} />
                <MetricCard icon={Clock} label="Estimativa" value={estimatedTime} highlight={estimatedTime === 'Próximo!'} />
              </div>
            )
          )}

          {pageError ? (
            <div
              className="mt-6 rounded-lg border px-4 py-3 text-sm"
              style={{
                background: 'oklch(0.2 0.06 25 / 0.45)',
                borderColor: 'oklch(0.58 0.2 25 / 0.45)',
                color: 'oklch(0.86 0.08 25)',
              }}
            >
              {pageError}
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
