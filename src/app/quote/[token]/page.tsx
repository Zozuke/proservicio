import { Suspense } from 'react'
import PublicQuoteClient from './PublicQuoteClient'

export default async function PublicQuotePage({
  params
}: {
  params: { token: string }
}) {
  return (
    <Suspense fallback={null}>
      <PublicQuoteClient token={params.token} />
    </Suspense>
  )
}
