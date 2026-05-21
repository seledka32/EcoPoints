/**
 * Создаёт (или обновляет) администратора в базе данных.
 *
 * Использование:
 *   MONGODB_URI=<uri> ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret node scripts/create-admin.mjs
 *
 * Если ADMIN_EMAIL / ADMIN_PASSWORD не заданы — используются значения по умолчанию.
 */

import { MongoClient, ObjectId } from 'mongodb'
import { hashSync } from 'bcryptjs'

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

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('Ошибка: переменная MONGODB_URI не задана')
  process.exit(1)
}

const email = (process.env.ADMIN_EMAIL ?? 'admin@ecopoints.kg').trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD ?? 'admin123456'

if (password.length < 6) {
  console.error('Ошибка: пароль должен быть минимум 6 символов')
  process.exit(1)
}

const client = new MongoClient(uri)

try {
  await client.connect()
  const db = client.db()

  const existing = await db.collection('users').findOne({ email })

  if (existing) {
    const update = { role: 'admin', updatedAt: new Date() }
    if (!existing.shortCode) update.shortCode = await uniqueCode(db)
    await db.collection('users').updateOne({ email }, { $set: update })
    console.log(`✓ Пользователь ${email} уже существует — роль обновлена до admin`)
    if (update.shortCode) console.log(`  Код:      ${update.shortCode}`)
  } else {
    const passwordHash = hashSync(password, 10)
    const shortCode = await uniqueCode(db)
    const result = await db.collection('users').insertOne({
      email,
      passwordHash,
      role: 'admin',
      shortCode,
      createdAt: new Date(),
    })

    await db.collection('points').insertOne({
      userId: result.insertedId,
      balance: 0,
      updatedAt: new Date(),
    })

    console.log(`✓ Администратор создан`)
    console.log(`  Email:    ${email}`)
    console.log(`  Пароль:   ${password}`)
    console.log(`  Код:      ${shortCode}`)
    console.log(`  ID:       ${result.insertedId}`)
  }
} finally {
  await client.close()
}
