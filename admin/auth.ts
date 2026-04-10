import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        password: { label: 'Password', type: 'password' },
        serverUrl: { label: 'Server URL', type: 'text' },
        serverApiKey: { label: 'API Key', type: 'text' },
        serverName: { label: 'Server Name', type: 'text' },
      },
      authorize(credentials) {
        if (credentials.password === process.env.ADMIN_PASSWORD) {
          return {
            id: '1',
            name: 'Admin',
            email: 'admin@example.com',
            serverUrl: credentials.serverUrl || undefined,
            serverApiKey: credentials.serverApiKey || undefined,
            serverName: credentials.serverName || undefined,
          } as any
        }
        return null
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      const u = user as any
      if (u?.serverUrl) {
        token.servers = [{
          id: 'server1',
          name: String(u.serverName || 'My Server'),
          url: String(u.serverUrl),
          apiKey: String(u.serverApiKey || ''),
        }]
      }
      return token
    },
    session({ session, token }) {
      if (token.servers) (session as any).servers = token.servers
      return session
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
})
