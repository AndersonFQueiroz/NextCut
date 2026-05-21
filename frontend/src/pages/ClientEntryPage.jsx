import { Loader2, Phone, Scissors, User } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
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
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#080808] px-4 py-10 text-stone-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(120,18,34,0.22),transparent_45%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1),rgba(0,0,0,0.6))]" />

      <div className="relative z-10 w-full max-w-[460px]">
        <header className="mb-8 flex flex-col items-center text-center">
          <img src={nextCutLogo} alt="Logo NextCut" className="h-40 w-40 object-contain" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-red-600">Fila digital</p>
        </header>

        <Card className="bg-[#111111] border border-[#242424] rounded-xl shadow-2xl shadow-black/70">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#7a1520]">
              <Scissors className="h-5 w-5 text-stone-100" />
            </span>
            <div>
              <h1 className="font-serif text-3xl font-bold uppercase tracking-[0.25em] text-stone-50">Entrar na fila</h1>
              <p className="mt-2 text-sm text-stone-400">Informe seus dados para acompanhar sua vez.</p>
            </div>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <Input
              admin
              label="Nome"
              name="clientName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Seu nome"
              error={errors.name}
              icon={<User className="h-4 w-4" />}
              aria-invalid={Boolean(errors.name)}
            />

            <Input
              admin
              label="Telefone"
              name="clientPhone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(maskPhone(event.target.value))}
              placeholder="(00) 00000-0000"
              error={errors.phone}
              icon={<Phone className="h-4 w-4" />}
              aria-invalid={Boolean(errors.phone)}
            />

            {apiError ? (
              <div className="rounded-lg border border-[#8b1a1a] bg-[#1e1e1e] px-4 py-3 text-sm text-stone-100">
                {apiError}
              </div>
            ) : null}

            <Button variant="danger" type="submit" fullWidth disabled={isSubmitting} className="h-12 gap-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? 'Entrando...' : 'Entrar na fila'}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  )
}
