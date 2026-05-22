import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import { compare } from 'bcryptjs'
import { ObjectId } from 'mongodb'

import getMongoClientPromise from '@/lib/server/mongodb'
import { generateUniqueShortCode } from '@/lib/server/short-code'
import { addPoints } from '@/lib/server/transactions'

export function getAuthOptions(): NextAuthOptions {
  return {
    adapter: MongoDBAdapter(getMongoClientPromise()),
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
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
            role?: string
            emailVerified?: boolean | Date
          }>({ email })

          if (!user?.passwordHash) return null

          const ok = await compare(password, user.passwordHash)
          if (!ok) return null

          // emailVerified === false means explicitly unverified (new user)
          // undefined = old user (treat as verified for backward compat)
          if (user.emailVerified === false) {
            throw new Error('EmailNotVerified')
          }

          return {
            id: String(user._id),
            email: user.email,
            role: user.role ?? 'user',
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
        if (user?.role) token.role = user.role
        return token
      },
      async session({ session, token }) {
        if (session.user && token.sub) {
          session.user.id = token.sub
        }
        session.user.role = (token.role as string | undefined) ?? 'user'
        return session
      },
    },
    events: {
      // Fires when a new user is created via OAuth (Google)
      async createUser({ user }) {
        if (!user.id) return
        try {
          const client = await getMongoClientPromise()
          const db = client.db()
          const userId = new ObjectId(user.id)
          const shortCode = await generateUniqueShortCode(db)

          await Promise.all([
            db.collection('users').updateOne(
              { _id: userId },
              { $set: { role: 'user', shortCode, createdAt: new Date() } }
            ),
            addPoints({
              userId,
              amount: 100,
              type: 'bonus',
              description: 'Приветственный бонус',
            }),
          ])
        } catch {
          // Non-fatal: user created, just missing shortCode/points
        }
      },
    },
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  }
}
