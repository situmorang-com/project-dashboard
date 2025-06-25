import { initializeDatabase } from '../lib/database'
import fs from 'fs'
import path from 'path'

// Delete the existing database file
const dbPath = path.join(process.cwd(), 'data', 'projects.db')
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath)
  console.log('Deleted existing database file')
}

// Reinitialize the database
console.log('Initializing database with corrected data...')
initializeDatabase()
console.log('Database reset and initialized successfully!')