import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { authConfig } from './auth-config'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        const adminUsername = authConfig.adminUsername
        const adminPasswordHash = authConfig.adminPasswordHash

        if (!adminUsername || !adminPasswordHash) {
          console.error('[AUTH] Admin credentials not configured')
          throw new Error('Admin credentials not configured')
        }

        if (credentials.username !== adminUsername) return null

        try {
          const isValid = await bcrypt.compare(credentials.password, adminPasswordHash)
          if (!isValid) return null
          return {
            id: '1',
            name: adminUsername,
            email: 'admin@shaballshoots.com',
          }
        } catch (error) {
          console.error('[AUTH] Error during password comparison:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: authConfig.nextAuthSecret,
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    },
  },
  debug: process.env.NODE_ENV === 'development',
}
