"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Project, Milestone } from "@/lib/database"
import { ProjectService } from "@/lib/project-service"
import { 
  Calendar,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  TrendingUp,
  Shield,
  FileText,
  Activity,
  RefreshCw
} from "lucide-react"
import { ProjectDetailsHeader } from "./project-details-header"

interface ProjectDetailsProps {
  projectId: string
}

export function ProjectDetails({ projectId }: ProjectDetailsProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchProject = async () => {
    try {
      const projectData = await ProjectService.getProjectById(projectId)
      setProject(projectData)
    } catch (error) {
      console.error('Error fetching project:', error)
    }
  }

  const fetchMilestones = async () => {
    try {
      const response = await fetch(`/api/milestones?projectId=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setMilestones(data)
      }
    } catch (error) {
      console.error('Error fetching milestones:', error)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await Promise.all([fetchProject(), fetchMilestones()])
    setRefreshing(false)
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchProject(), fetchMilestones()])
      setLoading(false)
    }
    loadData()
  }, [projectId])

  // Listen for custom events from the edit dialog
  useEffect(() => {
    const handleProjectUpdated = () => {
      refreshData()
    }

    const handleMilestonesUpdated = () => {
      fetchMilestones()
    }

    window.addEventListener('project-updated', handleProjectUpdated)
    window.addEventListener('milestones-updated', handleMilestonesUpdated)

    return () => {
      window.removeEventListener('project-updated', handleProjectUpdated)
      window.removeEventListener('milestones-updated', handleMilestonesUpdated)
    }
  }, [projectId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="h-20 bg-muted animate-pulse"></CardHeader>
              <CardContent className="h-16 bg-muted animate-pulse"></CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-muted-foreground">Project not found</p>
        </div>
      </Card>
    )
  }

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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'at-risk':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'blocked':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return null
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const budgetVariance = project.budgetPlanned - project.budgetActual
  const budgetVariancePercent = ((project.budgetActual / project.budgetPlanned) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      <ProjectDetailsHeader 
        projectId={projectId} 
        onRefresh={refreshData}
      />

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.progress}%</div>
            <Progress value={project.progress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthScoreColor(project.healthScore)}`}>
              {project.healthScore}
            </div>
            <p className="text-xs text-muted-foreground">
              {project.healthScore >= 80 ? 'Excellent' : project.healthScore >= 60 ? 'Good' : 'Needs Attention'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days to Due</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.daysToDue}</div>
            <p className="text-xs text-muted-foreground">
              {project.daysToDue > 30 ? 'On track' : project.daysToDue > 7 ? 'Approaching deadline' : 'Urgent'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Load</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.resourceLoad}%</div>
            <p className="text-xs text-muted-foreground">
              {project.resourceLoad > 90 ? 'Overloaded' : project.resourceLoad > 70 ? 'High' : 'Normal'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="risks">Risks & Dependencies</TabsTrigger>
          <TabsTrigger value="team">Team & Stakeholders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Project Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Start Date</span>
                    <span className="font-medium">{formatDate(project.startDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">End Date</span>
                    <span className="font-medium">{formatDate(project.endDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Next Milestone</span>
                    <span className="font-medium">{project.nextMilestone}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Milestone Date</span>
                    <span className="font-medium">{formatDate(project.milestoneDate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Budget Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Planned Budget</span>
                    <span className="font-medium">{formatCurrency(project.budgetPlanned)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Actual Spent</span>
                    <span className="font-medium">{formatCurrency(project.budgetActual)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Variance</span>
                    <span className={`font-medium ${budgetVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(budgetVariance)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">% Spent</span>
                    <span className="font-medium">{budgetVariancePercent}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline & Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Project Timeline */}
                <div className="space-y-3">
                  <h4 className="font-medium">Project Timeline</h4>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium">Project Start</h5>
                      <p className="text-sm text-muted-foreground">{formatDate(project.startDate)}</p>
                    </div>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium">{project.nextMilestone}</h5>
                      <p className="text-sm text-muted-foreground">{formatDate(project.milestoneDate)}</p>
                    </div>
                    <Badge variant="outline">Upcoming</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium">Project End</h5>
                      <p className="text-sm text-muted-foreground">{formatDate(project.endDate)}</p>
                    </div>
                    <Badge variant="outline">Planned</Badge>
                  </div>
                </div>

                {/* Milestones List */}
                <div className="space-y-3">
                  <h4 className="font-medium">All Milestones ({milestones.length})</h4>
                  {milestones.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No milestones found for this project
                    </div>
                  ) : (
                    milestones.map(milestone => (
                      <div key={milestone.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div>
                            <h5 className="font-medium">{milestone.name}</h5>
                            <p className="text-sm text-muted-foreground">{milestone.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={milestone.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                               milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                               milestone.status === 'delayed' ? 'bg-red-100 text-red-800' : 
                                               'bg-gray-100 text-gray-800'}>
                                {milestone.status.replace('-', ' ')}
                              </Badge>
                              <Badge className={milestone.priority === 'high' ? 'bg-red-100 text-red-800' :
                                               milestone.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                               'bg-green-100 text-green-800'}>
                                {milestone.priority}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(milestone.startDate)} - {formatDate(milestone.endDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Progress</div>
                          <div className="font-medium">{milestone.progress}%</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Budget Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Planned</span>
                        <span className="font-medium">{formatCurrency(project.budgetPlanned)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Actual</span>
                        <span className="font-medium">{formatCurrency(project.budgetActual)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Variance</span>
                        <span className={`font-medium ${budgetVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(budgetVariance)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Budget Health</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>% Spent</span>
                        <span className="font-medium">{budgetVariancePercent}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status</span>
                        <Badge className={budgetVariance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {budgetVariance >= 0 ? 'Under Budget' : 'Over Budget'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risks & Dependencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    Top Risks
                  </h4>
                  <p className="text-sm text-muted-foreground">{project.topRisks}</p>
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Key Dependencies
                  </h4>
                  <p className="text-sm text-muted-foreground">{project.keyDependencies}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team & Stakeholders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Core Team
                  </h4>
                  <p className="text-sm text-muted-foreground">{project.coreTeam}</p>
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Project Manager
                  </h4>
                  <p className="text-sm text-muted-foreground">{project.projectManager}</p>
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Sponsor
                  </h4>
                  <p className="text-sm text-muted-foreground">{project.sponsor}</p>
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Stakeholders
                  </h4>
                  <p className="text-sm text-muted-foreground">{project.stakeholders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 