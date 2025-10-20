"use client"

import { useState } from "react"
import { Button } from "./button"
import { FieldSelectionDialog, ExportFieldConfig } from "./field-selection-dialog"
import { useToast } from "./use-toast"
import { logger } from '@/lib/logger'

export function FieldSelectionDemo() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleExport = (config: ExportFieldConfig, includeWaitingList: boolean, includeRejected: boolean) => {
    logger.debug("Export configuration", { config, includeWaitingList, includeRejected })
    
    toast({
      title: "Export Configuration",
      description: `Selected ${config.fields.length} fields for export. Sheet name: ${config.sheetName}`,
    })
    
    setIsDialogOpen(false)
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Field Selection Demo</h1>
          <p className="text-muted-foreground">
            This demo shows the field selection and ordering functionality for Excel export.
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Features</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Select and deselect fields from a comprehensive list</li>
            <li>• Drag and drop to reorder selected fields</li>
            <li>• Search through available fields</li>
            <li>• Customize Excel sheet name</li>
            <li>• Choose export options (waiting list, rejected applications)</li>
            <li>• Real-time preview of selected fields</li>
          </ul>
        </div>

        <div className="text-center">
          <Button onClick={() => setIsDialogOpen(true)} size="lg">
            Open Field Selection Dialog
          </Button>
        </div>

        <FieldSelectionDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onExport={handleExport}
          isExporting={false}
        />
      </div>
    </div>
  )
}
