"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Project, Milestone } from "@/lib/database"
import { 
  Calendar,
  Users,
  DollarSign,
  AlertTriangle,
  Target,
  FileText,
  Plus,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react"

interface EditProjectDialogProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectUpdated?: (project: Project) => void
}

interface MilestoneFormData {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  progress: number
  status: 'completed' | 'in-progress' | 'upcoming' | 'delayed'
  priority: 'high' | 'medium' | 'low'
  assignees: string[]
}

export function EditProjectDialog({ project, open, onOpenChange, onProjectUpdated }: EditProjectDialogProps) {
  const [formData, setFormData] = useState<Partial<Project>>({})
  const [loading, setLoading] = useState(false)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [milestoneForm, setMilestoneForm] = useState<MilestoneFormData>({
    id: '',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    progress: 0,
    status: 'upcoming',
    priority: 'medium',
    assignees: []
  })
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null)

  useEffect(() => {
    if (project) {
      setFormData(project)
      fetchMilestones()
    }
  }, [project])

  const fetchMilestones = async () => {
    if (!project) return
    
    try {
      const response = await fetch(`/api/milestones?projectId=${project.id}`)
      if (response.ok) {
        const data = await response.json()
        setMilestones(data)
      }
    } catch (error) {
      console.error('Error fetching milestones:', error)
    }
  }

  const handleInputChange = (field: keyof Project, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleMilestoneFormChange = (field: keyof MilestoneFormData, value: any) => {
    setMilestoneForm(prev => ({ ...prev, [field]: value }))
  }

  const resetMilestoneForm = () => {
    setMilestoneForm({
      id: '',
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      progress: 0,
      status: 'upcoming',
      priority: 'medium',
      assignees: []
    })
    setEditingMilestoneId(null)
  }

  const handleAddMilestone = () => {
    setShowMilestoneForm(true)
    resetMilestoneForm()
  }

  const handleEditMilestone = (milestone: Milestone) => {
    setMilestoneForm({
      id: milestone.id,
      name: milestone.name,
      description: milestone.description,
      startDate: milestone.startDate,
      endDate: milestone.endDate,
      progress: milestone.progress,
      status: milestone.status,
      priority: milestone.priority,
      assignees: milestone.assignees
    })
    setEditingMilestoneId(milestone.id)
    setShowMilestoneForm(true)
  }

  const handleSaveMilestone = async () => {
    if (!project || !milestoneForm.name) return

    try {
      const milestoneData = {
        ...milestoneForm,
        projectId: project.id
      }

      // For new milestones, don't send an ID (let the database generate one)
      if (!editingMilestoneId) {
        delete milestoneData.id
      }

      const url = editingMilestoneId 
        ? `/api/milestones/${editingMilestoneId}`
        : '/api/milestones'
      
      const method = editingMilestoneId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(milestoneData)
      })

      if (response.ok) {
        await fetchMilestones()
        setShowMilestoneForm(false)
        resetMilestoneForm()
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('milestones-updated'))
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save milestone')
      }
    } catch (error) {
      console.error('Error saving milestone:', error)
      alert(`Failed to save milestone: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return

    try {
      const response = await fetch(`/api/milestones/${milestoneId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchMilestones()
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('milestones-updated'))
      } else {
        throw new Error('Failed to delete milestone')
      }
    } catch (error) {
      console.error('Error deleting milestone:', error)
      alert('Failed to delete milestone')
    }
  }

  const handleSubmit = async () => {
    if (!project || !formData) return

    setLoading(true)
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updatedProject = await response.json()
        onProjectUpdated?.(updatedProject)
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('project-updated'))
        
        onOpenChange(false)
      } else {
        throw new Error('Failed to update project')
      }
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Failed to update project')
    } finally {
      setLoading(false)
    }
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
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'upcoming':
        return 'bg-gray-100 text-gray-800'
      case 'delayed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  if (!project) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Edit Project: {project.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="team">Team & Risks</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="id">Project ID</Label>
                <Input
                  id="id"
                  value={formData.id || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sponsor">Sponsor</Label>
                <Input
                  id="sponsor"
                  value={formData.sponsor || ''}
                  onChange={(e) => handleInputChange('sponsor', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectManager">Project Manager</Label>
                <Input
                  id="projectManager"
                  value={formData.projectManager || ''}
                  onChange={(e) => handleInputChange('projectManager', e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextMilestone">Next Milestone</Label>
                  <Input
                    id="nextMilestone"
                    value={formData.nextMilestone || ''}
                    onChange={(e) => handleInputChange('nextMilestone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="milestoneDate">Milestone Date</Label>
                  <Input
                    id="milestoneDate"
                    type="date"
                    value={formData.milestoneDate || ''}
                    onChange={(e) => handleInputChange('milestoneDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Milestones</h3>
                  <Button onClick={handleAddMilestone} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Milestone
                  </Button>
                </div>

                <div className="space-y-3">
                  {milestones.map(milestone => (
                    <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(milestone.status)}
                        <div>
                          <div className="font-medium">{milestone.name}</div>
                          <div className="text-sm text-muted-foreground">{milestone.description}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(milestone.status)}>
                              {milestone.status.replace('-', ' ')}
                            </Badge>
                            <Badge className={getPriorityColor(milestone.priority)}>
                              {milestone.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {milestone.startDate} - {milestone.endDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditMilestone(milestone)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMilestone(milestone.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {showMilestoneForm && (
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        {editingMilestoneId ? 'Edit Milestone' : 'Add New Milestone'}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowMilestoneForm(false)
                          resetMilestoneForm()
                        }}
                      >
                        Cancel
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="milestoneName">Milestone Name</Label>
                        <Input
                          id="milestoneName"
                          value={milestoneForm.name}
                          onChange={(e) => handleMilestoneFormChange('name', e.target.value)}
                          placeholder="Enter milestone name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="milestonePriority">Priority</Label>
                        <Select 
                          value={milestoneForm.priority} 
                          onValueChange={(value) => handleMilestoneFormChange('priority', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="milestoneStartDate">Start Date</Label>
                        <Input
                          id="milestoneStartDate"
                          type="date"
                          value={milestoneForm.startDate}
                          onChange={(e) => handleMilestoneFormChange('startDate', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="milestoneEndDate">End Date</Label>
                        <Input
                          id="milestoneEndDate"
                          type="date"
                          value={milestoneForm.endDate}
                          onChange={(e) => handleMilestoneFormChange('endDate', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="milestoneStatus">Status</Label>
                        <Select 
                          value={milestoneForm.status} 
                          onValueChange={(value) => handleMilestoneFormChange('status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="delayed">Delayed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="milestoneProgress">Progress (%)</Label>
                        <Input
                          id="milestoneProgress"
                          type="number"
                          min="0"
                          max="100"
                          value={milestoneForm.progress}
                          onChange={(e) => handleMilestoneFormChange('progress', parseInt(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="milestoneDescription">Description</Label>
                      <Textarea
                        id="milestoneDescription"
                        value={milestoneForm.description}
                        onChange={(e) => handleMilestoneFormChange('description', e.target.value)}
                        placeholder="Enter milestone description"
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowMilestoneForm(false)
                          resetMilestoneForm()
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveMilestone}>
                        {editingMilestoneId ? 'Update Milestone' : 'Add Milestone'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="budget" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="budgetPlanned">Planned Budget</Label>
                <Input
                  id="budgetPlanned"
                  type="number"
                  value={formData.budgetPlanned || 0}
                  onChange={(e) => handleInputChange('budgetPlanned', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetActual">Actual Spent</Label>
                <Input
                  id="budgetActual"
                  type="number"
                  value={formData.budgetActual || 0}
                  onChange={(e) => handleInputChange('budgetActual', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="healthScore">Health Score</Label>
                <Input
                  id="healthScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.healthScore || 0}
                  onChange={(e) => handleInputChange('healthScore', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="daysToDue">Days to Due</Label>
                <Input
                  id="daysToDue"
                  type="number"
                  value={formData.daysToDue || 0}
                  onChange={(e) => handleInputChange('daysToDue', parseInt(e.target.value))}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="coreTeam">Core Team</Label>
                <Input
                  id="coreTeam"
                  value={formData.coreTeam || ''}
                  onChange={(e) => handleInputChange('coreTeam', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resourceLoad">Resource Load (%)</Label>
                <Input
                  id="resourceLoad"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.resourceLoad || 0}
                  onChange={(e) => handleInputChange('resourceLoad', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="riskLevel">Risk Level</Label>
                <Select value={formData.riskLevel || 'medium'} onValueChange={(value) => handleInputChange('riskLevel', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stakeholders">Stakeholders</Label>
                <Input
                  id="stakeholders"
                  value={formData.stakeholders || ''}
                  onChange={(e) => handleInputChange('stakeholders', e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="topRisks">Top Risks</Label>
                <Textarea
                  id="topRisks"
                  value={formData.topRisks || ''}
                  onChange={(e) => handleInputChange('topRisks', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="keyDependencies">Key Dependencies</Label>
                <Textarea
                  id="keyDependencies"
                  value={formData.keyDependencies || ''}
                  onChange={(e) => handleInputChange('keyDependencies', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 