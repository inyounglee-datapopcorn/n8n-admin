'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [serverUrl, setServerUrl] = useState('')
  const [serverApiKey, setServerApiKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isElectron, setIsElectron] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
      setIsElectron(true)
      setLoading(true)
      window.electronAPI.getSessionPassword().then(async (pw) => {
        const result = await signIn('credentials', { password: pw, redirect: false })
        if (result?.error) {
          setLoading(false)
        } else {
          router.push('/')
        }
      })
    }
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const credentials: Record<string, string> = { password, redirect: 'false' }
    if (serverUrl.trim()) credentials.serverUrl = serverUrl.trim()
    if (serverApiKey.trim()) credentials.serverApiKey = serverApiKey.trim()

    const result = await signIn('credentials', { ...credentials, redirect: false })
    if (result?.error) {
      setError('비밀번호가 올바르지 않습니다.')
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  if (isElectron && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40">
        <p className="text-muted-foreground">로그인 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">n8n Admin</CardTitle>
          <CardDescription>데이터클로드 서버 관리 대시보드</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">비밀번호</label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>

            {!isElectron && (
              <>
                <div className="space-y-2">
                  <label htmlFor="serverUrl" className="text-sm font-medium">n8n 서버 URL</label>
                  <Input
                    id="serverUrl"
                    type="url"
                    placeholder="http://localhost:5678"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="serverApiKey" className="text-sm font-medium">API Key</label>
                  <Input
                    id="serverApiKey"
                    type="password"
                    placeholder="n8n API 키 입력"
                    value={serverApiKey}
                    onChange={(e) => setServerApiKey(e.target.value)}
                  />
                </div>
              </>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
