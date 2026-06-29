import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const quoteId = searchParams.get('quoteId')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (quoteId) {
    await supabase.from('quotes').update({ status: 'paid' }).eq('id', quoteId)
    // Get quote public token to redirect
    const { data } = await supabase.from('quotes').select('public_token').eq('id', quoteId).single()
    if (data) return NextResponse.redirect(`${appUrl}/quote/${data.public_token}?paid=1`)
  }

  return NextResponse.redirect(`${appUrl}/dashboard`)
}
