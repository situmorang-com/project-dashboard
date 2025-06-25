import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Search, 
  Filter, 
  Download, 
  Plus,
  ArrowLeft 
} from "lucide-react"
import Link from "next/link"

export function ProjectListHeader() {
  return (
    <div className="space-y-4">
      {/* Breadcrumb and Back Button */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Projects</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Portfolio</h1>
          <p className="text-muted-foreground">
            Manage and monitor all active projects
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="on-track">On Track</SelectItem>
              <SelectItem value="at-risk">At Risk</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>
    </div>
  )
} 