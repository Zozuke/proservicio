'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLang } from '@/lib/lang-context'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import { LogOut, Globe, User, CreditCard, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

type Profile = { full_name: string; business_name: string; trade: string; phone: string; city: string; stripe_account_id: string | null }

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { t, lang, setLang } = useLang()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ full_name: '', business_name: '', trade: '', phone: '', city: '' })
  const [saving, setSaving] = useState(false)
  const [stripeStatus, setStripeStatus] = useState<'none' | 'pending' | 'connected'>('none')
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => {
        setProfile(data)
        if (data) setForm({ full_name: data.full_name, business_name: data.business_name, trade: data.trade, phone: data.phone, city: data.city || '' })
      })
    fetch(`/api/stripe/connect?userId=${user.id}`)
      .then(res => res.json())
      .then(({ connected, pending }) => setStripeStatus(connected ? 'connected' : pending ? 'pending' : 'none'))
      .catch(() => {})
  }, [user])

  const handleConnectStripe = async () => {
    if (!user) return
    setConnecting(true)
    try {
      const res = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      const { url, error } = await res.json()
      if (error || !url) throw new Error(error)
      window.location.href = url
    } catch {
      toast.error(t('stripe_connect_error'))
      setConnecting(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('profiles').update(form).eq('id', user!.id)
    setProfile(prev => prev ? { ...prev, ...form } : prev)
    toast.success(t('save'))
    setEditing(false)
    setSaving(false)
  }

  const handleLogout = async () => {
    await signOut()
    router.replace('/')
  }

  return (
    <div className="min-h-dvh bg-surface">
      <div className="page-container">
        <h1 className="font-display text-2xl font-bold mb-6">{t('settings')}</h1>

        {/* Language */}
        <div className="card mb-3">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-5 h-5 text-primary-400" />
            <span className="font-medium text-white">{t('language')}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setLang('es')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${lang === 'es' ? 'bg-primary-500 text-white' : 'bg-surface text-muted border border-border'}`}>
              🇲🇽 Español
            </button>
            <button onClick={() => setLang('en')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${lang === 'en' ? 'bg-primary-500 text-white' : 'bg-surface text-muted border border-border'}`}>
              🇺🇸 English
            </button>
          </div>
        </div>

        {/* Profile */}
        <div className="card mb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary-400" />
              <span className="font-medium text-white">{t('profile')}</span>
            </div>
            <button onClick={() => setEditing(!editing)} className="text-primary-400 text-sm font-medium">
              {editing ? t('cancel') : 'Editar'}
            </button>
          </div>

          {editing ? (
            <div className="space-y-3">
              {[
                { key: 'full_name', label: t('full_name'), placeholder: 'Juan García' },
                { key: 'business_name', label: t('business_name'), placeholder: 'García Plomería' },
                { key: 'trade', label: t('trade'), placeholder: 'Plomero' },
                { key: 'phone', label: t('phone'), placeholder: '+52 55 1234 5678' },
                { key: 'city', label: t('city'), placeholder: 'Ciudad de México' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs">{field.label}</label>
                  <input value={form[field.key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder} />
                </div>
              ))}
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '...' : t('save')}
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="font-semibold text-white">{profile?.business_name}</p>
              <p className="text-sm text-muted">{profile?.full_name} · {profile?.trade}</p>
              <p className="text-sm text-muted">{profile?.phone}</p>
              <p className="text-sm text-muted">{profile?.city}</p>
            </div>
          )}
        </div>

        {/* Stripe */}
        <button
          onClick={stripeStatus !== 'connected' ? handleConnectStripe : undefined}
          disabled={connecting}
          className="card mb-3 w-full text-left">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-primary-400" />
            <div className="flex-1">
              <p className="font-medium text-white">{t('payments')}</p>
              <p className={`text-sm ${stripeStatus === 'connected' ? 'text-green-400' : stripeStatus === 'pending' ? 'text-yellow-400' : 'text-muted'}`}>
                {connecting
                  ? '...'
                  : stripeStatus === 'connected' ? t('stripe_connected')
                  : stripeStatus === 'pending' ? t('stripe_pending')
                  : t('connect_stripe')}
              </p>
            </div>
            {stripeStatus !== 'connected' && <ChevronRight className="w-4 h-4 text-muted" />}
          </div>
        </button>

        {/* Email */}
        <div className="card mb-6">
          <p className="text-xs text-muted">Cuenta</p>
          <p className="text-white mt-0.5">{user?.email}</p>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="btn-secondary flex items-center justify-center gap-2 text-red-400 border-red-500/30">
          <LogOut className="w-4 h-4" /> {t('logout')}
        </button>
      </div>
      <BottomNav />
    </div>
  )
}
