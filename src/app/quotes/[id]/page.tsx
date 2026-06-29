'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLang } from '@/lib/lang-context'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import { ArrowLeft, Copy, Share2, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

type Quote = {
  id: string; title: string; description: string; total: number; subtotal: number
  commission: number; status: string; public_token: string; created_at: string
  items: Array<{ id: string; description: string; quantity: number; unit_price: number; total: number }>
  notes: string; client: { name: string; phone: string }
}

const statusClass: Record<string, string> = {
  pending: 'badge-pending', accepted: 'badge-accepted',
  rejected: 'badge-rejected', paid: 'badge-paid',
}

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { t, lang } = useLang()
  const router = useRouter()
  const [quote, setQuote] = useState<Quote | null>(null)

  useEffect(() => {
    if (!user || !id) return
    supabase.from('quotes').select('*, client:clients(name, phone)').eq('id', id).eq('user_id', user.id).single()
      .then(({ data }) => setQuote(data as unknown as Quote))
  }, [user, id])

  const fmt = (n: number) => new Intl.NumberFormat(lang === 'es' ? 'es-MX' : 'en-US', { style: 'currency', currency: 'USD' }).format(n)

  const publicUrl = quote ? `${process.env.NEXT_PUBLIC_APP_URL}/quote/${quote.public_token}` : ''

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl)
    toast.success(t('link_copied'))
  }

  const shareWhatsApp = () => {
    if (!quote) return
    const msg = encodeURIComponent(`Hola ${quote.client.name}, te comparto tu cotización de *${quote.title}* por *${fmt(quote.total)}*:\n\n${publicUrl}`)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  const statusLabel: Record<string, string> = {
    pending: t('status_pending'), accepted: t('status_accepted'),
    rejected: t('status_rejected'), paid: t('status_paid'),
  }

  if (!quote) return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-dvh bg-surface">
      <div className="page-container">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="btn-ghost p-2"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="font-display text-xl font-bold flex-1 truncate">{quote.title}</h1>
          <span className={`badge ${statusClass[quote.status]}`}>{statusLabel[quote.status]}</span>
        </div>

        {/* Client info */}
        <div className="card mb-4">
          <p className="text-xs text-muted mb-1">Cliente</p>
          <p className="font-semibold text-white">{quote.client?.name}</p>
          <p className="text-sm text-muted">{quote.client?.phone}</p>
          <p className="text-xs text-muted mt-1">{format(new Date(quote.created_at), 'dd/MM/yyyy')}</p>
        </div>

        {/* Items */}
        <div className="card mb-4">
          <p className="text-xs text-muted mb-3 font-medium">{t('work_details')}</p>
          {quote.description && <p className="text-sm text-slate-300 mb-3">{quote.description}</p>}
          <div className="space-y-2">
            {quote.items?.map(item => (
              <div key={item.id} className="flex justify-between items-start py-1.5 border-b border-border last:border-0">
                <div>
                  <p className="text-sm text-white">{item.description}</p>
                  <p className="text-xs text-muted">{item.quantity} × {fmt(item.unit_price)}</p>
                </div>
                <p className="text-sm font-medium text-white">{fmt(item.total)}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-sm text-muted">
              <span>{t('subtotal')}</span><span>{fmt(quote.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted">
              <span>{t('commission')}</span><span>{fmt(quote.commission)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-border pt-2">
              <span>{t('total')}</span><span className="text-primary-400">{fmt(quote.total)}</span>
            </div>
          </div>
          {quote.notes && <p className="text-xs text-muted mt-3 pt-3 border-t border-border">{quote.notes}</p>}
        </div>

        {/* Share actions */}
        {quote.status === 'pending' && (
          <div className="space-y-3">
            <p className="text-sm text-muted text-center">Comparte el link con tu cliente para que acepte y pague</p>
            <button onClick={shareWhatsApp} className="btn-primary flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" /> Enviar por WhatsApp
            </button>
            <button onClick={copyLink} className="btn-secondary flex items-center justify-center gap-2">
              <Copy className="w-4 h-4" /> {t('copy_link')}
            </button>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost flex items-center justify-center gap-2 text-sm">
              <ExternalLink className="w-4 h-4" /> Ver como cliente
            </a>
          </div>
        )}

        {quote.status === 'paid' && (
          <div className="card bg-green-500/10 border-green-500/30 text-center py-6">
            <p className="text-3xl mb-2">💰</p>
            <p className="font-bold text-green-400 text-lg">{t('payment_success')}</p>
            <p className="text-sm text-muted mt-1">{fmt(quote.total)} recibidos</p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
