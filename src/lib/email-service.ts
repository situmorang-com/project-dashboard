import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface ShareInvitation {
  to: string
  projectName: string
  projectId: string
  role: 'viewer' | 'editor'
  message?: string
  inviterName?: string
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    // For development, you can use a service like Mailtrap or Gmail
    // For production, use your actual SMTP settings
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    }

    // Only create transporter if credentials are provided
    if (config.auth.user && config.auth.pass) {
      this.transporter = nodemailer.createTransporter(config)
    }
  }

  async sendShareInvitation(invitation: ShareInvitation): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email service not configured. Skipping email send.')
      return false
    }

    try {
      const projectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/projects/${invitation.projectId}`
      
      const mailOptions = {
        from: `"Project Dashboard" <${process.env.SMTP_USER}>`,
        to: invitation.to,
        subject: `You've been invited to collaborate on ${invitation.projectName}`,
        html: this.generateShareInvitationEmail(invitation, projectUrl)
      }

      await this.transporter.sendMail(mailOptions)
      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  private generateShareInvitationEmail(invitation: ShareInvitation, projectUrl: string): string {
    const roleText = invitation.role === 'editor' ? 'edit and view' : 'view'
    const inviterName = invitation.inviterName || 'A team member'

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Project Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Project Collaboration Invitation</h2>
          </div>
          
          <p>Hello,</p>
          
          <p><strong>${inviterName}</strong> has invited you to ${roleText} the project:</p>
          
          <h3>${invitation.projectName}</h3>
          
          ${invitation.message ? `<p><strong>Message:</strong> ${invitation.message}</p>` : ''}
          
          <p>You can access the project using the link below:</p>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${projectUrl}" class="button">View Project</a>
          </p>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${projectUrl}</p>
          
          <div class="footer">
            <p>This invitation was sent from the Project Dashboard application.</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  // For development/testing without real email
  async sendMockEmail(invitation: ShareInvitation): Promise<boolean> {
    console.log('📧 Mock Email Sent:')
    console.log('To:', invitation.to)
    console.log('Subject: You\'ve been invited to collaborate on', invitation.projectName)
    console.log('Role:', invitation.role)
    console.log('Message:', invitation.message || 'No message')
    console.log('Project URL:', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/projects/${invitation.projectId}`)
    
    // Simulate email delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    return true
  }
}

export const emailService = new EmailService() 