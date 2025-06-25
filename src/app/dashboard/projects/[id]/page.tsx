import { ProjectDetails } from "@/components/dashboard/project-details"

interface ProjectPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProjectDetails projectId={id} />
      </div>
    </div>
  )
} 