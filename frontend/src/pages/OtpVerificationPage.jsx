import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Loader2, MessageSquare } from 'lucide-react'
import api from '../services/api'
import nextCutLogo from '../assets/nextcut-logo.png'

/**
 * @component OtpVerificationPage
 * @description
 * Tela responsável por confirmar a identidade do cliente via código de 4 dígitos.
 * 
 * Lógica e UX (User Experience):
 * - Recebe os dados de navegação via `location.state`. Se não existirem (acesso direto à URL),
 *   redireciona o usuário para o início de forma silenciosa e segura no `useEffect`.
 * - Controla 4 inputs separados (refs) que pulam o foco automaticamente ao digitar, apagar ou colar,
 *   simulando a experiência nativa de apps como Uber ou WhatsApp.
 * - Submete o código automaticamente quando o 4º dígito é preenchido.
 */
export default function OtpVerificationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Recupera os dados que vieram do ClientEntryPage
  const { clientName, clientPhone } = location.state || {}

  // Se a pessoa tentar acessar a rota diretamente sem preencher nome/telefone, volta para a entrada
  useEffect(() => {
    if (!clientName || !clientPhone) {
      navigate('/entrada')
    }
  }, [clientName, clientPhone, navigate])

  const [otp, setOtp] = useState(['', '', '', ''])
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)]
  
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(30)

  // Timer do cooldown para reenvio
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  // Focar no primeiro input ao carregar
  useEffect(() => {
    if (inputRefs[0]?.current) {
      inputRefs[0].current.focus()
    }
  }, [])

  // Lógica de digitar nos inputs (auto-focus next)
  const handleChange = (index, value) => {
    // Apenas números
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    // Pega só o último caractere digitado (caso o usuário cole ou digite rápido)
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    setError('') // Limpa erro ao digitar

    // Vai para o próximo input se digitou algo
    if (value && index < 3) {
      inputRefs[index + 1].current.focus()
    }

    // Se preencheu todos, auto-submit
    if (value && index === 3 && newOtp.every(d => d !== '')) {
      verifyOtp(newOtp.join(''))
    }
  }

  // Lógica de apagar (auto-focus prev)
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus()
    }
  }

  // Lógica de colar (paste)
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 4)
    if (pastedData) {
      const newOtp = [...otp]
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i]
      }
      setOtp(newOtp)
      
      // Foca no último preenchido ou no final
      const focusIndex = Math.min(pastedData.length, 3)
      inputRefs[focusIndex === 4 ? 3 : focusIndex].current.focus()
      
      if (pastedData.length === 4) {
        verifyOtp(pastedData)
      }
    }
  }

  const verifyOtp = async (codeToVerify) => {
    setIsVerifying(true)
    setError('')

    try {
      await api.post('/queue/verify-otp', {
        clientName,
        clientPhone,
        otpCode: codeToVerify
      })

      // Sucesso! Guarda o telefone na sessão (como era antes) e vai pra fila
      sessionStorage.setItem('nextcut.clientPhone', clientPhone)
      navigate(`/fila?phone=${encodeURIComponent(clientPhone)}`, { state: { phone: clientPhone } })
    } catch (err) {
      setError(err.response?.data?.title || err.response?.data?.message || 'Código inválido. Tente novamente.')
      // Limpa inputs no caso de erro para forçar digitar de novo
      setOtp(['', '', '', ''])
      if (inputRefs[0]?.current) {
        inputRefs[0].current.focus()
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const resendOtp = async () => {
    if (cooldown > 0 || isResending) return

    setIsResending(true)
    setError('')
    try {
      await api.post('/queue/request-otp', {
        clientName,
        clientPhone
      })
      setCooldown(30)
      setOtp(['', '', '', ''])
      if (inputRefs[0]?.current) {
        inputRefs[0].current.focus()
      }
    } catch (err) {
      setError(err.response?.data?.title || err.response?.data?.message || 'Erro ao reenviar o código.')
    } finally {
      setIsResending(false)
    }
  }

  // Se os state faltarem, a tela ficará em branco enquanto o useEffect redireciona
  if (!clientName || !clientPhone) return null

  return (
    <main
      className="relative min-h-screen overflow-hidden px-4 py-8 text-[var(--foreground)]"
      style={{ background: 'var(--gradient-dark)' }}
    >
      {/* Luz de fundo vermelha e escurecimento nas bordas para manter o visual do projeto */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(110,8,18,0.45),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.75)_100%)]" />
      <div className="absolute left-0 top-0 h-full w-1" style={{ background: 'var(--gradient-wine)' }} />
      <div className="absolute right-0 top-0 h-full w-1" style={{ background: 'var(--gradient-wine)' }} />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <header className="mb-7 flex flex-col items-center gap-3 text-center">
          <img
            src={nextCutLogo}
            alt="Logo NextCut"
            className="h-24 w-24 object-contain opacity-80"
            style={{ filter: 'drop-shadow(var(--shadow-wine))' }}
          />
        </header>

        <section
          className="w-full rounded-2xl border p-6 shadow-2xl backdrop-blur-sm sm:p-8 text-center"
          style={{
            background: 'oklch(0.16 0.01 20 / 0.7)',
            borderColor: 'oklch(0.42 0.14 17 / 0.3)',
            boxShadow: 'var(--shadow-wine)',
          }}
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full mb-4" style={{ background: 'oklch(0.42 0.14 17 / 0.18)' }}>
            <MessageSquare className="h-6 w-6 text-[var(--wine-glow)]" />
          </div>
          
          <h1 className="text-xl font-medium text-[var(--foreground)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Confirme seu Número
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.65 0.01 20)' }}>
            Enviamos um código de 4 dígitos via WhatsApp para o número <br />
            <strong className="text-stone-200 mt-1 inline-block">{clientPhone}</strong>
          </p>

          <div className="mt-8 flex justify-center gap-3 sm:gap-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isVerifying}
                className="h-14 w-12 rounded-xl border bg-transparent text-center text-2xl font-bold text-white transition-colors focus:border-[oklch(0.55_0.18_18)] focus:outline-none focus:ring-1 focus:ring-[oklch(0.55_0.18_18)] sm:h-16 sm:w-14"
                style={{ 
                  borderColor: error ? 'oklch(0.58 0.2 25)' : (digit ? 'var(--wine-glow)' : 'oklch(0.3 0.02 20)'),
                  background: 'oklch(0.12 0.01 20 / 0.5)'
                }}
              />
            ))}
          </div>

          {error ? (
            <p className="mt-4 text-sm font-medium text-red-400 animate-pulse">{error}</p>
          ) : (
            <p className="mt-4 h-5"></p> // Espaçador para evitar pulo
          )}

          <div className="mt-8 space-y-4">
            <button
              type="button"
              onClick={() => verifyOtp(otp.join(''))}
              disabled={isVerifying || otp.some(d => d === '')}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg font-semibold uppercase tracking-widest text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: 'var(--gradient-wine)' }}
            >
              {isVerifying ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {isVerifying ? 'Verificando...' : 'Confirmar Código'}
            </button>

            <button
              type="button"
              onClick={resendOtp}
              disabled={cooldown > 0 || isResending}
              className="text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{ color: cooldown > 0 ? 'oklch(0.65 0.01 20)' : 'var(--wine-glow)' }}
            >
              {isResending ? 'Reenviando...' : cooldown > 0 ? `Reenviar código em ${cooldown}s` : 'Não recebi o código'}
            </button>
          </div>
        </section>

        <button
          type="button"
          onClick={() => navigate('/entrada')}
          className="mx-auto mt-6 flex items-center gap-2 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]"
          style={{ color: 'oklch(0.65 0.01 20)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Mudar número de telefone
        </button>
      </section>
    </main>
  )
}
