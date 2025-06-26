"use client"

import { Checkbox } from "@/components/ui/checkbox"
import Swal from "sweetalert2"

import { cn } from "@/lib/utils"

import { Calendar as CalendarComponent } from "@/components/ui/calendar"

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

import { Input } from "@/components/ui/input"

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

import { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField } from "@/components/ui/form"

import { Button } from "@/components/ui/button"

import { CardContent } from "@/components/ui/card"

import { CardDescription } from "@/components/ui/card"

import { CardTitle } from "@/components/ui/card"

import { CardHeader } from "@/components/ui/card"

import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Upload, Calendar, User, FileText, Shield, Loader2, Eye, MapPin } from "lucide-react"
import { PhoneInput } from "./ui/phone-input"
import "react-phone-number-input/style.css"
import { useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { incrementApplicationsCount, selectExams, toggleBlockExam } from "@/redux/examDataSlice"
import { supabase } from "@/lib/supabaseClient"
import { addApplication } from "@/redux/applicationsSlice"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { useMemo } from "react"
import NotFound from "./ui/notFound"
import ExamClosedApp from "./ui/examClosedApplication"
import ExamClosed from "./ui/examClosed"
import "../App.css"
import { isValidPhoneNumber } from "libphonenumber-js"
import { ApplicationPDFComplete, ApplicationPDFCompletePreview } from "./ui/pdf-generator"
import { aktsFormDefaultValues, aktsFormSchema, AktsFormValues, formDefaultValues, formSchema, FormValues } from "./schema/applicationSchema"



// Part 1 exam dates
const part1ExamDates = [
  "AKT - November 2024",
  "AKT - May 2024",
  "AKT - November 2023",
  "AKT - May 2023",
  "AKT - November 2022",
  "AKT - June 2022",
  "AKT - January 2022",
  "AKT - June 2021",
  "AKT - September 2020",
  "AKT - November 2019",
  "AKT - May 2019",
]
const genderCategory = ["Male", "Female", "Other"]

const parseSlotDates = (slotString: string): Date[] => {
  // If the slot string contains a range (e.g., "2025-04-02 | 2025-04-08")
  const dates = slotString.split(" | ")

  if (dates.length === 2) {
    const startDate = new Date(dates[0])
    const endDate = new Date(dates[1])

    // Generate all dates between start and end (inclusive)
    const allDates: Date[] = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      allDates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return allDates
  }

  // If it's not a range, just return the parsed dates
  return dates.map((dateStr) => new Date(dateStr))
}


export function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [passportPreview, setPassportPreview] = useState<string | null>(null)
  const [medicalLicensePreview, setMedicalLicensePreview] = useState<string | null>(null)
  const [part1EmailPreview, setPart1EmailPreview] = useState<string | null>(null)
  const [passportBioPreview, setPassportBioPreview] = useState<string | null>(null)
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null)
  const [pdfGenerating] = useState(false)
  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const [isExamClosed, setIsExamClosed] = useState(false)
  const [isClosed, setIsClosed] = useState(false)
  const [warning, setWarning] = useState(false)
  const hasError = (field: keyof FormValues | keyof AktsFormValues) =>
  !selectedExamType && currentForm.formState.errors[field]

  const osceForm = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: formDefaultValues,
  shouldUnregister: false,
  mode: "onChange", // ✅ Added real-time validation
})




const aktsForm = useForm<AktsFormValues>({
  resolver: zodResolver(aktsFormSchema),
  defaultValues: aktsFormDefaultValues,
  shouldUnregister: false,
  mode: "onBlur", // ✅ Added real-time validation
})

// ✅ Removed useState for currentForm, now using direct reference
const [selectedExamType, setSelectedExamType] = useState<boolean>(false)

const currentForm:any  = !selectedExamType ? osceForm : aktsForm

useEffect(() => {
  const subscription = (selectedExamType ? aktsForm : osceForm).watch((values) => {
    console.log("Watching values:", values)
  }) as unknown as { unsubscribe: () => void } // 🔥 Trick TypeScript here

  return () => {
    subscription.unsubscribe()
  }
}, [selectedExamType])

  const [selectedDates, setSelectedDates] = useState<{
    preferenceDate1: string | null
    preferenceDate2: string | null
    preferenceDate3: string | null
  }>({
    preferenceDate1: null,
    preferenceDate2: null,
    preferenceDate3: null,
  })
  const exams = useSelector(selectExams)
  const params = useParams()
  const dispatch = useDispatch()

  if (!params.examId) return null

  const selectedExam = exams.find((exam) => exam.id === params.examId)

  useEffect(() => {
    if (selectedExam && selectedExam.examType === "AKTs") {
      setSelectedExamType(true)
    }
  }, [selectedExam])

// ✅ Reset form errors when switching exam types
useEffect(() => {
  if (selectedExamType) {
    // Clear OSCE form errors
    osceForm.clearErrors()
  } else {
    // Clear AKTs form errors
    aktsForm.clearErrors()
  }
}, [selectedExamType, osceForm, aktsForm])


  

console.log("Selected Exam Type:", selectedExamType);

  // Prepare images for PDF
  const pdfImages = useMemo(() => {
    return {
      passport: passportPreview,
      medicalLicense: medicalLicensePreview,
      part1Email: part1EmailPreview,
      passportBio: passportBioPreview,
      signature: signaturePreview,
    }
  }, [passportPreview, medicalLicensePreview, part1EmailPreview, passportBioPreview, signaturePreview])

  useEffect(() => {
    if (selectedExam && new Date(selectedExam.closingDate) < new Date()) {
      setIsExamClosed(true)
    } else {
      setIsExamClosed(false)
    }
    if (selectedExam && selectedExam.isBlocked === true) {
      setIsClosed(true)
    } else {
      setIsClosed(false)
    }
  }, [selectedExam])

  //  async function onSubmit(data: AktsFormValues | FormValues) {
  //   console.log("Form data being submitted:", data);
    
  //   try {
  //     setIsSubmitting(true)
      
  //     const isValid = await currentForm.trigger()
  //   if (!isValid) {
  //     console.log("Form validation failed")
  //     setIsSubmitting(false)
  //     return
  //   }

  //     // Type-safe handling based on selectedExamType
  //     if (selectedExamType) {

  //   //    Object.keys(currentForm.getValues()).forEach((key) => {
  //   //   currentForm.trigger(key as keyof AktsFormValues)
  //   // })

  //   // Validate phone numbers
  //   const phoneRegex = /^\+?[1-9]\d{1,14}$/

  //   if (!data.whatsapp || data.whatsapp.length < 8) {
  //   aktsForm.setError("whatsapp", { // ✅ Specific form reference
  //     type: "manual",
  //     message: "Please enter a valid phone number",
  //   })
  //   return
  // }

  //   if (!phoneRegex.test(data.emergencyContact)) {
  //     currentForm.setError("emergencyContact", {
  //       type: "manual",
  //       message: "Please enter a valid phone number",
  //     })
  //     setIsSubmitting(false)
  //     return
  //   }

  //   if (!params.examId || !selectedExam) {
  //     alert("Exam ID is missing or invalid. Please try again.")
  //     setIsSubmitting(false)
  //     return
  //   }

  //   // if (signaturePreview === null ) {
  //   //   setWarning(true)
  //   //   return
  //   // } else {
  //   //   setWarning(false)
  //   // }

  //       const aktsData = data as AktsFormValues
  //       await handleAktsSubmission(aktsData)

  //     } else {
  //       // Handle OSCE form submission

  //   //    Object.keys(currentForm.getValues()).forEach((key) => {
  //   //   currentForm.trigger(key as keyof FormValues)
  //   // })

  //   // Validate phone numbers
  //   const phoneRegex = /^\+?[1-9]\d{1,14}$/

  //   if (!data.whatsapp || data.whatsapp.length < 8) {
  //   osceForm.setError("whatsapp", { // ✅ Specific form reference
  //     type: "manual",
  //     message: "Please enter a valid phone number",
  //   })
  //   return
  // }

  //   if (!phoneRegex.test(data.emergencyContact)) {
  //     currentForm.setError("emergencyContact", {
  //       type: "manual",
  //       message: "Please enter a valid phone number",
  //     })
  //     setIsSubmitting(false)
  //     return
  //   }

  //   if (!params.examId || !selectedExam) {
  //     alert("Exam ID is missing or invalid. Please try again.")
  //     setIsSubmitting(false)
  //     return
  //   }

  //   if (signaturePreview === null || medicalLicensePreview === null || passportBioPreview === null) {
  //     setWarning(true)
  //     return
  //   } else {
  //     setWarning(false)
  //   }

  //       const osceData = data as FormValues
  //       await handleOsceSubmission(osceData)
  //     }
  //   } catch (error) {
  //     console.error("Submission error:", error)
  //     Swal.fire({
  //       title: "Error",
  //       text: "An error occurred during submission. Please try again.",
  //       icon: "error",
  //       confirmButtonColor: "#6366f1",
  //     })
  //   } finally {
  //     setIsSubmitting(false)
  //   }
  // }

  // // Handle AKTs form submission
  // async function handleAktsSubmission(data: AktsFormValues) {
  //   console.log("Submitting AKTs form:", data)

  //     // Show confirmation dialog with custom styling
  //   const result = await Swal.fire({
  //     html: `
  //     <div style="text-align: center; margin-bottom: 20px;">
  //     <img src="/icon.png" alt="MRCGP Logo" style="width: 100px; height: 100px; margin: 0 auto 15px auto;">
  //     </div>
  //     <h1><b>Are you sure you want to submit?</b></h1>
  //       <p style="color: #666; font-size: 16px;">
  //         Please review all details carefully before submission, as you won't be able to resubmit with the same candidate ID.
  //       </p>
  //     `,
  //     // title: "Are you sure you want to submit?",
  //     showCancelButton: true,
  //     confirmButtonText: "Yes, please submit!",
  //     cancelButtonText: "No, cancel submission!",
  //     confirmButtonColor: "#4ade80",
  //     cancelButtonColor: "#f87171",
  //     reverseButtons: false,
  //     focusConfirm: false,
  //     customClass: {
  //       container: "custom-swal-container",
  //       popup: "custom-swal-popup",
  //       title: "custom-swal-title",
  //       confirmButton: "custom-swal-confirm",
  //       cancelButton: "custom-swal-cancel",
  //     },
  //   })
  //    if (!params.examId || !selectedExam) {
  //     alert("Exam ID is missing or invalid. Please try again.")
  //     setIsSubmitting(false)  
  //     return
  //   }

  //   if (!result.isConfirmed) {
  //     return
  //   }

  //   setIsSubmitting(true)

  //   const isPendingAvailable = selectedExam.receivingApplicationsCount < selectedExam.applicationsLimit

  //   const isWaitingAvailable =
  //     selectedExam.receivingApplicationsCount < selectedExam.applicationsLimit + selectedExam.waitingLimit

  //   const application: any = {
  //     ...data,
  //     examId: params.examId || "",
  //     examName: selectedExam.name,
  //     id: crypto.randomUUID(),
  //     applicantName: data.fullName,
  //     submittedDate: new Date().toISOString(),
  //     passportUrl: passportPreview || "",
  //     signatureUrl: signaturePreview || "",
  //     status: "",
  //     pdfUrl: "",
  //     date: new Date().toISOString(),
  //     name: data.fullName,
  //     dateOfRegistration: data.dateOfRegistration ? new Date(data.dateOfRegistration) : new Date(),
  //     preferenceDate1: data.preferenceDate1 || "",
  //     preferenceDate2: data.preferenceDate2 || "",
  //     preferenceDate3: data.preferenceDate3 || "",
  //     eligibilityA: data.eligibilityA || false,
  //     eligibilityB: data.eligibilityB || false,
  //     eligibilityC: data.eligibilityC || false,
  //     schoolName: data.schoolName || "",
  //     schoolLocation: data.schoolLocation || "",
  //     QualificationDate: data.QualificationDate ? new Date(data.QualificationDate).toISOString() : "",
  //     candidateId: data.candidateId || "",
  //     candidateStatementA: data.candidateStatementA || false,
  //     candidateStatementB: data.candidateStatementB || false,
  //     candidateStatementC: data.candidateStatementC || false,
  //     examinationCenter: data.examinationCenter || "",


      
  //   }

  //   if (isPendingAvailable) {
  //     application.status = "pending"
  //     dispatch(addApplication(application))
  //     dispatch(incrementApplicationsCount(params.examId))

  //     // Show success dialog with custom styling
  //     Swal.fire({
  //       html: `
  //       <div style="text-align: center; margin-bottom: 20px;">
  //       <img src="/icon.png" alt="MRCGP Logo" style="width: 100px; height: 100px; margin: 0 auto 15px auto;">
  //       </div>
  //       <h1><b>Form Successfully Submitted!</b></h1>
  //       <p style="color: #666; font-size: 16px;">
  //       You should receive an email of acknowledgement within 24 hours of form submission otherwise please 
  //       <a href="mailto:contact@mrcgpintsouthasia.org" style="color: #818cf8; text-decoration: underline;">contact</a> the office
  //       </p>
  //       <p style="color: #666; font-size: 16px; margin-top: 15px;">
  //       For preview final PDF 
  //       <a href="#" id="pdf-preview-link" style="color: #818cf8; text-decoration: underline;">Click Me</a>
  //       </p>
  //       `,
  //       // title: "Form Successfully Submitted!",
  //       confirmButtonText: "OK",
  //       confirmButtonColor: "#3b82f6",
  //       customClass: {
  //         container: "custom-swal-container",
  //         popup: "custom-swal-popup",
  //         title: "custom-swal-title",
  //         confirmButton: "custom-swal-confirm",
  //       },
  //       didOpen: () => {
  //         // Add event listener to the PDF preview link
  //         document.getElementById("pdf-preview-link")?.addEventListener("click", (e) => {
  //           e.preventDefault()
  //           document.getElementById("pdf-download-link")?.click()
  //         })
  //       },
  //     }).then((result) => {
  //       if (result.isConfirmed) {
  //         setTimeout(() => {
  //           window.location.reload()
  //         }, 2000)
  //       }
  //     })
  //   } else if (isWaitingAvailable) {
  //     application.status = "waiting"
  //     dispatch(addApplication(application))
  //     dispatch(incrementApplicationsCount(params.examId))

  //     // Show success dialog with custom styling
  //     Swal.fire({
  //       title: "Form Successfully Submitted!",
  //       html: `
  //         <div style="text-align: center; margin-bottom: 20px;">
  //           <img src="/icon.png" alt="MRCGP Logo" style="width: 100px; height: 100px; margin: 0 auto 15px auto;">
  //         </div>
  //         <p style="color: #666; font-size: 16px;">
  //           You should receive an email of acknowledgement within 24 hours of form submission otherwise please 
  //           <a href="mailto:contact@mrcgpintsouthasia.org" style="color: #818cf8; text-decoration: underline;">contact</a> the office
  //         </p>
  //         <p style="color: #666; font-size: 16px; margin-top: 15px;">
  //           <strong>Note:</strong> Your application has been added to the waiting list.
  //         </p>
  //         <p style="color: #666; font-size: 16px; margin-top: 15px;">
  //           For preview final PDF 
  //           <a href="#" id="pdf-preview-link" style="color: #818cf8; text-decoration: underline;">Click Me</a>
  //         </p>
  //       `,
  //       confirmButtonText: "OK",
  //       confirmButtonColor: "#3b82f6",
  //       customClass: {
  //         container: "custom-swal-container",
  //         popup: "custom-swal-popup",
  //         title: "custom-swal-title",
  //         confirmButton: "custom-swal-confirm",
  //       },
  //       didOpen: () => {
  //         // Add event listener to the PDF preview link
  //         document.getElementById("pdf-preview-link")?.addEventListener("click", (e) => {
  //           e.preventDefault()
  //           document.getElementById("pdf-download-link")?.click()
  //         })
  //       },
  //     }).then((result) => {
  //       if (result.isConfirmed) {
  //         setTimeout(() => {
  //           window.location.reload()
  //         }, 2000)
  //       }
  //     })
  //   } else {
  //     dispatch(toggleBlockExam(params.examId))
  //     Swal.fire({
  //       title: "Error",
  //       text: "No more slots available for this exam.",
  //       icon: "error",
  //       confirmButtonColor: "#6366f1",
  //     })
  //   }

  //   setIsSubmitting(false)
  //     return

  // }

  // // Handle OSCE form submission
  // async function handleOsceSubmission(data: FormValues) {
  //   console.log("Submitting OSCE form:", data)

  //   // Validate OSCE-specific fields
  //     // Show confirmation dialog with custom styling
  //   const result = await Swal.fire({
  //     html: `
  //     <div style="text-align: center; margin-bottom: 20px;">
  //     <img src="/icon.png" alt="MRCGP Logo" style="width: 100px; height: 100px; margin: 0 auto 15px auto;">
  //     </div>
  //     <h1><b>Are you sure you want to submit?</b></h1>
  //       <p style="color: #666; font-size: 16px;">
  //         Please review all details carefully before submission, as you won't be able to resubmit with the same candidate ID.
  //       </p>
  //     `,
  //     // title: "Are you sure you want to submit?",
  //     showCancelButton: true,
  //     confirmButtonText: "Yes, please submit!",
  //     cancelButtonText: "No, cancel submission!",
  //     confirmButtonColor: "#4ade80",
  //     cancelButtonColor: "#f87171",
  //     reverseButtons: false,
  //     focusConfirm: false,
  //     customClass: {
  //       container: "custom-swal-container",
  //       popup: "custom-swal-popup",
  //       title: "custom-swal-title",
  //       confirmButton: "custom-swal-confirm",
  //       cancelButton: "custom-swal-cancel",
  //     },
  //   })
  //    if (!params.examId || !selectedExam) {
  //     alert("Exam ID is missing or invalid. Please try again.")
  //     setIsSubmitting(false)
  //     return
  //   }

  //   if (!result.isConfirmed) {
  //     return
  //   }

  //   setIsSubmitting(true)

  //   const isPendingAvailable = selectedExam.receivingApplicationsCount < selectedExam.applicationsLimit

  //   const isWaitingAvailable =
  //     selectedExam.receivingApplicationsCount < selectedExam.applicationsLimit + selectedExam.waitingLimit

  //   const application: any = {
  //     ...data,
  //     examId: params.examId,
  //     examName: selectedExam.name,
  //     id: crypto.randomUUID(),
  //     applicantName: data.fullName,
  //     submittedDate: new Date().toISOString(),
  //     passportUrl: passportPreview || "",
  //     medicalLicenseUrl: medicalLicensePreview || "",
  //     part1EmailUrl: part1EmailPreview || "",
  //     passportBioUrl: passportBioPreview || "",
  //     signatureUrl: signaturePreview || "",
  //     status: "",
  //     pdfUrl: "",
  //     date: new Date().toISOString(),
  //     name: data.fullName,
  //     dateOfRegistration: data.dateOfRegistration ? data.dateOfRegistration.toISOString() : "",
  //     preferenceDate1: data.preferenceDate1 || "",
  //     preferenceDate2: data.preferenceDate2 || "",
  //     preferenceDate3: data.preferenceDate3 || "",
  //     candidateId: data.candidateId || "",
  //   }

  //   if (isPendingAvailable) {
  //     application.status = "pending"
  //     dispatch(addApplication(application))
  //     dispatch(incrementApplicationsCount(params.examId))

  //     // Show success dialog with custom styling
  //     Swal.fire({
  //       html: `
  //       <div style="text-align: center; margin-bottom: 20px;">
  //       <img src="/icon.png" alt="MRCGP Logo" style="width: 100px; height: 100px; margin: 0 auto 15px auto;">
  //       </div>
  //       <h1><b>Form Successfully Submitted!</b></h1>
  //       <p style="color: #666; font-size: 16px;">
  //       You should receive an email of acknowledgement within 24 hours of form submission otherwise please 
  //       <a href="mailto:contact@mrcgpintsouthasia.org" style="color: #818cf8; text-decoration: underline;">contact</a> the office
  //       </p>
  //       <p style="color: #666; font-size: 16px; margin-top: 15px;">
  //       For preview final PDF 
  //       <a href="#" id="pdf-preview-link" style="color: #818cf8; text-decoration: underline;">Click Me</a>
  //       </p>
  //       `,
  //       // title: "Form Successfully Submitted!",
  //       confirmButtonText: "OK",
  //       confirmButtonColor: "#3b82f6",
  //       customClass: {
  //         container: "custom-swal-container",
  //         popup: "custom-swal-popup",
  //         title: "custom-swal-title",
  //         confirmButton: "custom-swal-confirm",
  //       },
  //       didOpen: () => {
  //         // Add event listener to the PDF preview link
  //         document.getElementById("pdf-preview-link")?.addEventListener("click", (e) => {
  //           e.preventDefault()
  //           document.getElementById("pdf-download-link")?.click()
  //         })
  //       },
  //     }).then((result) => {
  //       if (result.isConfirmed) {
  //         setTimeout(() => {
  //           window.location.reload()
  //         }, 2000)
  //       }
  //     })
  //   } else if (isWaitingAvailable) {
  //     application.status = "waiting"
  //     dispatch(addApplication(application))
  //     dispatch(incrementApplicationsCount(params.examId))

  //     // Show success dialog with custom styling
  //     Swal.fire({
  //       title: "Form Successfully Submitted!",
  //       html: `
  //         <div style="text-align: center; margin-bottom: 20px;">
  //           <img src="/icon.png" alt="MRCGP Logo" style="width: 100px; height: 100px; margin: 0 auto 15px auto;">
  //         </div>
  //         <p style="color: #666; font-size: 16px;">
  //           You should receive an email of acknowledgement within 24 hours of form submission otherwise please 
  //           <a href="mailto:contact@mrcgpintsouthasia.org" style="color: #818cf8; text-decoration: underline;">contact</a> the office
  //         </p>
  //         <p style="color: #666; font-size: 16px; margin-top: 15px;">
  //           <strong>Note:</strong> Your application has been added to the waiting list.
  //         </p>
  //         <p style="color: #666; font-size: 16px; margin-top: 15px;">
  //           For preview final PDF 
  //           <a href="#" id="pdf-preview-link" style="color: #818cf8; text-decoration: underline;">Click Me</a>
  //         </p>
  //       `,
  //       confirmButtonText: "OK",
  //       confirmButtonColor: "#3b82f6",
  //       customClass: {
  //         container: "custom-swal-container",
  //         popup: "custom-swal-popup",
  //         title: "custom-swal-title",
  //         confirmButton: "custom-swal-confirm",
  //       },
  //       didOpen: () => {
  //         // Add event listener to the PDF preview link
  //         document.getElementById("pdf-preview-link")?.addEventListener("click", (e) => {
  //           e.preventDefault()
  //           document.getElementById("pdf-download-link")?.click()
  //         })
  //       },
  //     }).then((result) => {
  //       if (result.isConfirmed) {
  //         setTimeout(() => {
  //           window.location.reload()
  //         }, 2000)
  //       }
  //     })
  //   } else {
  //     dispatch(toggleBlockExam(params.examId))
  //     Swal.fire({
  //       title: "Error",
  //       text: "No more slots available for this exam.",
  //       icon: "error",
  //       confirmButtonColor: "#6366f1",
  //     })
  //   }

  //   setIsSubmitting(false)
  //     return
    

    
  // }


  async function onSubmit(data: AktsFormValues | FormValues) {
  console.log("Form data being submitted:", data)

  try {
    setIsSubmitting(true)

    const isValid = await currentForm.trigger()
    if (!isValid) {
      console.log("Form validation failed")
      setIsSubmitting(false)
      return
    }

    // Manual validations
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!data.whatsapp || data.whatsapp.length < 8) {
      currentForm.setError("whatsapp", {
        type: "manual",
        message: "Please enter a valid phone number",
      })
      setIsSubmitting(false)
      return
    }
    if (!phoneRegex.test(data.emergencyContact)) {
      currentForm.setError("emergencyContact", {
        type: "manual",
        message: "Please enter a valid phone number",
      })
      setIsSubmitting(false)
      return
    }

    if (!params.examId || !selectedExam) {
      alert("Exam ID is missing or invalid. Please try again.")
      setIsSubmitting(false)
      return
    }

    // Optional file validation (OSCE-only)
    if (!selectedExamType) {
      if (signaturePreview === null || medicalLicensePreview === null || passportBioPreview === null) {
        setWarning(true)
        setIsSubmitting(false)
        return
      }
      setWarning(false)
    }

    // Show confirmation dialog
    const result = await Swal.fire({
      html: `
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="/icon.png" alt="MRCGP Logo" style="width: 100px; height: 100px; margin: 0 auto 15px auto;">
        </div>
        <h1><b>Are you sure you want to submit?</b></h1>
        <p style="color: #666; font-size: 16px;">
          Please review all details carefully before submission.
        </p>
      `,
      showCancelButton: true,
      confirmButtonText: "Yes, please submit!",
      cancelButtonText: "No, cancel submission!",
      confirmButtonColor: "#4ade80",
      cancelButtonColor: "#f87171",
    })

    if (!result.isConfirmed) {
      setIsSubmitting(false)
      return
    }

    const isPendingAvailable = selectedExam.receivingApplicationsCount < selectedExam.applicationsLimit
    const isWaitingAvailable =
      selectedExam.receivingApplicationsCount < selectedExam.applicationsLimit + selectedExam.waitingLimit

    // Build unified application object
    const application: any = {
      ...data,
      examId: params.examId,
      examName: selectedExam.name,
      id: crypto.randomUUID(),
      applicantName: data.fullName,
      submittedDate: new Date().toISOString(),
      passportUrl: passportPreview || "",
      signatureUrl: signaturePreview || "",
      pdfUrl: "",
      status: "",
      date: new Date().toISOString(),
      name: data.fullName,
      dateOfRegistration: data.dateOfRegistration ? new Date(data.dateOfRegistration) : new Date(),

      // Dates
      preferenceDate1: data.preferenceDate1 || "",
      preferenceDate2: data.preferenceDate2 || "",
      preferenceDate3: data.preferenceDate3 || "",

      // Conditional fields for AKTs
     ...(selectedExamType
  ? {
      eligibilityA: (data as AktsFormValues).eligibilityA || false,
      eligibilityB: (data as AktsFormValues).eligibilityB || false,
      eligibilityC: (data as AktsFormValues).eligibilityC || false,
      schoolName: (data as AktsFormValues).schoolName || "",
      schoolLocation: (data as AktsFormValues).schoolLocation || "",
      QualificationDate: (data as AktsFormValues).QualificationDate
        ? new Date((data as AktsFormValues).QualificationDate).toISOString()
        : "",
      candidateId: (data as AktsFormValues).candidateId || "",
      candidateStatementA: (data as AktsFormValues).candidateStatementA || false,
      candidateStatementB: (data as AktsFormValues).candidateStatementB || false,
      candidateStatementC: (data as AktsFormValues).candidateStatementC || false,
      examinationCenter: (data as AktsFormValues).examinationCenter || "",
    }
  : {}),
    }

    // Decide status and dispatch
    if (isPendingAvailable) {
      application.status = "pending"
    } else if (isWaitingAvailable) {
      application.status = "waiting"
    } else {
      dispatch(toggleBlockExam(params.examId))
      Swal.fire({
        title: "Error",
        text: "No more slots available for this exam.",
        icon: "error",
        confirmButtonColor: "#6366f1",
      })
      setIsSubmitting(false)
      return
    }

    // Final dispatch
    dispatch(addApplication(application))
    dispatch(incrementApplicationsCount(params.examId))

    // Success Alert
    Swal.fire({
      html: `
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="/icon.png" alt="MRCGP Logo" style="width: 100px; height: 100px; margin: 0 auto 15px auto;">
        </div>
        <h1><b>Form Successfully Submitted!</b></h1>
        <p style="color: #666; font-size: 16px;">
          You should receive an email within 24 hours. If not, please 
          <a href="mailto:contact@mrcgpintsouthasia.org" style="color: #818cf8;">contact us</a>.
        </p>
        <p style="margin-top: 15px;">
          For preview final PDF 
          <a href="#" id="pdf-preview-link" style="color: #818cf8;">Click Me</a>
        </p>
      `,
      confirmButtonText: "OK",
      confirmButtonColor: "#3b82f6",
      didOpen: () => {
        document.getElementById("pdf-preview-link")?.addEventListener("click", (e) => {
          e.preventDefault()
          document.getElementById("pdf-download-link")?.click()
        })
      },
    }).then(() => {
      setTimeout(() => window.location.reload(), 2000)
    })
  } catch (err) {
    console.error("Submission error:", err)
    Swal.fire({
      title: "Error",
      text: "Something went wrong during submission.",
      icon: "error",
      confirmButtonColor: "#6366f1",
    })
  } finally {
    setIsSubmitting(false)
  }
}


  const validateFile = async (file: File, inputId: string) => {
    // List of input IDs that require validation
    const validateThese = ["passport-image"]

    // Reset error
    setFileError(null)

    // Only validate if inputId is in the validation list
    if (validateThese.includes(inputId)) {
      // Check file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png"]
      if (!validTypes.includes(file.type)) {
        setFileError(`Invalid file format. Only PNG and JPG formats are supported.`)
        const fileInput = document.getElementById(inputId) as HTMLInputElement
        if (fileInput) fileInput.value = ""
        return false
      }

      // Check file size (2MB = 2 * 1024 * 1024 bytes)
      const maxSize = 2 * 1024 * 1024
      if (file.size > maxSize) {
        setFileError(`File size exceeds 2MB limit. Please choose a smaller file.`)
        const fileInput = document.getElementById(inputId) as HTMLInputElement
        if (fileInput) fileInput.value = ""
        return false
      }
    }

    // Upload to Supabase
    const fileName = `${inputId}/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from("restaurant-images").upload(fileName, file)

    if (error) {
      setFileError("Upload failed. Please try again.")
      return false
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from("restaurant-images").getPublicUrl(fileName)
    const publicUrl = publicUrlData?.publicUrl

    if (!publicUrl) {
      setFileError("Could not retrieve image URL.")
      return false
    }

    // Set image URL in preview state
    switch (inputId) {
      case "passport-image":
        setPassportPreview(publicUrl)
        break
      case "medical-license":
        setMedicalLicensePreview(publicUrl)
        break
      case "part1-email":
        setPart1EmailPreview(publicUrl)
        break
      case "passport-bio":
        setPassportBioPreview(publicUrl)
        break
      case "signature":
        setSignaturePreview(publicUrl)
        break
    }

    return true
  }

  useEffect(() => {
    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      if (passportPreview) URL.revokeObjectURL(passportPreview)
      if (medicalLicensePreview) URL.revokeObjectURL(medicalLicensePreview)
      if (part1EmailPreview) URL.revokeObjectURL(part1EmailPreview)
      if (passportBioPreview) URL.revokeObjectURL(passportBioPreview)
      if (signaturePreview) URL.revokeObjectURL(signaturePreview)
    }
  }, [passportPreview, medicalLicensePreview, part1EmailPreview, passportBioPreview, signaturePreview])

  // Parse slot dates when selectedExam changes
  useEffect(() => {
    if (selectedExam && selectedExam.slot1) {
      const slot1Dates = parseSlotDates(selectedExam.slot1)
      const slot2Dates = parseSlotDates(selectedExam.slot2)
      const slot3Dates = parseSlotDates(selectedExam.slot3)

      // Combine all dates and remove duplicates
      const allDates = [...slot1Dates, ...slot2Dates, ...slot3Dates]
      const uniqueDatesStr = [
        ...new Set(
          allDates.filter((date) => date instanceof Date && !isNaN(date.getTime())).map((date) => date.toISOString()),
        ),
      ]
      const uniqueDates = uniqueDatesStr.map((dateStr) => new Date(dateStr))

      // Sort dates in ascending order
      uniqueDates.sort((a, b) => a.getTime() - b.getTime())

      setAvailableDates(uniqueDates)
    }
  }, [selectedExam])

  // Update selected dates when form values change
useEffect(() => {
  const activeForm = selectedExamType ? aktsForm : osceForm

  // 👇 Yeh watch function callback ke sath hai, so it's a Subscription
  const subscription = activeForm.watch((value) => {
    setSelectedDates({
      preferenceDate1:
        value.preferenceDate1 && value.preferenceDate1 !== " "
          ? new Date(value.preferenceDate1).toISOString()
          : null,
      preferenceDate2:
        value.preferenceDate2 && value.preferenceDate2 !== " "
          ? new Date(value.preferenceDate2).toISOString()
          : null,
      preferenceDate3:
        value.preferenceDate3 && value.preferenceDate3 !== " "
          ? new Date(value.preferenceDate3).toISOString()
          : null,
    })
  })

  // ✅ Clean up safely
  return () => {
    if (typeof subscription === "object" && subscription !== null && "unsubscribe" in subscription) {
      subscription.unsubscribe()
    }
  }
}, [selectedExamType])



  // Get available dates for a specific field (excluding dates selected in other fields)
  const getAvailableDatesForField = (fieldName: "preferenceDate1" | "preferenceDate2" | "preferenceDate3") => {
    return availableDates.filter((date) => {
      const dateStr = date.toISOString()

      // Check if this date is selected in another field
      for (const [field, selectedDate] of Object.entries(selectedDates)) {
        if (field !== fieldName && selectedDate === dateStr) {
          return false
        }
      }

      return true
    })
  }

  const candidateId = currentForm.watch("candidateId")

  useEffect(() => {
    if (candidateId && candidateId.length > 7) {
      currentForm.setValue("candidateId", "")
    }
  }, [candidateId])

  const [phone, setPhone] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)

  const handleBlur = () => {
    if (!phone) {
      setError("Phone number is required")
    } else if (!isValidPhoneNumber(phone)) {
      setError("Invalid phone number")
    } else {
      setError(null)
    }
  }

  function test() {
    setTimeout(() => {
      const pdfBlob = document.getElementById("pdf-download-preview-link")
      if (pdfBlob) {
        // @ts-ignore
        const pdfUrl = pdfBlob.href
        window.open(pdfUrl, "_blank")
      }
    }, 200)
  }
 

  if (isExamClosed) {
    return <ExamClosed />
  }
  if (isClosed) {
    return <ExamClosedApp />
  }
  if (selectedExam === undefined) return <NotFound />

console.log("current form errors", currentForm.formState.errors);
// useEffect(() => {
//   const errors = selectedExamType ? aktsForm.formState.errors : osceForm.formState.errors
//   console.log("Form errors", errors)
// }, [selectedExamType])

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <CardHeader className="space-y-1 bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              <div className="flex justify-start items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <img src="/icon.png" alt="404" />
                </div>
                <span>APPLICATION FORM</span>
              </div>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                For the South Asia MRCGP [INT.] Part 2 (OSCE) Examination
              </CardDescription>
            </CardTitle>
            <div className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-md text-indigo-700 dark:text-indigo-300 font-medium text-sm">
              {selectedExam ? selectedExam.name + " - " + selectedExam.location : ""}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Form {...(currentForm)}>

            <form onSubmit={currentForm.handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal and Contact Information */}
              <Accordion type="single" collapsible defaultValue="personal" className="w-full">
                <AccordionItem
                  value="personal"
                  className="border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm"
                >
                  <AccordionTrigger className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                    <div className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200">
                      <User className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                      PERSONAL AND CONTACT INFORMATION
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pt-4 pb-6 bg-white dark:bg-slate-900">
                    <div className="space-y-6">
                      {/* Candidate ID */}
                      <FormField
                        control={currentForm.control}
                        name="candidateId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">
                              Candidate ID {!selectedExamType && <span className="text-red-500">*</span>}
                              {selectedExamType && <span className="text-slate-500">(Optional for AKTs)</span>}
                            </FormLabel>
                            <FormDescription>Please quote it in all correspondence.</FormDescription>
                            <FormControl>
                              <Input
                                placeholder="e.g. 1234567"
                                {...field}
                                maxLength={7}
                                onChange={(e) => {
                                  const value = e.target.value
                                  if (value.length <= 7) {
                                    field.onChange(value)
                                  }
                                }}
                                className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                  currentForm.formState.errors.candidateId ? "border-red-500 dark:border-red-700" : ""
                                }`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Passport Image */}
                      <div className="space-y-2">
                        <FormLabel className="text-base font-medium">Passport Size image:</FormLabel>
                        <div className="flex items-center justify-center w-full">
                          {passportPreview ? (
                            <div className="relative w-full">
                              <div className="flex flex-col items-center">
                                <img
                                  src={passportPreview || "/placeholder.svg"}
                                  alt="Passport preview"
                                  className="h-40 object-contain rounded-md mb-2 border border-slate-200 dark:border-slate-700"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setPassportPreview(null)
                                    const fileInput = document.getElementById("passport-image") as HTMLInputElement
                                    if (fileInput) fileInput.value = ""
                                  }}
                                  className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                >
                                  Change Image
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <label
                              htmlFor="passport-image"
                              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-slate-500 dark:text-slate-400" />
                                <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                                  <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG (MAX. 2MB)</p>
                              </div>
                              <input
                                id="passport-image"
                                type="file"
                                className="hidden"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    validateFile(e.target.files[0], "passport-image")
                                  }
                                }}
                              />
                            </label>
                          )}
                        </div>
                        {fileError && <p className="text-sm text-red-500 mt-1">{fileError}</p>}
                      </div>

                      {/* Full Name */}
                     {!selectedExamType && <FormField
                        control={currentForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">
                              Full name as you would like it to appear on record <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Full Name"
                                {...field}
                                className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                  currentForm.formState.errors.fullName ? "border-red-500 dark:border-red-700" : ""
                                }`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />}
                      {selectedExamType && (
                        <>
                        <FormField
                        control={currentForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">
                              Full name as you would like it to appear on record <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Full Name"
                                {...field}
                                className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                  currentForm.formState.errors.fullName ? "border-red-500 dark:border-red-700" : ""
                                }`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={currentForm.control}
                              name="gender"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Gender <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger
                                        className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                          currentForm.formState.errors.gender ? "border-red-500 dark:border-red-700" : ""
                                        }`}
                                      >
                                        <SelectValue placeholder="Select gender" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                                      {genderCategory.map((date) => (
                                        <SelectItem
                                          key={date}
                                          value={date}
                                          className="dark:text-slate-200 dark:focus:bg-slate-700"
                                        >
                                          {date}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={currentForm.control}
                              name="schoolName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Graduating School Name: <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter Graduating School Name"
                                      {...field}
                                      className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                        currentForm.formState.errors.schoolName ? "border-red-500 dark:border-red-700" : ""
                                      }`}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={currentForm.control}
                              name="schoolLocation"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Graduating School Location: <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter Graduating School Location"
                                      {...field}
                                      className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                        currentForm.formState.errors.schoolLocation ? "border-red-500 dark:border-red-700" : ""
                                      }`}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={currentForm.control}
                              name="QualificationDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Date Of Qualification: <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Select qualification date"
                                      type="date"
                                      value={field.value || ""}
                                      onChange={(e) => {
                                        const selectedDate = e.target.value
                                        console.log("Selected date:", selectedDate)

                                        // Store as ISO date string (YYYY-MM-DD format)
                                        field.onChange(selectedDate)
                                      }}
                                      max={new Date().toISOString().split("T")[0]} // Prevent future dates
                                      className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                        currentForm.formState.errors.QualificationDate
                                          ? "border-red-500 dark:border-red-700"
                                          : ""
                                      }`}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </>
                      )}
                      {/* Residential Address */}
                      <div className="space-y-4">
                        <h3 className="text-base font-medium">Residential Address</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={currentForm.control}
                            name="poBox"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  House no. and street or P.O.Box: <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter P.O.Box"
                                    {...field}
                                    className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                      currentForm.formState.errors.poBox ? "border-red-500 dark:border-red-700" : ""
                                    }`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={currentForm.control}
                            name="district"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  District: <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter District"
                                    {...field}
                                    className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                      currentForm.formState.errors.district ? "border-red-500 dark:border-red-700" : ""
                                    }`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={currentForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  City / Town / Village: <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter City / Town / Village"
                                    {...field}
                                    className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                      currentForm.formState.errors.city ? "border-red-500 dark:border-red-700" : ""
                                    }`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={currentForm.control}
                            name="province"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Province / Region: <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter Province / Region"
                                    {...field}
                                    className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                      currentForm.formState.errors.province ? "border-red-500 dark:border-red-700" : ""
                                    }`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={currentForm.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Country: <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter Country"
                                    {...field}
                                    className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                      currentForm.formState.errors.country ? "border-red-500 dark:border-red-700" : ""
                                    }`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Contact Details */}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={currentForm.control}
                          name="whatsapp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                WhatsApp number: <span className="text-red-500">*</span>
                              </FormLabel>
                              {/* <FormDescription>In full international format</FormDescription> */}
                              <FormControl>
                                <div
                                  className={`bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 ${
                                    currentForm.formState.errors.whatsapp ? "border-red-500 dark:border-red-700" : ""
                                  }`}
                                >
                                  <PhoneInput
                                    international
                                    countryCallingCodeEditable={true}
                                    value={field.value}
                                    onBlur={handleBlur}
                                    onChange={(value) => {
                                      field.onChange(value)
                                      setPhone(value)
                                    }}
                                    className="flex h-10 w-full rounded-md bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage>
                                {error && <span className="text-sm text-red-500">{error}</span>}
                              </FormMessage>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={currentForm.control}
                          name="emergencyContact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Emergency contact number <span className="text-red-500">*</span>
                              </FormLabel>
                              {/* <FormDescription>In full international format</FormDescription> */}
                              <FormControl>
                                <div
                                  className={`bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 ${
                                    currentForm.formState.errors.whatsapp ? "border-red-500 dark:border-red-700" : ""
                                  }`}
                                >
                                  <PhoneInput
                                    international
                                    countryCallingCodeEditable={true}
                                    value={field.value}
                                    onBlur={handleBlur}
                                    onChange={(value) => {
                                      field.onChange(value)
                                      setPhone(value)
                                    }}
                                    className="flex h-10 w-full rounded-md bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage>
                                {error && <span className="text-sm text-red-500">{error}</span>}
                              </FormMessage>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={currentForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem className="col-span-1 md:col-span-2">
                              <FormLabel>
                                E-mail <span className="text-red-500">*</span>
                              </FormLabel>
                              {/* <FormDescription>
                                  Please provide valid personal email address that you regularly check, as most
                                  correspondence and important announcements are communicated to candidates by email.
                                </FormDescription> */}
                              <FormControl>
                                <Input
                                  placeholder="Enter Email"
                                  type="email"
                                  {...field}
                                  className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                    currentForm.formState.errors.email ? "border-red-500 dark:border-red-700" : ""
                                  }`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Date of passing Part 1 exam */}
                        <FormField
                          control={currentForm.control}
                          name="dateOfPassingPart1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Date of passing Part 1 exam <span className="text-red-500">*</span>
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger
                                    className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                      currentForm.formState.errors.dateOfPassingPart1 ? "border-red-500 dark:border-red-700" : ""
                                    }`}
                                  >
                                    <SelectValue placeholder="Select date" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                                  {part1ExamDates.map((date) => (
                                    <SelectItem
                                      key={date}
                                      value={date}
                                      className="dark:text-slate-200 dark:focus:bg-slate-700"
                                    >
                                      {date}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* No. of previous OSCE attempts */}
                        {selectedExamType ? (
                          <FormField
                            control={currentForm.control}
                            name="previousAktsAttempts"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  No. of previous AKTs attempts <span className="text-red-500">*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger
                                      className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                        currentForm.formState.errors.previousAktsAttempts ? "border-red-500 dark:border-red-700" : ""
                                      }`}
                                    >
                                      <SelectValue placeholder="Select number" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                                    <SelectItem value="0" className="dark:text-slate-200 dark:focus:bg-slate-700">
                                      0
                                    </SelectItem>
                                    <SelectItem value="1" className="dark:text-slate-200 dark:focus:bg-slate-700">
                                      1
                                    </SelectItem>
                                    <SelectItem value="2" className="dark:text-slate-200 dark:focus:bg-slate-700">
                                      2
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <FormField
                            control={currentForm.control}
                            name="previousOsceAttempts"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  No. of previous OSCE attempts <span className="text-red-500">*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger
                                      className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                        currentForm.formState.errors.previousOsceAttempts ? "border-red-500 dark:border-red-700" : ""
                                      }`}
                                    >
                                      <SelectValue placeholder="Select number" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                                    <SelectItem value="0" className="dark:text-slate-200 dark:focus:bg-slate-700">
                                      0
                                    </SelectItem>
                                    <SelectItem value="1" className="dark:text-slate-200 dark:focus:bg-slate-700">
                                      1
                                    </SelectItem>
                                    <SelectItem value="2" className="dark:text-slate-200 dark:focus:bg-slate-700">
                                      2
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Experience and License Details */}
              <Accordion type="single" collapsible defaultValue="experience" className="w-full">
                <AccordionItem
                  value="experience"
                  className="border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm"
                >
                  <AccordionTrigger className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                    <div className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200">
                      <FileText className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                      EXPERIENCE AND LICENSE DETAILS
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pt-4 pb-6 bg-white dark:bg-slate-900">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={currentForm.control}
                          name="countryOfExperience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Country of postgraduate clinical experience: <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter country of postgraduate clinical experience"
                                  {...field}
                                  className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                    currentForm.formState.errors.countryOfExperience ? "border-red-500 dark:border-red-700" : ""
                                  }`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={currentForm.control}
                          name="countryOfOrigin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Country of ethnic origin <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter Country of ethnic origin"
                                  {...field}
                                  className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                    currentForm.formState.errors.countryOfOrigin ? "border-red-500 dark:border-red-700" : ""
                                  }`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={currentForm.control}
                          name="registrationAuthority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Registration authority <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter Registration authority"
                                  {...field}
                                  className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                    currentForm.formState.errors.registrationAuthority ? "border-red-500 dark:border-red-700" : ""
                                  }`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={currentForm.control}
                          name="registrationNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Registration number <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter Registration number"
                                  {...field}
                                  className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                    currentForm.formState.errors.registrationNumber ? "border-red-500 dark:border-red-700" : ""
                                  }`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={currentForm.control}
                          name="dateOfRegistration"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>
                                Date of full registration <span className="text-red-500">*</span>
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500",
                                        !field.value && "text-muted-foreground",
                                      )}
                                    >
                                      {field.value ? format(field.value, "PPP") : <span>dd/mm/yyyy</span>}
                                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0 dark:bg-slate-800 dark:border-slate-700"
                                  align="start"
                                >
                                  <CalendarComponent
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                    initialFocus
                                    className="dark:bg-slate-800"
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Eligibility Section - Only for AKTs */}
              {selectedExamType && (
                <Accordion type="single" collapsible defaultValue="eligibility" className="w-full">
                  <AccordionItem
                    value="eligibility"
                    className="border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm"
                  >
                    <AccordionTrigger className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                      <div className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200">
                        <Shield className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                        ELIGIBILITY
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-4 pb-6 bg-white dark:bg-slate-900">
                      <div className="space-y-6">
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                          I am eligible to apply for the MRCGP[INT] South Asia Examination under the following criterion
                          – please choose at least ONE:
                        </p>

                        <div className="space-y-4">
                          <FormField
                            control={currentForm.control}
                            name="eligibilityA"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium">
                                    I have satisfactorily completed a structured two-year training course or a two-year
                                    diploma in family medicine as recognised by the MRCGP [INT] South Asia Board
                                    (certificates of experience and references attached).
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={currentForm.control}
                            name="eligibilityB"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium">
                                    I have satisfactorily completed a structured one-year training programme / diploma
                                    in family medicine as recognised by the MRCGP[INT] South Asia Board (certificates of
                                    experience and references attached) along with a further 2 years of clinical
                                    experience.
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={currentForm.control}
                            name="eligibilityC"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium">
                                    I have completed a minimum of five years of clinical experience of which a minimum
                                    of three years has been in family medicine (experience during must be in last 10
                                    years).
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {/* Examination Center Preference - Only for AKTs */}
              {selectedExamType && (
                <Accordion type="single" collapsible defaultValue="center-preference" className="w-full">
                  <AccordionItem
                    value="center-preference"
                    className="border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm"
                  >
                    <AccordionTrigger className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                      <div className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200">
                        <MapPin className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                        EXAMINATION CENTER PREFERENCE
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-4 pb-6 bg-white dark:bg-slate-900">
                      <div className="space-y-6">
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                          Please choose below the examination centre where you would like to take the Part 1
                          examination. Candidates will be assigned to an examination centre on the basis of availability
                          of their choice, otherwise alternate centre will be offered.
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                          <strong>Note:</strong> Limited seats at each venue are available for the computer-based exam
                          administered by Pearson VUE and will be allocated on a{" "}
                          <strong>first come first served basis</strong>. Others will be accommodated in a paper-based
                          exam administered by British Council.
                        </p>

                        <FormField
                          control={currentForm.control}
                          name="examinationCenter"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormControl>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  {Array.isArray(selectedExam?.location) ? (
                                    selectedExam.location.map((location) => (
                                      <div key={location} className="flex items-center space-x-2">
                                        <input
                                          type="radio"
                                          id={location}
                                          value={location}
                                          checked={field.value === location}
                                          onChange={(e) => field.onChange(e.target.value)}
                                          className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <label
                                          htmlFor={location}
                                          className="text-sm font-medium text-gray-900 dark:text-gray-300"
                                        >
                                          {location}
                                        </label>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        id={selectedExam?.location}
                                        value={selectedExam?.location}
                                        checked={field.value === selectedExam?.location}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                      />
                                      <label
                                        htmlFor={selectedExam?.location}
                                        className="text-sm font-medium text-gray-900 dark:text-gray-300"
                                      >
                                        {selectedExam?.location}
                                      </label>
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-100 dark:border-amber-800">
                          <p className="text-sm text-amber-700 dark:text-amber-300">
                            <strong>NOTE:</strong> Changing your exam centre preference is only possible in exceptional
                            circumstances and subject to availability. Requests after the registration closing deadline
                            may not be accommodated.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

             

              {/* OSCE Session */}
          

              {/* OSCE Session */}
              <Accordion type="single" collapsible defaultValue="osce" className="w-full">
                <AccordionItem
                  value="osce"
                  className="border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm"
                >
                  <AccordionTrigger className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                    <div className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200">
                      <Calendar className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                      {selectedExamType ? "AKTs SESSION" : "OSCE SESSION"}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pt-4 pb-6 bg-white dark:bg-slate-900">
                    <div className="space-y-6">
                      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-md border border-indigo-100 dark:border-indigo-800">
                        <p className="text-sm text-indigo-700 dark:text-indigo-300">
                          The OSCE exam will take place over 12 days ({selectedExam ? selectedExam?.name : ""}{" "}
                          {Object.values(availableDates).map((dateStr: any) => {
                            const day = new Date(dateStr).getDate()
                            return <span key={dateStr}>{day}, </span>
                          })}
                          ) If you have a preference (e.g. for travel purposes) for a particular day, please indicate
                          below your preferred choice:
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={currentForm.control}
                          name="preferenceDate1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preference Date 1</FormLabel>
                              <Select onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger
                                    className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500`}
                                  >
                                    <SelectValue placeholder="Select a date" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                                  <SelectItem key="" value={" "}>
                                    None
                                  </SelectItem>
                                  {getAvailableDatesForField("preferenceDate1").map((date) => (
                                    <SelectItem key={date.toISOString()} value={date.toISOString()}>
                                      {format(date, "MMMM d, yyyy")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={currentForm.control}
                          name="preferenceDate2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preference Date 2</FormLabel>
                              <Select onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger
                                    className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 `}
                                  >
                                    <SelectValue placeholder="Select a date" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                                  <SelectItem key="" value={" "}>
                                    None
                                  </SelectItem>
                                  {getAvailableDatesForField("preferenceDate2").map((date) => (
                                    <SelectItem key={date.toISOString()} value={date.toISOString()}>
                                      {format(date, "MMMM d, yyyy")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={currentForm.control}
                          name="preferenceDate3"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preference Date 3</FormLabel>
                              <Select onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger
                                    className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500`}
                                  >
                                    <SelectValue placeholder="Select a date" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                                  <SelectItem key="" value={" "}>
                                    None
                                  </SelectItem>
                                  {getAvailableDatesForField("preferenceDate3").map((date) => (
                                    <SelectItem key={date.toISOString()} value={date.toISOString()}>
                                      {format(date, "MMMM d, yyyy")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-100 dark:border-amber-800">
                        <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">PLEASE NOTE</h4>
                        <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                          <li>
                            The number of seats are limited and slots will be allocated on the "First Come First Served"
                            basis.
                          </li>
                          <li>
                            Whilst we will try to accommodate your preference, it may not be possible due to a large
                            number of applicants.
                          </li>
                          <li>
                            Please email us well in advance if you require a letter of invitation for visa purposes and
                            make sure you complete all travel formalities in good time (visa applications, travel
                            permits, leaves, etc.) No Refunds will be granted in case any candidate fails to get the
                            visa prior to the exam date.
                          </li>
                          <li>
                            Candidates with a disability are requested to read the rules and regulation document [Page
                            10] available on the website.
                          </li>
                          <li>
                            The MRCGP [INT.] South Asia Secretariat will notify you by email of your allocated date and
                            time at least four weeks before the exam starting date. [It is advised to make your travel
                            arrangements once you receive this email]
                          </li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Candidate's Statement */}
            {!selectedExamType &&  <Accordion type="single" collapsible defaultValue="statement" className="w-full">
                <AccordionItem
                  value="statement"
                  className="border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm"
                >
                  <AccordionTrigger className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                    <div className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200">
                      <Shield className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                      CANDIDATE'S STATEMENT
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pt-4 pb-6 bg-white dark:bg-slate-900">
                    <div className="space-y-6">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                          I hereby apply to sit the South Asia MRCGP [INT.] Part 2 (OSCE) Examination, success in which
                          will allow me to apply for International Membership of the UK's Royal College of General
                          Practitioners. Detailed information on the membership application process can be found on the
                          RCGP website:{" "}
                          <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                            Member Ship
                          </a>
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                          I have read and agree to abide by the conditions set out in the South Asia MRCGP [INT.]
                          Examination Rules and Regulations as published on the MRCGP [INT.] South Asia website:{" "}
                          <a
                            href="http://www.mrcgpintsouthasia.org"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            www.mrcgpintsouthasia.org
                          </a>{" "}
                          If accepted for International Membership, I undertake to continue approved postgraduate study
                          while I remain in active general practice/family practice, and to uphold and promote the aims
                          of the RCGP to the best of my ability.
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                          I understand that, on being accepted for International Membership, an annual subscription fee
                          is to be payable to the RCGP. I understand that only registered International Members who
                          maintain their RCGP subscription are entitled to use the post-nominal designation "MRCGP
                          [INT]". Success in the exam does not give me the right to refer to myself as MRCGP [INT.].
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          I also understand and agree that my personal data will be handled by the MRCGP [INT.] South
                          Asia Board and I also give permission for my personal data to be handled by the regional MRCGP
                          [INT.] South Asia co-ordinators.
                        </p>
                      </div>
                      <FormField
                        control={currentForm.control}
                        name="termsAgreed"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-medium">
                                I agree to the terms and conditions <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormDescription className="text-xs">
                                By checking this box, I confirm that I have read and agree to the statements above.
                              </FormDescription>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* File Uploads */}
                        <div className="space-y-4">
                          <h3 className="text-base font-medium">Required Documents</h3>

                          <div className="space-y-2">
                            <FormLabel>
                              Valid Medical license: (Use .png or .jpg only) <span className="text-red-500">*</span>
                            </FormLabel>
                            <div className="flex items-center justify-center w-full">
                              {medicalLicensePreview ? (
                                <div className="relative w-full">
                                  <div className="flex flex-col items-center">
                                    <img
                                      src={
                                        medicalLicensePreview ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg"
                                      }
                                      alt="Medical license preview"
                                      className="h-40 object-contain rounded-md mb-2 border border-slate-200 dark:border-slate-700"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setMedicalLicensePreview(null)
                                        const fileInput = document.getElementById("medical-license") as HTMLInputElement
                                        if (fileInput) fileInput.value = ""
                                      }}
                                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                    >
                                      Change Image
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <label
                                  htmlFor="medical-license"
                                  className={
                                    warning || currentForm.formState.errors.medicalLicense
                                      ? "border-red-500 flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                                      : "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                                  }
                                >
                                  <div className={`flex flex-col items-center justify-center pt-5 pb-6 `}>
                                    <Upload className="w-6 h-6 mb-1 text-slate-500 dark:text-slate-400" />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      <span className={`font-semibold`}>Click to upload</span> or drag and drop
                                    </p>
                                  </div>
                                  <input
                                    id="medical-license"
                                    type="file"
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/jpg"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        validateFile(e.target.files[0], "medical-license")
                                      }
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <FormLabel>Part I passing email: (Use .png or .jpg only)</FormLabel>
                            <div className="flex items-center justify-center w-full">
                              {part1EmailPreview ? (
                                <div className="relative w-full">
                                  <div className="flex flex-col items-center">
                                    <img
                                      src={
                                        part1EmailPreview ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg"
                                      }
                                      alt="Part I passing email preview"
                                      className="h-40 object-contain rounded-md mb-2 border border-slate-200 dark:border-slate-700"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setPart1EmailPreview(null)
                                        const fileInput = document.getElementById("part1-email") as HTMLInputElement
                                        if (fileInput) fileInput.value = ""
                                      }}
                                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                    >
                                      Change Image
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <label
                                  htmlFor="part1-email"
                                  className={
                                    "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 "
                                  }
                                >
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-6 h-6 mb-1 text-slate-500 dark:text-slate-400" />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                  </div>
                                  <input
                                    id="part1-email"
                                    type="file"
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/jpg"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        validateFile(e.target.files[0], "part1-email")
                                      }
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-base font-medium">&nbsp;</h3>

                          <div className="space-y-2">
                            <FormLabel>
                              Passport bio Page (Valid): (Use .png or .jpg only) <span className="text-red-500">*</span>
                            </FormLabel>
                            <div className="flex items-center justify-center w-full">
                              {passportBioPreview ? (
                                <div className="relative w-full">
                                  <div className="flex flex-col items-center">
                                    <img
                                      src={
                                        passportBioPreview ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg"
                                      }
                                      alt="Passport bio page preview"
                                      className="h-40 object-contain rounded-md mb-2 border border-slate-200 dark:border-slate-700"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setPassportBioPreview(null)
                                        const fileInput = document.getElementById("passport-bio") as HTMLInputElement
                                        if (fileInput) fileInput.value = ""
                                      }}
                                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                    >
                                      Change Image
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <label
                                  htmlFor="passport-bio"
                                  className={
                                    warning || currentForm.formState.errors.medicalLicense
                                      ? "border-red-500 flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                                      : "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                                  }
                                >
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-6 h-6 mb-1 text-slate-500 dark:text-slate-400" />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                  </div>
                                  <input
                                    id="passport-bio"
                                    type="file"
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/jpg"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        validateFile(e.target.files[0], "passport-bio")
                                      }
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <FormLabel>
                              Signature: (Use .png or .jpg only) <span className="text-red-500">*</span>
                            </FormLabel>
                            <div className="flex items-center justify-center w-full">
                              {signaturePreview ? (
                                <div className="relative w-full">
                                  <div className="flex flex-col items-center">
                                    <img
                                      src={signaturePreview || "/placeholder.svg"}
                                      alt="Signature preview"
                                      className="h-40 object-contain rounded-md mb-2 border border-slate-200 dark:border-slate-700"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSignaturePreview(null)
                                        const fileInput = document.getElementById("signature") as HTMLInputElement
                                        if (fileInput) fileInput.value = ""
                                      }}
                                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                    >
                                      Change Image
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <label
                                  htmlFor="signature"
                                  className={
                                    warning || currentForm.formState.errors.medicalLicense
                                      ? "border-red-500 flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                                      : "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                                  }
                                >
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-6 h-6 mb-1 text-slate-500 dark:text-slate-400" />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                  </div>
                                  <input
                                    id="signature"
                                    type="file"
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/jpg"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        validateFile(e.target.files[0], "signature")
                                      }
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={currentForm.control}
                            name="agreementName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full name: </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter Full name"
                                    {...field}
                                    className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={currentForm.control}
                            name="agreementDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>
                                  Date: <span className="text-red-500">*</span>
                                </FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500",
                                          !field.value && "text-muted-foreground",
                                        )}
                                      >
                                        {field.value ? format(field.value, "PPP") : format(new Date(), "PPP")}
                                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0 dark:bg-slate-800 dark:border-slate-700"
                                    align="start"
                                  >
                                    <CalendarComponent
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                      initialFocus
                                      className="dark:bg-slate-800"
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>}

               {/* Candidate Statement - Only for AKTs */}
              {selectedExamType && (
                <Accordion type="single" collapsible defaultValue="candidate-statement" className="w-full">
                  <AccordionItem
                    value="candidate-statement"
                    className="border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm"
                  >
                    <AccordionTrigger className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                      <div className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200">
                        <FileText className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                        CANDIDATE STATEMENT
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-4 pb-6 bg-white dark:bg-slate-900">
                      <div className="space-y-6">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                          <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                            I hereby apply to sit the MRCGP [INT] South Asia Examination, success in which will allow me
                            to become an International Member of the UK's Royal College of General Practitioners. I have
                            read and agree to abide by the conditions set out in the MRCGP [INT] South Asia Examination
                            Rules and Regulations as published on the MRCGP [INT] South Asia website:
                            www.mrcgpintsouthasia.org
                          </p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                            I understand that success in the two modules of the South Asia MRCGP [INT] examination does
                            not automatically make me an International Member of the RCGP, and that I must apply to
                            register with the RCGP as an International Member before I am allowed to refer to myself as
                            "MRCGP [INT]".
                          </p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                            I understand that "MRCGP [INT]" stands for "Member of the Royal College of General
                            Practitioners [International]" and the title is subject to remaining a Member in Good
                            Standing, which involves continuing annual membership subscription and adhering to the RCGP
                            values and philosophy.
                          </p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            If accepted for International Membership, I undertake to continue approved postgraduate
                            study while I remain in active general practice, and to uphold and promote the aims of the
                            College to the best of my ability.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            I attach the following:
                          </p>

                          <FormField
                            control={currentForm.control}
                            name="candidateStatementA"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium">
                                    A photocopy of my qualification, internship/house job and registration
                                    documentation.
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={currentForm.control}
                            name="candidateStatementB"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium">One passport-size photograph.</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={currentForm.control}
                            name="candidateStatementC"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium">
                                    Job experience certificates / private practice certificates etc to prove that you
                                    fulfil the eligibility criteria.
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <PDFDownloadLink
                  id="pdf-download-link"
                  document={<ApplicationPDFComplete data={currentForm.getValues()} images={pdfImages} />}
                  fileName="MRCGP_Application_Form.pdf"
                  className="hidden"
                >
                  {({ loading }) => (
                    <>
                      {loading || pdfGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </>
                      )}
                    </>
                  )}
                </PDFDownloadLink>
                <PDFDownloadLink
                  id="pdf-download-preview-link"
                  document={<ApplicationPDFCompletePreview data={currentForm.getValues()} images={pdfImages} />}
                  fileName="MRCGP_Application_Form.pdf"
                  className="hidden"
                >
                  {({ loading }) => (
                    <>
                      {loading || pdfGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </>
                      )}
                    </>
                  )}
                </PDFDownloadLink>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    currentForm.handleSubmit(test)()
                  }}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  id="preview-button"
                  onClick={() => {
                    // Create a new window to open the PDF
                    setTimeout(() => {
                      const pdfBlob = document.getElementById("pdf-download-link")
                      if (pdfBlob) {
                        // @ts-ignore
                        const pdfUrl = pdfBlob.href
                        window.open(pdfUrl, "_blank")
                        currentForm.reset()
                        setPassportPreview(null)
                        setMedicalLicensePreview(null)
                        setPart1EmailPreview(null)
                        setPassportBioPreview(null)
                        setSignaturePreview(null)
                      }
                    }, 500) // Increased timeout to ensure PDF generation completes
                  }}
                  className=" hidden items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                ></Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-all duration-200 transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>

        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800">
            © 2025 . Crafted with ❤ by MRCGP International South Asia
          </div>
        </div>
      </Card>
    </div>
  )
}
export default ApplicationForm
