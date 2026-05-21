import { ArrowLeft, Clock, Loader2, LogOut, Phone, Ticket } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
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
    <div className="rounded-xl border border-[#242424] bg-[#111111] p-4 shadow-2xl shadow-black/70">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-red-600">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-stone-100">{value}</p>
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
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#080808] px-4 py-10 text-stone-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(120,18,34,0.22),transparent_45%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1),rgba(0,0,0,0.6))]" />

      <div className="relative z-10 w-full max-w-2xl">
        <header className="mb-8 flex flex-col items-center text-center">
          <img src={nextCutLogo} alt="Logo NextCut" className="h-36 w-36 object-contain" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-red-600">Acompanhe sua vez</p>
        </header>

        <Card className="bg-[#111111] border border-[#242424] rounded-xl shadow-2xl shadow-black/70">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold uppercase tracking-[0.25em] text-stone-50">Status da fila</h1>
              <div className="mt-2 flex items-center gap-2 text-sm text-stone-400">
                <Phone className="h-4 w-4 text-red-600" />
                <span>{phone || 'Telefone nao informado'}</span>
              </div>
            </div>

            <Button variant="secondary" onClick={() => navigate('/entrada')} className="h-10 gap-2 px-4">
              <ArrowLeft className="h-4 w-4 text-red-600" />
              Voltar
            </Button>
          </div>

          {isLoading ? (
            <div className="mt-10 flex items-center justify-center gap-3 py-10 text-sm text-stone-400">
              <Loader2 className="h-5 w-5 animate-spin text-red-600" />
              Carregando sua posicao...
            </div>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <MetricCard icon={Ticket} label="Senha" value={queueEntry?.ticketNumber ?? '--'} />
              <MetricCard icon={LogOut} label="Posicao" value={queueEntry?.position ? `${queueEntry.position}a` : '--'} />
              <MetricCard icon={Clock} label="Estimativa" value={estimatedTime} />
            </div>
          )}

          {error ? <div className="mt-6 rounded-lg border border-[#8b1a1a] bg-[#1e1e1e] px-4 py-3 text-sm text-stone-100">{error}</div> : null}

          {message ? <div className="mt-6 rounded-lg border border-[#242424] bg-[#1e1e1e] px-4 py-3 text-sm text-stone-400">{message}</div> : null}

          <Button
            variant="secondary"
            onClick={handleLeaveQueue}
            disabled={isLeaving || isLoading}
            fullWidth
            className="mt-8 h-12 gap-2"
          >
            {isLeaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 text-red-600" />}
            {isLeaving ? 'Saindo...' : 'Sair da fila'}
          </Button>
        </Card>
      </div>
    </main>
  )
}
