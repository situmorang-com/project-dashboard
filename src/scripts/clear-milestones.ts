import { initializeDatabase } from '../lib/database'

// Initialize database
initializeDatabase()

// Clear milestones table
const db = require('better-sqlite3')('./data/projects.db')
db.prepare('DELETE FROM milestone_dependencies').run()
db.prepare('DELETE FROM milestone_assignees').run()
db.prepare('DELETE FROM milestones').run()

console.log('Milestones cleared successfully!') 