import { NextRequest, NextResponse } from 'next/server'
import { projectOperations, initializeDatabase } from '@/lib/database'

// Initialize database on first request
initializeDatabase()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const project = projectOperations.getById(id)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const existingProject = projectOperations.getById(id)
    
    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const updatedProject = { ...existingProject, ...body }
    projectOperations.update(updatedProject)
    
    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existingProject = projectOperations.getById(id)
    
    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    projectOperations.delete(id)
    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
} 