import { NextRequest, NextResponse } from 'next/server'
import { milestoneOperations, initializeDatabase } from '@/lib/database'

// Initialize database on first request
initializeDatabase()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    
    if (projectId) {
      // Get milestones for specific project
      const milestones = milestoneOperations.getByProjectId(projectId)
      return NextResponse.json(milestones)
    } else {
      // Get all milestones
      const milestones = milestoneOperations.getAll()
      return NextResponse.json(milestones)
    }
  } catch (error) {
    console.error('Error fetching milestones:', error)
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = milestoneOperations.create(body)
    return NextResponse.json({ id: result.lastInsertRowid })
  } catch (error) {
    console.error('Error creating milestone:', error)
    return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 })
  }
} 