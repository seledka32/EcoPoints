import type { Db } from 'mongodb'

const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function generate(): string {
  let code = ''
  for (let i = 0; i < 6; i++) code += CHARS[Math.floor(Math.random() * CHARS.length)]
  return code
}

export async function generateUniqueShortCode(db: Db): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const code = generate()
    const existing = await db.collection('users').findOne({ shortCode: code })
    if (!existing) return code
  }
  throw new Error('Failed to generate unique short code')
}
