import { useState, useEffect, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, Copy, CheckCircle, Banknote, QrCode } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL

function getToken() {
  return localStorage.getItem('nextcut_token')
}

/**
 * Modal de finalização com Pix que aparece no painel do barbeiro.
 * Permite gerar QR Code, acompanhar gorjeta em tempo real e confirmar pagamento.
 */
export default function PaymentModal({ isOpen, onClose, onConfirm, onFinishWithoutPix, clientTipValue, clientName }) {
  const [amount, setAmount] = useState('')
  const [pixPayload, setPixPayload] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [paymentRequested, setPaymentRequested] = useState(false)

  // Reseta estado quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setAmount('')
      setPixPayload(null)
      setLoading(false)
      setCopied(false)
      setPaymentRequested(false)
    }
  }, [isOpen])

  const tipValue = clientTipValue ?? 0
  const numericAmount = parseFloat(amount) || 0
  const total = numericAmount + tipValue

  // Gera o payload Pix e envia a cobrança para a tela do cliente
  const gerarPix = useCallback(async () => {
    if (numericAmount <= 0) return
    setLoading(true)
    try {
      // Envia a cobrança para aparecer na tela do cliente
      if (!paymentRequested) {
        await fetch(`${API_BASE}/admin/payment/request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({ amount: numericAmount })
        })
        setPaymentRequested(true)
      }

      // Gera o QR Code com o valor total (serviço + gorjeta)
      const resp = await fetch(`${API_BASE}/pix/gerar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total })
      })
      const data = await resp.json()
      if (data?.success && data?.data?.payload) {
        setPixPayload(data.data.payload)
      }
    } catch {
      // Silencioso — em modo demo sem backend o QR não aparece
    } finally {
      setLoading(false)
    }
  }, [numericAmount, total, paymentRequested])

  // Regenera o QR Code quando a gorjeta muda
  useEffect(() => {
    if (pixPayload && paymentRequested && numericAmount > 0) {
      const regenerate = async () => {
        try {
          const resp = await fetch(`${API_BASE}/pix/gerar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: total })
          })
          const data = await resp.json()
          if (data?.success && data?.data?.payload) {
            setPixPayload(data.data.payload)
          }
        } catch { /* silencioso */ }
      }
      regenerate()
    }
  }, [tipValue])

  const copiarPix = () => {
    if (pixPayload) {
      navigator.clipboard.writeText(pixPayload)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isOpen) return null

  return (
    // Overlay escuro com blur
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[oklch(0.42_0.14_17_/_0.4)] shadow-2xl animate-in fade-in zoom-in-95"
        style={{ background: 'oklch(0.12 0.02 20 / 0.95)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Glow decorativo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(110,8,18,0.4),transparent_70%)]" />

        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--wine-glow)' }}>
                Finalizar Atendimento
              </p>
              <h2 className="mt-1 text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {clientName || 'Cliente'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/60 transition hover:border-white/30 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Input de valor */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-white/60">
              Valor do corte (R$)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              disabled={paymentRequested}
              className="w-full rounded-lg border border-[oklch(0.42_0.14_17_/_0.3)] bg-black/40 px-4 py-3 text-lg font-semibold text-white placeholder-white/30 outline-none transition focus:border-[var(--wine-glow)] disabled:opacity-50"
              style={{ fontFamily: 'var(--font-display)' }}
            />
          </div>

          {/* Botão gerar Pix */}
          {!pixPayload && (
            <button
              type="button"
              onClick={gerarPix}
              disabled={loading || numericAmount <= 0}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-widest text-white shadow-[var(--shadow-wine)] transition hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: 'var(--gradient-wine)' }}
            >
              <QrCode className="h-4 w-4" />
              {loading ? 'Gerando...' : 'Gerar Pix'}
            </button>
          )}

          {/* QR Code + resumo */}
          {pixPayload && (
            <div className="mb-4 space-y-4">
              {/* QR Code com fundo branco */}
              <div className="flex justify-center">
                <div className="rounded-xl bg-white p-4 shadow-lg">
                  <QRCodeSVG value={pixPayload} size={180} level="M" />
                </div>
              </div>

              {/* Resumo de valores */}
              <div className="rounded-lg border border-[oklch(0.42_0.14_17_/_0.3)] bg-black/30 p-3 text-sm">
                <div className="flex justify-between text-white/70">
                  <span>Corte</span>
                  <span className="font-semibold text-white">R$ {numericAmount.toFixed(2)}</span>
                </div>
                {tipValue > 0 && (
                  <div className="mt-1 flex justify-between text-white/70">
                    <span>Gorjeta do cliente</span>
                    <span className="font-semibold text-green-400">+ R$ {tipValue.toFixed(2)}</span>
                  </div>
                )}
                <div className="mt-2 border-t border-white/10 pt-2 flex justify-between text-white">
                  <span className="font-bold">Total</span>
                  <span className="text-lg font-bold" style={{ color: 'var(--wine-glow)', fontFamily: 'var(--font-display)' }}>
                    R$ {total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Copiar código */}
              <button
                type="button"
                onClick={copiarPix}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[oklch(0.42_0.14_17_/_0.3)] bg-transparent px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-white/80 transition hover:border-white/40 hover:text-white"
              >
                {copied ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copiado!' : 'Copiar código Pix'}
              </button>
            </div>
          )}

          {/* Botões finais */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onConfirm(numericAmount, tipValue)}
              disabled={!pixPayload}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-widest text-white shadow-[var(--shadow-wine)] transition hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: pixPayload ? 'linear-gradient(135deg, rgba(22,101,52,0.8), rgba(21,128,61,0.8))' : 'oklch(0.3 0.02 20)' }}
            >
              <CheckCircle className="h-4 w-4" />
              Confirmar Pagamento
            </button>

            <button
              type="button"
              onClick={onFinishWithoutPix}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[oklch(0.42_0.14_17_/_0.3)] bg-transparent px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-white/60 transition hover:border-white/40 hover:text-white"
            >
              <Banknote className="h-4 w-4" />
              Finalizar sem Pix (Dinheiro / Cartão)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
