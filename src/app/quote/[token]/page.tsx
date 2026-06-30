import PublicQuoteClient from './PublicQuoteClient'

export default async function PublicQuotePage({
  params
}: {
  params: { token: string }
}) {
  return <PublicQuoteClient token={params.token} />
}
