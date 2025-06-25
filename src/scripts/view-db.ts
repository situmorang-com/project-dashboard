import { projectOperations } from '../lib/database'

console.log('=== Project Database Contents ===\n')

const projects = projectOperations.getAll()
const stats = projectOperations.getStats()

console.log(`Database Statistics:`)
console.log(`Total Projects: ${stats.total}`)
console.log(`On Track: ${stats.onTrack}`)
console.log(`At Risk: ${stats.atRisk}`)
console.log(`Blocked: ${stats.blocked}\n`)

console.log('Projects:')
projects.forEach((project, index) => {
  console.log(`${index + 1}. ${project.id} - ${project.name}`)
  console.log(`   Status: ${project.status} | Progress: ${project.progress}% | Health: ${project.healthScore}`)
  console.log(`   Manager: ${project.projectManager} | Sponsor: ${project.sponsor}`)
  console.log(`   Budget: $${project.budgetPlanned.toLocaleString()} | Actual: $${project.budgetActual.toLocaleString()}`)
  console.log('')
})

process.exit(0) 