import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, projectName, projectId, role, message, inviterName } = body

    // Validate required fields
    if (!to || !projectName || !projectId || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email format' }, 
        { status: 400 }
      )
    }

    // Send email (use mock for development)
    const success = process.env.NODE_ENV === 'production' 
      ? await emailService.sendShareInvitation({ to, projectName, projectId, role, message, inviterName })
      : await emailService.sendMockEmail({ to, projectName, projectId, role, message, inviterName })

    if (success) {
      return NextResponse.json({ 
        message: 'Invitation sent successfully',
        sentTo: to 
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send invitation' }, 
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error sending share invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 