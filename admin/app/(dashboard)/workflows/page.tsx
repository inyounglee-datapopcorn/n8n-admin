import { getServers } from '@/lib/server-config'
import WorkflowsClient from './workflows-client'

export const dynamic = 'force-dynamic'

export default async function WorkflowsPage() {
  const servers = await getServers()
  return <WorkflowsClient servers={servers} />
}
