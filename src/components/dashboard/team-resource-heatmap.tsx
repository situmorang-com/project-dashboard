"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProjectService } from "@/lib/project-service"
import { TeamMember } from "@/lib/database"

interface ResourceLoadData {
  teamMembers: TeamMember[]
  weeks: string[]
  utilizationData: { [memberId: string]: { [week: string]: number } }
}

const getHeatMapColor = (value: number) => {
  if (value >= 90) return "bg-red-500 text-white"
  if (value >= 80) return "bg-orange-400 text-white"
  if (value >= 70) return "bg-yellow-400 text-black"
  if (value >= 60) return "bg-blue-400 text-white"
  return "bg-green-400 text-white"
}

const getLoadStatus = (load: number) => {
  if (load >= 90) return { status: "Overloaded", color: "text-red-600", icon: AlertTriangle }
  if (load >= 80) return { status: "High", color: "text-orange-600", icon: TrendingUp }
  if (load >= 70) return { status: "Moderate", color: "text-yellow-600", icon: TrendingUp }
  return { status: "Normal", color: "text-green-600", icon: TrendingUp }
}

export function TeamResourceHeatmap() {
  const [resourceData, setResourceData] = useState<ResourceLoadData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [selectedWeek, setSelectedWeek] = useState<string>("Week 1")
  const [viewMode, setViewMode] = useState<"heatmap" | "list">("heatmap")

  useEffect(() => {
    const fetchResourceData = async () => {
      try {
        setLoading(true)
        const data = await ProjectService.getTeamResourceData()
        setResourceData(data)
        if (data.weeks.length > 0) {
          setSelectedWeek(data.weeks[0])
        }
      } catch (error) {
        console.error('Error fetching resource data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResourceData()
  }, [])

  if (loading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Resource Load
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading resource data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!resourceData) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Resource Load
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            No resource data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const departments = ["all", ...Array.from(new Set(resourceData.teamMembers.map(tm => tm.department)))]

  const filteredMembers = resourceData.teamMembers.filter(member => 
    selectedDepartment === "all" || member.department === selectedDepartment
  )

  const getAverageLoad = (memberId: string) => {
    const loads = Object.values(resourceData.utilizationData[memberId])
    return Math.round(loads.reduce((sum, load) => sum + load, 0) / loads.length)
  }

  const getCurrentWeekLoad = (memberId: string) => {
    return resourceData.utilizationData[memberId][selectedWeek] || 0
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Resource Load
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>
                    {dept === "all" ? "All Departments" : dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {resourceData.weeks.map(week => (
                  <SelectItem key={week} value={week}>
                    {week}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "heatmap" ? "list" : "heatmap")}
            >
              {viewMode === "heatmap" ? "List View" : "Heat Map"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "heatmap" ? (
          <div className="space-y-4">
            {/* Heat Map Grid */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2 font-medium">Team Member</th>
                    <th className="text-left p-2 font-medium">Role</th>
                    <th className="text-left p-2 font-medium">Department</th>
                    {resourceData.weeks.map(week => (
                      <th key={week} className="text-center p-2 font-medium text-sm">
                        {week}
                      </th>
                    ))}
                    <th className="text-center p-2 font-medium">Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(member => (
                    <tr key={member.id} className="border-b hover:bg-muted/30">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-xs text-muted-foreground">{member.projects.join(", ")}</div>
                        </div>
                      </td>
                      <td className="p-2 text-sm">{member.role}</td>
                      <td className="p-2 text-sm">{member.department}</td>
                      {resourceData.weeks.map(week => {
                        const load = resourceData.utilizationData[member.id][week]
                        return (
                          <td key={week} className="p-2 text-center">
                            <div className={`inline-block w-8 h-8 rounded text-xs font-medium flex items-center justify-center ${getHeatMapColor(load)}`}>
                              {load}%
                            </div>
                          </td>
                        )
                      })}
                      <td className="p-2 text-center">
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getHeatMapColor(getAverageLoad(member.id))}`}>
                          {getAverageLoad(member.id)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium">Legend:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-400 rounded"></div>
                <span>0-59% (Normal)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-400 rounded"></div>
                <span>60-69% (Moderate)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                <span>70-79% (High)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-400 rounded"></div>
                <span>80-89% (Very High)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>90%+ (Overloaded)</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMembers.map(member => {
              const currentLoad = getCurrentWeekLoad(member.id)
              const avgLoad = getAverageLoad(member.id)
              const loadStatus = getLoadStatus(currentLoad)
              const StatusIcon = loadStatus.icon

              return (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.role} • {member.department}</p>
                      <p className="text-xs text-muted-foreground">Projects: {member.projects.join(", ")}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Current Week</div>
                      <div className={`font-bold ${loadStatus.color}`}>{currentLoad}%</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Average</div>
                      <div className="font-bold">{avgLoad}%</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${loadStatus.color}`} />
                      <Badge variant="outline" className={loadStatus.color}>
                        {loadStatus.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 