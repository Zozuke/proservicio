'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLang } from '@/lib/lang-context'
import { supabase, QuoteItem } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'

type Client = { id: string; name: string; phone: string }

const COMMISSION = 0.02

export default function NewQuotePage() {
  const { user } = useAuth()
  const { t, lang } = useLang()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<QuoteItem[]>([
    { id: uuidv4(), description: '', quantity: 1, unit_price: 0, total: 0 }
  ])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('clients').select('id, name, phone').eq('user_id', user.id).order('name')
      .then(({ data }) => setClients(data || []))
  }, [user])

  const updateItem = (id: string, field: keyof QuoteItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const updated = { ...item, [field]: value }
      updated.total = Number(updated.quantity) * Number(updated.unit_price)
      return updated
    }))
  }

  const addItem = () => setItems(prev => [...prev, { id: uuidv4(), description: '', quantity: 1, unit_price: 0, total: 0 }])
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))

  const subtotal = items.reduce((s, i) => s + i.total, 0)
  const commission = subtotal * COMMISSION
  const total = subtotal + commission

  const fmt = (n: number) => new Intl.NumberFormat(lang === 'es' ? 'es-MX' : 'en-US', { style: 'currency', currency: 'USD' }).format(n)

  const handleSubmit = async () => {
    if (!clientId || !title) return toast.error(t('fill_all'))
    if (items.some(i => !i.description || i.unit_price <= 0)) return toast.error(t('fill_all'))
    setSubmitting(true)
    const publicToken = uuidv4()
    const { data, error } = await supabase.from('quotes').insert({
      user_id: user!.id, client_id: clientId, title, description, notes,
      items, subtotal, commission, total, status: 'pending',
      public_token: publicToken, stripe_payment_intent_id: null,
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    }).select().single()
    if (error) { toast.error(t('error_generic')); setSubmitting(false); return }
    toast.success(t('quote_sent'))
    router.replace(`/quotes/${data.id}`)
  }

  return (
    <div className="min-h-dvh bg-surface">
      <div className="page-container">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="btn-ghost p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold">{t('new_quote')}</h1>
        </div>

        <div className="space-y-4">
          {/* Client selector */}
          <div>
            <label>{t('clients')}</label>
            <select value={clientId} onChange={e => setClientId(e.target.value)}>
              <option value="">-- Selecciona cliente --</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {clients.length === 0 && (
              <p className="text-xs text-muted mt-1">
                <a href="/clients/new" className="text-primary-400 underline">Crea un cliente primero</a>
              </p>
            )}
          </div>

          <div>
            <label>{t('quote_title')}</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Reparación de tubería, instalación eléctrica..." />
          </div>

          <div>
            <label>{t('quote_desc')}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Descripción del trabajo..." />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="mb-0">Ítems del trabajo</label>
              <button onClick={addItem} className="flex items-center gap-1 text-primary-400 text-sm">
                <Plus className="w-4 h-4" /> {t('add_item')}
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted font-medium">Ítem {idx + 1}</span>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(item.id)} className="text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <input className="mb-2" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} placeholder={t('item_desc')} />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs">{t('quantity')}</label>
                      <input type="number" min="1" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="text-xs">{t('unit_price')}</label>
                      <input type="number" min="0" value={item.unit_price || ''} onChange={e => updateItem(item.id, 'unit_price', Number(e.target.value))} placeholder="0.00" />
                    </div>
                  </div>
                  {item.total > 0 && (
                    <p className="text-right text-sm text-primary-400 mt-1 font-medium">{fmt(item.total)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label>Notas adicionales (opcional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Garantía, condiciones, materiales incluidos..." />
          </div>

          {/* Totals */}
          {subtotal > 0 && (
            <div className="card space-y-2">
              <div className="flex justify-between text-sm text-muted">
                <span>{t('subtotal')}</span><span className="text-white">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted">
                <span>{t('commission')}</span><span className="text-white">{fmt(commission)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-lg">
                <span>{t('total')}</span><span className="text-primary-400">{fmt(total)}</span>
              </div>
            </div>
          )}

          <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? '...' : t('send_quote')}
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
