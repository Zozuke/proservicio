'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useLang } from '@/lib/lang-context'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import { Plus, Users, Phone, ChevronRight } from 'lucide-react'

type Client = { id: string; name: string; phone: string; email: string | null; city: string | null }

export default function ClientsPage() {
  const { user } = useAuth()
  const { t } = useLang()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!user) return
    supabase.from('clients').select('*').eq('user_id', user.id).order('name')
      .then(({ data }) => { setClients(data || []); setLoading(false) })
  }, [user])

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  return (
    <div className="min-h-dvh bg-surface">
      <div className="page-container">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-2xl font-bold">{t('clients')}</h1>
          <Link href="/clients/new" className="flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium">
            <Plus className="w-4 h-4" /> {t('new_client')}
          </Link>
        </div>

        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o teléfono..." className="mb-4" />

        {loading ? (
          <div className="flex justify-center pt-20">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-14">
            <Users className="w-10 h-10 text-muted mx-auto mb-3" />
            <p className="text-muted text-sm mb-4">{clients.length === 0 ? 'No tienes clientes aún' : 'Sin resultados'}</p>
            {clients.length === 0 && <Link href="/clients/new" className="btn-primary max-w-xs mx-auto block">{t('new_client')}</Link>}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <Link key={c.id} href={`/clients/${c.id}`} className="card flex items-center gap-3 hover:border-primary-500/50 transition-colors">
                <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-400 font-bold text-sm">{c.name[0].toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{c.name}</p>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-muted" />
                    <p className="text-sm text-muted">{c.phone}</p>
                  </div>
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
