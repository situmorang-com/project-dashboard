import { NextRequest, NextResponse } from 'next/server'
import { projectOperations, initializeDatabase } from '@/lib/database'

// Initialize database on first request
initializeDatabase()

export async function GET() {
  try {
    const projects = projectOperations.getAll()
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const project = await request.json()
    const result = projectOperations.create(project)
    return NextResponse.json({ success: true, id: result.lastInsertRowid })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
} 