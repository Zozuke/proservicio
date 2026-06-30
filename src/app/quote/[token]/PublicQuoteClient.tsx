'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { loadStripe } from '@stripe/stripe-js'
import { CheckCircle, XCircle, Wrench } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type Quote = {
  id: string; title: string; description: string; total: number; subtotal: number
  commission: number; status: string; notes: string | null
  items: Array<{ id: string; description: string; quantity: number; unit_price: number; total: number }>
  client: { name: string }
  profile: { business_name: string; trade: string; phone: string; full_name: string }
}

export default function PublicQuoteClient({ token }: { token: string }) {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    supabase.from('quotes')
      .select('*, client:clients(name), profile:profiles(business_name, trade, phone, full_name)')
      .eq('public_token', token)
      .single()
      .then(({ data }) => {
        if (!data) setNotFound(true)
        else {
          setQuote(data as unknown as Quote)
          setStatus(data.status)
        }
        setFetching(false)
      })
  }, [token])

  const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(n)

  const handleAccept = async () => {
    if (!quote) return
    setLoading(true)
    await supabase.from('quotes').update({ status: 'accepted' }).eq('id', quote.id)
    setStatus('accepted')
    setLoading(false)
  }

  const handleReject = async () => {
    if (!quote) return
    setLoading(true)
    await supabase.from('quotes').update({ status: 'rejected' }).eq('id', quote.id)
    setStatus('rejected')
    setLoading(false)
  }

  const handlePay = async () => {
    if (!quote) return
    setLoading(true)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId: quote.id, amount: Math.round(quote.total * 100), title: quote.title }),
      })
      const { sessionId } = await res.json()
      const stripe = await stripePromise
      await stripe?.redirectToCheckout({ sessionId })
    } catch {
      alert('Error al procesar pago. Intenta de nuevo.')
    }
    setLoading(false)
  }

  if (fetching) return (
    <div className="min-h-dvh flex items-center justify-center bg-surface">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (notFound) return (
    <div className="min-h-dvh bg-surface flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-5xl mb-4">🔍</p>
        <h1 className="font-display text-xl font-bold text-white mb-2">Cotización no encontrada</h1>
        <p className="text-muted">El link puede haber expirado o ser incorrecto.</p>
      </div>
    </div>
  )

  if (!quote) return null

  if (status === 'paid') return (
    <div className="min-h-dvh bg-surface flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-5xl mb-4">🎉</p>
        <h1 className="font-display text-2xl font-bold text-white mb-2">¡Pago realizado!</h1>
        <p className="text-muted">Tu pago fue procesado. {quote.profile?.business_name} recibirá una notificación.</p>
      </div>
    </div>
  )

  if (status === 'rejected') return (
    <div className="min-h-dvh bg-surface flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="font-display text-xl font-bold text-white mb-2">Cotización rechazada</h1>
        <p className="text-muted">Has rechazado esta cotización. Puedes contactar al proveedor si cambiaste de opinión.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh bg-surface">
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 px-4 pt-12 pb-8">
        <div className="flex items-center gap-3 max-w-sm mx-auto">
          <div className="bg-white/20 rounded-xl p-2.5">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-lg">{quote.profile?.business_name}</h1>
            <p className="text-primary-200 text-sm">{quote.profile?.trade}</p>
          </div>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-4 py-6 space-y-4">
        <div className="card">
          <p className="text-xs text-muted mb-1">Cotización para</p>
          <p className="font-bold text-white text-lg">{quote.client?.name}</p>
          <p className="text-primary-400 font-semibold mt-0.5">{quote.title}</p>
          {quote.description && <p className="text-sm text-muted mt-2">{quote.description}</p>}
        </div>

        <div className="card">
          <p className="text-xs text-muted font-medium mb-3">Detalle del trabajo</p>
          <div className="space-y-2">
            {quote.items?.map(item => (
              <div key={item.id} className="flex justify-between items-start py-1.5 border-b border-border last:border-0">
                <div>
                  <p className="text-sm text-white">{item.description}</p>
                  <p className="text-xs text-muted">{item.quantity} × {fmt(item.unit_price)}</p>
                </div>
                <p className="text-sm font-medium text-white ml-4">{fmt(item.total)}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-sm text-muted">
              <span>Subtotal</span><span>{fmt(quote.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted">
              <span>Comisión plataforma</span><span>{fmt(quote.commission)}</span>
            </div>
            <div className="flex justify-between font-bold text-xl border-t border-border pt-2 mt-2">
              <span className="text-white">Total</span>
              <span className="text-primary-400">{fmt(quote.total)}</span>
            </div>
          </div>
          {quote.notes && (
            <p className="text-xs text-muted mt-3 pt-3 border-t border-border">{quote.notes}</p>
          )}
        </div>

        {status === 'pending' && (
          <div className="space-y-3">
            <button onClick={handleAccept} disabled={loading}
              className="btn-primary flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" /> Aceptar cotización
            </button>
            <button onClick={handleReject} disabled={loading}
              className="btn-secondary flex items-center justify-center gap-2 text-red-400 border-red-500/30">
              <XCircle className="w-4 h-4" /> Rechazar
            </button>
          </div>
        )}

        {status === 'accepted' && (
          <div className="space-y-3">
            <div className="card bg-green-500/10 border-green-500/30 text-center py-3">
              <p className="text-green-400 font-medium text-sm">✓ Cotización aceptada</p>
            </div>
            <button onClick={handlePay} disabled={loading}
              className="btn-primary flex items-center justify-center gap-2">
              💳 {loading ? 'Procesando...' : `Pagar ${fmt(quote.total)}`}
            </button>
            <p className="text-xs text-center text-muted">Pago seguro procesado por Stripe</p>
          </div>
        )}

        <div className="card text-center">
          <p className="text-xs text-muted mb-1">¿Preguntas?</p>
          <a href={`https://wa.me/${quote.profile?.phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
            className="text-primary-400 font-medium text-sm">
            Contactar a {quote.profile?.full_name}
          </a>
        </div>
      </div>
    </div>
  )
}
