"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { EditProjectDialog } from "@/components/dashboard/edit-project-dialog"
import { ProjectService } from "@/lib/project-service"
import { Project } from "@/lib/database"
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronRight,
  Users,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from "lucide-react"
import Link from "next/link"

// Utility functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'on-track':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'at-risk':
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    case 'blocked':
      return <XCircle className="h-4 w-4 text-red-600" />
    default:
      return null
  }
}

const getHealthScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-yellow-600"
  return "text-red-600"
}

const getRiskLevelColor = (level: string) => {
  switch (level) {
    case 'high':
      return "bg-red-100 text-red-800"
    case 'medium':
      return "bg-yellow-100 text-yellow-800"
    case 'low':
      return "bg-green-100 text-green-800"
    default:
      return ""
  }
}

export function ProjectListTable() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<keyof Project>('id')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const projectData = await ProjectService.getAllProjects()
      setProjects(projectData)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleSort = (field: keyof Project) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const toggleRowExpansion = (projectId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
    }
    setExpandedRows(newExpanded)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setIsEditDialogOpen(true)
  }

  const handleSaveProject = async (updatedProject: Project) => {
    try {
      await ProjectService.updateProject(updatedProject)
      await fetchProjects() // Refresh the data
      setEditingProject(null)
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating project:', error)
      // You might want to show a toast notification here
    }
  }

  const handleCloseEditDialog = () => {
    setEditingProject(null)
    setIsEditDialogOpen(false)
  }

  const sortedProjects = [...projects].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    return 0
  })

  const SortableHeader = ({ field, children }: { field: keyof Project, children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 font-medium text-left hover:text-primary transition-colors"
    >
      {children}
      {sortField === field && (
        sortDirection === 'asc' ? 
          <ChevronUp className="h-4 w-4" /> : 
          <ChevronDown className="h-4 w-4" />
      )}
    </button>
  )

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading projects...</span>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 text-left">
                  <SortableHeader field="id">Project ID</SortableHeader>
                </th>
                <th className="p-4 text-left">
                  <SortableHeader field="name">Project Name</SortableHeader>
                </th>
                <th className="p-4 text-left">
                  <SortableHeader field="description">Description</SortableHeader>
                </th>
                <th className="p-4 text-left">
                  <SortableHeader field="sponsor">Sponsor</SortableHeader>
                </th>
                <th className="p-4 text-left">
                  <SortableHeader field="projectManager">Project Manager</SortableHeader>
                </th>
                <th className="p-4 text-left">
                  <SortableHeader field="startDate">Timeline</SortableHeader>
                </th>
                <th className="p-4 text-left">
                  <SortableHeader field="progress">Progress</SortableHeader>
                </th>
                <th className="p-4 text-left">
                  <SortableHeader field="status">Status</SortableHeader>
                </th>
                <th className="p-4 text-left">
                  <SortableHeader field="healthScore">Health</SortableHeader>
                </th>
                <th className="p-4 text-left">
                  <SortableHeader field="daysToDue">Due</SortableHeader>
                </th>
                <th className="p-4 text-left">
                  <SortableHeader field="budgetPlanned">Budget</SortableHeader>
                </th>
                <th className="p-4 text-left">
                  <SortableHeader field="riskLevel">Risk</SortableHeader>
                </th>
                <th className="p-4 text-left">
                  <SortableHeader field="resourceLoad">Resources</SortableHeader>
                </th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedProjects.map((project, index) => (
                <React.Fragment key={project.id}>
                  <tr className={`border-b hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}>
                    <td className="p-4 font-mono text-sm">
                      {project.id}
                    </td>
                    <td className="p-4">
                      <Link 
                        href={`/dashboard/projects/${project.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="truncate" title={project.description}>
                        {project.description}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {project.sponsor.split(',')[0]}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium">
                        {project.projectManager}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(project.startDate)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          to {formatDate(project.endDate)}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <Progress value={project.progress} className="h-2" />
                        <div className="text-sm font-medium">
                          {project.progress}%
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(project.status)}
                        <Badge 
                          variant={
                            project.status === 'on-track' ? 'success' :
                            project.status === 'at-risk' ? 'warning' : 'danger'
                          }
                        >
                          {project.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`text-sm font-bold ${getHealthScoreColor(project.healthScore)}`}>
                        {project.healthScore}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {project.daysToDue}d
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="text-sm">
                          {formatCurrency(project.budgetPlanned)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(project.budgetActual)} actual
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getRiskLevelColor(project.riskLevel)}>
                        {project.riskLevel.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{project.resourceLoad}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(project.id)}
                      >
                        {expandedRows.has(project.id) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </Button>
                    </td>
                  </tr>
                  
                  {/* Expanded Row Details */}
                  {expandedRows.has(project.id) && (
                    <tr className="bg-muted/20">
                      <td colSpan={14} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Next Milestone */}
                          <div>
                            <h4 className="font-medium text-sm mb-2">Next Milestone</h4>
                            <div className="space-y-1">
                              <div className="text-sm font-medium">{project.nextMilestone}</div>
                              <div className="text-xs text-muted-foreground">
                                Due: {formatDate(project.milestoneDate)}
                              </div>
                            </div>
                          </div>

                          {/* Budget Variance */}
                          <div>
                            <h4 className="font-medium text-sm mb-2">Budget Variance</h4>
                            <div className="space-y-1">
                              <div className="text-sm">
                                {formatCurrency(project.budgetPlanned - project.budgetActual)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {((project.budgetActual / project.budgetPlanned) * 100).toFixed(1)}% spent
                              </div>
                            </div>
                          </div>

                          {/* Top Risks */}
                          <div>
                            <h4 className="font-medium text-sm mb-2">Top Risks</h4>
                            <div className="text-sm text-muted-foreground">
                              {project.topRisks}
                            </div>
                          </div>

                          {/* Key Dependencies */}
                          <div>
                            <h4 className="font-medium text-sm mb-2">Key Dependencies</h4>
                            <div className="text-sm text-muted-foreground">
                              {project.keyDependencies}
                            </div>
                          </div>

                          {/* Core Team */}
                          <div>
                            <h4 className="font-medium text-sm mb-2">Core Team</h4>
                            <div className="text-sm">
                              {project.coreTeam}
                            </div>
                          </div>

                          {/* Stakeholders */}
                          <div>
                            <h4 className="font-medium text-sm mb-2">Stakeholders</h4>
                            <div className="text-sm text-muted-foreground">
                              {project.stakeholders}
                            </div>
                          </div>

                          {/* Last Updated */}
                          <div>
                            <h4 className="font-medium text-sm mb-2">Last Updated</h4>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(project.lastUpdated)}
                            </div>
                          </div>

                          {/* Next Steering Committee */}
                          <div>
                            <h4 className="font-medium text-sm mb-2">Next Steering Committee</h4>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(project.nextSteeringCommittee)}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="md:col-span-2 lg:col-span-1">
                            <h4 className="font-medium text-sm mb-2">Actions</h4>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditProject(project)}
                              >
                                Edit Project
                              </Button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Project Dialog */}
      <EditProjectDialog
        project={editingProject}
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onSave={handleSaveProject}
      />
    </>
  )
} 