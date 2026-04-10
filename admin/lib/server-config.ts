import fs from 'fs'
import { auth } from '@/auth'
import { ServerConfig } from './types'

function getConfiguredServers(): ServerConfig[] {
  // Electron: JSON 파일에서 읽기
  const configPath = process.env.ELECTRON_CONFIG_PATH
  if (configPath) {
    try {
      if (fs.existsSync(configPath)) {
        const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        return data.servers ?? []
      }
    } catch (err) {
      console.error('Failed to read Electron config:', err)
    }
    return []
  }

  // 웹: .env에서 읽기
  const servers: ServerConfig[] = []
  let i = 1
  while (true) {
    const prefix = i === 1 ? 'SERVER' : `SERVER${i}`
    const url = process.env[`${prefix}_URL`]
    if (!url) break
    servers.push({
      id: `server${i}`,
      name: process.env[`${prefix}_NAME`] ?? `Server ${i}`,
      url,
      apiKey: process.env[`${prefix}_API_KEY`] ?? '',
      description: process.env[`${prefix}_DESCRIPTION`],
    })
    i++
  }

  if (servers.length > 0) return servers

  // 폴백: CLOUD_URL / GCP_URL / RAILWAY_URL 명명 규칙 지원
  const namedEnvs: { key: string; id: string; name: string; description: string }[] = [
    { key: 'CLOUD', id: 'cloud', name: 'Cloud', description: '' },
    { key: 'GCP', id: 'gcp-vm', name: 'GCP VM', description: '' },
    { key: 'RAILWAY', id: 'railway', name: 'Railway', description: '' },
  ]
  for (const s of namedEnvs) {
    const url = process.env[`${s.key}_URL`]
    if (url) {
      servers.push({
        id: s.id,
        name: process.env[`${s.key}_NAME`] ?? s.name,
        url,
        apiKey: process.env[`${s.key}_API_KEY`] ?? '',
        description: process.env[`${s.key}_DESCRIPTION`] ?? s.description,
      })
    }
  }

  return servers
}

export async function getServers(): Promise<ServerConfig[]> {
  const configured = getConfiguredServers()
  if (configured.length > 0) return configured

  const session = await auth()
  const sessionServers = (session as any)?.servers as ServerConfig[] | undefined
  return sessionServers ?? []
}

export async function getServer(id: string): Promise<ServerConfig> {
  const servers = await getServers()
  const server = servers.find((s) => s.id === id)
  if (!server) throw new Error(`Unknown server: ${id}. Available: ${servers.map((s) => s.id).join(', ')}`)
  return server
}
