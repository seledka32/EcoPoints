import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import { compare } from 'bcryptjs'

import getMongoClientPromise from '@/lib/server/mongodb'

export function getAuthOptions(): NextAuthOptions {
  return {
    adapter: MongoDBAdapter(getMongoClientPromise()),
    providers: [
      CredentialsProvider({
        name: 'credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          const email = credentials?.email
          const password = credentials?.password

          if (!email || !password) return null

          const client = await getMongoClientPromise()
          const db = client.db()

          const user = await db.collection('users').findOne<{
            _id: unknown
            email: string
            passwordHash?: string
          }>({ email })

          if (!user?.passwordHash) return null

          const ok = await compare(password, user.passwordHash)
          if (!ok) return null

          return {
            id: String(user._id),
            email: user.email,
          }
        },
      }),
    ],
    pages: {
      signIn: '/auth/login',
      error: '/auth/error',
    },
    session: {
      strategy: 'jwt',
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user?.id) token.sub = user.id
        return token
      },
      async session({ session, token }) {
        if (session.user && token.sub) {
          session.user.id = token.sub
        }
        return session
      },
    },
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  }
}

