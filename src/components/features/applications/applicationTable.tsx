
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { logger } from '@/lib/logger';
import { isNoPreferenceDate } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Check,
  XIcon
} from "lucide-react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Calendar, Download, Filter, Loader2, Search, Settings } from "lucide-react";
import { DataTable } from "@/components/common/data-table";
import { useEffect, useState } from "react";
import { useApplications } from "@/hooks/useApplications";
import { useExamOccurrences } from "@/hooks/useExamOccurrences";
import { getApplication, startReview } from "@/api/applicationsApi";
import { columns } from "@/components/common/columns";
import { format } from "date-fns";
import { pdf } from "@react-pdf/renderer";
import Swal from "sweetalert2";
import { toast } from 'react-toastify';
import * as pdfjsLib from "pdfjs-dist";
import { FieldSelectionDialog, ExportFieldConfig } from "@/components/common/field-selection-dialog";
import { ApplicationPDFCompleteAktApp } from "@/components/pdf/pdf-generator";
import { PDFPreviewPanel } from "@/components/pdf/pdf-preview-panel";
import { ApplicationDetailView } from "./application-detail-view";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

// PDF.js worker setup for v5.x
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// Component props interface
interface ApplicationTableProps {
  initialExamId?: string;
}

// Component is now self-contained with optional initial exam ID
export default function ApplicationTable({ initialExamId }: ApplicationTableProps) {
  const navigate = useNavigate();
  const { examId: urlExamId } = useParams<{ examId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();


  const [activeFilter, setActiveFilter] = useState<string>(searchParams.get('filter') || "all");
  const [selectedExamOccurrence, setSelectedExamOccurrence] = useState<string>(searchParams.get('exam') || "all")
  const [isExporting, setIsExporting] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || "");
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set())
  const [reviewingIds, setReviewingIds] = useState<Set<string>>(new Set())
  const [isFieldSelectionOpen, setIsFieldSelectionOpen] = useState(false)
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false)
  const [selectedApplicationData, setSelectedApplicationData] = useState<any>(null)
  const [detailViewOpen, setDetailViewOpen] = useState<boolean>(false)
  const { items: examOccurrences } = useExamOccurrences()
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('pageSize') || '10'))
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '0'))
  const {
    applications,
    review,
    loadState,
    error,
    pagination,
    setPageSize: updatePageSize,
    setPageIndex,
    reload,
  } = useApplications(
    selectedExamOccurrence === "all" ? undefined : selectedExamOccurrence,
    activeFilter === "all" ? undefined : activeFilter,
    pageSize,
    searchQuery,
  )

  // Function to update URL parameters
  const updateURLParams = (updates: Record<string, string | number | null>) => {
    const newSearchParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all') {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value.toString());
      }
    });

    setSearchParams(newSearchParams);
  };

  useEffect(() => {
    // Priority: URL examId > initialExamId prop > first exam occurrence
    const examIdToUse = urlExamId || initialExamId;

    if (examIdToUse && examOccurrences.length > 0) {
      // Check if the exam ID exists in the occurrences
      const examExists = examOccurrences.some((exam: any) => exam.id.toString() === examIdToUse);
      if (examExists) {
        setSelectedExamOccurrence(examIdToUse);
        // Update URL to include exam parameter
        updateURLParams({ exam: examIdToUse });
      } else {
        // If exam ID doesn't exist, fall back to first exam
        const currentExamOccurrence: any = examOccurrences[0];
        if (currentExamOccurrence && currentExamOccurrence.id) {
          setSelectedExamOccurrence(currentExamOccurrence.id.toString());
          // Update URL to reflect the actual selected exam
          navigate(`/applications/${currentExamOccurrence.id}`, { replace: true });
        }
      }
    } else if (examOccurrences.length > 0) {
      // No exam ID provided, use first exam occurrence
      const currentExamOccurrence: any = examOccurrences[0];
      if (currentExamOccurrence && currentExamOccurrence.id) {
        setSelectedExamOccurrence(currentExamOccurrence.id.toString());
        // Update URL to reflect the selected exam
        navigate(`/applications/${currentExamOccurrence.id}`, { replace: true });
      }
    }

    // Set initial page from URL
    if (currentPage !== pagination.pageIndex) {
      setPageIndex(currentPage);
    }

    // Removed message listener since we're using routes now
  }, [examOccurrences, urlExamId, initialExamId, navigate, currentPage, pagination.pageIndex, setPageIndex])

  const actionColumn = {
    id: "actions",
    header: "Action",
    cell: ({ row }: { row: any }) => {
      const id = row.original.id
      const status = row.original.status

      return (
        <div className="flex space-x-2">
          <Button
            key={id}
            onClick={() => handlePdfGenerate(row)}
            disabled={generatingIds.has(id)}
            className="bg-red-400 hover:bg-red-200 text-white dark:bg-red-900 dark:hover:bg-blue-900/50 dark:text-white border-blue-200 dark:border-blue-800"
          >
            {generatingIds.has(id) ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Generating...
              </>
            ) : status === "SUBMITTED" ? (
              "Review"
            ) : (
              "Get PDF"
            )}
          </Button>
          {(status === "SUBMITTED" || status === "UNDER_REVIEW") && (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={reviewingIds.has(id)}
                className="bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-400 border-green-200 dark:border-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleStatusChange(id, "approved")}
              >
                {reviewingIds.has(id) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={reviewingIds.has(id)}
                className="bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 border-red-200 dark:border-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleStatusChange(id, "rejected")}
              >
                {reviewingIds.has(id) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XIcon className="h-4 w-4 mr-1" />
                    Reject
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      )
    },
  }

  const handleStatusChange = async (id: string, status: "approved" | "rejected") => {
    setReviewingIds(prev => new Set(prev).add(id))
    try {
      if (status === "approved") {
        // Show approval confirmation dialog with optional notes
        const result = await Swal.fire({
          title: "Are you sure you want to approve?",
          imageUrl: "/icon.png", // Replace with your actual icon path
          imageWidth: 150,
          imageHeight: 150,
          input: "textarea",
          inputPlaceholder: "Optional admin notes...",
          inputAttributes: {
            "aria-label": "Admin notes",
          },
          showCancelButton: true,
          confirmButtonText: "Yes, approve",
          cancelButtonText: "Cancel",
          confirmButtonColor: "#4ade80",
          cancelButtonColor: "#ef4444",
          customClass: {
            popup: "rounded-lg",
            confirmButton: "rounded-lg px-4 py-2",
            cancelButton: "rounded-lg px-4 py-2",
          },
        })

        if (result.isConfirmed) {
          // Call the review API with APPROVED status
          await review(id, "APPROVED", result.value || undefined)

          // Show success message
          await Swal.fire({
            title: "Application Approved Successfully!",
            imageUrl: "/icon.png", // Replace with your actual icon path
            imageWidth: 150,
            imageHeight: 150,
            confirmButtonText: "OK",
            confirmButtonColor: "#3b82f6",
            customClass: {
              popup: "rounded-lg",
              confirmButton: "rounded-lg px-4 py-2",
            },
          })
        }
      } else if (status === "rejected") {
        // Show rejection confirmation dialog with mandatory reason
        const result = await Swal.fire({
          title: "Are you sure you want to reject?",
          imageUrl: "/icon.png", // Replace with your actual logo path
          imageWidth: 150,
          imageHeight: 150,
          input: "textarea",
          inputPlaceholder: "Enter reason for rejection (required)...",
          inputValidator: (value) => {
            if (!value) {
              return "You need to provide a reason for rejection!"
            }
          },
          showCancelButton: true,
          confirmButtonText: "Yes, reject",
          cancelButtonText: "Cancel",
          confirmButtonColor: "#ef4444",
          cancelButtonColor: "#6b7280",
          customClass: {
            popup: "rounded-lg",
            input: "border rounded-lg p-2 w-auto",
            confirmButton: "rounded-lg px-4 py-2",
            cancelButton: "rounded-lg px-4 py-2",
          },
        })

        if (result.isConfirmed && result.value) {
          // Call the review API with REJECTED status and reason as adminNotes
          await review(id, "REJECTED", result.value)
        }
      }
    } finally {
      setReviewingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleExamChange = (value: string) => {
    setSelectedExamOccurrence(value);
    // Update URL to reflect the selected exam
    if (value === "all") {
      navigate("/applications");
    } else {
      navigate(`/applications/${value}`);
    }
    // Update URL parameters
    updateURLParams({ exam: value });
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateURLParams({ search: value });
    // Reset to first page when searching
    setCurrentPage(0);
    setPageIndex(0);
    updateURLParams({ page: 0 });
  }

  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
    updateURLParams({ filter: value });
    // Reset to first page when filtering
    setCurrentPage(0);
    setPageIndex(0);
    updateURLParams({ page: 0 });
  }

  const handlePageSizeChange = (value: string) => {
    const newSize = parseInt(value);
    setPageSize(newSize);
    updatePageSize(newSize);
    updateURLParams({ pageSize: newSize });
    // Reset to first page when page size changes
    setCurrentPage(0);
    setPageIndex(0);
    updateURLParams({ page: 0 });
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setPageIndex(page);
    updateURLParams({ page: page });
  }

  const handlePdfGenerate = async (row: any) => {
    setGeneratingIds((prev) => new Set(prev).add(row.original.id))

    // Clear previous application data and close any open panels
    setSelectedApplicationData(null)
    setPdfPreviewOpen(false)
    setDetailViewOpen(false)

    try {
      // Call start-review API if status is SUBMITTED
      if (row.original.status === "SUBMITTED") {
        try {
          await startReview(row.original.id)
        } catch {
          // Ignore start-review API errors for now
        }
      }

      // Fetch detailed application data
      const detailedData: any = await getApplication(row.original.id)

      // Convert images to base64 using the API endpoint for attachments
      const imagePromises =
        detailedData.data.attachments?.map(async (attachment: any) => {
          if (!attachment.id) return { ...attachment, base64Data: null }

          try {
            // Get the auth token from localStorage (same as apiClient)
            const token = localStorage.getItem("auth_token")

            // Use the API endpoint to download the attachment with authentication
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/attachments/${attachment.id}`, {
              method: "GET",
              headers: {
                Accept: "*/*",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            })

            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

            const blob = await response.blob()

            if (attachment.fileType === "document") {
              // PDF Blob ko ArrayBuffer mein convert karo
              const arrayBuffer = await blob.arrayBuffer()

              // pdfjs se document load karo
              const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise

              // Check if PDF has many pages (heavy file)
              if (pdf.numPages > 5) {
                toast.info("Processing Heavy Files: Data contains heavy files, it takes some time to generate.", {
                  position: "top-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                });
              }

              const images: string[] = []

              // Har page ko render karo (agar tum sirf pehla page chahte ho to loop hata do)
              for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum)

                const viewport = page.getViewport({ scale: 1.5 })
                const canvas = document.createElement("canvas")
                const context = canvas.getContext("2d")!
                canvas.height = viewport.height
                canvas.width = viewport.width

                await page.render({ canvasContext: context, viewport, canvas }).promise

                const base64Data = canvas.toDataURL("image/png")
                images.push(base64Data)
              }

              // Agar multi-page PDF hai, sab pages ka array bhejo
              return { ...attachment, base64Data: images }
            } else {
              // Agar image hai to normal base64 convert
              const base64Data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result as string)
                reader.onerror = reject
                reader.readAsDataURL(blob)
              })

              return { ...attachment, base64Data }
            }
          } catch (error) {
            logger.error(`Failed to load image ${attachment.fileName}`, error)
            return { ...attachment, base64Data: null }
          }
        }) || []

      const attachmentsWithImages = await Promise.all(imagePromises)

      const dataWithImages = {
        ...detailedData.data,
        attachments: attachmentsWithImages,
      }

      // Set the application data and show the preview panel
      setSelectedApplicationData(dataWithImages)
      setPdfPreviewOpen(true)

      // Refetch applications after loading data
      await reload()
    } catch (error) {
      logger.error("Error generating PDF", error)
      Swal.fire({
        title: "Error",
        text: `Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
        icon: "error",
        confirmButtonText: "OK",
      })
    } finally {
      setGeneratingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(row.original.id)
        return newSet
      })
    }
  }

  const handleExport = () => {
    setIsFieldSelectionOpen(true)
  }

  const handleDownloadPDF = async () => {
    if (!selectedApplicationData) return;

    try {
      const blob = await generatePdfBlob(selectedApplicationData)
      const url = URL.createObjectURL(blob)
      window.open(url, "_blank")
    } catch (error) {
      logger.error("Error generating PDF", error)
      Swal.fire({
        title: "Error",
        text: `Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
        icon: "error",
        confirmButtonText: "OK",
      })
    }
  }

  const handleDetailView = () => {
    if (selectedApplicationData?.id) {
      // Open the detail view in a new tab using the route
      const detailUrl = `/applications/${selectedApplicationData.id}/details`
      window.open(detailUrl, '_blank')
    }
  }

  const handleDetailViewClose = () => {
    setDetailViewOpen(false)
    setSelectedApplicationData(null)
    setPdfPreviewOpen(false)
  }

  const handlePdfPreviewClose = () => {
    setPdfPreviewOpen(false)
    setSelectedApplicationData(null)
    setDetailViewOpen(false)
  }

  const handleDetailViewBack = () => {
    setDetailViewOpen(false)
    setPdfPreviewOpen(true)
  }

  const handleConfirmExport = async (fieldConfig: ExportFieldConfig, includeWaitingList: boolean, includeRejected: boolean) => {
    setIsExporting(true)
    setIsFieldSelectionOpen(false)

    try {
      const token = localStorage.getItem("auth_token")

      // Build query parameters
      const params = new URLSearchParams({
        includeWaitingList: includeWaitingList.toString(),
        includeRejected: includeRejected.toString(),
      })

      // Add field configuration
      params.append("fieldConfig", JSON.stringify(fieldConfig))

      const url = `${import.meta.env.VITE_API_BASE_URL}/api/v2/applications/exam-occurrence/${selectedExamOccurrence}/export?${params.toString()}`

      const response = await fetch(url, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

      const blob = await response.blob()

      const examName =
        selectedExamOccurrence !== "all"
          ? examOccurrences.find((examOccurrence) => examOccurrence.id.toString() === selectedExamOccurrence)?.title ||
          "Selected-Exam-Occurrence"
          : "All-Exam-Occurrences"

      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.setAttribute("download", `Applications_${examName}.xlsx`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)

      toast.success("Export Successful: Applications exported successfully.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      logger.error("Export error", error)
      Swal.fire({
        title: "Error",
        text: `Failed to export: ${error instanceof Error ? error.message : "Unknown error"}`,
        icon: "error",
        confirmButtonText: "OK",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const generatePdfBlob = async (data: any) => {
    // Check exam type and use appropriate PDF generator
    const isAKT = data.examOccurrence.type === "AKT"
    const doc = isAKT ? <ApplicationPDFCompleteAktApp data={data} /> : <ApplicationPDF data={data} />
    const asPdf = pdf()
    asPdf.updateContainer(doc)
    const blob = await asPdf.toBlob()
    return blob
  }

  const ApplicationPDF = ({ data }: any) => {
    logger.debug("Generating PDF for data", data);

    return (
      <Document>
        {/* Main application form page */}
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent1}>
              <Image src="/icon.png" style={styles.passportImage1} />
              <div className="text-center">
                <Text style={styles.title}>MRCGP [INT.] South Asia</Text>
                <Text style={styles.subtitle}>
                  Part 2 (OSCE) Examination Application
                </Text>
              </div>
            </View>
            {(() => {
              const passportAttachment = data.attachments?.find(
                (att: any) => att.fileName === "passport-image" && att.base64Data,
              )
              return passportAttachment ? (
                <Image src={passportAttachment.base64Data || "/placeholder.svg"} style={styles.passportImage} />
              ) : null
            })()}
          </View>

          {/* Main content - Resume style format */}
          <View style={styles.section}>
            {/* Candidate information section */}
            <View style={styles.resumeSection}>
              <View style={styles.resumeHeader}>
                <Text style={styles.resumeSectionTitle}>CANDIDATE INFORMATION</Text>
              </View>
              <View style={styles.resumeBody}>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Candidate ID:</Text>
                      <Text style={styles.fieldValue}>{data.candidateId || "Not provided"}</Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Full Name:</Text>
                      <Text style={styles.fieldValue}>{data.fullName || "Not provided"}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Contact information section */}
            <View style={styles.resumeSection}>
              <View style={styles.resumeHeader}>
                <Text style={styles.resumeSectionTitle}>CONTACT INFORMATION</Text>
              </View>
              <View style={styles.resumeBody}>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>WhatsApp:</Text>
                      <Text style={styles.fieldValue}>{data.personalContact || "Not provided"}</Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Emergency Contact:</Text>
                      <Text style={styles.fieldValue}>{data.emergencyContact || "Not provided"}</Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Email:</Text>
                      <Text style={styles.fieldValue}>{data.email || "Not provided"}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Address section */}

            <View style={styles.resumeSection}>
              <View style={styles.resumeHeader}>
                <Text style={styles.resumeSectionTitle}>CONTACT INFORMATION</Text>
              </View>
              <View style={styles.resumeBody}>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Street Address:</Text>
                      <Text style={styles.fieldValue}>{data.streetAddress || "No address"}</Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>District</Text>
                      <Text style={styles.fieldValue}>{data.district || ""}</Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>City:</Text>
                      <Text style={styles.fieldValue}>{data.city || ""}</Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>province:</Text>
                      <Text style={styles.fieldValue}>{data.province || ""}</Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Country:</Text>
                      <Text style={styles.fieldValue}>{data.country || ""}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Experience section */}
            <View style={styles.resumeSection}>
              <View style={styles.resumeHeader}>
                <Text style={styles.resumeSectionTitle}>EXPERIENCE</Text>
              </View>
              <View style={styles.resumeBody}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Date of passing Part 1:</Text>
                  <Text style={styles.fieldValue}>
                    {data.osceDetails?.aktPassingDate
                      ? format(new Date(data.osceDetails.aktPassingDate), "PPP")
                      : "Not provided"}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Previous OSCE attempts:</Text>
                  <Text style={styles.fieldValue}>{data.osceDetails?.previousOSCEAttempts || "Not provided"}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Country of experience:</Text>
                  <Text style={styles.fieldValue}>{data.clinicalExperienceCountry || "Not provided"}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Country of origin:</Text>
                  <Text style={styles.fieldValue}>{data.originCountry || "Not provided"}</Text>
                </View>
              </View>
            </View>

            {/* License details section */}
            <View style={styles.resumeSection}>
              <View style={styles.resumeHeader}>
                <Text style={styles.resumeSectionTitle}>LICENSE DETAILS</Text>
              </View>
              <View style={styles.resumeBody}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Registration authority:</Text>
                  <Text style={styles.fieldValue}>{data.registrationAuthority || "Not provided"}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Registration number:</Text>
                  <Text style={styles.fieldValue}>{data.registrationNumber || "Not provided"}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Date of registration:</Text>
                  <Text style={styles.fieldValue}>
                    {data.registrationDate ? format(new Date(data.registrationDate), "PPP") : "Not provided"}
                  </Text>
                </View>
              </View>
            </View>

            {/* OSCE Session Preferences */}
            <View style={styles.resumeSection}>
              <View style={styles.resumeHeader}>
                <Text style={styles.resumeSectionTitle}>OSCE SESSION PREFERENCES</Text>
              </View>
              <View style={styles.resumeBody}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Preference Date 1:</Text>
                  <Text style={styles.fieldValue}>
                    {!isNoPreferenceDate(data.osceDetails?.preferenceDate1)
                      ? format(new Date(data.osceDetails.preferenceDate1), "PPP")
                      : "Not Available"}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Preference Date 2:</Text>
                  <Text style={styles.fieldValue}>
                    {!isNoPreferenceDate(data.osceDetails?.preferenceDate2)
                      ? format(new Date(data.osceDetails.preferenceDate2), "PPP")
                      : "Not Available"}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Preference Date 3:</Text>
                  <Text style={styles.fieldValue}>
                    {!isNoPreferenceDate(data.osceDetails?.preferenceDate3)
                      ? format(new Date(data.osceDetails.preferenceDate3), "PPP")
                      : "Not Available"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Agreement */}
            <View style={styles.resumeSection}>
              <View style={styles.resumeHeader}>
                <Text style={styles.resumeSectionTitle}>AGREEMENT</Text>
              </View>
              <View style={styles.resumeBody}>

                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>OSCE Candidate Statement:</Text>
                  <Text style={styles.fieldValue}>
                    {data.osceDetails?.osceCandidateStatement ? "Agreed" : "Not agreed"}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.resumeSection}>
              <View style={styles.resumeHeader}>
                <Text style={styles.resumeSectionTitle}>Please Note</Text>
              </View>
              <View style={styles.resumeBody}>
                <View style={styles.fieldRow}>
                  <Text style={styles.note}>
                    THE NUMBER OF PLACES IS LIMITED, AND SLOTS WILL BE ALLOCATED ON THE "FIRST COME FIRST SERVED” BASIS.
                    Your application may be rejected because of a large number of applicants and you may be invited to
                    apply again or offered a slot at a subsequent examination. Priority will be given to applicants from
                    South Asia and those applications that reach us first, so we encourage you to apply as soon as
                    possible. WHILST WE WILL TRY TO ACCOMMODATE YOUR PREFERENCE, IT MAY NOT BE POSSIBLE DUE TO A LARGE
                    NUMBER OF APPLICANTS. Please email us well in advance if you require a letter of invitation for visa
                    purposes and make sure you complete all travel formalities in good time (visa applications, travel
                    permits, leaves, etc.) No Refunds will be granted in case any candidate fails to get the visa prior
                    to the exam date. Candidates with a disability are requested to read the rules and regulation
                    document [Page 10] available on the website The MRCGP [INT.] South Asia Secretariat will notify you
                    by email of your allocated date and time at least two weeks before the exam starting date.
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.resumeSection}>
              <View style={styles.resumeHeader}>
                <Text style={styles.resumeSectionTitle}>CANDIDATE'S STATEMENT</Text>
              </View>
              <View style={styles.resumeBody}>
                <View style={styles.fieldRow}>
                  <Text style={styles.note}>
                    I hereby apply to sit the South Asia MRCGP [INT.] Part 2 (OSCE) Examination, success in which will
                    allow me to apply for International Membership of the UK's Royal College of General Practitioners.
                    Detailed information on the membership application process can be found on the RCGP website: Member
                    Ship I have read and agree to abide by the conditions set out in the South Asia MRCGP [INT.]
                    Examination Rules and Regulations as published on the MRCGP [INT.] South Asia website:
                    www.mrcgpintsouthasia.org If accepted for International Membership, I undertake to continue approved
                    postgraduate study while I remain in active general practice/family practice, and to uphold and
                    promote the aims of the RCGP to the best of my ability. I understand that, on being accepted for
                    International Membership, an annual subscription fee is to be payable to the RCGP. I understand that
                    only registered International Members who maintain their RCGP subscription are entitled to use the
                    post-nominal designation "MRCGP [INT]". Success in the exam does not give me the right to refer to
                    myself as MRCGP [INT.]. I attach a banker's draft made payable to “MRCGP [INT.] South Asia”, I also
                    understand and agree that my personal data will be handled by the MRCGP [INT.] South Asia Board and
                    I also give permission for my personal data to be handled by the regional MRCGP [INT.] South Asia
                    co-ordinators..
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Page>

        {/* Each attachment on its own page */}
        {data.attachments &&
          data.attachments.flatMap((attachment: any, index: number) => {
            // Build a friendly label
            const label =
              attachment.fileName === "passport-image"
                ? "Passport Photo"
                : attachment.fileName?.toLowerCase()?.includes("medical_license")
                  ? "Medical License"
                  : attachment.fileName?.toLowerCase()?.includes("part_1_passing_email")
                    ? "Part 1 Passing Email"
                    : attachment.fileName?.toLowerCase()?.includes("passport_bio_page")
                      ? "Passport Bio Page"
                      : attachment.fileName?.toLowerCase()?.includes("signature")
                        ? "Signature"
                        : `Attachment ${index + 1}`

            // Normalize base64Data to an array to support multi-page PDFs
            const images: string[] = Array.isArray(attachment.base64Data)
              ? attachment.base64Data
              : attachment.base64Data
                ? [attachment.base64Data]
                : []

            // If we have no image data, skip rendering a page for this attachment
            if (images.length === 0) return []

            // Render one PDF page per image
            return images.map((imgSrc: string, pageIndex: number) => (
              <Page key={`${attachment.id || index}-${pageIndex}`} size="A4" style={styles.page}>
                <View style={styles.documentPage}>
                  <Text style={styles.documentPageTitle}>
                    {label}
                    {images.length > 1 ? ` - Page ${pageIndex + 1}` : ""}
                  </Text>
                  <Image src={imgSrc || "/placeholder.svg"} style={styles.documentPageImage} />
                  <View style={styles.documentPageFooter}>
                    <Text style={styles.documentPageFooterText}>
                      {data.fullName} - Candidate ID: {data.candidateId}
                    </Text>
                    <Text style={styles.documentPageFooterText}>{attachment.fileName}</Text>
                  </View>
                </View>
              </Page>
            ))
          })}
      </Document>
    )
  }

  const styles = StyleSheet.create({
    page: {
      padding: 30,
      backgroundColor: "#ffffff",
      fontFamily: "Helvetica",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
      paddingBottom: 10,
      borderBottomWidth: 2,
      borderBottomColor: "#6366f1",
      borderBottomStyle: "solid",
    },
    headerContent: {
      flex: 1,
    },
    headerContent1: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      gap: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#4f46e5",
      marginBottom: 5,
    },
    titleimage: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#4f46e5",
      marginBottom: 5,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
    },
    subtitle: {
      fontSize: 12,
      color: "#6b7280",
    },
    passportImage: {
      width: 80,
      height: 80,
      objectFit: "cover",
      borderRadius: 4,
      border: "1px solid #e5e7eb",
    },
    passportImage1: {
      width: 80,
      height: 80,
      objectFit: "cover",
    },
    section: {
      marginBottom: 10,
    },
    row: {
      flexDirection: "row",
      marginBottom: 5,
    },
    column: {
      flex: 1,
      paddingRight: 10,
    },
    resumeSection: {
      marginBottom: 15,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: "#e5e7eb",
      overflow: "hidden",
    },
    resumeHeader: {
      backgroundColor: "#6366f1",
      padding: 5,
    },
    resumeSectionTitle: {
      fontSize: 10,
      fontWeight: "bold",
      color: "white",
    },
    resumeBody: {
      padding: 8,
      backgroundColor: "#f9fafb",
    },
    fieldRow: {
      flexDirection: "row",
      marginBottom: 4,
    },
    fieldLabel: {
      fontSize: 9,
      fontWeight: "bold",
      marginRight: 5,
      flex: 1,
    },
    fieldValue: {
      fontSize: 9,
      flex: 2,
    },
    note: {
      fontSize: 10,
      flex: 2,
    },
    footer: {
      marginTop: 20,
      padding: 10,
      borderTopWidth: 1,
      borderTopColor: "#e5e7eb",
      borderTopStyle: "solid",
      textAlign: "center",
    },
    footerText: {
      fontSize: 8,
      color: "#6b7280",
    },
    // Document page styles
    documentPage: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    documentPageTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 20,
      color: "#4f46e5",
      textAlign: "center",
    },
    documentPageImage: {
      width: "90%",
      height: "70%",
      objectFit: "contain",
      marginBottom: 20,
      border: "1px solid #e5e7eb",
    },
    documentPageFooter: {
      position: "absolute",
      bottom: 20,
      width: "100%",
      textAlign: "center",
    },
    documentPageFooterText: {
      fontSize: 10,
      color: "#6b7280",
    },
    documentPageImageContainer: {
      width: "90%",
      height: "70%",
      justifyContent: "center",
      alignItems: "center",
      border: "1px solid #e5e7eb",
      backgroundColor: "#f9fafb",
      marginBottom: 20,
    },
    imagePlaceholderText: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#4f46e5",
      textAlign: "center",
      marginBottom: 10,
    },
    imageNoteText: {
      fontSize: 10,
      color: "#6b7280",
      textAlign: "center",
      paddingHorizontal: 10,
    },
  })
  const columnsWithActions = [...columns.filter((col: any) => col.id !== "actions"), actionColumn]

  return (
    <div>
      <Card className="shadow-lg border-0 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <CardHeader className="bg-[#5c347d] dark:bg-[#3b1f52] flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold text-white">Applications</CardTitle>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/30"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="dark:bg-slate-900 dark:border-slate-700">
                <DropdownMenuItem
                  onClick={() => handleFilterChange("all")}
                  className="dark:text-slate-200 dark:focus:bg-slate-800"
                >
                  All
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("SUBMITTED")}
                  className="dark:text-slate-200 dark:focus:bg-slate-800"
                >
                  Submitted
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("UNDER_REVIEW")}
                  className="dark:text-slate-200 dark:focus:bg-slate-800"
                >
                  Under Review
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("APPROVED")}
                  className="dark:text-slate-200 dark:focus:bg-slate-800"
                >
                  Approved
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("REJECTED")}
                  className="dark:text-slate-200 dark:focus:bg-slate-800"
                >
                  Rejected
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("waiting")}
                  className="dark:text-slate-200 dark:focus:bg-slate-800"
                >
                  Waiting
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/30 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 dark:bg-slate-900">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                {/* Exam Dropdown */}
                <div className="w-full md:w-80">
                  <Select value={selectedExamOccurrence} onValueChange={handleExamChange}>
                    <SelectTrigger className="w-full dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 border-[#5c347d]/20 focus:border-[#5c347d] focus:ring-[#5c347d]/20">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-[#5c347d] dark:text-[#8b5fbf]" />
                        <SelectValue placeholder="Select Exam Occurrence" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                      {examOccurrences.map((examOccurrence: any) => (
                        <SelectItem
                          key={examOccurrence.id}
                          value={examOccurrence.id.toString()}
                          className="dark:text-slate-200 dark:focus:bg-slate-800 focus:bg-[#5c347d]/10 focus:text-[#5c347d]"
                        >
                          {examOccurrence.title} - {examOccurrence.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Page Size Selector */}
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-[#5c347d] dark:text-[#8b5fbf]" />
                  <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className="w-20 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 border-[#5c347d]/20 focus:border-[#5c347d] focus:ring-[#5c347d]/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                      <SelectItem value="10" className="dark:text-slate-200 dark:focus:bg-slate-800">10</SelectItem>
                      <SelectItem value="20" className="dark:text-slate-200 dark:focus:bg-slate-800">20</SelectItem>
                      <SelectItem value="30" className="dark:text-slate-200 dark:focus:bg-slate-800">30</SelectItem>
                      <SelectItem value="50" className="dark:text-slate-200 dark:focus:bg-slate-800">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-slate-600 dark:text-slate-400">per page</span>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-slate-400" />
                  <Input
                    placeholder="Search by SNO, name, email, candidate ID..."
                    className="pl-8 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 border-[#5c347d]/20 focus:border-[#5c347d] focus:ring-[#5c347d]/20"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Selected Exam Occurrence Info */}
            {selectedExamOccurrence !== "all" && (
              <div className="mb-4 p-3 bg-[#5c347d]/10 dark:bg-[#3b1f52]/20 rounded-md border border-[#5c347d]/20 dark:border-[#3b1f52]/30">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-[#5c347d] dark:text-[#8b5fbf]" />
                  <span className="font-medium dark:text-slate-200 text-slate-700">
                    Showing applications for:{" "}
                    <span className="text-[#5c347d] dark:text-[#8b5fbf] font-semibold">
                      {examOccurrences.find((examOccurrence: any) => examOccurrence.id.toString() === selectedExamOccurrence)?.title || "N/A"}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Active Filter Info */}
            {activeFilter !== "all" && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Filter className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium dark:text-slate-200 text-slate-700">
                      Filter applied:{" "}
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        {activeFilter === "SUBMITTED" ? "Submitted" :
                          activeFilter === "UNDER_REVIEW" ? "Under Review" :
                            activeFilter === "APPROVED" ? "Approved" :
                              activeFilter === "REJECTED" ? "Rejected" :
                                activeFilter === "waiting" ? "Waiting" : activeFilter}
                      </span>
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange("all")}
                    className="ml-4 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30"
                  >
                    Clear Filter
                  </Button>
                </div>
              </div>
            )}
          </div>

          {loadState === "loading" && (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5c347d] mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading applications...</p>
              </div>
            </div>
          )}

          {loadState === "error" && (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">Error loading applications: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-[#5c347d] text-white rounded hover:bg-[#4a2a68]"
              >
                Retry
              </button>
            </div>
          )}

          {loadState === "success" && (
            <DataTable
              columns={columnsWithActions}
              data={applications}
              pagination={{
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onPageChange: handlePageChange,
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Field Selection Dialog */}
      <FieldSelectionDialog
        isOpen={isFieldSelectionOpen}
        onClose={() => setIsFieldSelectionOpen(false)}
        onExport={handleConfirmExport}
        isExporting={isExporting}
      />

      {/* PDF Preview Panel */}
      <PDFPreviewPanel
        isOpen={pdfPreviewOpen}
        onClose={handlePdfPreviewClose}
        applicationData={selectedApplicationData}
        onDownloadPDF={handleDownloadPDF}
        onDetailView={handleDetailView}
        isLoading={generatingIds.size > 0}
      />

      {/* Application Detail View */}
      <ApplicationDetailView
        isOpen={detailViewOpen}
        onClose={handleDetailViewClose}
        applicationData={selectedApplicationData}
        onDownloadPDF={handleDownloadPDF}
        onBack={handleDetailViewBack}
      />
    </div>
  )
}
