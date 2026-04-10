import { getServers } from '@/lib/server-config'
import CredentialsClient from './credentials-client'

export default async function CredentialsPage() {
  const servers = await getServers()
  return <CredentialsClient servers={servers} />
}
