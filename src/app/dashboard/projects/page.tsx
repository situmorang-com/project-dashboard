import { ProjectListTable } from "@/components/dashboard/project-list-table"
import { ProjectListHeader } from "@/components/dashboard/project-list-header"

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProjectListHeader />
        <ProjectListTable />
      </div>
    </div>
  )
} 