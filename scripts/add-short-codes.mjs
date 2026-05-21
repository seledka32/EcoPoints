/**
 * Добавляет shortCode всем пользователям у которых его нет.
 *
 * Использование:
 *   MONGODB_URI=<uri> node scripts/add-short-codes.mjs
 */

import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('Ошибка: переменная MONGODB_URI не задана')
  process.exit(1)
}

const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function generateCode() {
  let c = ''
  for (let i = 0; i < 6; i++) c += CHARS[Math.floor(Math.random() * CHARS.length)]
  return c
}

async function uniqueCode(db) {
  for (let i = 0; i < 20; i++) {
    const code = generateCode()
    if (!(await db.collection('users').findOne({ shortCode: code }))) return code
  }
  throw new Error('Cannot generate unique code')
}

const client = new MongoClient(uri)

try {
  await client.connect()
  const db = client.db()

  await db.collection('users').createIndex({ shortCode: 1 }, { unique: true, sparse: true })

  const users = await db.collection('users').find({ shortCode: { $exists: false } }).toArray()
  console.log(`Пользователей без кода: ${users.length}`)

  for (const user of users) {
    const code = await uniqueCode(db)
    await db.collection('users').updateOne({ _id: user._id }, { $set: { shortCode: code } })
    console.log(`  ${user.email} → ${code}`)
  }

  console.log('✓ Готово')
} finally {
  await client.close()
}
