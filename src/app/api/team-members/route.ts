import { NextResponse } from 'next/server'
import { teamMemberOperations, initializeDatabase } from '@/lib/database'

// Initialize database on first request
initializeDatabase()

export async function GET() {
  try {
    const data = teamMemberOperations.getUtilizationData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
  }
} 