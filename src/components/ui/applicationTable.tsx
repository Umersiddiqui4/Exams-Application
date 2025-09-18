
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./card";
import { Input } from "./input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
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
} from "./select";
import { Calendar, Download, Filter, Loader2, Search, Settings } from "lucide-react";
import { DataTable } from "../data-table";
import { useEffect, useState } from "react";
import { useApplications } from "@/lib/useApplications";
import { useExamOccurrences } from "@/lib/useExamOccurrences";
import { columns } from "../columns";
import { format } from "date-fns";
import { pdf } from "@react-pdf/renderer";
import Swal from "sweetalert2";

export default function ApplicationTable() {

      const [activeFilter, setActiveFilter] = useState<string>("all");
      const [selectedExamOccurrence, setSelectedExamOccurrence] = useState<string>("all");
      const [isExporting, setIsExporting] = useState(false);
      const [pdfGenerating] = useState(false);
      const [searchQuery, setSearchQuery] = useState<string>("");
      const { items: examOccurrences } = useExamOccurrences();
      const [pageSize, setPageSize] = useState(10);
      const { applications, review, loadState, error, pagination, setPageSize: updatePageSize, setPageIndex } = useApplications(
        selectedExamOccurrence === "all" ? undefined : selectedExamOccurrence,
        activeFilter === "all" ? undefined : activeFilter,
        pageSize
      );

      useEffect(() => {
       const currentExamOccurrence: any = examOccurrences[examOccurrences.length - 1];
       if(currentExamOccurrence && currentExamOccurrence.id) {
       setSelectedExamOccurrence(currentExamOccurrence.id.toString());
       }
      }, [examOccurrences]);
      
      console.log("Selected Exam Occurrence:", selectedExamOccurrence);
      console.log("Exam Occurrences:", examOccurrences);
      

    const actionColumn = {
        id: "actions",
        header: "Action",
        cell: ({ row }: { row: any }) => {
          const id = row.original.id;
          const status = row.original.status;
    
          return (
            <div className="flex space-x-2">
              {(status === "SUBMITTED" || status === "UNDER_REVIEW") && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-400 border-green-200 dark:border-green-800"
                    onClick={() => handleStatusChange(id, "approved")}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 border-red-200 dark:border-red-800"
                    onClick={() => handleStatusChange(id, "rejected")}
                  >
                    <XIcon className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}
    
              <Button
                onClick={() => handlePdfGenerate(row)}
                disabled={pdfGenerating}
                className="bg-red-400 hover:bg-red-200 text-white dark:bg-red-900 dark:hover:bg-blue-900/50 dark:text-white border-blue-200 dark:border-blue-800"
              >
                PDF
              </Button>
            </div>
          );
        },
      };

      const handleStatusChange = async (id: string, status: "approved" | "rejected") => {
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
              'aria-label': 'Admin notes'
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
            await review(id, "APPROVED", result.value || undefined);

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
                return 'You need to provide a reason for rejection!';
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
            await review(id, "REJECTED", result.value);
          }
        }
      }
    
    
      const handleExamChange = (value: string) => {
        setSelectedExamOccurrence(value);
      };
    
      const handlePdfGenerate = async (row: any) => {
        const blob = await generatePdfBlob(row.original, {
          passport: row.original.passportUrl,
          medicalLicense: row.original.medicalLicenseUrl,
          part1Email: row.original.part1EmailUrl,
          passportBio: row.original.passportBioUrl,
          signature: row.original.signatureUrl,
        });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      };
    
      const handleExport = () => {
        setIsExporting(true);
    
        // Default: all applications
        let dataToExport = applications;
    
        const exportData = dataToExport.map((app, index) => ({
          "S/No": index + 1,
          "Condidate ID#": app.candidateId,
          Profile: app.passportUrl,
          "Application Date": app.createdAt,
          Name: app.fullName,
          Email: app.email,
          WhatsApp: app.personalContact,
          "Emergency Contact": app.emergencyContact,
          "Residential Street Address": app.streetAddress,
          "Residential District": app.district,
          "Residential City/Town/Village": app.city,
          "Residential Province/Region": app.province,
          "Residential Country": app.country,
          "Date of passing Part 1 exam": app.dateOfPassingPart1,
          "Date of passing Part 2 exam": "0000-00-00",
          "Country of PG clinical": "Country",
          "Country of ethnic origin": app.originCountry,
          "Registration Authority": app.registrationAuthority,
          "Registration Number": app.registrationNumber,
          "Registration Date": app.registrationDate,
          "Preference Date 1": app.preferenceDate1,
          "Preference Date 2": app.preferenceDate2,
          "Preference Date 3": app.preferenceDate3,
          Status: app.status,
          Action: "PDF",
        }));
    
        setTimeout(() => {
          try {
            const headers = Object.keys(exportData[0]);
            const csvContent = [
              headers.join("\t"),
              ...exportData.map((row) =>
                headers
                  .map((header) => {
                    const cell = row[header as keyof typeof row];
                    const cellStr = String(cell);
                    return cellStr.includes("\t") || cellStr.includes('"')
                      ? `"${cellStr.replace(/"/g, '""')}"`
                      : cellStr;
                  })
                  .join("\t")
              ),
            ].join("\n");
    
            const BOM = "\uFEFF";
            const blob = new Blob([BOM + csvContent], {
              type: "text/csv;charset=utf-16",
            });
    
            const examName =
              selectedExamOccurrence !== "all"
                ? examOccurrences.find((examOccurrence) => examOccurrence.id.toString() === selectedExamOccurrence)
                    ?.title || "Selected-Exam-Occurrence"
                : "All-Exam-Occurrences";
    
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Applications_${examName}.xls`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
    
            setIsExporting(false);
          } catch (error) {
            console.error("Export error:", error);
            setIsExporting(false);
          }
        }, 500);
      };

      const generatePdfBlob = async (data: any, images: any) => {
        const doc = <ApplicationPDF data={data} images={images} />;
        const asPdf = pdf();
        asPdf.updateContainer(doc);
        const blob = await asPdf.toBlob();
        return blob;
      };

      const ApplicationPDF = ({ data, images }: any) => {
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
                {images.passport && (
                  <Image
                    src={images.passport || "/placeholder.svg"}
                    style={styles.passportImage}
                  />
                )}
              </View>
    
              {/* Main content - Resume style format */}
              <View style={styles.section}>
                {/* Candidate information section */}
                <View style={styles.resumeSection}>
                  <View style={styles.resumeHeader}>
                    <Text style={styles.resumeSectionTitle}>
                      CANDIDATE INFORMATION
                    </Text>
                  </View>
                  <View style={styles.resumeBody}>
                    <View style={styles.row}>
                      <View style={styles.column}>
                        <View style={styles.fieldRow}>
                          <Text style={styles.fieldLabel}>Candidate ID:</Text>
                          <Text style={styles.fieldValue}>
                            {data.candidateId || "Not provided"}
                          </Text>
                        </View>
                        <View style={styles.fieldRow}>
                          <Text style={styles.fieldLabel}>Full Name:</Text>
                          <Text style={styles.fieldValue}>
                            {data.fullName || "Not provided"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
    
                {/* Contact information section */}
                <View style={styles.resumeSection}>
                  <View style={styles.resumeHeader}>
                    <Text style={styles.resumeSectionTitle}>
                      CONTACT INFORMATION
                    </Text>
                  </View>
                  <View style={styles.resumeBody}>
                    <View style={styles.row}>
                      <View style={styles.column}>
                        <View style={styles.fieldRow}>
                          <Text style={styles.fieldLabel}>WhatsApp:</Text>
                          <Text style={styles.fieldValue}>
                            {data.personalContact || "Not provided"}
                          </Text>
                        </View>
                        <View style={styles.fieldRow}>
                          <Text style={styles.fieldLabel}>Emergency Contact:</Text>
                          <Text style={styles.fieldValue}>
                            {data.emergencyContact || "Not provided"}
                          </Text>
                        </View>
                        <View style={styles.fieldRow}>
                          <Text style={styles.fieldLabel}>Email:</Text>
                          <Text style={styles.fieldValue}>
                            {data.email || "Not provided"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
    
                {/* Address section */}
    
                <View style={styles.resumeSection}>
                  <View style={styles.resumeHeader}>
                    <Text style={styles.resumeSectionTitle}>
                      CONTACT INFORMATION
                    </Text>
                  </View>
                  <View style={styles.resumeBody}>
                    <View style={styles.row}>
                      <View style={styles.column}>
                        <View style={styles.fieldRow}>
                          <Text style={styles.fieldLabel}>Street Address:</Text>
                          <Text style={styles.fieldValue}>
                            {data.streetAddress || "No address"}
                          </Text>
                        </View>
                        <View style={styles.fieldRow}>
                          <Text style={styles.fieldLabel}>District</Text>
                          <Text style={styles.fieldValue}>
                            {data.district || ""}
                          </Text>
                        </View>
                        <View style={styles.fieldRow}>
                          <Text style={styles.fieldLabel}>City:</Text>
                          <Text style={styles.fieldValue}>{data.city || ""}</Text>
                        </View>
                        <View style={styles.fieldRow}>
                          <Text style={styles.fieldLabel}>province:</Text>
                          <Text style={styles.fieldValue}>
                            {data.province || ""}
                          </Text>
                        </View>
                        <View style={styles.fieldRow}>
                          <Text style={styles.fieldLabel}>Country:</Text>
                          <Text style={styles.fieldValue}>
                            {data.country || ""}
                          </Text>
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
                        {data.dateOfPassingPart1 || "Not provided"}
                      </Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Previous OSCE attempts:</Text>
                      <Text style={styles.fieldValue}>
                        {data.previousOsceAttempts || "Not provided"}
                      </Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Country of experience:</Text>
                      <Text style={styles.fieldValue}>
                        {data.clinicalExperienceCountry || "Not provided"}
                      </Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Country of origin:</Text>
                      <Text style={styles.fieldValue}>
                        {data.originCountry || "Not provided"}
                      </Text>
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
                      <Text style={styles.fieldValue}>
                        {data.registrationAuthority || "Not provided"}
                      </Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Registration number:</Text>
                      <Text style={styles.fieldValue}>
                        {data.registrationNumber || "Not provided"}
                      </Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Date of registration:</Text>
                      <Text style={styles.fieldValue}>
                        {data.dateOfRegistration
                          ? format(data.dateOfRegistration, "PPP")
                          : "Not provided"}
                      </Text>
                    </View>
                  </View>
                </View>
    
                {/* OSCE Session Preferences */}
                <View style={styles.resumeSection}>
                  <View style={styles.resumeHeader}>
                    <Text style={styles.resumeSectionTitle}>
                      OSCE SESSION PREFERENCES
                    </Text>
                  </View>
                  <View style={styles.resumeBody}>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Preference Date 1:</Text>
                      <Text style={styles.fieldValue}>
                        {data.preferenceDate1
                          ? format(new Date(data.preferenceDate1), "PPP")
                          : "Not provided"}
                      </Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Preference Date 2:</Text>
                      <Text style={styles.fieldValue}>
                        {data.preferenceDate2
                          ? format(new Date(data.preferenceDate2), "PPP")
                          : "Not provided"}
                      </Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Preference Date 3:</Text>
                      <Text style={styles.fieldValue}>
                        {data.preferenceDate3
                          ? format(new Date(data.preferenceDate3), "PPP")
                          : "Not provided"}
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
                      <Text style={styles.fieldLabel}>Name:</Text>
                      <Text style={styles.fieldValue}>
                        {data.agreementName || "Not provided"}
                      </Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Date:</Text>
                      <Text style={styles.fieldValue}>
                        {data.agreementDate
                          ? format(data.agreementDate, "PPP")
                          : "Not provided"}
                      </Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Terms Agreed:</Text>
                      <Text style={styles.fieldValue}>
                        {data.termsAgreed ? "Yes" : "No"}
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
                        THE NUMBER OF PLACES IS LIMITED, AND SLOTS WILL BE ALLOCATED
                        ON THE "FIRST COME FIRST SERVED” BASIS. Your application may
                        be rejected because of a large number of applicants and you
                        may be invited to apply again or offered a slot at a
                        subsequent examination. Priority will be given to applicants
                        from South Asia and those applications that reach us first,
                        so we encourage you to apply as soon as possible. WHILST WE
                        WILL TRY TO ACCOMMODATE YOUR PREFERENCE, IT MAY NOT BE
                        POSSIBLE DUE TO A LARGE NUMBER OF APPLICANTS. Please email
                        us well in advance if you require a letter of invitation for
                        visa purposes and make sure you complete all travel
                        formalities in good time (visa applications, travel permits,
                        leaves, etc.) No Refunds will be granted in case any
                        candidate fails to get the visa prior to the exam date.
                        Candidates with a disability are requested to read the rules
                        and regulation document [Page 10] available on the website
                        The MRCGP [INT.] South Asia Secretariat will notify you by
                        email of your allocated date and time at least two weeks
                        before the exam starting date.
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.resumeSection}>
                  <View style={styles.resumeHeader}>
                    <Text style={styles.resumeSectionTitle}>
                      CANDIDATE'S STATEMENT
                    </Text>
                  </View>
                  <View style={styles.resumeBody}>
                    <View style={styles.fieldRow}>
                      <Text style={styles.note}>
                        I hereby apply to sit the South Asia MRCGP [INT.] Part 2
                        (OSCE) Examination, success in which will allow me to apply
                        for International Membership of the UK's Royal College of
                        General Practitioners. Detailed information on the
                        membership application process can be found on the RCGP
                        website: Member Ship I have read and agree to abide by the
                        conditions set out in the South Asia MRCGP [INT.]
                        Examination Rules and Regulations as published on the MRCGP
                        [INT.] South Asia website: www.mrcgpintsouthasia.org If
                        accepted for International Membership, I undertake to
                        continue approved postgraduate study while I remain in
                        active general practice/family practice, and to uphold and
                        promote the aims of the RCGP to the best of my ability. I
                        understand that, on being accepted for International
                        Membership, an annual subscription fee is to be payable to
                        the RCGP. I understand that only registered International
                        Members who maintain their RCGP subscription are entitled to
                        use the post-nominal designation "MRCGP [INT]". Success in
                        the exam does not give me the right to refer to myself as
                        MRCGP [INT.]. I attach a banker's draft made payable to
                        “MRCGP [INT.] South Asia”, I also understand and agree that
                        my personal data will be handled by the MRCGP [INT.] South
                        Asia Board and I also give permission for my personal data
                        to be handled by the regional MRCGP [INT.] South Asia
                        co-ordinators..
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Page>
    
            {/* Each document on its own page */}
            {images.medicalLicense && (
              <Page size="A4" style={styles.page}>
                <View style={styles.documentPage}>
                  <Text style={styles.documentPageTitle}>Medical License</Text>
                  <Image
                    src={images.medicalLicense || "/placeholder.svg"}
                    style={styles.documentPageImage}
                  />
                  <View style={styles.documentPageFooter}>
                    <Text style={styles.documentPageFooterText}>
                      {data.fullName} - Candidate ID: {data.candidateId}
                    </Text>
                  </View>
                </View>
              </Page>
            )}
    
            {images.part1Email && (
              <Page size="A4" style={styles.page}>
                <View style={styles.documentPage}>
                  <Text style={styles.documentPageTitle}>Part 1 Passing Email</Text>
                  <Image
                    src={images.part1Email || "/placeholder.svg"}
                    style={styles.documentPageImage}
                  />
                  <View style={styles.documentPageFooter}>
                    <Text style={styles.documentPageFooterText}>
                      {data.fullName} - Candidate ID: {data.candidateId}
                    </Text>
                  </View>
                </View>
              </Page>
            )}
    
            {images.passportBio && (
              <Page size="A4" style={styles.page}>
                <View style={styles.documentPage}>
                  <Text style={styles.documentPageTitle}>Passport Bio Page</Text>
                  <Image
                    src={images.passportBio || "/placeholder.svg"}
                    style={styles.documentPageImage}
                  />
                  <View style={styles.documentPageFooter}>
                    <Text style={styles.documentPageFooterText}>
                      {data.fullName} - Candidate ID: {data.candidateId}
                    </Text>
                  </View>
                </View>
              </Page>
            )}
    
            {images.signature && (
              <Page size="A4" style={styles.page}>
                <View style={styles.documentPage}>
                  <Text style={styles.documentPageTitle}>Signature</Text>
                  <Image
                    src={images.signature || "/placeholder.svg"}
                    style={styles.documentPageImage}
                  />
                  <View style={styles.documentPageFooter}>
                    <Text style={styles.documentPageFooterText}>
                      {data.fullName} - Candidate ID: {data.candidateId}
                    </Text>
                  </View>
                </View>
              </Page>
            )}
          </Document>
        );
      };

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
      });
      const columnsWithActions = [
        ...columns.filter((col: any) => col.id !== "actions"),
        actionColumn,
      ];


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
                  onClick={() => setActiveFilter("all")}
                  className="dark:text-slate-200 dark:focus:bg-slate-800"
                >
                  All
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActiveFilter("DRAFT")}
                  className="dark:text-slate-200 dark:focus:bg-slate-800"
                >
                  Draft
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActiveFilter("SUBMITTED")}
                  className="dark:text-slate-200 dark:focus:bg-slate-800"
                >
                  Submitted
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActiveFilter("UNDER_REVIEW")}
                  className="dark:text-slate-200 dark:focus:bg-slate-800"
                >
                  Under Review
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActiveFilter("APPROVED")}
                  className="dark:text-slate-200 dark:focus:bg-slate-800"
                >
                  Approved
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActiveFilter("REJECTED")}
                  className="dark:text-slate-200 dark:focus:bg-slate-800"
                >
                  Rejected
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActiveFilter("APPLIED")}
                  className="dark:text-slate-200 dark:focus:bg-slate-800"
                >
                  Applied
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
                <div className="w-full md:w-64">
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
                  <Select value={pageSize.toString()} onValueChange={(value) => {
                    const newSize = parseInt(value);
                    setPageSize(newSize);
                    updatePageSize(newSize);
                    // Reset to first page when page size changes
                    setPageIndex(0);
                  }}>
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
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-slate-400" />
                  <Input
                    placeholder="Search by SNO, name, email, candidate ID..."
                    className="pl-8 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 border-[#5c347d]/20 focus:border-[#5c347d] focus:ring-[#5c347d]/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                onPageChange: setPageIndex,
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
