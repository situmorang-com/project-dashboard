import { Suspense } from "react"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { TeamResourceHeatmap } from "@/components/dashboard/team-resource-heatmap"
import { UpcomingWorkGantt } from "@/components/dashboard/upcoming-work-gantt"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Project Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor project status, team resources, and upcoming work
          </p>
        </div>

        {/* KPI Cards */}
        <KPICards />

        {/* Charts Section */}
        <div className="grid gap-6">
          {/* Team Resource Heat Map */}
          <Suspense fallback={
            <div className="col-span-4 h-64 bg-muted/20 rounded-lg animate-pulse" />
          }>
            <TeamResourceHeatmap />
          </Suspense>

          {/* Upcoming Work Gantt */}
          <Suspense fallback={
            <div className="col-span-4 h-64 bg-muted/20 rounded-lg animate-pulse" />
          }>
            <UpcomingWorkGantt />
          </Suspense>
        </div>
      </div>
    </div>
  )
} 