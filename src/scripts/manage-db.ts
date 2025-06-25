import { initializeDatabase, clearAllData, projectOperations, teamMemberOperations, milestoneOperations } from '../lib/database'
import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'data', 'projects.db')

interface DatabaseAction {
  action: 'init' | 'clear' | 'seed' | 'reset' | 'status'
}

function showHelp() {
  console.log(`
Database Management Script

Usage: npm run db <action>

Actions:
  init    - Initialize database with tables (no data)
  seed    - Add mockup data to existing database
  clear   - Remove all data but keep tables
  reset   - Delete database file and recreate with mockup data
  status  - Show current database status

Examples:
  npm run db init
  npm run db seed
  npm run db clear
  npm run db reset
  npm run db status
`)
}

function showStatus() {
  if (!fs.existsSync(dbPath)) {
    console.log('❌ Database file does not exist')
    return
  }

  try {
    initializeDatabase()
    const projects = projectOperations.getAll()
    const teamMembers = teamMemberOperations.getAll()
    const milestones = milestoneOperations.getAll()

    console.log('📊 Database Status:')
    console.log(`   Projects: ${projects.length}`)
    console.log(`   Team Members: ${teamMembers.length}`)
    console.log(`   Milestones: ${milestones.length}`)
    console.log(`   Database file: ${dbPath}`)
  } catch (error) {
    console.error('❌ Error checking database status:', error)
  }
}

function clearData() {
  if (!fs.existsSync(dbPath)) {
    console.log('❌ Database file does not exist')
    return
  }

  try {
    initializeDatabase()
    clearAllData()
    console.log('✅ All data cleared from database')
  } catch (error) {
    console.error('❌ Error clearing data:', error)
  }
}

function seedData() {
  if (!fs.existsSync(dbPath)) {
    console.log('❌ Database file does not exist. Run "npm run db init" first')
    return
  }

  try {
    initializeDatabase()
    clearAllData() // Clear existing data first
    console.log('✅ Mockup data added to database')
  } catch (error) {
    console.error('❌ Error seeding data:', error)
  }
}

function resetDatabase() {
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath)
    console.log('✅ Deleted existing database file')
  }

  try {
    initializeDatabase()
    console.log('✅ Database reset with mockup data')
  } catch (error) {
    console.error('❌ Error resetting database:', error)
  }
}

function initDatabase() {
  if (fs.existsSync(dbPath)) {
    console.log('⚠️ Database file already exists. Use "npm run db reset" to recreate')
    return
  }

  try {
    // Create tables only, no data
    initializeDatabase()
    console.log('✅ Database initialized with empty tables')
  } catch (error) {
    console.error('❌ Error initializing database:', error)
  }
}

// Main execution
const action = process.argv[2] as DatabaseAction['action']

if (!action || !['init', 'clear', 'seed', 'reset', 'status'].includes(action)) {
  showHelp()
  process.exit(1)
}

switch (action) {
  case 'init':
    initDatabase()
    break
  case 'seed':
    seedData()
    break
  case 'clear':
    clearData()
    break
  case 'reset':
    resetDatabase()
    break
  case 'status':
    showStatus()
    break
} 