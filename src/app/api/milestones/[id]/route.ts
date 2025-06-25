import { NextRequest, NextResponse } from 'next/server'
import { milestoneOperations, initializeDatabase } from '@/lib/database'

// Initialize database on first request
initializeDatabase()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const milestone = milestoneOperations.getById(id)
    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
    }
    return NextResponse.json(milestone)
  } catch (error) {
    console.error('Error fetching milestone:', error)
    return NextResponse.json({ error: 'Failed to fetch milestone' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const existingMilestone = milestoneOperations.getById(id)
    
    if (!existingMilestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
    }

    const updatedMilestone = { ...existingMilestone, ...body }
    milestoneOperations.update(updatedMilestone)
    
    return NextResponse.json(updatedMilestone)
  } catch (error) {
    console.error('Error updating milestone:', error)
    return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existingMilestone = milestoneOperations.getById(id)
    
    if (!existingMilestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
    }

    milestoneOperations.delete(id)
    return NextResponse.json({ message: 'Milestone deleted successfully' })
  } catch (error) {
    console.error('Error deleting milestone:', error)
    return NextResponse.json({ error: 'Failed to delete milestone' }, { status: 500 })
  }
} 