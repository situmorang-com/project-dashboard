"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  FolderOpen, 
  CheckCircle, 
  AlertTriangle, 
  XCircle 
} from "lucide-react"
import Link from "next/link"
import { ProjectService } from "@/lib/project-service"

interface ProjectStats {
  total: number
  onTrack: number
  atRisk: number
  blocked: number
}

export function KPICards() {
  const [stats, setStats] = useState<ProjectStats>({ total: 0, onTrack: 0, atRisk: 0, blocked: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const projectStats = await ProjectService.getProjectStats()
        setStats(projectStats)
      } catch (error) {
        console.error('Error fetching project stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const kpiData = [
    {
      title: "Total Projects",
      value: loading ? "..." : stats.total.toString(),
      description: "Active projects",
      icon: FolderOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/dashboard/projects",
    },
    {
      title: "On-Track",
      value: loading ? "..." : stats.onTrack.toString(),
      description: "Projects on schedule",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/dashboard/projects?status=on-track",
    },
    {
      title: "At-Risk",
      value: loading ? "..." : stats.atRisk.toString(),
      description: "Projects at risk",
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      href: "/dashboard/projects?status=at-risk",
    },
    {
      title: "Blocked",
      value: loading ? "..." : stats.blocked.toString(),
      description: "Projects blocked",
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      href: "/dashboard/projects?status=blocked",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpiData.map((kpi) => {
        const IconComponent = kpi.icon
        const CardWrapper = kpi.href ? Link : 'div'
        const cardProps = kpi.href ? { href: kpi.href } : {}
        
        return (
          <CardWrapper key={kpi.title} {...cardProps} className={kpi.href ? "block transition-transform hover:scale-105" : ""}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <IconComponent className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground">
                  {kpi.description}
                </p>
              </CardContent>
            </Card>
          </CardWrapper>
        )
      })}
    </div>
  )
} 