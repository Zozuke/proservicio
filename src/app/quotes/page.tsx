'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useLang } from '@/lib/lang-context'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import { Plus, FileText, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

type Quote = {
  id: string; title: string; total: number; status: string; created_at: string
  client: { name: string }
}

const statusClass: Record<string, string> = {
  pending: 'badge-pending', accepted: 'badge-accepted',
  rejected: 'badge-rejected', paid: 'badge-paid',
}

export default function QuotesPage() {
  const { user } = useAuth()
  const { t, lang } = useLang()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('quotes').select('*, client:clients(name)')
      .eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setQuotes((data as unknown as Quote[]) || []); setLoading(false) })
  }, [user])

  const fmt = (n: number) => new Intl.NumberFormat(lang === 'es' ? 'es-MX' : 'en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  const statusLabel: Record<string, string> = {
    pending: t('status_pending'), accepted: t('status_accepted'),
    rejected: t('status_rejected'), paid: t('status_paid'),
  }

  return (
    <div className="min-h-dvh bg-surface">
      <div className="page-container">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold">{t('quotes')}</h1>
          <Link href="/quotes/new" className="flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium">
            <Plus className="w-4 h-4" /> {t('new_quote')}
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center pt-20">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : quotes.length === 0 ? (
          <div className="card text-center py-14">
            <FileText className="w-10 h-10 text-muted mx-auto mb-3" />
            <p className="text-muted text-sm mb-4">No tienes cotizaciones aún</p>
            <Link href="/quotes/new" className="btn-primary max-w-xs mx-auto block">{t('new_quote')}</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {quotes.map(q => (
              <Link key={q.id} href={`/quotes/${q.id}`} className="card flex items-center gap-3 hover:border-primary-500/50 transition-colors">
                <div className="bg-primary-500/10 rounded-xl p-3">
                  <FileText className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{q.title}</p>
                  <p className="text-sm text-muted">{q.client?.name} · {format(new Date(q.created_at), 'dd/MM/yy')}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-white">{fmt(q.total)}</p>
                  <span className={`badge ${statusClass[q.status] || 'badge-pending'}`}>{statusLabel[q.status]}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
