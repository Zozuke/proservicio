'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLang } from '@/lib/lang-context'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewClientPage() {
  const { user } = useAuth()
  const { t } = useLang()
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name || !phone) return toast.error(t('fill_all'))
    setSubmitting(true)
    const { error } = await supabase.from('clients').insert({
      user_id: user!.id, name, phone,
      email: email || null, address: address || null, notes: notes || null,
    })
    if (error) { toast.error(t('error_generic')); setSubmitting(false); return }
    toast.success('Cliente guardado')
    router.replace('/clients')
  }

  return (
    <div className="min-h-dvh bg-surface">
      <div className="page-container">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="btn-ghost p-2"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="font-display text-xl font-bold">{t('new_client')}</h1>
        </div>

        <div className="space-y-4">
          <div>
            <label>{t('client_name')}</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="María López" />
          </div>
          <div>
            <label>{t('client_phone')}</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="+52 55 1234 5678" />
          </div>
          <div>
            <label>{t('client_email')}</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="maria@email.com" />
          </div>
          <div>
            <label>{t('client_address')}</label>
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle, número, colonia" />
          </div>
          <div>
            <label>{t('client_notes')}</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Notas sobre el cliente, trabajos anteriores..." />
          </div>
          <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? '...' : t('save')}
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
