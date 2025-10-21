"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export interface FieldConfig {
  key: string
  displayName: string
  type: "application" | "exam" | "system"
}

export interface ExportFieldConfig {
  fields: FieldConfig[]
  sheetName: string
}

interface FieldSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  onExport: (config: ExportFieldConfig, includeWaitingList: boolean, includeRejected: boolean) => void
  isExporting?: boolean
}

// Available fields for export based on ApplicationData type
const AVAILABLE_FIELDS: FieldConfig[] = [
  // Basic Information
  { key: "candidateId", displayName: "Candidate ID", type: "application" },
  { key: "fullName", displayName: "Full Name", type: "application" },
  { key: "email", displayName: "Email Address", type: "application" },
  { key: "personalContact", displayName: "WhatsApp Number", type: "application" },
  { key: "emergencyContact", displayName: "Emergency Contact", type: "application" },

  // Address Information
  { key: "streetAddress", displayName: "Street Address", type: "application" },
  { key: "poBox", displayName: "P.O. Box", type: "application" },
  { key: "district", displayName: "District", type: "application" },
  { key: "city", displayName: "City", type: "application" },
  { key: "province", displayName: "Province", type: "application" },
  { key: "country", displayName: "Country", type: "application" },
  { key: "originCountry", displayName: "Country of Origin", type: "application" },
  { key: "clinicalExperienceCountry", displayName: "Country of Experience", type: "application" },

  // Registration Information
  { key: "registrationAuthority", displayName: "Registration Authority", type: "application" },
  { key: "registrationNumber", displayName: "Registration Number", type: "application" },
  { key: "registrationDate", displayName: "Registration Date", type: "application" },

  // Exam Information
  { key: "dateOfPassingPart1", displayName: "Part 1 Passing Date", type: "application" },
  { key: "previousOsceAttempts", displayName: "Previous OSCE Attempts", type: "application" },
  { key: "preferenceDate1", displayName: "Preference Date 1", type: "application" },
  { key: "preferenceDate2", displayName: "Preference Date 2", type: "application" },
  { key: "preferenceDate3", displayName: "Preference Date 3", type: "application" },

  // Status and System
  { key: "status", displayName: "Application Status", type: "system" },
  { key: "createdAt", displayName: "Application Date", type: "system" },
  { key: "updatedAt", displayName: "Last Updated", type: "system" },
  { key: "isWaiting", displayName: "Waiting List", type: "system" },
  { key: "notes", displayName: "Notes", type: "system" },
  { key: "adminNotes", displayName: "Admin Notes", type: "system" },
]

const DEFAULT_SHEET_NAME = "Applications"

// Sortable item component
function SortableItem({ field, index, totalItems, onMoveUp, onMoveDown, onRemove }: {
  field: FieldConfig
  index: number
  totalItems: number
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onRemove: (fieldKey: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.key })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-2 p-2 bg-background border rounded-md ${isDragging ? "shadow-lg opacity-90" : ""
        }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{field.displayName}</div>
        <div className="text-xs text-muted-foreground">{field.key}</div>
      </div>

      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMoveUp(index)}
          disabled={index === 0}
          className="h-6 w-6 p-0"
        >
          ↑
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMoveDown(index)}
          disabled={index === totalItems - 1}
          className="h-6 w-6 p-0"
        >
          ↓
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(field.key)}
          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

export function FieldSelectionDialog({
  isOpen,
  onClose,
  onExport,
  isExporting = false,
}: FieldSelectionDialogProps) {
  const { toast } = useToast()
  const [selectedFields, setSelectedFields] = useState<FieldConfig[]>([])
  const [sheetName, setSheetName] = useState(DEFAULT_SHEET_NAME)
  const [searchQuery, setSearchQuery] = useState("")
  const [includeWaitingList, setIncludeWaitingList] = useState(true)
  const [includeRejected, setIncludeRejected] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Initialize with default fields if none selected
  useEffect(() => {
    if (isOpen && selectedFields.length === 0) {
      const defaultFields = AVAILABLE_FIELDS.filter(field =>
        ["candidateId", "fullName", "email", "personalContact", "status", "createdAt"].includes(field.key)
      )
      setSelectedFields(defaultFields)
    }
  }, [isOpen, selectedFields.length])

  const filteredFields = AVAILABLE_FIELDS.filter(field =>
    field.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    field.key.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleFieldToggle = (field: FieldConfig) => {
    setSelectedFields(prev => {
      const isSelected = prev.some(f => f.key === field.key)
      if (isSelected) {
        return prev.filter(f => f.key !== field.key)
      } else {
        return [...prev, field]
      }
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setSelectedFields((items) => {
        const oldIndex = items.findIndex((item) => item.key === active.id)
        const newIndex = items.findIndex((item) => item.key === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newFields = [...selectedFields]
      ;[newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]]
    setSelectedFields(newFields)
  }

  const handleMoveDown = (index: number) => {
    if (index === selectedFields.length - 1) return
    const newFields = [...selectedFields]
      ;[newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]]
    setSelectedFields(newFields)
  }

  const handleRemoveField = (fieldKey: string) => {
    setSelectedFields(prev => prev.filter(f => f.key !== fieldKey))
  }

  const handleSelectAll = () => {
    setSelectedFields(AVAILABLE_FIELDS)
  }

  const handleSelectNone = () => {
    setSelectedFields([])
  }

  const handleExport = () => {
    if (selectedFields.length === 0) {
      toast({
        title: "No Fields Selected",
        description: "Please select at least one field to export.",
        variant: "destructive",
      })
      return
    }

    if (!sheetName.trim()) {
      toast({
        title: "Sheet Name Required",
        description: "Please enter a name for the Excel sheet.",
        variant: "destructive",
      })
      return
    }

    const config: ExportFieldConfig = {
      fields: selectedFields,
      sheetName: sheetName.trim(),
    }

    onExport(config, includeWaitingList, includeRejected)
  }

  const handleClose = () => {
    setSearchQuery("")
    onClose()
  }


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Configure Excel Export Fields
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Select and reorder the fields you want to include in the Excel export.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Fields */}
          <div className="space-y-4">
            <div className="space-y-2 ">
              <Label htmlFor="search">Search Fields</Label>
              <Input
                id="search"
                className="ml-1"
                placeholder="Search available fields..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Available Fields</Label>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectNone}
                  >
                    Select None
                  </Button>
                </div>
              </div>

              <div className="border rounded-md max-h-96 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {filteredFields.map((field) => {
                    const isSelected = selectedFields.some(f => f.key === field.key)
                    return (
                      <div
                        key={field.key}
                        className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                        onClick={() => handleFieldToggle(field)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleFieldToggle(field)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{field.displayName}</div>
                          <div className="text-xs text-muted-foreground">{field.key}</div>
                        </div>
                        <div className="text-xs px-2 py-1 rounded-full bg-muted">
                          {field.type}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Selected Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sheetName">Excel Sheet Name</Label>
              <Input
                id="sheetName"
                placeholder="Enter sheet name..."
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Export Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeWaitingList"
                    checked={includeWaitingList}
                    onCheckedChange={(checked) => setIncludeWaitingList(checked === true)}
                  />
                  <Label htmlFor="includeWaitingList" className="text-sm">
                    Include waiting list applications
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeRejected"
                    checked={includeRejected}
                    onCheckedChange={(checked) => setIncludeRejected(checked === true)}
                  />
                  <Label htmlFor="includeRejected" className="text-sm">
                    Include rejected applications
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Selected Fields ({selectedFields.length})</Label>

              {selectedFields.length === 0 ? (
                <div className="border rounded-md p-8 text-center text-muted-foreground">
                  No fields selected. Choose fields from the left panel.
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={selectedFields.map(field => field.key)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="border rounded-md max-h-96 overflow-y-auto">
                      <div className="p-2 space-y-1">
                        {selectedFields.map((field, index) => (
                          <SortableItem
                            key={field.key}
                            field={field}
                            index={index}
                            totalItems={selectedFields.length}
                            onMoveUp={handleMoveUp}
                            onMoveDown={handleMoveDown}
                            onRemove={handleRemoveField}
                          />
                        ))}
                      </div>
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || selectedFields.length === 0}
            className="min-w-32"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
