import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import { compare } from 'bcryptjs'
import { ObjectId } from 'mongodb'

import getMongoClientPromise from '@/lib/server/mongodb'
import { generateUniqueShortCode } from '@/lib/server/short-code'
import { addPoints } from '@/lib/server/transactions'

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

export function getAuthOptions(): NextAuthOptions {
  const providers: NextAuthOptions['providers'] = []

  if (googleClientId && googleClientSecret) {
    providers.push(
      GoogleProvider({
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        authorization: {
          params: {
            prompt: 'consent',
            access_type: 'offline',
            response_type: 'code',
          },
        },
      })
    )
  }

  providers.push(
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

        return {
          id: String(user._id),
          email: user.email,
          role: user.role ?? 'user',
        }
      },
    })
  )

  return {
    adapter: MongoDBAdapter(getMongoClientPromise()),
    providers,
    pages: {
      signIn: '/auth/login',
      error: '/auth/error',
    },
    session: {
      strategy: 'jwt',
    },
    callbacks: {
      async jwt({ token, user, account }) {
        if (user) {
          token.sub = user.id
          // For OAuth sign-ins (e.g. Google), user.role is not set by the adapter.
          // Load it from the database so we always have it in the token.
          if (account && account.provider !== 'credentials') {
            try {
              const client = await getMongoClientPromise()
              const db = client.db()
              const dbUser = await db.collection('users').findOne({
                _id: new ObjectId(user.id),
              })
              token.role = (dbUser?.role as string | undefined) ?? 'user'
            } catch {
              token.role = 'user'
            }
          } else {
            token.role = (user as { role?: string }).role ?? 'user'
          }
        }
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
      async createUser({ user }) {
        if (!user.id) return
        try {
          const client = await getMongoClientPromise()
          const db = client.db()
          const userId = new ObjectId(user.id)
          const shortCode = await generateUniqueShortCode(db)
          const displayName = (user.name ?? (user.email ?? '').split('@')[0]).slice(0, 30)

          await Promise.all([
            db.collection('users').updateOne(
              { _id: userId },
              {
                $set: {
                  role: 'user',
                  shortCode,
                  displayName,
                  totalPoints: 0,
                  rank: 'sprout',
                  team: null,
                  createdAt: new Date(),
                },
              }
            ),
            addPoints({
              userId,
              amount: 100,
              type: 'bonus',
              description: 'Приветственный бонус',
            }),
          ])
        } catch {
          // Non-fatal
        }
      },
    },
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  }
}
