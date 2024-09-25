import 'dotenv/config'
import pg from 'pg'
const { Pool } = pg

const connectionString = process.env.DATABASE_URL

export const db = new Pool({
  allowExitOnIdle: true,
  connectionString
  // ssl: {
  //     rejectUnauthorized: false // Para desarrollo, cambiar a true en producción
  // }
})

try {
  await db.query('SELECT NOW()')
  console.log('Database connection established successfully')
} catch (error) {
  console.error('Error connecting to the database:', error)
}
