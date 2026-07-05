'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/lang-context'
import toast from 'react-hot-toast'
import { Wrench, Zap, Hammer, CheckCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const { t } = useLang()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [ready, setReady] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Supabase reads the recovery token from the URL hash automatically and
    // fires PASSWORD_RECOVERY once the temporary session is established.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    // Fallback: if a session already exists (e.g. fast redirect), allow reset too.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    const timeout = setTimeout(() => {
      setInvalid(prev => (ready ? prev : true))
    }, 4000)
    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async () => {
    if (!password || password.length < 6) return toast.error(t('error_required'))
    if (password !== confirm) return toast.error(t('passwords_no_match'))
    setSubmitting(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) toast.error(error.message)
    else {
      setDone(true)
      toast.success(t('password_updated'))
      setTimeout(() => router.replace('/'), 1500)
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-dvh bg-surface flex flex-col">
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 px-6 pt-16 pb-12 text-center">
        <div className="flex justify-center gap-3 mb-4">
          <Wrench className="w-7 h-7 text-white/80" />
          <Zap className="w-7 h-7 text-white" />
          <Hammer className="w-7 h-7 text-white/80" />
        </div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">ProServicio</h1>
      </div>

      <div className="flex-1 px-4 -mt-6">
        <div className="card max-w-sm mx-auto">
          {done ? (
            <div className="text-center space-y-3 py-4">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
              <p className="text-white font-medium">{t('password_updated')}</p>
            </div>
          ) : invalid && !ready ? (
            <div className="text-center space-y-3 py-4">
              <p className="text-sm text-muted">{t('reset_invalid_link')}</p>
              <button className="btn-primary" onClick={() => router.replace('/')}>
                {t('back_to_login')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label>{t('new_password')}</label>
                <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" />
              </div>
              <div>
                <label>{t('confirm_password')}</label>
                <input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" placeholder="••••••••" />
              </div>
              <button className="btn-primary mt-2" onClick={handleSubmit} disabled={submitting || !ready}>
                {submitting ? '...' : t('update_password')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
