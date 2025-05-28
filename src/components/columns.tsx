"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"

export type ApplicationData = {
  id: string
  createdAt: string
  updatedAt: string
  candidateId: string
  fullName: string
  email: string
  personalContact: string
  emergencyContact: string
  streetAddress: string
  city: string
  district: string
  province: string
  country: string
  originCountry: string
  clinicalExperienceCountry: string
  registrationAuthority: string
  registrationNumber: string
  registrationDate: string
  examOccurrenceId: string
  status: "APPROVED" | "REJECTED" | "PENDING" | "WAITING" | "SUBMITTED"
  isWaiting: boolean
  notes?: string
  adminNotes?: string
  reviewedAt?: string
  reviewedById?: string
  // Additional fields that might be present
  applicantName?: string
  examId?: string | number
  submittedDate?: string
  examName?: string
  date?: string
  name?: string
  whatsapp?: string
  passportUrl?: string
  poBox?: string
  dateOfPassingPart1?: string
  countryOfOrigin?: string
  preferenceDate1?: string
  preferenceDate2?: string
  preferenceDate3?: string
  medicalLicenseUrl?: string
  part1EmailUrl?: string
  passportBioUrl?: string
  signatureUrl?: string
  previousOsceAttempts?: string
  countryOfExperience?: string
  agreementName?: string
  agreementDate?: string
  termsAgreed?: boolean
}

export const columns: ColumnDef<ApplicationData>[] = [
  {
    accessorKey: "candidateId",
    header: "Candidate ID#",
  },
  {
    accessorKey: "createdAt",
    header: "Application Date",
    cell: ({ row }) => {
      const rawDate = row.getValue("createdAt") as string;
      const date = new Date(rawDate);
      return date.toLocaleDateString(); // only date shown, no time
    },
  },
  {
    accessorKey: "fullName",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "personalContact",
    header: "WhatsApp",
  },
  {
    accessorKey: "emergencyContact",
    header: "Emergency Contact",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string

      return (
        <Badge
          variant="outline"
          className={
            status === "APPROVED"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
              : status === "REJECTED"
                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800"
              : status === "SUBMITTED"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
              : status === "UNDER_REVIEW"
                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800"
              : status === "DRAFT"
                ? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800"
              : status === "APPLIED"
                ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
          }
        >
          {status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: () => {
      return (
        <button className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
          <FileText className="h-4 w-4" />
        </button>
      )
    },
  },
]
