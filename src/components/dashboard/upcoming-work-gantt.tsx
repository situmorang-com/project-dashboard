"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Calendar, 
  Clock, 
  Users, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Milestone, Project } from "@/lib/database"

interface MilestoneWithProject extends Milestone {
  projectName: string
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'in-progress':
      return <Clock className="h-4 w-4 text-blue-600" />
    case 'upcoming':
      return <Calendar className="h-4 w-4 text-gray-600" />
    case 'delayed':
      return <AlertTriangle className="h-4 w-4 text-red-600" />
    default:
      return null
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return "bg-green-100 text-green-800"
    case 'in-progress':
      return "bg-blue-100 text-blue-800"
    case 'upcoming':
      return "bg-gray-100 text-gray-800"
    case 'delayed':
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return "bg-red-100 text-red-800"
    case 'medium':
      return "bg-yellow-100 text-yellow-800"
    case 'low':
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const getDaysUntil = (dateString: string) => {
  const today = new Date()
  const targetDate = new Date(dateString)
  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function UpcomingWorkGantt() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"timeline" | "list">("timeline")
  const [milestones, setMilestones] = useState<MilestoneWithProject[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [milestonesRes, projectsRes] = await Promise.all([
          fetch('/api/milestones'),
          fetch('/api/projects')
        ])
        
        if (milestonesRes.ok && projectsRes.ok) {
          const milestonesData = await milestonesRes.json()
          const projectsData = await projectsRes.json()
          setMilestones(milestonesData)
          setProjects(projectsData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const statuses = ["all", "completed", "in-progress", "upcoming", "delayed"]
  const priorities = ["all", "high", "medium", "low"]

  const filteredMilestones = milestones.filter(milestone => {
    const statusMatch = selectedStatus === "all" || milestone.status === selectedStatus
    const priorityMatch = selectedPriority === "all" || milestone.priority === selectedPriority
    return statusMatch && priorityMatch
  })

  const sortedMilestones = [...filteredMilestones].sort((a, b) => {
    // Sort by priority first, then by start date
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder]
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder]
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority
    }
    
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  })

  if (loading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Work Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading milestones...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Work Roadmap
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status === "all" ? "All Status" : status.replace('-', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map(priority => (
                  <SelectItem key={priority} value={priority}>
                    {priority === "all" ? "All Priority" : priority.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "timeline" ? "list" : "timeline")}
            >
              {viewMode === "timeline" ? "List View" : "Timeline"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {milestones.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-muted-foreground">No milestones found</div>
            </div>
          </div>
        ) : viewMode === "timeline" ? (
          <div className="space-y-6">
            {/* Timeline View */}
            <div className="space-y-4">
              {sortedMilestones.map(milestone => {
                const daysUntil = getDaysUntil(milestone.startDate)
                const project = projects.find(p => p.id === milestone.projectId)
                
                return (
                  <div key={milestone.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(milestone.status)}
                          <h4 className="font-medium">{milestone.name}</h4>
                          <Badge className={getStatusColor(milestone.status)}>
                            {milestone.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                          <Badge className={getPriorityColor(milestone.priority)}>
                            {milestone.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Project: {milestone.projectName}</span>
                          <span>•</span>
                          <span>{formatDate(milestone.startDate)} - {formatDate(milestone.endDate)}</span>
                          <span>•</span>
                          <span>{milestone.assignees.length} assignees</span>
                          {daysUntil > 0 && (
                            <>
                              <span>•</span>
                              <span className="font-medium">Starts in {daysUntil} days</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Progress</div>
                        <div className="font-medium">{milestone.progress}%</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Progress value={milestone.progress} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Assignees: {milestone.assignees.join(", ")}</span>
                        {milestone.dependencies.length > 0 && (
                          <span>Dependencies: {milestone.dependencies.length}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* List View */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Milestone</th>
                    <th className="text-left p-2 font-medium">Project</th>
                    <th className="text-left p-2 font-medium">Status</th>
                    <th className="text-left p-2 font-medium">Priority</th>
                    <th className="text-left p-2 font-medium">Timeline</th>
                    <th className="text-left p-2 font-medium">Progress</th>
                    <th className="text-left p-2 font-medium">Assignees</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMilestones.map(milestone => {
                    const daysUntil = getDaysUntil(milestone.startDate)
                    
                    return (
                      <tr key={milestone.id} className="border-b hover:bg-muted/30">
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{milestone.name}</div>
                            <div className="text-xs text-muted-foreground">{milestone.description}</div>
                          </div>
                        </td>
                        <td className="p-2 text-sm">{milestone.projectName}</td>
                        <td className="p-2">
                          <Badge className={getStatusColor(milestone.status)}>
                            {milestone.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge className={getPriorityColor(milestone.priority)}>
                            {milestone.priority.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-2 text-sm">
                          <div>{formatDate(milestone.startDate)} - {formatDate(milestone.endDate)}</div>
                          {daysUntil > 0 && (
                            <div className="text-xs text-muted-foreground">Starts in {daysUntil} days</div>
                          )}
                        </td>
                        <td className="p-2">
                          <div className="space-y-1">
                            <Progress value={milestone.progress} className="h-2" />
                            <div className="text-sm">{milestone.progress}%</div>
                          </div>
                        </td>
                        <td className="p-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {milestone.assignees.length}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {milestone.assignees.join(", ")}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 