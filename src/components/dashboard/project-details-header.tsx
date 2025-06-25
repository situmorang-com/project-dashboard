"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Share2,
  Calendar,
  Users,
  DollarSign
} from "lucide-react"
import Link from "next/link"
import { Project } from "@/lib/database"
import { ProjectService } from "@/lib/project-service"
import { ShareProjectDialog } from "./share-project-dialog"
import { ExportProjectDialog } from "./export-project-dialog"
import { EditProjectDialog } from "./edit-project-dialog"

interface ProjectDetailsHeaderProps {
  projectId: string
}

export function ProjectDetailsHeader({ projectId }: ProjectDetailsHeaderProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectData = await ProjectService.getProjectById(projectId)
        setProject(projectData)
      } catch (error) {
        console.error('Error fetching project:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [projectId])

  const handleProjectUpdated = (updatedProject: Project) => {
    setProject(updatedProject)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard/projects" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Projects
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Loading...</span>
        </div>
        <div className="h-8 bg-muted animate-pulse rounded"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard/projects" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Projects
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Project Not Found</span>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Project not found</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-800'
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-800'
      case 'blocked':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/dashboard/projects" className="hover:text-foreground transition-colors">
          Projects
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{project.name}</span>
      </div>

      {/* Project Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge className={getStatusColor(project.status)}>
              {project.status.replace('-', ' ').toUpperCase()}
            </Badge>
            <Badge className={getRiskColor(project.riskLevel)}>
              {project.riskLevel.toUpperCase()} RISK
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            {project.description}
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>ID: {project.id}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{project.coreTeam}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>Budget: ${project.budgetPlanned.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShareDialogOpen(true)}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setExportDialogOpen(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            size="sm"
            onClick={() => setEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <ShareProjectDialog
        project={project}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
      
      <ExportProjectDialog
        project={project}
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
      />
      
      <EditProjectDialog
        project={project}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onProjectUpdated={handleProjectUpdated}
      />
    </div>
  )
} 