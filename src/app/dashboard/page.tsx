'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useLang } from '@/lib/lang-context'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import { Plus, Clock, DollarSign, Calendar, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'

type Job = { id: string; title: string; scheduled_time: string; address: string; status: string; client: { name: string } }
type Profile = { business_name: string; full_name: string; trade: string }

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const { t, lang } = useLang()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [todayJobs, setTodayJobs] = useState<Job[]>([])
  const [pendingAmount, setPendingAmount] = useState(0)
  const [weekEarnings, setWeekEarnings] = useState(0)

  useEffect(() => {
    if (!loading && !user) router.replace('/')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    const today = format(new Date(), 'yyyy-MM-dd')

    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => setProfile(data))

    supabase.from('jobs').select('*, client:clients(name)')
      .eq('user_id', user.id).eq('scheduled_date', today)
      .neq('status', 'cancelled').order('scheduled_time')
      .then(({ data }) => setTodayJobs((data as unknown as Job[]) || []))

    supabase.from('quotes').select('total').eq('user_id', user.id).eq('status', 'accepted')
      .then(({ data }) => setPendingAmount(data?.reduce((s, q) => s + q.total, 0) || 0))

    const weekStart = format(new Date(Date.now() - 7 * 86400000), 'yyyy-MM-dd')
    supabase.from('quotes').select('total').eq('user_id', user.id).eq('status', 'paid').gte('created_at', weekStart)
      .then(({ data }) => setWeekEarnings(data?.reduce((s, q) => s + q.total, 0) || 0))
  }, [user])

  if (loading || !user) return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const dateLocale = lang === 'es' ? es : enUS
  const todayStr = format(new Date(), "EEEE d 'de' MMMM", { locale: dateLocale })

  const fmt = (n: number) => new Intl.NumberFormat(lang === 'es' ? 'es-MX' : 'en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="min-h-dvh bg-surface">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-4 pt-12 pb-8">
        <p className="text-primary-200 text-sm capitalize">{todayStr}</p>
        <h1 className="font-display text-2xl font-bold text-white mt-1">
          {profile?.business_name || 'ProServicio'}
        </h1>
        <p className="text-primary-100 text-sm">{profile?.trade}</p>
      </div>

      <div className="page-container -mt-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-muted">{t('pending_payment')}</span>
            </div>
            <p className="font-display text-xl font-bold text-yellow-400">{fmt(pendingAmount)}</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-green-400" />
              <span className="text-xs text-muted">{t('this_week')}</span>
            </div>
            <p className="font-display text-xl font-bold text-green-400">{fmt(weekEarnings)}</p>
          </div>
        </div>

        {/* Today's jobs */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-white">{t('today_jobs')}</h2>
          <Link href="/jobs/new" className="flex items-center gap-1 text-primary-400 text-sm font-medium">
            <Plus className="w-4 h-4" /> {t('schedule_job')}
          </Link>
        </div>

        {todayJobs.length === 0 ? (
          <div className="card text-center py-10">
            <Calendar className="w-10 h-10 text-muted mx-auto mb-3" />
            <p className="text-muted text-sm">{t('no_jobs_today')}</p>
            <Link href="/jobs/new" className="btn-primary mt-4 max-w-xs mx-auto block">{t('schedule_job')}</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {todayJobs.map(job => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="card flex items-center gap-3 hover:border-primary-500/50 transition-colors">
                <div className="bg-primary-500/10 rounded-xl p-3">
                  <Clock className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{job.title}</p>
                  <p className="text-sm text-muted truncate">{job.client?.name} · {job.scheduled_time}</p>
                  <p className="text-xs text-muted truncate">{job.address}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <Link href="/quotes/new" className="card flex flex-col items-center py-5 gap-2 hover:border-primary-500/50 transition-colors text-center">
            <span className="text-2xl">📋</span>
            <span className="text-sm font-medium text-white">{t('new_quote')}</span>
          </Link>
          <Link href="/clients/new" className="card flex flex-col items-center py-5 gap-2 hover:border-primary-500/50 transition-colors text-center">
            <span className="text-2xl">👤</span>
            <span className="text-sm font-medium text-white">{t('new_client')}</span>
          </Link>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
