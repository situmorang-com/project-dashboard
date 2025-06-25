"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  File,
  Calendar,
  Users,
  DollarSign,
  Activity
} from "lucide-react"
import { Project } from "@/lib/database"

interface ExportProjectDialogProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ExportOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  format: 'pdf' | 'excel' | 'json'
  sections: string[]
}

export function ExportProjectDialog({ project, open, onOpenChange }: ExportProjectDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'json'>('pdf')
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'overview', 'timeline', 'budget', 'risks', 'team'
  ])

  const exportOptions: ExportOption[] = [
    {
      id: 'pdf',
      name: 'PDF Report',
      description: 'Professional PDF document with all project details',
      icon: <File className="h-5 w-5" />,
      format: 'pdf',
      sections: ['overview', 'timeline', 'budget', 'risks', 'team']
    },
    {
      id: 'excel',
      name: 'Excel Spreadsheet',
      description: 'Data in spreadsheet format for analysis',
      icon: <FileSpreadsheet className="h-5 w-5" />,
      format: 'excel',
      sections: ['overview', 'timeline', 'budget', 'risks', 'team']
    },
    {
      id: 'json',
      name: 'JSON Data',
      description: 'Raw project data in JSON format',
      icon: <FileText className="h-5 w-5" />,
      format: 'json',
      sections: ['overview', 'timeline', 'budget', 'risks', 'team']
    }
  ]

  const sectionOptions = [
    { id: 'overview', name: 'Project Overview', icon: <Activity className="h-4 w-4" /> },
    { id: 'timeline', name: 'Timeline & Milestones', icon: <Calendar className="h-4 w-4" /> },
    { id: 'budget', name: 'Budget Details', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'risks', name: 'Risks & Dependencies', icon: <Activity className="h-4 w-4" /> },
    { id: 'team', name: 'Team & Stakeholders', icon: <Users className="h-4 w-4" /> }
  ]

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleExport = () => {
    // Simulate export process
    const exportData = {
      project,
      format: selectedFormat,
      sections: selectedSections,
      exportedAt: new Date().toISOString()
    }

    if (selectedFormat === 'json') {
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${project?.id}-${project?.name.replace(/\s+/g, '-')}.json`
      link.click()
      URL.revokeObjectURL(url)
    } else {
      // For PDF and Excel, you would typically call your backend API
      console.log('Exporting:', exportData)
      alert(`${selectedFormat.toUpperCase()} export would be generated here`)
    }
    
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Project: {project?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <div className="grid gap-3">
              {exportOptions.map(option => (
                <div
                  key={option.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedFormat === option.format 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedFormat(option.format)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {option.icon}
                    <div>
                      <div className="font-medium">{option.name}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </div>
                  {selectedFormat === option.format && (
                    <Badge className="bg-primary text-primary-foreground">Selected</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Include Sections</Label>
            <div className="grid gap-2">
              {sectionOptions.map(section => (
                <div
                  key={section.id}
                  className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => toggleSection(section.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedSections.includes(section.id)}
                    onChange={() => toggleSection(section.id)}
                    className="rounded"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    {section.icon}
                    <span className="text-sm">{section.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Preview */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Summary</Label>
            <div className="p-3 border rounded-lg bg-muted/30">
              <div className="text-sm space-y-1">
                <div>Format: <span className="font-medium">{selectedFormat.toUpperCase()}</span></div>
                <div>Sections: <span className="font-medium">{selectedSections.length} of {sectionOptions.length}</span></div>
                <div>File size: <span className="font-medium">~{Math.floor(Math.random() * 500) + 100}KB</span></div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={selectedSections.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 