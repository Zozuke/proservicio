'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useLang } from '@/lib/lang-context'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import { ArrowLeft, Phone, Mail, MapPin, FileText, Plus } from 'lucide-react'

type Client = { id: string; name: string; phone: string; email: string | null; address: string | null; notes: string | null }
type Quote = { id: string; title: string; total: number; status: string; created_at: string }

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { t, lang } = useLang()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [quotes, setQuotes] = useState<Quote[]>([])

  useEffect(() => {
    if (!user || !id) return
    supabase.from('clients').select('*').eq('id', id).eq('user_id', user.id).single()
      .then(({ data }) => setClient(data))
    supabase.from('quotes').select('id, title, total, status, created_at').eq('client_id', id).order('created_at', { ascending: false })
      .then(({ data }) => setQuotes(data || []))
  }, [user, id])

  const fmt = (n: number) => new Intl.NumberFormat(lang === 'es' ? 'es-MX' : 'en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  const statusClass: Record<string, string> = {
    pending: 'badge-pending', accepted: 'badge-accepted', rejected: 'badge-rejected', paid: 'badge-paid',
  }
  const statusLabel: Record<string, string> = {
    pending: t('status_pending'), accepted: t('status_accepted'), rejected: t('status_rejected'), paid: t('status_paid'),
  }

  if (!client) return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-dvh bg-surface">
      <div className="page-container">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="btn-ghost p-2"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="font-display text-xl font-bold">{client.name}</h1>
        </div>

        <div className="card mb-4 space-y-3">
          <a href={`tel:${client.phone}`} className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-primary-400" />
            <span className="text-primary-400">{client.phone}</span>
          </a>
          {client.email && (
            <a href={`mailto:${client.email}`} className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted" />
              <span className="text-muted">{client.email}</span>
            </a>
          )}
          {client.address && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted flex-shrink-0" />
              <span className="text-muted">{client.address}</span>
            </div>
          )}
          {client.notes && (
            <p className="text-sm text-muted border-t border-border pt-2">{client.notes}</p>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white">{t('quotes')}</h2>
          <Link href={`/quotes/new?clientId=${client.id}`} className="flex items-center gap-1 text-primary-400 text-sm">
            <Plus className="w-4 h-4" /> {t('new_quote')}
          </Link>
        </div>

        {quotes.length === 0 ? (
          <div className="card text-center py-8">
            <FileText className="w-8 h-8 text-muted mx-auto mb-2" />
            <p className="text-muted text-sm">Sin cotizaciones</p>
          </div>
        ) : (
          <div className="space-y-2">
            {quotes.map(q => (
              <Link key={q.id} href={`/quotes/${q.id}`} className="card flex items-center justify-between hover:border-primary-500/50 transition-colors">
                <div>
                  <p className="font-medium text-white text-sm">{q.title}</p>
                  <span className={`badge ${statusClass[q.status]}`}>{statusLabel[q.status]}</span>
                </div>
                <p className="font-semibold text-white">{fmt(q.total)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
