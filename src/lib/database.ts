import Database from 'better-sqlite3'
import path from 'path'

// Initialize database
const dbPath = path.join(process.cwd(), 'data', 'projects.db')
const db = new Database(dbPath)

// Create tables if they don't exist
export function initializeDatabase() {
  // Projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      sponsor TEXT,
      projectManager TEXT,
      startDate TEXT,
      endDate TEXT,
      progress INTEGER,
      nextMilestone TEXT,
      milestoneDate TEXT,
      status TEXT CHECK(status IN ('on-track', 'at-risk', 'blocked')),
      healthScore INTEGER,
      daysToDue INTEGER,
      budgetPlanned REAL,
      budgetActual REAL,
      riskLevel TEXT CHECK(riskLevel IN ('high', 'medium', 'low')),
      topRisks TEXT,
      keyDependencies TEXT,
      coreTeam TEXT,
      resourceLoad INTEGER,
      lastUpdated TEXT,
      nextSteeringCommittee TEXT,
      stakeholders TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Team members table
  db.exec(`
    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT,
      department TEXT,
      capacity INTEGER,
      currentLoad INTEGER,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Team member projects junction table
  db.exec(`
    CREATE TABLE IF NOT EXISTS team_member_projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teamMemberId TEXT,
      projectId TEXT,
      allocation INTEGER,
      FOREIGN KEY (teamMemberId) REFERENCES team_members(id) ON DELETE CASCADE,
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
    )
  `)

  // Resource utilization table
  db.exec(`
    CREATE TABLE IF NOT EXISTS resource_utilization (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teamMemberId TEXT,
      week TEXT,
      utilization INTEGER,
      FOREIGN KEY (teamMemberId) REFERENCES team_members(id) ON DELETE CASCADE
    )
  `)

  // Milestones table with auto-incrementing ID
  db.exec(`
    CREATE TABLE IF NOT EXISTS milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      milestoneId TEXT UNIQUE,  -- Custom milestone ID for display
      projectId TEXT,
      name TEXT NOT NULL,
      description TEXT,
      startDate TEXT,
      endDate TEXT,
      progress INTEGER,
      status TEXT CHECK(status IN ('completed', 'in-progress', 'upcoming', 'delayed')),
      priority TEXT CHECK(priority IN ('high', 'medium', 'low')),
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
    )
  `)

  // Milestone assignees junction table
  db.exec(`
    CREATE TABLE IF NOT EXISTS milestone_assignees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      milestoneId TEXT,
      teamMemberId TEXT,
      role TEXT,
      FOREIGN KEY (milestoneId) REFERENCES milestones(id) ON DELETE CASCADE,
      FOREIGN KEY (teamMemberId) REFERENCES team_members(id) ON DELETE CASCADE
    )
  `)

  // Milestone dependencies junction table
  db.exec(`
    CREATE TABLE IF NOT EXISTS milestone_dependencies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      milestoneId TEXT,
      dependencyId TEXT,
      FOREIGN KEY (milestoneId) REFERENCES milestones(id) ON DELETE CASCADE,
      FOREIGN KEY (dependencyId) REFERENCES milestones(id) ON DELETE CASCADE
    )
  `)

  // Check if we need to seed data
  const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number }
  
  if (projectCount.count === 0) {
    console.log('📊 No data found, seeding mockup data...')
    seedMockupData()
  }
}

// Clear all data from all tables
export function clearAllData() {
  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM milestone_dependencies').run()
    db.prepare('DELETE FROM milestone_assignees').run()
    db.prepare('DELETE FROM milestones').run()
    db.prepare('DELETE FROM resource_utilization').run()
    db.prepare('DELETE FROM team_member_projects').run()
    db.prepare('DELETE FROM team_members').run()
    db.prepare('DELETE FROM projects').run()
  })
  
  transaction()
}

// Seed mockup data
function seedMockupData() {
  insertInitialProjects()
  insertInitialTeamMembers()
  insertInitialMilestones()
}

// Insert initial projects
function insertInitialProjects() {
  const insertProject = db.prepare(`
    INSERT INTO projects (
      id, name, description, sponsor, projectManager, startDate, endDate, 
      progress, nextMilestone, milestoneDate, status, healthScore, daysToDue,
      budgetPlanned, budgetActual, riskLevel, topRisks, keyDependencies,
      coreTeam, resourceLoad, lastUpdated, nextSteeringCommittee, stakeholders
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const initialProjects = [
    {
      id: "PRJ-001",
      name: "Digital Transformation Initiative",
      description: "Modernize legacy systems and implement cloud infrastructure",
      sponsor: "Sarah Johnson, CTO",
      projectManager: "Mike Chen",
      startDate: "2024-01-15",
      endDate: "2024-12-31",
      progress: 65,
      nextMilestone: "Phase 2 Deployment",
      milestoneDate: "2024-08-15",
      status: "on-track",
      healthScore: 85,
      daysToDue: 45,
      budgetPlanned: 2500000,
      budgetActual: 1800000,
      riskLevel: "medium",
      topRisks: "Integration complexity with legacy systems",
      keyDependencies: "Vendor delivery timeline",
      coreTeam: "12 members",
      resourceLoad: 78,
      lastUpdated: "2024-07-01",
      nextSteeringCommittee: "2024-07-15",
      stakeholders: "IT, Operations, Finance"
    },
    {
      id: "PRJ-002",
      name: "Customer Portal Redesign",
      description: "Redesign customer-facing portal with improved UX",
      sponsor: "David Smith, VP Marketing",
      projectManager: "Lisa Wang",
      startDate: "2024-03-01",
      endDate: "2024-09-30",
      progress: 40,
      nextMilestone: "User Testing Phase",
      milestoneDate: "2024-07-20",
      status: "at-risk",
      healthScore: 65,
      daysToDue: 92,
      budgetPlanned: 800000,
      budgetActual: 450000,
      riskLevel: "high",
      topRisks: "User feedback integration delays",
      keyDependencies: "Design system completion",
      coreTeam: "8 members",
      resourceLoad: 92,
      lastUpdated: "2024-07-02",
      nextSteeringCommittee: "2024-07-10",
      stakeholders: "Marketing, Product, Customer Success"
    },
    {
      id: "PRJ-003",
      name: "Data Analytics Platform",
      description: "Build comprehensive analytics and reporting platform",
      sponsor: "Emily Davis, VP Data",
      projectManager: "Alex Rodriguez",
      startDate: "2024-02-01",
      endDate: "2024-11-30",
      progress: 25,
      nextMilestone: "Data Pipeline Setup",
      milestoneDate: "2024-08-01",
      status: "blocked",
      healthScore: 35,
      daysToDue: 152,
      budgetPlanned: 1200000,
      budgetActual: 300000,
      riskLevel: "high",
      topRisks: "Data governance approval pending",
      keyDependencies: "Security team sign-off",
      coreTeam: "6 members",
      resourceLoad: 45,
      lastUpdated: "2024-06-28",
      nextSteeringCommittee: "2024-07-08",
      stakeholders: "Data, Security, Legal"
    },
    {
      id: "PRJ-004",
      name: "Mobile App Development",
      description: "Develop native mobile applications for iOS and Android",
      sponsor: "Robert Wilson, VP Product",
      projectManager: "Jennifer Kim",
      startDate: "2024-04-01",
      endDate: "2024-10-31",
      progress: 55,
      nextMilestone: "Beta Testing",
      milestoneDate: "2024-08-30",
      status: "on-track",
      healthScore: 90,
      daysToDue: 123,
      budgetPlanned: 1500000,
      budgetActual: 850000,
      riskLevel: "low",
      topRisks: "App store approval process",
      keyDependencies: "Third-party API integration",
      coreTeam: "10 members",
      resourceLoad: 85,
      lastUpdated: "2024-07-03",
      nextSteeringCommittee: "2024-07-20",
      stakeholders: "Product, Engineering, QA"
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
      status: "on-track",
      healthScore: 95,
      daysToDue: 59,
      budgetPlanned: 900000,
      budgetActual: 720000,
      riskLevel: "low",
      topRisks: "Regulatory compliance updates",
      keyDependencies: "External auditor availability",
      coreTeam: "5 members",
      resourceLoad: 60,
      lastUpdated: "2024-07-01",
      nextSteeringCommittee: "2024-07-12",
      stakeholders: "Security, Legal, Compliance"
    },
    {
      id: "PRJ-006",
      name: "ERP System Implementation",
      description: "Implement new enterprise resource planning system",
      sponsor: "Patricia Garcia, CFO",
      projectManager: "Kevin O'Brien",
      startDate: "2024-05-01",
      endDate: "2024-12-31",
      progress: 15,
      nextMilestone: "Requirements Gathering",
      milestoneDate: "2024-08-30",
      status: "at-risk",
      healthScore: 55,
      daysToDue: 178,
      budgetPlanned: 3000000,
      budgetActual: 200000,
      riskLevel: "high",
      topRisks: "Vendor selection delays",
      keyDependencies: "Stakeholder alignment",
      coreTeam: "15 members",
      resourceLoad: 70,
      lastUpdated: "2024-07-01",
      nextSteeringCommittee: "2024-07-18",
      stakeholders: "Finance, Operations, IT"
    },
    {
      id: "PRJ-007",
      name: "AI-Powered Customer Service",
      description: "Implement AI chatbot and automated customer support system",
      sponsor: "Rachel Lee, VP Customer Success",
      projectManager: "Marcus Johnson",
      startDate: "2024-06-01",
      endDate: "2024-11-30",
      progress: 10,
      nextMilestone: "AI Model Training",
      milestoneDate: "2024-09-15",
      status: "on-track",
      healthScore: 75,
      daysToDue: 152,
      budgetPlanned: 800000,
      budgetActual: 80000,
      riskLevel: "medium",
      topRisks: "AI model accuracy requirements",
      keyDependencies: "Data pipeline completion",
      coreTeam: "8 members",
      resourceLoad: 95,
      lastUpdated: "2024-07-02",
      nextSteeringCommittee: "2024-07-25",
      stakeholders: "Customer Success, Product, Engineering"
    },
    {
      id: "PRJ-008",
      name: "Office Expansion Project",
      description: "Expand office space and modernize workplace facilities",
      sponsor: "James Wilson, VP Operations",
      projectManager: "Sofia Rodriguez",
      startDate: "2024-07-01",
      endDate: "2024-10-31",
      progress: 5,
      nextMilestone: "Furniture Installation",
      milestoneDate: "2024-09-01",
      status: "on-track",
      healthScore: 85,
      daysToDue: 123,
      budgetPlanned: 500000,
      budgetActual: 25000,
      riskLevel: "low",
      topRisks: "Construction permit delays",
      keyDependencies: "Landlord approval",
      coreTeam: "4 members",
      resourceLoad: 55,
      lastUpdated: "2024-07-01",
      nextSteeringCommittee: "2024-07-30",
      stakeholders: "Operations, HR, Facilities"
    }
  ]

  const transaction = db.transaction(() => {
    for (const project of initialProjects) {
      insertProject.run(
        project.id, project.name, project.description, project.sponsor,
        project.projectManager, project.startDate, project.endDate,
        project.progress, project.nextMilestone, project.milestoneDate,
        project.status, project.healthScore, project.daysToDue,
        project.budgetPlanned, project.budgetActual, project.riskLevel,
        project.topRisks, project.keyDependencies, project.coreTeam,
        project.resourceLoad, project.lastUpdated, project.nextSteeringCommittee,
        project.stakeholders
      )
    }
  })

  transaction()
}

// Insert initial team members
function insertInitialTeamMembers() {
  const insertTeamMember = db.prepare(`
    INSERT INTO team_members (id, name, role, department, capacity, currentLoad)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const insertTeamMemberProject = db.prepare(`
    INSERT INTO team_member_projects (teamMemberId, projectId, allocation)
    VALUES (?, ?, ?)
  `)

  const insertUtilization = db.prepare(`
    INSERT INTO resource_utilization (teamMemberId, week, utilization)
    VALUES (?, ?, ?)
  `)

  const teamMembers = [
    { id: "tm1", name: "Sarah Johnson", role: "Senior Developer", department: "Engineering", capacity: 40, currentLoad: 85, projects: ["PRJ-001", "PRJ-004"] },
    { id: "tm2", name: "Mike Chen", role: "Project Manager", department: "PMO", capacity: 40, currentLoad: 92, projects: ["PRJ-001"] },
    { id: "tm3", name: "Lisa Wang", role: "UX Designer", department: "Design", capacity: 40, currentLoad: 78, projects: ["PRJ-002"] },
    { id: "tm4", name: "Alex Rodriguez", role: "Data Engineer", department: "Data", capacity: 40, currentLoad: 45, projects: ["PRJ-003"] },
    { id: "tm5", name: "Jennifer Kim", role: "Mobile Developer", department: "Engineering", capacity: 40, currentLoad: 88, projects: ["PRJ-004"] },
    { id: "tm6", name: "Tom Anderson", role: "Security Engineer", department: "Security", capacity: 40, currentLoad: 60, projects: ["PRJ-005"] },
    { id: "tm7", name: "Kevin O'Brien", role: "Business Analyst", department: "PMO", capacity: 40, currentLoad: 70, projects: ["PRJ-006"] },
    { id: "tm8", name: "Marcus Johnson", role: "AI Engineer", department: "Engineering", capacity: 40, currentLoad: 95, projects: ["PRJ-007"] },
    { id: "tm9", name: "Sofia Rodriguez", role: "Facilities Manager", department: "Operations", capacity: 40, currentLoad: 55, projects: ["PRJ-008"] },
    { id: "tm10", name: "David Smith", role: "Marketing Manager", department: "Marketing", capacity: 40, currentLoad: 82, projects: ["PRJ-002"] },
  ]

  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"]
  const utilizationData = {
    "tm1": [85, 88, 90, 92, 85, 88, 90, 92],
    "tm2": [92, 95, 98, 100, 92, 95, 98, 100],
    "tm3": [78, 80, 82, 85, 78, 80, 82, 85],
    "tm4": [45, 50, 55, 60, 45, 50, 55, 60],
    "tm5": [88, 90, 92, 95, 88, 90, 92, 95],
    "tm6": [60, 65, 70, 75, 60, 65, 70, 75],
    "tm7": [70, 72, 75, 78, 70, 72, 75, 78],
    "tm8": [95, 98, 100, 100, 95, 98, 100, 100],
    "tm9": [55, 58, 60, 62, 55, 58, 60, 62],
    "tm10": [82, 85, 88, 90, 82, 85, 88, 90],
  }

  const transaction = db.transaction(() => {
    for (const member of teamMembers) {
      insertTeamMember.run(member.id, member.name, member.role, member.department, member.capacity, member.currentLoad)
      
      // Insert project assignments
      for (const projectId of member.projects) {
        insertTeamMemberProject.run(member.id, projectId, 50) // 50% allocation per project
      }
      
      // Insert utilization data
      const utilizations = utilizationData[member.id as keyof typeof utilizationData]
      for (let i = 0; i < weeks.length; i++) {
        insertUtilization.run(member.id, weeks[i], utilizations[i])
      }
    }
  })

  transaction()
}

// Insert initial milestones
function insertInitialMilestones() {
  const insertMilestone = db.prepare(`
    INSERT INTO milestones (id, projectId, name, description, startDate, endDate, progress, status, priority)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertMilestoneAssignee = db.prepare(`
    INSERT INTO milestone_assignees (milestoneId, teamMemberId, role)
    VALUES (?, ?, ?)
  `)

  const insertMilestoneDependency = db.prepare(`
    INSERT INTO milestone_dependencies (milestoneId, dependencyId)
    VALUES (?, ?)
  `)

  const milestones = [
    {
      id: "ms1",
      projectId: "PRJ-001",
      name: "Phase 2 Deployment",
      description: "Deploy cloud infrastructure and migrate legacy systems",
      startDate: "2024-08-15",
      endDate: "2024-09-15",
      progress: 0,
      status: "upcoming",
      priority: "high",
      assignees: ["tm1", "tm2"],
      dependencies: []
    },
    {
      id: "ms2",
      projectId: "PRJ-002",
      name: "User Testing Phase",
      description: "Conduct comprehensive user testing and feedback collection",
      startDate: "2024-07-20",
      endDate: "2024-08-20",
      progress: 25,
      status: "in-progress",
      priority: "high",
      assignees: ["tm3", "tm10"],
      dependencies: ["ms1"]
    },
    {
      id: "ms3",
      projectId: "PRJ-003",
      name: "Data Pipeline Setup",
      description: "Set up data ingestion and processing pipelines",
      startDate: "2024-08-01",
      endDate: "2024-09-01",
      progress: 0,
      status: "upcoming",
      priority: "medium",
      assignees: ["tm4"],
      dependencies: []
    },
    {
      id: "ms4",
      projectId: "PRJ-004",
      name: "Beta Testing",
      description: "Launch beta version and collect user feedback",
      startDate: "2024-08-30",
      endDate: "2024-09-30",
      progress: 0,
      status: "upcoming",
      priority: "high",
      assignees: ["tm5", "tm1"],
      dependencies: ["ms2"]
    },
    {
      id: "ms5",
      projectId: "PRJ-005",
      name: "Final Security Audit",
      description: "Complete comprehensive security audit and compliance review",
      startDate: "2024-08-15",
      endDate: "2024-08-31",
      progress: 0,
      status: "upcoming",
      priority: "high",
      assignees: ["tm6"],
      dependencies: []
    },
    {
      id: "ms6",
      projectId: "PRJ-006",
      name: "Requirements Gathering",
      description: "Complete stakeholder requirements and vendor selection",
      startDate: "2024-08-30",
      endDate: "2024-09-30",
      progress: 0,
      status: "upcoming",
      priority: "medium",
      assignees: ["tm7"],
      dependencies: []
    },
    {
      id: "ms7",
      projectId: "PRJ-007",
      name: "AI Model Training",
      description: "Train and optimize AI models for customer service chatbot",
      startDate: "2024-09-15",
      endDate: "2024-10-15",
      progress: 0,
      status: "upcoming",
      priority: "medium",
      assignees: ["tm8"],
      dependencies: ["ms3"]
    },
    {
      id: "ms8",
      projectId: "PRJ-008",
      name: "Furniture Installation",
      description: "Install and configure new office furniture and equipment",
      startDate: "2024-09-01",
      endDate: "2024-09-15",
      progress: 0,
      status: "upcoming",
      priority: "low",
      assignees: ["tm9"],
      dependencies: []
    }
  ]

  const transaction = db.transaction(() => {
    for (const milestone of milestones) {
      insertMilestone.run(
        milestone.id, milestone.projectId, milestone.name, milestone.description,
        milestone.startDate, milestone.endDate, milestone.progress,
        milestone.status, milestone.priority
      )
      
      // Insert assignees
      for (const assigneeId of milestone.assignees) {
        insertMilestoneAssignee.run(milestone.id, assigneeId, "Team Member")
      }
      
      // Insert dependencies
      for (const dependencyId of milestone.dependencies) {
        insertMilestoneDependency.run(milestone.id, dependencyId)
      }
    }
  })

  transaction()
}

// Project type
export interface Project {
  id: string
  name: string
  description: string
  sponsor: string
  projectManager: string
  startDate: string
  endDate: string
  progress: number
  nextMilestone: string
  milestoneDate: string
  status: 'on-track' | 'at-risk' | 'blocked'
  healthScore: number
  daysToDue: number
  budgetPlanned: number
  budgetActual: number
  riskLevel: 'high' | 'medium' | 'low'
  topRisks: string
  keyDependencies: string
  coreTeam: string
  resourceLoad: number
  lastUpdated: string
  nextSteeringCommittee: string
  stakeholders: string
  createdAt?: string
  updatedAt?: string
}

// Team member type
export interface TeamMember {
  id: string
  name: string
  role: string
  department: string
  capacity: number
  currentLoad: number
  projects: string[]
  createdAt?: string
  updatedAt?: string
}

// Milestone type
export interface Milestone {
  id: string
  projectId: string
  projectName: string
  name: string
  description: string
  startDate: string
  endDate: string
  progress: number
  status: 'completed' | 'in-progress' | 'upcoming' | 'delayed'
  priority: 'high' | 'medium' | 'low'
  assignees: string[]
  dependencies: string[]
  createdAt?: string
  updatedAt?: string
}

// Database operations
export const projectOperations = {
  getAll: () => {
    return db.prepare('SELECT * FROM projects ORDER BY id').all() as Project[]
  },

  getById: (id: string) => {
    return db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project | undefined
  },

  create: (project: Omit<Project, 'createdAt' | 'updatedAt'>) => {
    const stmt = db.prepare(`
      INSERT INTO projects (
        id, name, description, sponsor, projectManager, startDate, endDate,
        progress, nextMilestone, milestoneDate, status, healthScore, daysToDue,
        budgetPlanned, budgetActual, riskLevel, topRisks, keyDependencies,
        coreTeam, resourceLoad, lastUpdated, nextSteeringCommittee, stakeholders
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    return stmt.run(
      project.id, project.name, project.description, project.sponsor,
      project.projectManager, project.startDate, project.endDate,
      project.progress, project.nextMilestone, project.milestoneDate,
      project.status, project.healthScore, project.daysToDue,
      project.budgetPlanned, project.budgetActual, project.riskLevel,
      project.topRisks, project.keyDependencies, project.coreTeam,
      project.resourceLoad, project.lastUpdated, project.nextSteeringCommittee,
      project.stakeholders
    )
  },

  update: (project: Omit<Project, 'createdAt' | 'updatedAt'>) => {
    const stmt = db.prepare(`
      UPDATE projects SET
        name = ?, description = ?, sponsor = ?, projectManager = ?,
        startDate = ?, endDate = ?, progress = ?, nextMilestone = ?,
        milestoneDate = ?, status = ?, healthScore = ?, daysToDue = ?,
        budgetPlanned = ?, budgetActual = ?, riskLevel = ?, topRisks = ?,
        keyDependencies = ?, coreTeam = ?, resourceLoad = ?,
        lastUpdated = ?, nextSteeringCommittee = ?, stakeholders = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    
    return stmt.run(
      project.name, project.description, project.sponsor,
      project.projectManager, project.startDate, project.endDate,
      project.progress, project.nextMilestone, project.milestoneDate,
      project.status, project.healthScore, project.daysToDue,
      project.budgetPlanned, project.budgetActual, project.riskLevel,
      project.topRisks, project.keyDependencies, project.coreTeam,
      project.resourceLoad, project.lastUpdated, project.nextSteeringCommittee,
      project.stakeholders, project.id
    )
  },

  delete: (id: string) => {
    return db.prepare('DELETE FROM projects WHERE id = ?').run(id)
  },

  getStats: () => {
    const total = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number }
    const onTrack = db.prepare('SELECT COUNT(*) as count FROM projects WHERE status = ?').get('on-track') as { count: number }
    const atRisk = db.prepare('SELECT COUNT(*) as count FROM projects WHERE status = ?').get('at-risk') as { count: number }
    const blocked = db.prepare('SELECT COUNT(*) as count FROM projects WHERE status = ?').get('blocked') as { count: number }
    
    return {
      total: total.count,
      onTrack: onTrack.count,
      atRisk: atRisk.count,
      blocked: blocked.count
    }
  }
}

export const teamMemberOperations = {
  getAll: () => {
    const members = db.prepare('SELECT * FROM team_members ORDER BY name').all() as TeamMember[]
    
    // Get projects for each member
    return members.map(member => {
      const projects = db.prepare('SELECT projectId FROM team_member_projects WHERE teamMemberId = ?').all(member.id) as { projectId: string }[]
      return {
        ...member,
        projects: projects.map(p => p.projectId)
      }
    })
  },

  getById: (id: string) => {
    const member = db.prepare('SELECT * FROM team_members WHERE id = ?').get(id) as TeamMember | undefined
    if (!member) return undefined
    
    const projects = db.prepare('SELECT projectId FROM team_member_projects WHERE teamMemberId = ?').all(id) as { projectId: string }[]
    return {
      ...member,
      projects: projects.map(p => p.projectId)
    }
  },

  getUtilizationData: () => {
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"]
    const members = teamMemberOperations.getAll()
    const utilizationData: { [memberId: string]: { [week: string]: number } } = {}
    
    for (const member of members) {
      utilizationData[member.id] = {}
      for (const week of weeks) {
        const result = db.prepare('SELECT utilization FROM resource_utilization WHERE teamMemberId = ? AND week = ?').get(member.id, week) as { utilization: number } | undefined
        utilizationData[member.id][week] = result?.utilization || 0
      }
    }
    
    return { teamMembers: members, weeks, utilizationData }
  }
}

export const milestoneOperations = {
  getAll: () => {
    const milestones = db.prepare(`
      SELECT m.*, p.name as projectName 
      FROM milestones m 
      JOIN projects p ON m.projectId = p.id 
      ORDER BY m.startDate
    `).all() as (Milestone & { projectName: string })[]
    
    // Get assignees and dependencies for each milestone
    return milestones.map(milestone => {
      const assignees = db.prepare(`
        SELECT tm.name 
        FROM milestone_assignees ma 
        JOIN team_members tm ON ma.teamMemberId = tm.id 
        WHERE ma.milestoneId = ?
      `).all(milestone.id) as { name: string }[]
      
      const dependencies = db.prepare(`
        SELECT dependencyId 
        FROM milestone_dependencies 
        WHERE milestoneId = ?
      `).all(milestone.id) as { dependencyId: string }[]
      
      return {
        ...milestone,
        assignees: assignees.map(a => a.name),
        dependencies: dependencies.map(d => d.dependencyId)
      }
    })
  },

  getById: (id: string) => {
    const milestone = db.prepare(`
      SELECT m.*, p.name as projectName 
      FROM milestones m 
      JOIN projects p ON m.projectId = p.id 
      WHERE m.id = ?
    `).get(id) as (Milestone & { projectName: string }) | undefined
    
    if (!milestone) return undefined
    
    const assignees = db.prepare(`
      SELECT tm.name 
      FROM milestone_assignees ma 
      JOIN team_members tm ON ma.teamMemberId = tm.id 
      WHERE ma.milestoneId = ?
    `).all(id) as { name: string }[]
    
    const dependencies = db.prepare(`
      SELECT dependencyId 
      FROM milestone_dependencies 
      WHERE milestoneId = ?
    `).all(id) as { dependencyId: string }[]
    
    return {
      ...milestone,
      assignees: assignees.map(a => a.name),
      dependencies: dependencies.map(d => d.dependencyId)
    }
  },

  create: (milestone: Omit<Milestone, 'createdAt' | 'updatedAt' | 'projectName'>) => {
    // Generate a unique ID if not provided or if it's empty
    const milestoneId = milestone.id && milestone.id.trim() !== '' 
      ? milestone.id 
      : `ms${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const stmt = db.prepare(`
      INSERT INTO milestones (id, projectId, name, description, startDate, endDate, progress, status, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    return stmt.run(
      milestoneId, 
      milestone.projectId, 
      milestone.name, 
      milestone.description,
      milestone.startDate, 
      milestone.endDate, 
      milestone.progress,
      milestone.status, 
      milestone.priority
    )
  },

  update: (milestone: Omit<Milestone, 'createdAt' | 'updatedAt' | 'projectName'>) => {
    const stmt = db.prepare(`
      UPDATE milestones SET
        projectId = ?, name = ?, description = ?, startDate = ?, endDate = ?,
        progress = ?, status = ?, priority = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    
    return stmt.run(
      milestone.projectId, milestone.name, milestone.description,
      milestone.startDate, milestone.endDate, milestone.progress,
      milestone.status, milestone.priority, milestone.id
    )
  },

  delete: (id: string) => {
    return db.prepare('DELETE FROM milestones WHERE id = ?').run(id)
  },

  getByProjectId: (projectId: string) => {
    const milestones = db.prepare(`
      SELECT m.*, p.name as projectName 
      FROM milestones m 
      JOIN projects p ON m.projectId = p.id 
      WHERE m.projectId = ?
      ORDER BY m.startDate
    `).all(projectId) as (Milestone & { projectName: string })[]
    
    // Get assignees and dependencies for each milestone
    return milestones.map(milestone => {
      const assignees = db.prepare(`
        SELECT tm.name 
        FROM milestone_assignees ma 
        JOIN team_members tm ON ma.teamMemberId = tm.id 
        WHERE ma.milestoneId = ?
      `).all(milestone.id) as { name: string }[]
      
      const dependencies = db.prepare(`
        SELECT dependencyId 
        FROM milestone_dependencies 
        WHERE milestoneId = ?
      `).all(milestone.id) as { dependencyId: string }[]
      
      return {
        ...milestone,
        assignees: assignees.map(a => a.name),
        dependencies: dependencies.map(d => d.dependencyId)
      }
    })
  }
}

export { db } 