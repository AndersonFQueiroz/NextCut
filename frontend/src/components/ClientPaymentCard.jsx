import { useState, useEffect, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Heart, Copy, CheckCircle } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL

const TIP_OPTIONS = [
  { label: 'Sem gorjeta', value: 0 },
  { label: 'R$ 2', value: 2 },
  { label: 'R$ 5', value: 5 },
  { label: 'R$ 10', value: 10 },
]

/**
 * Card de pagamento que aparece na tela do CLIENTE quando o barbeiro solicita cobrança.
 * Exibe QR Code Pix com opções de gorjeta e desaparece automaticamente após 60s.
 */
export default function ClientPaymentCard({ paymentValue, onSelectTip, selectedTip, visible }) {
  const [pixPayload, setPixPayload] = useState(null)
  const [copied, setCopied] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const totalValue = paymentValue + (selectedTip || 0)

  // Gera/regenera QR Code quando o valor total muda
  const fetchPixPayload = useCallback(async () => {
    if (totalValue <= 0) return
    try {
      const resp = await fetch(`${API_BASE}/pix/gerar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalValue })
      })
      const data = await resp.json()
      if (data?.success && data?.data?.payload) {
        setPixPayload(data.data.payload)
      }
    } catch { /* silencioso em modo demo */ }
  }, [totalValue])

  useEffect(() => {
    fetchPixPayload()
  }, [fetchPixPayload])

  // Auto-dismiss após 60 segundos
  useEffect(() => {
    if (visible && !dismissed) {
      const timer = setTimeout(() => setDismissed(true), 60000)
      return () => clearTimeout(timer)
    }
  }, [visible, dismissed])

  // Reseta dismissed quando uma nova cobrança chega
  useEffect(() => {
    if (visible) setDismissed(false)
  }, [paymentValue])

  const handleSelectTip = async (tipAmount) => {
    onSelectTip(tipAmount)
    try {
      await fetch(`${API_BASE}/queue/payment/tip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipAmount })
      })
    } catch { /* silencioso */ }
  }

  const copiarPix = () => {
    if (pixPayload) {
      navigator.clipboard.writeText(pixPayload)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!visible || dismissed || paymentValue <= 0) return null

  return (
    <section
      className="overflow-hidden rounded-2xl border border-[oklch(0.42_0.14_17_/_0.4)] shadow-2xl"
      style={{ background: 'oklch(0.12 0.02 20 / 0.95)' }}
    >
      {/* Glow decorativo */}
      <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(110,8,18,0.3),transparent_70%)]" />

      <div className="relative z-10 p-5 sm:p-6">
        {/* Header */}
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--wine-glow)' }}>
          Pagamento Solicitado
        </p>
        <p className="mb-4 text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          R$ {paymentValue.toFixed(2)}
        </p>

        {/* QR Code */}
        {pixPayload && (
          <div className="mb-4 flex flex-col items-center gap-3">
            <div className="rounded-xl bg-white p-3 shadow-lg">
              <QRCodeSVG value={pixPayload} size={160} level="M" />
            </div>

            {/* Copiar código */}
            <button
              type="button"
              onClick={copiarPix}
              className="flex items-center gap-2 rounded-lg border border-[oklch(0.42_0.14_17_/_0.3)] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/70 transition hover:border-white/40 hover:text-white"
            >
              {copied ? <CheckCircle className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copiado!' : 'Copiar Pix'}
            </button>
          </div>
        )}

        {/* Gorjeta */}
        <div className="mb-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-white/50">
            <Heart className="h-3.5 w-3.5" />
            Deixar uma gorjeta?
          </p>
          <div className="flex flex-wrap gap-2">
            {TIP_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelectTip(opt.value)}
                className="rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition hover:scale-105 active:scale-95"
                style={
                  selectedTip === opt.value
                    ? { background: 'var(--gradient-wine)', borderColor: 'transparent', color: 'white' }
                    : { background: 'transparent', borderColor: 'oklch(0.42 0.14 17 / 0.3)', color: 'oklch(0.75 0.01 20)' }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Total com gorjeta */}
        {selectedTip > 0 && (
          <div className="rounded-lg border border-[oklch(0.42_0.14_17_/_0.2)] bg-black/20 p-3 text-sm">
            <div className="flex justify-between text-white/60">
              <span>Serviço</span>
              <span>R$ {paymentValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-400/80">
              <span>Gorjeta</span>
              <span>+ R$ {selectedTip.toFixed(2)}</span>
            </div>
            <div className="mt-1 border-t border-white/10 pt-1 flex justify-between font-bold text-white">
              <span>Total</span>
              <span style={{ color: 'var(--wine-glow)' }}>R$ {totalValue.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Dismiss discreto */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="mt-3 w-full text-center text-xs text-white/30 transition hover:text-white/60"
        >
          Fechar
        </button>
      </div>
    </section>
  )
}
