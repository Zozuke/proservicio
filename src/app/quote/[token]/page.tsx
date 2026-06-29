import { createClient } from '@supabase/supabase-js'
import PublicQuoteClient from './PublicQuoteClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function PublicQuotePage({ params }: { params: { token: string } }) {
  const { data: quote } = await supabase
    .from('quotes')
    .select('*, client:clients(name), profile:profiles(business_name, trade, phone, full_name)')
    .eq('public_token', params.token)
    .single()

  if (!quote) {
    return (
      <div className="min-h-dvh bg-surface flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h1 className="font-display text-xl font-bold text-white mb-2">Cotización no encontrada</h1>
          <p className="text-muted">El link puede haber expirado o ser incorrecto.</p>
        </div>
      </div>
    )
  }

  return <PublicQuoteClient quote={quote} />
}
