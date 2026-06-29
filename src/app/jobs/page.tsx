'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useLang } from '@/lib/lang-context'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import { Plus, Calendar, MapPin, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'

type Job = {
  id: string; title: string; scheduled_date: string; scheduled_time: string
  address: string; status: string; client: { name: string }
}

const statusClass: Record<string, string> = {
  scheduled: 'badge-scheduled', in_progress: 'badge-scheduled',
  completed: 'badge-completed', cancelled: 'badge-cancelled',
}

export default function JobsPage() {
  const { user } = useAuth()
  const { t, lang } = useLang()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('jobs').select('*, client:clients(name)').eq('user_id', user.id)
      .order('scheduled_date', { ascending: true }).order('scheduled_time', { ascending: true })
      .then(({ data }) => { setJobs((data as unknown as Job[]) || []); setLoading(false) })
  }, [user])

  const locale = lang === 'es' ? es : enUS

  const statusLabel: Record<string, string> = {
    scheduled: t('job_status_scheduled'), in_progress: t('job_status_progress'),
    completed: t('job_status_completed'), cancelled: t('job_status_cancelled'),
  }

  return (
    <div className="min-h-dvh bg-surface">
      <div className="page-container">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold">{t('jobs')}</h1>
          <Link href="/jobs/new" className="flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium">
            <Plus className="w-4 h-4" /> {t('new_job')}
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center pt-20">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="card text-center py-14">
            <Calendar className="w-10 h-10 text-muted mx-auto mb-3" />
            <p className="text-muted text-sm mb-4">No tienes trabajos agendados</p>
            <Link href="/jobs/new" className="btn-primary max-w-xs mx-auto block">{t('new_job')}</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="card flex items-start gap-3 hover:border-primary-500/50 transition-colors">
                <div className="bg-primary-500/10 rounded-xl p-3 flex-shrink-0 mt-0.5">
                  <Calendar className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-white truncate">{job.title}</p>
                    <span className={`badge flex-shrink-0 ${statusClass[job.status]}`}>{statusLabel[job.status]}</span>
                  </div>
                  <p className="text-sm text-muted mt-0.5">{job.client?.name}</p>
                  <p className="text-sm text-muted">
                    {format(new Date(job.scheduled_date + 'T12:00:00'), "EEE d MMM", { locale })} · {job.scheduled_time}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-muted flex-shrink-0" />
                    <p className="text-xs text-muted truncate">{job.address}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted flex-shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
