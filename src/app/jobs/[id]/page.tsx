'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLang } from '@/lib/lang-context'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import { ArrowLeft, MapPin, Clock, User, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'

type Job = {
  id: string; title: string; description: string; scheduled_date: string
  scheduled_time: string; address: string; status: string
  client: { name: string; phone: string }
}

const statusClass: Record<string, string> = {
  scheduled: 'badge-scheduled', in_progress: 'badge-scheduled',
  completed: 'badge-completed', cancelled: 'badge-cancelled',
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { t, lang } = useLang()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)

  useEffect(() => {
    if (!user || !id) return
    supabase.from('jobs').select('*, client:clients(name, phone)').eq('id', id).eq('user_id', user.id).single()
      .then(({ data }) => setJob(data as unknown as Job))
  }, [user, id])

  const markComplete = async () => {
    await supabase.from('jobs').update({ status: 'completed' }).eq('id', id)
    setJob(prev => prev ? { ...prev, status: 'completed' } : prev)
    toast.success('¡Trabajo completado!')
  }

  const openMaps = () => {
    if (!job) return
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`, '_blank')
  }

  const locale = lang === 'es' ? es : enUS

  const statusLabel: Record<string, string> = {
    scheduled: t('job_status_scheduled'), in_progress: t('job_status_progress'),
    completed: t('job_status_completed'), cancelled: t('job_status_cancelled'),
  }

  if (!job) return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-dvh bg-surface">
      <div className="page-container">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="btn-ghost p-2"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="font-display text-xl font-bold flex-1 truncate">{job.title}</h1>
          <span className={`badge ${statusClass[job.status]}`}>{statusLabel[job.status]}</span>
        </div>

        <div className="space-y-3">
          <div className="card space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted flex-shrink-0" />
              <div>
                <p className="font-medium text-white">{job.client?.name}</p>
                <a href={`tel:${job.client?.phone}`} className="text-sm text-primary-400">{job.client?.phone}</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted flex-shrink-0" />
              <p className="text-white">
                {format(new Date(job.scheduled_date + 'T12:00:00'), "EEEE d 'de' MMMM", { locale })} · {job.scheduled_time}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted flex-shrink-0 mt-0.5" />
              <p className="text-white">{job.address}</p>
            </div>
          </div>

          {job.description && (
            <div className="card">
              <p className="text-xs text-muted mb-1">Descripción</p>
              <p className="text-white text-sm">{job.description}</p>
            </div>
          )}

          <button onClick={openMaps} className="btn-secondary flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" /> {t('open_maps')}
          </button>

          <a href={`https://wa.me/${job.client?.phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
            className="btn-secondary flex items-center justify-center gap-2 block text-center">
            💬 Contactar cliente por WhatsApp
          </a>

          {job.status === 'scheduled' && (
            <button onClick={markComplete} className="btn-primary flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" /> {t('mark_complete')}
            </button>
          )}

          {job.status === 'completed' && (
            <div className="card bg-green-500/10 border-green-500/30 text-center py-4">
              <p className="text-green-400 font-semibold">✓ Trabajo completado</p>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
