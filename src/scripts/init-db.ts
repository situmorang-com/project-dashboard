import { initializeDatabase, projectOperations } from '../lib/database'

// Initialize the database
initializeDatabase()

console.log('Database initialized successfully!')

// Check if we have data
const projects = projectOperations.getAll()
console.log(`Found ${projects.length} projects in database`)

// If no projects exist, let's add some sample data
if (projects.length === 0) {
  console.log('Adding sample projects...')
  
  const sampleProjects = [
    {
      id: "PRJ-001",
      name: "Digital Transformation Initiative",
      description: "Modernize legacy systems and implement cloud infrastructure across the organization",
      sponsor: "Sarah Johnson, CTO",
      projectManager: "Mike Chen",
      startDate: "2024-01-15",
      endDate: "2024-12-31",
      progress: 65,
      nextMilestone: "Phase 2 Deployment",
      milestoneDate: "2024-08-15",
      status: "on-track" as const,
      healthScore: 85,
      daysToDue: 45,
      budgetPlanned: 2500000,
      budgetActual: 1800000,
      riskLevel: "medium" as const,
      topRisks: "Integration complexity with legacy systems, vendor timeline delays",
      keyDependencies: "Vendor delivery timeline, infrastructure team availability",
      coreTeam: "12 members",
      resourceLoad: 78,
      lastUpdated: "2024-07-01",
      nextSteeringCommittee: "2024-07-15",
      stakeholders: "IT, Operations, Finance, HR"
    },
    {
      id: "PRJ-002",
      name: "Customer Portal Redesign",
      description: "Complete redesign of customer-facing portal with improved UX and mobile responsiveness",
      sponsor: "David Smith, VP Marketing",
      projectManager: "Lisa Wang",
      startDate: "2024-03-01",
      endDate: "2024-09-30",
      progress: 40,
      nextMilestone: "User Testing Phase",
      milestoneDate: "2024-07-20",
      status: "at-risk" as const,
      healthScore: 65,
      daysToDue: 92,
      budgetPlanned: 800000,
      budgetActual: 450000,
      riskLevel: "high" as const,
      topRisks: "User feedback integration delays, design system completion",
      keyDependencies: "Design system completion, user research findings",
      coreTeam: "8 members",
      resourceLoad: 92,
      lastUpdated: "2024-07-02",
      nextSteeringCommittee: "2024-07-10",
      stakeholders: "Marketing, Product, Customer Success, Sales"
    },
    {
      id: "PRJ-003",
      name: "Data Analytics Platform",
      description: "Build comprehensive analytics and reporting platform for business intelligence",
      sponsor: "Emily Davis, VP Data",
      projectManager: "Alex Rodriguez",
      startDate: "2024-02-01",
      endDate: "2024-11-30",
      progress: 25,
      nextMilestone: "Data Pipeline Setup",
      milestoneDate: "2024-08-01",
      status: "blocked" as const,
      healthScore: 35,
      daysToDue: 152,
      budgetPlanned: 1200000,
      budgetActual: 300000,
      riskLevel: "high" as const,
      topRisks: "Data governance approval pending, security compliance issues",
      keyDependencies: "Security team sign-off, legal compliance approval",
      coreTeam: "6 members",
      resourceLoad: 45,
      lastUpdated: "2024-06-28",
      nextSteeringCommittee: "2024-07-08",
      stakeholders: "Data, Security, Legal, Compliance"
    },
    {
      id: "PRJ-004",
      name: "Mobile App Development",
      description: "Develop native mobile applications for iOS and Android platforms",
      sponsor: "Robert Wilson, VP Product",
      projectManager: "Jennifer Kim",
      startDate: "2024-04-01",
      endDate: "2024-10-31",
      progress: 55,
      nextMilestone: "Beta Testing",
      milestoneDate: "2024-08-30",
      status: "on-track" as const,
      healthScore: 90,
      daysToDue: 123,
      budgetPlanned: 1500000,
      budgetActual: 850000,
      riskLevel: "low" as const,
      topRisks: "App store approval process, third-party API integration",
      keyDependencies: "Third-party API integration, app store guidelines",
      coreTeam: "10 members",
      resourceLoad: 85,
      lastUpdated: "2024-07-03",
      nextSteeringCommittee: "2024-07-20",
      stakeholders: "Product, Engineering, QA, Marketing"
    },
    {
      id: "PRJ-005",
      name: "Security Infrastructure Upgrade",
      description: "Implement advanced security measures and compliance framework",
      sponsor: "Michael Brown, CISO",
      projectManager: "Tom Anderson",
      startDate: "2024-01-01",
      endDate: "2024-08-31",
      progress: 80,
      nextMilestone: "Final Security Audit",
      milestoneDate: "2024-08-15",
      status: "on-track" as const,
      healthScore: 95,
      daysToDue: 59,
      budgetPlanned: 900000,
      budgetActual: 720000,
      riskLevel: "low" as const,
      topRisks: "Regulatory compliance updates, external auditor availability",
      keyDependencies: "External auditor availability, compliance framework updates",
      coreTeam: "5 members",
      resourceLoad: 60,
      lastUpdated: "2024-07-01",
      nextSteeringCommittee: "2024-07-12",
      stakeholders: "Security, Legal, Compliance, IT"
    },
    {
      id: "PRJ-006",
      name: "ERP System Migration",
      description: "Migrate from legacy ERP system to modern cloud-based solution",
      sponsor: "Patricia Garcia, CFO",
      projectManager: "Kevin O'Brien",
      startDate: "2024-05-01",
      endDate: "2025-02-28",
      progress: 15,
      nextMilestone: "Requirements Gathering",
      milestoneDate: "2024-08-30",
      status: "on-track" as const,
      healthScore: 75,
      daysToDue: 245,
      budgetPlanned: 3000000,
      budgetActual: 450000,
      riskLevel: "medium" as const,
      topRisks: "Data migration complexity, user training requirements",
      keyDependencies: "Vendor selection, stakeholder requirements",
      coreTeam: "15 members",
      resourceLoad: 70,
      lastUpdated: "2024-07-05",
      nextSteeringCommittee: "2024-07-25",
      stakeholders: "Finance, Operations, IT, HR, Procurement"
    },
    {
      id: "PRJ-007",
      name: "AI-Powered Chatbot Implementation",
      description: "Deploy AI-powered customer service chatbot across all channels",
      sponsor: "Rachel Green, VP Customer Experience",
      projectManager: "Marcus Johnson",
      startDate: "2024-06-01",
      endDate: "2024-12-31",
      progress: 30,
      nextMilestone: "AI Model Training",
      milestoneDate: "2024-09-15",
      status: "at-risk" as const,
      healthScore: 60,
      daysToDue: 180,
      budgetPlanned: 600000,
      budgetActual: 200000,
      riskLevel: "medium" as const,
      topRisks: "AI model accuracy, customer acceptance",
      keyDependencies: "AI model training, customer feedback integration",
      coreTeam: "7 members",
      resourceLoad: 88,
      lastUpdated: "2024-07-04",
      nextSteeringCommittee: "2024-07-18",
      stakeholders: "Customer Experience, IT, Marketing, Support"
    },
    {
      id: "PRJ-008",
      name: "Office Relocation Project",
      description: "Relocate headquarters to new modern office space with improved facilities",
      sponsor: "James Wilson, VP Facilities",
      projectManager: "Sofia Rodriguez",
      startDate: "2024-03-15",
      endDate: "2024-11-30",
      progress: 70,
      nextMilestone: "Furniture Installation",
      milestoneDate: "2024-09-01",
      status: "on-track" as const,
      healthScore: 88,
      daysToDue: 148,
      budgetPlanned: 1800000,
      budgetActual: 1260000,
      riskLevel: "low" as const,
      topRisks: "Construction delays, permit approvals",
      keyDependencies: "Construction timeline, permit approvals",
      coreTeam: "4 members",
      resourceLoad: 55,
      lastUpdated: "2024-07-06",
      nextSteeringCommittee: "2024-07-22",
      stakeholders: "Facilities, HR, IT, Finance"
    }
  ]

  // Add each project to the database
  for (const project of sampleProjects) {
    try {
      projectOperations.create(project)
      console.log(`Added project: ${project.name}`)
    } catch (error) {
      console.error(`Error adding project ${project.name}:`, error)
    }
  }

  console.log('Sample projects added successfully!')
} else {
  console.log('Database already contains projects, skipping sample data insertion.')
}

// Show final stats
const finalStats = projectOperations.getStats()
console.log('\nFinal Database Stats:')
console.log(`Total Projects: ${finalStats.total}`)
console.log(`On Track: ${finalStats.onTrack}`)
console.log(`At Risk: ${finalStats.atRisk}`)
console.log(`Blocked: ${finalStats.blocked}`)

process.exit(0) 