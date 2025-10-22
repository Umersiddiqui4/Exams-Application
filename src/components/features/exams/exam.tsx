"use client"
import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, addDays, parseISO } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { FileText, Edit, Calendar, MapPin, Users, Clock, BookOpen, Loader2 } from "lucide-react"
import { DatePickerWithRange } from "@/components/common/date-range-picker"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { createExamOccurrence } from "@/api/examOccurrencesApi"
import { useExamOccurrences } from "@/hooks/useExamOccurrences"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap } from "lucide-react"
import CreatableSelect from "react-select/creatable"
import { useExams } from "@/hooks/useExam"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
interface DateRange {
  from: Date | undefined
  to?: Date | undefined
}

const aktsLocationOptions = [
  { value: "Colombo", label: "Colombo" },
  { value: "Chennai", label: "Chennai" },
  { value: "Dhaka", label: "Dhaka" },
  { value: "Jeddah", label: "Jeddah" },
  { value: "Karachi", label: "Karachi" },
  { value: "Delhi", label: "Delhi" },
  { value: "Lahore", label: "Lahore" },
  { value: "Yangon", label: "Yangon" },
  { value: "Kathmandu", label: "Kathmandu" },
]

// Unified Zod schema for both OSCE and AKT exams
const formSchema = z.object({
  name: z.string().min(1, "Required"),
  location: z.string().min(1, "Required"),
  applicationsDateRange: z.object({
    from: z.string().min(1, "Required"),
    to: z.string().min(1, "Required"),
  }),
  applicationsLimit: z.string().min(1, "Required"),
  waitingLimit: z.string().min(1, "Required"),
  // OSCE fields - optional for AKT
  slot1DateRange: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }).optional(),
  slot2DateRange: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }).optional(),
  slot3DateRange: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }).optional(),
  // AKT field - optional for OSCE
  examDate: z.string().optional(),
})

// type FormValues = z.infer<typeof formSchema>

function DateRangePickerWithRange({
  className,
  value,
  onChange,
  isError = false,
  disabled = false,
  minDate,
}: {
  className?: string
  value: { from: string; to: string }
  onChange: (value: { from: string; to: string }) => void
  isError?: boolean
  disabled?: boolean
  minDate?: Date
}) {
  const [date, setDate] = useState<DateRange>({
    from: value.from ? new Date(value.from) : undefined,
    to: value.to ? new Date(value.to) : undefined,
  })

  // Use a ref to track if we're handling a prop change
  const isUpdatingFromProps = useRef(false)

  // Only update local state when props change and values are different
  useEffect(() => {
    const newFrom = value.from ? new Date(value.from) : undefined
    const newTo = value.to ? new Date(value.to) : undefined

    const currentFromStr = date.from ? date.from.toLocaleDateString("en-CA") : ""
    const currentToStr = date.to ? date.to.toLocaleDateString("en-CA") : ""

    if (value.from !== currentFromStr || value.to !== currentToStr) {
      isUpdatingFromProps.current = true
      setDate({
        from: newFrom,
        to: newTo,
      })
    }
  }, [value.from, value.to])

  // Handle user interactions with the date picker
  const handleDateChange = (newDate: DateRange | undefined) => {
    // If there's a minimum date and the selected from date is before it, adjust it
    if (newDate?.from && minDate && newDate.from < minDate) {
      newDate.from = minDate
    }

    setDate(newDate || { from: undefined, to: undefined })

    if (newDate?.from || newDate?.to) {
      onChange({
        from: newDate.from ? format(newDate.from, "yyyy-MM-dd") : "",
        to: newDate.to ? format(newDate.to, "yyyy-MM-dd") : "",
      })
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <div className={isError ? "border border-red-500 rounded-md" : ""}>
        <DatePickerWithRange date={date} setDate={handleDateChange} />
      </div>
      {disabled && (
        <p className="text-xs text-muted-foreground">This slot will auto-start after the previous slot ends</p>
      )}
    </div>
  )
}

const defaultOsceFormState = {
  name: "",
  location: "",
  applicationsDateRange: { from: "", to: "" },
  applicationsLimit: "",
  waitingLimit: "",
  slot1DateRange: { from: "", to: "" },
  slot2DateRange: { from: "", to: "" },
  slot3DateRange: { from: "", to: "" },
  examDate: "", // Include for unified schema
}

const defaultAktFormState = {
  name: "",
  location: aktsLocationOptions.map(loc => loc.value).join(', '), // Set default locations
  applicationsDateRange: { from: "", to: "" },
  applicationsLimit: "",
  waitingLimit: "",
  examDate: "",
  slot1DateRange: { from: "", to: "" }, // Include for unified schema
  slot2DateRange: { from: "", to: "" }, // Include for unified schema
  slot3DateRange: { from: "", to: "" }, // Include for unified schema
}

const defaultFormState = defaultOsceFormState

export function Exam() {
  const [editMode, setEditMode] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const { items: occurrences, reload: reloadOccurrences, update: updateOccurrence, toggleActive } = useExamOccurrences()
  const [selectedLocations, setSelectedLocations] = useState<any[]>([])
  const [examType, setExamType] = useState<"OSCE" | "AKTs">("OSCE")
  const [currentExam, setCurrentExam] = useState<any>(null)
  const { items: exams } = useExams();

  const handleLocationChange = (selectedOptions: any) => {
    setSelectedLocations(selectedOptions || [])
    const locationString = selectedOptions ? selectedOptions.map((option: any) => option.value).join(', ') : ''
    form.setValue("location", locationString)
  }

  const handleExamTypeChange = (newExamType: "OSCE" | "AKTs") => {
    setExamType(newExamType)
    const examName = newExamType === "OSCE" ? "OSCE" : "AKT"
    const exam = exams.find((e: any) => e.name === examName)
    setCurrentExam(exam || null)

    // Reset form with appropriate defaults based on exam type
    if (newExamType === "OSCE") {
      form.reset(defaultOsceFormState as any)
      setSelectedLocations([])
    } else {
      // For AKT, set default locations
      form.reset(defaultAktFormState as any)
      const defaultLocations = aktsLocationOptions.map(loc => ({
        value: loc.value,
        label: loc.label
      }))
      setSelectedLocations(defaultLocations)
      form.setValue("location", aktsLocationOptions.map(loc => loc.value).join(', '))
    }
  }
  // Initialize form with React Hook Form
  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormState,
    mode: "onSubmit",
  })

  const { formState } = form
  const { errors } = formState

  // Initialize currentExam when exams load
  useEffect(() => {
    if (exams && exams.length > 0) {
      const examName = examType === "OSCE" ? "OSCE" : "AKT"
      const exam = exams.find((e: any) => e.name === examName)
      setCurrentExam(exam || null)
    }
  }, [exams, examType])

  // Initialize default locations for AKT exams
  useEffect(() => {
    if (examType === "AKTs" && selectedLocations.length === 0) {
      const defaultLocations = aktsLocationOptions.map(loc => ({
        value: loc.value,
        label: loc.label
      }))
      setSelectedLocations(defaultLocations)
      form.setValue("location", aktsLocationOptions.map(loc => loc.value).join(', '))
    }
  }, [examType, selectedLocations.length, form])

  // Watch slot dates to calculate minimum dates for subsequent slots
  const slot1DateRange = form.watch("slot1DateRange")
  const slot2DateRange = form.watch("slot2DateRange")
  const applicationsDateRange = form.watch("applicationsDateRange")

  // Calculate minimum dates for slots based on previous slot end dates
  const getSlot2MinDate = () => {
    if (slot1DateRange?.to) {
      return addDays(parseISO(slot1DateRange.to), 1)
    }
    return undefined
  }

  const getSlot3MinDate = () => {
    if (slot2DateRange?.to) {
      return addDays(parseISO(slot2DateRange.to), 1)
    } else if (slot1DateRange?.to) {
      return addDays(parseISO(slot1DateRange.to), 1)
    }
    return undefined
  }

  const getSlot1MinDate = () => {
    if (applicationsDateRange?.to) {
      return addDays(parseISO(applicationsDateRange.to), 1)
    }
    return undefined
  }

  // Auto-update slot start dates when previous slot ends
  useEffect(() => {
    if (slot1DateRange?.to && !slot2DateRange?.from) {
      const nextDay = addDays(parseISO(slot1DateRange.to), 1)
      form.setValue("slot2DateRange.from", format(nextDay, "yyyy-MM-dd"))
    }
  }, [slot1DateRange?.to, slot2DateRange?.from, form])

  useEffect(() => {
    if (slot2DateRange?.to && !form.watch("slot3DateRange")?.from) {
      const nextDay = addDays(parseISO(slot2DateRange.to), 1)
      form.setValue("slot3DateRange.from", format(nextDay, "yyyy-MM-dd"))
    }
  }, [slot2DateRange?.to, form])

  // Handle date range changes
  const handleDateRangeChange = (
    field: "applicationsDateRange" | "slot1DateRange" | "slot2DateRange" | "slot3DateRange",
    value: { from: string; to: string },
  ) => {
    form.setValue(field, value, { shouldValidate: false })

    // Auto-update subsequent slots when a slot's end date changes
    if (field === "slot1DateRange" && value.to) {
      const nextDay = addDays(parseISO(value.to), 1)
      const currentSlot2 = form.watch("slot2DateRange")
      if (!currentSlot2?.from || parseISO(currentSlot2.from) <= parseISO(value.to)) {
        form.setValue("slot2DateRange.from", format(nextDay, "yyyy-MM-dd"))
      }
    }

    if (field === "slot2DateRange" && value.to) {
      const nextDay = addDays(parseISO(value.to), 1)
      const currentSlot3 = form.watch("slot3DateRange")
      if (!currentSlot3?.from || parseISO(currentSlot3.from) <= parseISO(value.to)) {
        form.setValue("slot3DateRange.from", format(nextDay, "yyyy-MM-dd"))
      }
    }
  }

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    if (editMode && editId !== null) {
      try {
        let examSlots;

        // Handle AKT single date vs OSCE multiple slots
        if (examType === "AKTs") {
          examSlots = [
            {
              slotNumber: 1,
              startDate: `${data.examDate}T09:00:00Z`,
              endDate: `${data.examDate}T17:00:00Z`,
              isActive: true,
              description: "AKT Exam"
            }
          ];
        } else {
          examSlots = [
            {
              slotNumber: 1,
              startDate: `${data.slot1DateRange.from}T09:00:00Z`,
              endDate: `${data.slot1DateRange.to}T17:00:00Z`,
              isActive: true,
              description: "Morning Session"
            }
          ];

          if (data.slot2DateRange?.from && data.slot2DateRange?.to) {
            examSlots.push({
              slotNumber: 2,
              startDate: `${data.slot2DateRange.from}T09:00:00Z`,
              endDate: `${data.slot2DateRange.to}T17:00:00Z`,
              isActive: true,
              description: "Afternoon Session"
            });
          }

          if (data.slot3DateRange?.from && data.slot3DateRange?.to) {
            examSlots.push({
              slotNumber: 3,
              startDate: `${data.slot3DateRange.from}T09:00:00Z`,
              endDate: `${data.slot3DateRange.to}T17:00:00Z`,
              isActive: true,
              description: "Evening Session"
            });
          }
        }

        await updateOccurrence(editId, {
          title: data.name,
          location: (examType === "AKTs" ? data.location.split(', ').map((l: string) => l.trim()).filter((l: string) => l) : [data.location]) as string[],
          registrationStartDate: `${data.applicationsDateRange.from}T00:00:00Z`,
          registrationEndDate: `${data.applicationsDateRange.to}T23:59:59Z`,
          examSlots,
          applicationLimit: Number.parseInt(data.applicationsLimit) || 0,
          waitingListLimit: Number.parseInt(data.waitingLimit) || 0,
        })
        await reloadOccurrences()
        toast({ title: "Exam updated", description: data.name })
        setEditMode(false)
        setEditId(null)
      } catch (err: unknown) {
        toast({ title: "Update failed", description: err instanceof Error ? err.message : "Unable to update exam", variant: "destructive" })
      } finally {
        setIsSubmitting(false)
      }
    } else {
      try {
        const regEnd = `${data.applicationsDateRange.to}T23:59:59Z`
        const examStart = examType === "AKTs"
          ? `${data.examDate}T09:00:00Z`
          : `${data.slot1DateRange.from}T09:00:00Z`

        if (new Date(regEnd) >= new Date(examStart)) {
          toast({ title: "Invalid dates", description: "Exam date must be after applications end date", variant: "destructive" })
          return
        }

        let examSlots;

        // Handle AKT single date vs OSCE multiple slots
        if (examType === "AKTs") {
          examSlots = [
            {
              slotNumber: 1,
              startDate: `${data.examDate}T09:00:00Z`,
              endDate: `${data.examDate}T17:00:00Z`,
              isActive: true,
              description: "AKT Exam"
            }
          ];
        } else {
          examSlots = [
            {
              slotNumber: 1,
              startDate: `${data.slot1DateRange.from}T09:00:00Z`,
              endDate: `${data.slot1DateRange.to}T17:00:00Z`,
              isActive: true,
              description: "Morning Session"
            }
          ];

          if (data.slot2DateRange?.from && data.slot2DateRange?.to) {
            examSlots.push({
              slotNumber: 2,
              startDate: `${data.slot2DateRange.from}T09:00:00Z`,
              endDate: `${data.slot2DateRange.to}T17:00:00Z`,
              isActive: true,
              description: "Afternoon Session"
            });
          }

          if (data.slot3DateRange?.from && data.slot3DateRange?.to) {
            examSlots.push({
              slotNumber: 3,
              startDate: `${data.slot3DateRange.from}T09:00:00Z`,
              endDate: `${data.slot3DateRange.to}T17:00:00Z`,
              isActive: true,
              description: "Evening Session"
            });
          }
        }

        await createExamOccurrence({
          examId: currentExam?.id || crypto.randomUUID(),
          title: `${data.name}`,
          type: currentExam?.name || "AKT",
          examSlots,
          registrationStartDate: `${data.applicationsDateRange.from}T00:00:00Z`,
          registrationEndDate: regEnd,
          applicationLimit: Number.parseInt(data.applicationsLimit) || 0,
          waitingListLimit: Number.parseInt(data.waitingLimit) || 0,
          isActive: true,
          location: (examType === "AKTs" ? data.location.split(', ').map((l: string) => l.trim()).filter((l: string) => l) : [data.location]) as string[],
          instructions: "Please bring a valid ID and arrive 30 minutes early",
        })
        await reloadOccurrences()
        toast({ title: "Exam created", description: `${data.name} saved to server` })
      } catch (err: unknown) {
        toast({ title: "Create failed", description: err instanceof Error ? err.message : "Unable to create exam", variant: "destructive" })
      } finally {
        setIsSubmitting(false)
      }
    }

    form.reset(examType === "AKTs" ? defaultAktFormState as any : defaultOsceFormState as any)
  }

  const toggleBlock = async (id: string, current: boolean) => {
    setTogglingIds(prev => new Set(prev).add(id))
    try {
      await toggleActive(id, !current)
      await reloadOccurrences()
    } catch (err) {
      toast({ title: "Toggle failed", description: err instanceof Error ? err.message : "Unable to toggle", variant: "destructive" })
    } finally {
      setTogglingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleEdit = (exam: any) => {
    // Set exam type based on exam type
    const isAKT = exam.type === "AKT"
    setExamType(isAKT ? "AKTs" : "OSCE")

    // Handle location based on exam type
    const locationValue = Array.isArray(exam.location) ? exam.location.join(', ') : exam.location
    let selectedLocs: any[] = []
    if (isAKT && Array.isArray(exam.location)) {
      selectedLocs = exam.location.map((loc: string) => ({ value: loc, label: loc }))
    } else {
      selectedLocs = []
    }

    // Parse exam slots
    const slots = exam.examSlots || []
    const slot1 = slots.find((s: any) => s.slotNumber === 1)

    // Set form data based on exam type
    if (isAKT) {
      // For AKT, use single exam date
      form.reset({
        name: exam.title,
        location: locationValue,
        applicationsDateRange: {
          from: exam.registrationStartDate?.substring(0, 10),
          to: exam.registrationEndDate?.substring(0, 10),
        },
        applicationsLimit: String(exam.applicationLimit ?? ""),
        waitingLimit: String(exam.waitingListLimit ?? ""),
        examDate: slot1?.startDate?.substring(0, 10) || "",
      } as any)
    } else {
      // For OSCE, use multiple slots
      const slot2 = slots.find((s: any) => s.slotNumber === 2)
      const slot3 = slots.find((s: any) => s.slotNumber === 3)

      form.reset({
        name: exam.title,
        location: locationValue,
        applicationsDateRange: {
          from: exam.registrationStartDate?.substring(0, 10),
          to: exam.registrationEndDate?.substring(0, 10),
        },
        applicationsLimit: String(exam.applicationLimit ?? ""),
        waitingLimit: String(exam.waitingListLimit ?? ""),
        slot1DateRange: {
          from: slot1?.startDate?.substring(0, 10) || "",
          to: slot1?.endDate?.substring(0, 10) || "",
        },
        slot2DateRange: {
          from: slot2?.startDate?.substring(0, 10) || "",
          to: slot2?.endDate?.substring(0, 10) || "",
        },
        slot3DateRange: {
          from: slot3?.startDate?.substring(0, 10) || "",
          to: slot3?.endDate?.substring(0, 10) || "",
        },
      } as any)
    }

    setSelectedLocations(selectedLocs)
    setEditMode(true)
    setEditId(exam.id)

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cancelEdit = () => {
    form.reset(examType === "AKTs" ? defaultAktFormState as any : defaultOsceFormState as any)
    setEditMode(false)
    setEditId(null)
  }

  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: "hsl(var(--background))",
      borderColor: state.isFocused ? "#5c347d" : "hsl(var(--border))",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(92, 52, 125, 0.2)" : "none",
      color: "hsl(var(--foreground))",
      minHeight: "40px",
      "&:hover": {
        borderColor: "#5c347d",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "hsl(var(--background))",
      border: "1px solid hsl(var(--border))",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      zIndex: 50,
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#5c347d" : state.isFocused ? "rgba(92, 52, 125, 0.1)" : "transparent",
      color: state.isSelected ? "white" : "hsl(var(--foreground))",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: state.isSelected ? "#5c347d" : "rgba(92, 52, 125, 0.1)",
      },
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: "rgba(92, 52, 125, 0.1)",
      border: "1px solid rgba(92, 52, 125, 0.2)",
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: "#5c347d",
      fontWeight: "500",
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: "#5c347d",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "#5c347d",
        color: "white",
      },
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "hsl(var(--muted-foreground))",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "hsl(var(--foreground))",
    }),
    input: (provided: any) => ({
      ...provided,
      color: "hsl(var(--foreground))",
    }),
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        <CardHeader className="bg-[#5c347d] dark:bg-[#3b1f52] border-b dark:border-slate-700">
          <CardTitle className="text-xl font-bold text-white flex items-center">
            {editMode ? (
              <>
                <Edit className="h-5 w-5 mr-2" />
                Edit Exam
              </>
            ) : (
              <>
                <Calendar className="h-5 w-5 mr-2" />
                Add New Exam
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          <Tabs
            value={examType}
            onValueChange={(value) => handleExamTypeChange(value as "OSCE" | "AKTs")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 dark:bg-slate-800">
              <TabsTrigger
                value="OSCE"
                className="flex items-center space-x-2 data-[state=active]:bg-[#5c347d] data-[state=active]:text-white"
              >
                <GraduationCap className="h-4 w-4" />
                <span>OSCE Exam</span>
              </TabsTrigger>
              <TabsTrigger
                value="AKTs"
                className="flex items-center space-x-2 data-[state=active]:bg-[#5c347d] data-[state=active]:text-white"
              >
                <BookOpen className="h-4 w-4" />
                <span>AKTs Exam</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="OSCE">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="examName" className="dark:text-slate-200 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                      Exam Name <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="examName"
                      {...form.register("name")}
                      placeholder="Exam Name"
                      className={cn(
                        "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500",
                        errors.name && "border-red-500 focus:ring-red-500",
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="examLocation" className="dark:text-slate-200 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                      Exam Location <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="examLocation"
                      {...form.register("location")}
                      placeholder="Exam Location"
                      className={cn(
                        "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500",
                        errors.location && "border-red-500 focus:ring-red-500",
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="applicationsDateRange" className="dark:text-slate-200 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                      Applications Receiving Dates <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <DateRangePickerWithRange
                      value={form.watch("applicationsDateRange")}
                      onChange={(value) => handleDateRangeChange("applicationsDateRange", value)}
                      isError={!!(errors as any).applicationsDateRange?.from || !!(errors as any).applicationsDateRange?.to}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="applicationsLimit" className="dark:text-slate-200 flex items-center">
                        <Users className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                        Applications Limit <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="applicationsLimit"
                        type="number"
                        {...form.register("applicationsLimit")}
                        placeholder="Limit"
                        className={cn(
                          "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500",
                          errors.applicationsLimit && "border-red-500 focus:ring-red-500",
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="waitingLimit" className="dark:text-slate-200 flex items-center">
                        <Users className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                        Waiting Limit <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="waitingLimit"
                        type="number"
                        {...form.register("waitingLimit")}
                        placeholder="Waiting Limit"
                        className={cn(
                          "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500",
                          errors.waitingLimit && "border-red-500 focus:ring-red-500",
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="dark:text-slate-200 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                        Exam Slot One <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <DateRangePickerWithRange
                        value={form.watch("slot1DateRange")}
                        onChange={(value) => handleDateRangeChange("slot1DateRange", value)}
                        isError={!!(errors as any).slot1DateRange?.from || !!(errors as any).slot1DateRange?.to}
                        minDate={getSlot1MinDate()}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="dark:text-slate-200 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                        Exam Slot Two (optional)
                      </Label>
                      <DateRangePickerWithRange
                        value={{
                          from: form.watch("slot2DateRange")?.from || "",
                          to: form.watch("slot2DateRange")?.to || "",
                        }}
                        onChange={(value) => handleDateRangeChange("slot2DateRange", value)}
                        minDate={getSlot2MinDate()}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="dark:text-slate-200 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                        Exam Slot Three (optional)
                      </Label>
                      <DateRangePickerWithRange
                        value={{
                          from: form.watch("slot3DateRange")?.from || "",
                          to: form.watch("slot3DateRange")?.to || "",
                        }}
                        onChange={(value) => handleDateRangeChange("slot3DateRange", value)}
                        minDate={getSlot3MinDate()}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#5c347d] hover:bg-[#4b2c5f] text-white dark:bg-[#3b1f52] dark:hover:bg-[#4b2c5f] transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editMode ? "Updating..." : "Submitting..."}
                      </>
                    ) : (
                      editMode ? "Update Exam" : "Submit"
                    )}
                  </Button>
                  {editMode && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEdit}
                      disabled={isSubmitting}
                      className="dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </TabsContent>
            <TabsContent value="AKTs">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="examName" className="dark:text-slate-200 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                      Exam Name <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="examName"
                      {...form.register("name")}
                      placeholder="AKTs Exam Name"
                      className={cn(
                        "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#5c347d] dark:focus:ring-[#8b5fbf]",
                        errors.name && "border-red-500 focus:ring-red-500",
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="examLocations" className="dark:text-slate-200 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                      Exam Locations <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <CreatableSelect
                      isMulti
                      value={selectedLocations}
                      onChange={handleLocationChange}
                      options={aktsLocationOptions}
                      placeholder="Select or create locations..."
                      styles={selectStyles}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="applicationsDateRange" className="dark:text-slate-200 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                      Applications Receiving Dates <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <DateRangePickerWithRange
                      value={form.watch("applicationsDateRange")}
                      onChange={(value) => handleDateRangeChange("applicationsDateRange", value)}
                      isError={!!(errors as any).applicationsDateRange?.from || !!(errors as any).applicationsDateRange?.to}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="applicationsLimit" className="dark:text-slate-200 flex items-center">
                        <Users className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                        Applications Limit <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="applicationsLimit"
                        type="number"
                        {...form.register("applicationsLimit")}
                        placeholder="Limit"
                        className={cn(
                          "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#5c347d] dark:focus:ring-[#8b5fbf]",
                          errors.applicationsLimit && "border-red-500 focus:ring-red-500",
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="waitingLimit" className="dark:text-slate-200 flex items-center">
                        <Users className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                        Waiting Limit <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="waitingLimit"
                        type="number"
                        {...form.register("waitingLimit")}
                        placeholder="Waiting Limit"
                        className={cn(
                          "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#5c347d] dark:focus:ring-[#8b5fbf]",
                          errors.waitingLimit && "border-red-500 focus:ring-red-500",
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="examDate" className="dark:text-slate-200 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                      Exam Date (Single Day) <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700",
                            !form.watch("examDate") && "text-muted-foreground",
                            (errors as any).examDate && "border-red-500 focus:ring-red-500",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch("examDate") ? (
                            format(parseISO(form.watch("examDate")), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 dark:bg-slate-800 dark:border-slate-700"
                        align="start"
                      >
                        <CalendarComponent
                          mode="single"
                          selected={form.watch("examDate") ? parseISO(form.watch("examDate")) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              form.setValue("examDate", format(date, "yyyy-MM-dd"))
                            }
                          }}
                          disabled={(date) => {
                            const minDate = form.watch("applicationsDateRange")?.to
                              ? addDays(parseISO(form.watch("applicationsDateRange").to), 1)
                              : undefined
                            return minDate ? date < minDate : false
                          }}
                          initialFocus
                          className="dark:bg-slate-800"
                        />
                      </PopoverContent>
                    </Popover>
                    {(errors as any).examDate && (
                      <p className="text-sm text-red-500">{(errors as any).examDate.message}</p>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      AKT is a single-day examination. Select the date when the exam will be held.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#5c347d] hover:bg-[#4b2c5f] text-white dark:bg-[#3b1f52] dark:hover:bg-[#4b2c5f] transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editMode ? "Updating..." : "Submitting..."}
                      </>
                    ) : (
                      editMode ? "Update Exam" : "Submit"
                    )}
                  </Button>
                  {editMode && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEdit}
                      disabled={isSubmitting}
                      className="dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 dark:bg-slate-900/80 dark:border-slate-800 overflow-hidden gradient-border">
        <CardHeader className="bg-[#5c347d] dark:bg-[#3b1f52] from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border-b dark:border-slate-700">
          <CardTitle className="text-xl font-bold text-white flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Exam List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/80">
          <div className="p-4">
            <div className="grid grid-cols-1 w-auto md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {Array.isArray(occurrences) && [...occurrences].sort((a: any, b: any) => {
                const aDate = a.examSlots?.[0]?.startDate || '';
                const bDate = b.examSlots?.[0]?.startDate || '';
                return bDate.localeCompare(aDate);
              }).filter((exam: any) => exam.type === currentExam?.name).map((exam: any) => (
                <div
                  key={exam.id}
                  className="exam-card relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:shadow-xl dark:shadow-slate-900/30 hover:translate-y-[-5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col min-h-[280px]"
                >
                  <div className="absolute top-0 right-0 p-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs dark:text-slate-400">{exam.isActive ? "Active" : "Inactive"}</span>
                      <Switch
                        checked={!!exam.isActive}
                        onCheckedChange={() => toggleBlock(exam.id, !!exam.isActive)}
                        disabled={togglingIds.has(exam.id)}
                        className="data-[state=checked]:bg-[#5c347d] disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="mb-4 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-3">
                      <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="font-bold text-lg dark:text-white">{exam.title}</h3>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                      <span className="dark:text-slate-300">{Array.isArray(exam.location) ? exam.location.join(', ') : exam.location}</span>
                    </div>

                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                      <span className="dark:text-slate-300">{exam.registrationStartDate?.substring(0, 10)} - {exam.registrationEndDate?.substring(0, 10)}</span>
                    </div>

                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                      <span className="dark:text-slate-300">Limit: {exam.applicationLimit} (Waiting: {exam.waitingListLimit})
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 flex-grow">
                    <h4 className="text-sm font-semibold dark:text-slate-200">Exam Slots:</h4>
                    <div className="text-xs bg-slate-100 dark:bg-slate-700 p-1.5 rounded dark:text-slate-300 space-y-1">
                      {exam.examSlots?.map((slot: any) => (
                        <div key={slot.slotNumber}>
                          Slot {slot.slotNumber}: {slot.startDate?.substring(0, 10)}
                        </div>
                      )) || <div>No slots</div>}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 flex justify-between items-center border-t border-slate-200 dark:border-slate-700">
                    <a
                      href={`/application/${exam.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline text-indigo-700 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Form Link
                    </a>

                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 transition-all duration-200 transform hover:scale-105 btn-glow"
                      onClick={() => handleEdit(exam)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>

                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
