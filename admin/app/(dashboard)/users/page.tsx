import { getServers } from '@/lib/server-config'
import UsersClient from './users-client'

export default async function UsersPage() {
  const servers = await getServers()
  return <UsersClient servers={servers} />
}
