import { Project, TeamMember, Milestone } from './database'

export class ProjectService {
  static async getAllProjects(): Promise<Project[]> {
    const response = await fetch('/api/projects')
    if (!response.ok) {
      throw new Error('Failed to fetch projects')
    }
    return response.json()
  }

  static async getProjectById(id: string): Promise<Project> {
    const response = await fetch(`/api/projects/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch project')
    }
    return response.json()
  }

  static async createProject(project: Omit<Project, 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; id: number }> {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
    })
    if (!response.ok) {
      throw new Error('Failed to create project')
    }
    return response.json()
  }

  static async updateProject(project: Omit<Project, 'createdAt' | 'updatedAt'>): Promise<{ success: boolean }> {
    const response = await fetch(`/api/projects/${project.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
    })
    if (!response.ok) {
      throw new Error('Failed to update project')
    }
    return response.json()
  }

  static async deleteProject(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete project')
    }
    return response.json()
  }

  static async getProjectStats(): Promise<{ total: number; onTrack: number; atRisk: number; blocked: number }> {
    const response = await fetch('/api/projects/stats')
    if (!response.ok) {
      throw new Error('Failed to fetch project stats')
    }
    return response.json()
  }

  static async getTeamResourceData(): Promise<{
    teamMembers: TeamMember[]
    weeks: string[]
    utilizationData: { [memberId: string]: { [week: string]: number } }
  }> {
    const response = await fetch('/api/team-members')
    if (!response.ok) {
      throw new Error('Failed to fetch team resource data')
    }
    return response.json()
  }

  static async getAllMilestones(): Promise<Milestone[]> {
    const response = await fetch('/api/milestones')
    if (!response.ok) {
      throw new Error('Failed to fetch milestones')
    }
    return response.json()
  }
} 