"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Copy, 
  Mail, 
  Link as LinkIcon, 
  Users, 
  Eye, 
  Edit,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { Project } from "@/lib/database"

interface ShareProjectDialogProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ShareLink {
  id: string
  email: string
  role: 'viewer' | 'editor'
  status: 'pending' | 'accepted'
  createdAt: string
}

export function ShareProjectDialog({ project, open, onOpenChange }: ShareProjectDialogProps) {
  const [shareEmail, setShareEmail] = useState("")
  const [shareRole, setShareRole] = useState<'viewer' | 'editor'>('viewer')
  const [shareMessage, setShareMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([
    {
      id: "1",
      email: "stakeholder@company.com",
      role: "viewer",
      status: "accepted",
      createdAt: "2024-07-01"
    },
    {
      id: "2", 
      email: "manager@company.com",
      role: "editor",
      status: "pending",
      createdAt: "2024-07-02"
    }
  ])

  const handleShare = async () => {
    if (!shareEmail || !project) return
    
    setSending(true)
    setSendStatus('idle')
    
    try {
      const response = await fetch('/api/projects/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: shareEmail,
          projectName: project.name,
          projectId: project.id,
          role: shareRole,
          message: shareMessage,
          inviterName: 'You' // In a real app, this would be the current user's name
        })
      })

      if (response.ok) {
        const newLink: ShareLink = {
          id: Date.now().toString(),
          email: shareEmail,
          role: shareRole,
          status: 'pending',
          createdAt: new Date().toISOString().split('T')[0]
        }
        
        setShareLinks([...shareLinks, newLink])
        setShareEmail("")
        setShareMessage("")
        setSendStatus('success')
        
        // Reset success status after 3 seconds
        setTimeout(() => setSendStatus('idle'), 3000)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send invitation')
      }
    } catch (error) {
      console.error('Error sending invitation:', error)
      setSendStatus('error')
      
      // Reset error status after 5 seconds
      setTimeout(() => setSendStatus('idle'), 5000)
    } finally {
      setSending(false)
    }
  }

  const removeShareLink = (id: string) => {
    setShareLinks(shareLinks.filter(link => link.id !== id))
  }

  const copyProjectLink = () => {
    const projectUrl = `${window.location.origin}/dashboard/projects/${project?.id}`
    navigator.clipboard.writeText(projectUrl)
  }

  const getRoleIcon = (role: string) => {
    return role === 'editor' ? <Edit className="h-3 w-3" /> : <Eye className="h-3 w-3" />
  }

  const getRoleColor = (role: string) => {
    return role === 'editor' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    return status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Share Project: {project?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Share Link */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quick Share Link</Label>
            <div className="flex gap-2">
              <Input 
                value={`${window.location.origin}/dashboard/projects/${project?.id}`}
                readOnly
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={copyProjectLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can view the project
            </p>
          </div>

          {/* Share with specific people */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Share with specific people</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="flex-1"
                  disabled={sending}
                />
                <select
                  value={shareRole}
                  onChange={(e) => setShareRole(e.target.value as 'viewer' | 'editor')}
                  className="px-3 py-2 border border-input rounded-md bg-background"
                  disabled={sending}
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                </select>
              </div>
              <Textarea
                placeholder="Add a message (optional)"
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                rows={2}
                disabled={sending}
              />
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleShare} 
                  disabled={!shareEmail || sending}
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
                {sendStatus === 'success' && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Invitation sent!</span>
                  </div>
                )}
                {sendStatus === 'error' && (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Failed to send invitation</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shared with list */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Shared with</Label>
            <div className="space-y-2">
              {shareLinks.map(link => (
                <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(link.role)}
                      <span className="font-medium">{link.email}</span>
                    </div>
                    <Badge className={getRoleColor(link.role)}>
                      {link.role}
                    </Badge>
                    <Badge className={getStatusColor(link.status)}>
                      {link.status}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeShareLink(link.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 