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
import { FileText, Edit, Calendar, MapPin, Users, Clock } from "lucide-react"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { cn } from "@/lib/utils"
import { useToast } from "./ui/use-toast"
import { createExamOccurrence } from "@/lib/examOccurrencesApi"
import { useExamOccurrences } from "@/lib/useExamOccurrences"

interface DateRange {
  from: Date | undefined
  to?: Date | undefined
}

// Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(1, "Required"),
  location: z.string().min(1, "Required"),
  applicationsDateRange: z.object({
    from: z.string().min(1, "Required"),
    to: z.string().min(1, "Required"),
  }),
  applicationsLimit: z.string().min(1, "Required"),
  waitingLimit: z.string().min(1, "Required"),
  slot1DateRange: z.object({
    from: z.string().min(1, "Required"),
    to: z.string().min(1, "Required"),
  }),
  slot2DateRange: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }),
  slot3DateRange: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }),
})

type FormValues = z.infer<typeof formSchema>

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
        <DatePickerWithRange date={date} setDate={handleDateChange}  />
      </div>
      {disabled && (
        <p className="text-xs text-muted-foreground">This slot will auto-start after the previous slot ends</p>
      )}
    </div>
  )
}

const defaultFormState = {
  name: "",
  location: "",
  applicationsDateRange: { from: "", to: "" },
  applicationsLimit: "",
  waitingLimit: "",
  slot1DateRange: { from: "", to: "" },
  slot2DateRange: { from: "", to: "" },
  slot3DateRange: { from: "", to: "" },
}

export function Exam() {
  const [editMode, setEditMode] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const { toast } = useToast()
  const { items: occurrences, reload: reloadOccurrences, update: updateOccurrence } = useExamOccurrences()

  // Initialize form with React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormState,
    mode: "onSubmit",
  })

  const { formState } = form
  const { errors } = formState

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

  const onSubmit = async (data: FormValues) => {
    if (editMode && editId !== null) {
      try {
        await updateOccurrence(editId, {
          title: data.name,
            location: data.location,
          registrationStartDate: `${data.applicationsDateRange.from}T00:00:00Z`,
          registrationEndDate: `${data.applicationsDateRange.to}T23:59:59Z`,
          examDate: `${data.slot1DateRange.from}T09:00:00Z`,
          applicationLimit: Number.parseInt(data.applicationsLimit) || 0,
          waitingListLimit: Number.parseInt(data.waitingLimit) || 0,
        })
        await reloadOccurrences()
        toast({ title: "Exam updated", description: data.name })
        setEditMode(false)
        setEditId(null)
      } catch (err: unknown) {
        toast({ title: "Update failed", description: err instanceof Error ? err.message : "Unable to update exam", variant: "destructive" })
      }
    } else {
      try {
        const regEnd = `${data.applicationsDateRange.to}T23:59:59Z`
        const examStart = `${data.slot1DateRange.from}T09:00:00Z`
        if (new Date(regEnd) >= new Date(examStart)) {
          toast({ title: "Invalid dates", description: "Exam date must be after applications end date", variant: "destructive" })
          return
        }

        await createExamOccurrence({
          examId: crypto.randomUUID(),
          title: `${data.name}`,
          type: "AKT",
          examDate: examStart,
          registrationStartDate: `${data.applicationsDateRange.from}T00:00:00Z`,
          registrationEndDate: regEnd,
          applicationLimit: Number.parseInt(data.applicationsLimit) || 0,
          waitingListLimit: Number.parseInt(data.waitingLimit) || 0,
          isActive: true,
          location: data.location,
          instructions: "Please bring a valid ID and arrive 30 minutes early",
        })
        await reloadOccurrences()
        toast({ title: "Exam created", description: `${data.name} saved to server` })
      } catch (err: unknown) {
        toast({ title: "Create failed", description: err instanceof Error ? err.message : "Unable to create exam", variant: "destructive" })
      }
    }

    form.reset(defaultFormState)
  }

  const toggleBlock = async (id: string, current: boolean) => {
    try {
      await updateOccurrence(id, { isActive: !current })
      await reloadOccurrences()
    } catch (err) {
      toast({ title: "Toggle failed", description: err instanceof Error ? err.message : "Unable to toggle", variant: "destructive" })
    }
  }

  const handleEdit = (exam: any) => {
    // Parse slot dates
    const examDateOnly = exam.examDate ? exam.examDate.substring(0, 10) : ""

    // Set form data with parsed dates
    form.reset({
      name: exam.title,
      location: exam.location,
      applicationsDateRange: {
        from: exam.registrationStartDate?.substring(0, 10),
        to: exam.registrationEndDate?.substring(0, 10),
      },
      applicationsLimit: String(exam.applicationLimit ?? ""),
      waitingLimit: String(exam.waitingListLimit ?? ""),
      slot1DateRange: {
        from: examDateOnly,
        to: examDateOnly,
      },
      slot2DateRange: {
        from: "",
        to: "",
      },
      slot3DateRange: {
        from: "",
        to: "",
      },
    })

    setEditMode(true)
    setEditId(exam.id)

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cancelEdit = () => {
    form.reset(defaultFormState)
    setEditMode(false)
    setEditId(null)
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
                  isError={!!errors.applicationsDateRange?.from || !!errors.applicationsDateRange?.to}
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
                    isError={!!errors.slot1DateRange?.from || !!errors.slot1DateRange?.to}
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
                className="bg-[#5c347d] hover:bg-[#4b2c5f] text-white dark:bg-[#3b1f52] dark:hover:bg-[#4b2c5f] transition-all duration-200 transform hover:scale-105"
              >
                {editMode ? "Update Exam" : "Submit"}
              </Button>
              {editMode && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEdit}
                  className="dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
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
              {[...occurrences].reverse().map((exam: any) => (
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
                        className="data-[state=checked]:bg-[#5c347d]"
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
                      <span className="dark:text-slate-300">{exam.location}</span>
                    </div>

                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                      <span className="dark:text-slate-300">{exam.registrationStartDate?.substring(0,10)} - {exam.registrationEndDate?.substring(0,10)}</span>
                    </div>

                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                      <span className="dark:text-slate-300">Limit: {exam.applicationLimit} (Waiting: {exam.waitingListLimit})
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 flex-grow">
                    <h4 className="text-sm font-semibold dark:text-slate-200">Exam Date:</h4>
                      <div className="text-xs bg-slate-100 dark:bg-slate-700 p-1.5 rounded dark:text-slate-300">
                      {exam.examDate?.substring(0,10)}
                      </div>
                  </div>

                  <div className="mt-4 pt-3 flex justify-between items-center border-t border-slate-200 dark:border-slate-700">
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
