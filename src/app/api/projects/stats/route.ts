import { NextResponse } from 'next/server'
import { projectOperations, initializeDatabase } from '@/lib/database'

// Initialize database on first request
initializeDatabase()

export async function GET() {
  try {
    const stats = projectOperations.getStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
} 