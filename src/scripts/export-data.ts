import { projectOperations, teamMemberOperations, milestoneOperations } from '../lib/database'
import fs from 'fs'
import path from 'path'

const exportPath = path.join(process.cwd(), 'data', 'export')

// Ensure export directory exists
if (!fs.existsSync(exportPath)) {
  fs.mkdirSync(exportPath, { recursive: true })
}

// Export all data to JSON files
const projects = projectOperations.getAll()
const teamMembers = teamMemberOperations.getAll()
const milestones = milestoneOperations.getAll()

fs.writeFileSync(
  path.join(exportPath, 'projects.json'),
  JSON.stringify(projects, null, 2)
)

fs.writeFileSync(
  path.join(exportPath, 'team-members.json'),
  JSON.stringify(teamMembers, null, 2)
)

fs.writeFileSync(
  path.join(exportPath, 'milestones.json'),
  JSON.stringify(milestones, null, 2)
)

console.log('✅ Data exported to data/export/')
console.log(`   Projects: ${projects.length}`)
console.log(`   Team Members: ${teamMembers.length}`)
console.log(`   Milestones: ${milestones.length}`) 