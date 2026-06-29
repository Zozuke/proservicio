'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLang } from '@/lib/lang-context'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

type Client = { id: string; name: string }

export default function NewJobPage() {
  const { user } = useAuth()
  const { t } = useLang()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [time, setTime] = useState('09:00')
  const [address, setAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('clients').select('id, name').eq('user_id', user.id).order('name')
      .then(({ data }) => setClients(data || []))
  }, [user])

  const handleSubmit = async () => {
    if (!clientId || !title || !address) return toast.error(t('fill_all'))
    setSubmitting(true)
    const { error } = await supabase.from('jobs').insert({
      user_id: user!.id, client_id: clientId, title, description,
      scheduled_date: date, scheduled_time: time, address, status: 'scheduled',
    })
    if (error) { toast.error(t('error_generic')); setSubmitting(false); return }
    toast.success('Trabajo agendado')
    router.replace('/jobs')
  }

  return (
    <div className="min-h-dvh bg-surface">
      <div className="page-container">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="btn-ghost p-2"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="font-display text-xl font-bold">{t('new_job')}</h1>
        </div>

        <div className="space-y-4">
          <div>
            <label>{t('clients')}</label>
            <select value={clientId} onChange={e => setClientId(e.target.value)}>
              <option value="">-- Selecciona cliente --</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label>{t('job_title')}</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Instalación eléctrica, reparación de fuga..." />
          </div>

          <div>
            <label>Descripción (opcional)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Detalles del trabajo..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label>{t('job_date')}</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label>{t('job_time')}</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>

          <div>
            <label>{t('job_address')}</label>
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle, número, colonia, ciudad" />
          </div>

          <button className="btn-primary mt-2" onClick={handleSubmit} disabled={submitting}>
            {submitting ? '...' : 'Agendar trabajo'}
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
