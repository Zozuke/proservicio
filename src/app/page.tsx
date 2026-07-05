'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { useLang } from '@/lib/lang-context'
import toast from 'react-hot-toast'
import { Wrench, Zap, Hammer } from 'lucide-react'

export default function HomePage() {
  const { user, loading } = useAuth()
  const { t } = useLang()
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [trade, setTrade] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard')
  }, [user, loading, router])

  const handleLogin = async () => {
    if (!email || !password) return toast.error(t('fill_all'))
    setSubmitting(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) toast.error(error.message)
    else router.replace('/dashboard')
    setSubmitting(false)
  }

  const handleRegister = async () => {
    if (!email || !password || !fullName || !businessName || !trade || !phone) return toast.error(t('fill_all'))
    setSubmitting(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
if (error) {
  if (error.status === 429) {
    toast.error('Demasiados intentos. Espera 5 minutos.')
  } else {
    toast.error(error.message)
  }
  setSubmitting(false)
  return
}
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id, full_name: fullName, business_name: businessName,
        trade, phone, email, city, language: 'es', logo_url: null, stripe_account_id: null,
      })
      toast.success('¡Cuenta creada!')
      router.replace('/dashboard')
    }
    setSubmitting(false)
  }

  const handleForgotPassword = async () => {
    if (!email) return toast.error(t('fill_all'))
    setSubmitting(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) toast.error(error.message)
    else setResetSent(true)
    setSubmitting(false)
  }

  if (loading) return (
    <div className="min-h-dvh flex items-center justify-center bg-surface">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-dvh bg-surface flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 px-6 pt-16 pb-12 text-center">
        <div className="flex justify-center gap-3 mb-4">
          <Wrench className="w-7 h-7 text-white/80" />
          <Zap className="w-7 h-7 text-white" />
          <Hammer className="w-7 h-7 text-white/80" />
        </div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">ProServicio</h1>
        <p className="text-primary-100 text-base">{t('tagline')}</p>
      </div>

      {/* Form card */}
      <div className="flex-1 px-4 -mt-6">
        <div className="card max-w-sm mx-auto">
          {/* Tabs */}
          {mode !== 'forgot' && (
            <div className="flex bg-surface rounded-xl p-1 mb-6">
              <button onClick={() => setMode('login')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'login' ? 'bg-primary-500 text-white' : 'text-muted'}`}>
                {t('login')}
              </button>
              <button onClick={() => setMode('register')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'register' ? 'bg-primary-500 text-white' : 'text-muted'}`}>
                {t('register')}
              </button>
            </div>
          )}

          {mode === 'forgot' ? (
            resetSent ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted">{t('reset_link_sent')}</p>
                <button className="btn-secondary" onClick={() => { setMode('login'); setResetSent(false) }}>
                  {t('back_to_login')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label>{t('email')}</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="juan@email.com" />
                </div>
                <button className="btn-primary mt-2" onClick={handleForgotPassword} disabled={submitting}>
                  {submitting ? '...' : t('send_reset_link')}
                </button>
                <button className="text-primary-400 text-sm font-medium w-full text-center" onClick={() => setMode('login')}>
                  {t('back_to_login')}
                </button>
              </div>
            )
          ) : (
          <div className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label>{t('full_name')}</label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Juan García" />
                </div>
                <div>
                  <label>{t('business_name')}</label>
                  <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="García Plomería" />
                </div>
                <div>
                  <label>{t('trade')}</label>
                  <input value={trade} onChange={e => setTrade(e.target.value)} placeholder="Plomero, Electricista, Albañil..." />
                </div>
                <div>
                  <label>{t('phone')}</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+52 55 1234 5678" type="tel" />
                </div>
                <div>
                  <label>{t('city')}</label>
                  <input value={city} onChange={e => setCity(e.target.value)} placeholder="Ciudad de México" />
                </div>
              </>
            )}
            <div>
              <label>{t('email')}</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="juan@email.com" />
            </div>
            <div>
              <label>{t('password')}</label>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" />
            </div>
            {mode === 'login' && (
              <button className="text-primary-400 text-sm font-medium -mt-2 text-right w-full" onClick={() => setMode('forgot')}>
                {t('forgot_password')}
              </button>
            )}
            <button
              className="btn-primary mt-2"
              onClick={mode === 'login' ? handleLogin : handleRegister}
              disabled={submitting}>
              {submitting ? '...' : mode === 'login' ? t('login') : t('register')}
            </button>
          </div>
          )}
        </div>

        {/* Value props */}
        <div className="max-w-sm mx-auto mt-8 mb-6 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: '📋', label: mode === 'login' ? 'Cotiza' : 'Cotiza rápido' },
            { icon: '📅', label: 'Agenda' },
            { icon: '💳', label: 'Cobra' },
          ].map(item => (
            <div key={item.label} className="card py-3">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs text-muted font-medium">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
