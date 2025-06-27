"use client";

import Swal from "sweetalert2";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { CardDescription } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye } from "lucide-react";
import "react-phone-number-input/style.css";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  incrementApplicationsCount,
  selectExams,
  toggleBlockExam,
} from "@/redux/examDataSlice";
import { supabase } from "@/lib/supabaseClient";
import { addApplication } from "@/redux/applicationsSlice";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useMemo } from "react";
import NotFound from "./ui/notFound";
import ExamClosedApp from "./ui/examClosedApplication";
import ExamClosed from "./ui/examClosed";
import "../App.css";

import {
  ApplicationPDFComplete,
  ApplicationPDFCompletePreview,
} from "./ui/pdf-generator";
import {
  aktsFormDefaultValues,
  aktsFormSchema,
  AktsFormValues,
  formDefaultValues,
  formSchema,
  FormValues,
} from "./schema/applicationSchema";
import { OsceFeilds } from "@/hooks/osceFeilds";
import { AktFeilds } from "@/hooks/aktFeilds";


export function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<any>([]);
  const [medicalLicensePreview, setMedicalLicensePreview] = useState<
    string | null
  >(null);
  const [part1EmailPreview, setPart1EmailPreview] = useState<string | null>(
    null
  );
  const [passportBioPreview, setPassportBioPreview] = useState<string | null>(
    null
  );
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [pdfGenerating] = useState(false);
  const [isExamClosed, setIsExamClosed] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [warning, setWarning] = useState(false);
  const exams = useSelector(selectExams);
  const params = useParams();
  const dispatch = useDispatch();

  if (!params.examId) return null;

  const selectedExam = exams.find((exam) => exam.id === params.examId);

  const osceForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: formDefaultValues,
    shouldUnregister: false,
    mode: "onChange", // ✅ Added real-time validation
  });

  const aktsForm = useForm<AktsFormValues>({
    resolver: zodResolver(aktsFormSchema),
    defaultValues: aktsFormDefaultValues,
    shouldUnregister: false,
    mode: "onBlur", // ✅ Added real-time validation
  });

  // ✅ Removed useState for currentForm, now using direct reference
  const [selectedExamType, setSelectedExamType] = useState<boolean>(false);

  const currentForm: any = !selectedExamType ? osceForm : aktsForm;

  useEffect(() => {
    const subscription = (selectedExamType ? aktsForm : osceForm).watch(
      (values) => {
        console.log("Watching values:", values);
      }
    ) as unknown as { unsubscribe: () => void }; // 🔥 Trick TypeScript here

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedExamType]);

  useEffect(() => {
    if (selectedExam && selectedExam.examType === "AKTs") {
      setSelectedExamType(true);
    }
  }, [selectedExam]);

  // ✅ Reset form errors when switching exam types
  useEffect(() => {
    if (selectedExamType) {
      // Clear OSCE form errors
      osceForm.clearErrors();
    } else {
      // Clear AKTs form errors
      aktsForm.clearErrors();
    }
  }, [selectedExamType, osceForm, aktsForm]);

  console.log("Selected Exam Type:", selectedExamType);

  // Prepare images for PDF
  const pdfImages = useMemo(() => {
    return {
      passport: passportPreview,
      medicalLicense: medicalLicensePreview,
      part1Email: part1EmailPreview,
      passportBio: passportBioPreview,
      signature: signaturePreview,
    };
  }, [
    passportPreview,
    medicalLicensePreview,
    part1EmailPreview,
    passportBioPreview,
    signaturePreview,
  ]);

  useEffect(() => {
    if (selectedExam && new Date(selectedExam.closingDate) < new Date()) {
      setIsExamClosed(true);
    } else {
      setIsExamClosed(false);
    }
    if (selectedExam && selectedExam.isBlocked === true) {
      setIsClosed(true);
    } else {
      setIsClosed(false);
    }
  }, [selectedExam]);

  async function onSubmit(data: AktsFormValues | FormValues) {
    console.log("Form data being submitted:", data);

    try {
      setIsSubmitting(true);

      const isValid = await currentForm.trigger();
      if (!isValid) {
        console.log("Form validation failed");
        setIsSubmitting(false);
        return;
      }

      // Manual validations
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!data.whatsapp || data.whatsapp.length < 8) {
        currentForm.setError("whatsapp", {
          type: "manual",
          message: "Please enter a valid phone number",
        });
        setIsSubmitting(false);
        return;
      }
      if (!phoneRegex.test(data.emergencyContact)) {
        currentForm.setError("emergencyContact", {
          type: "manual",
          message: "Please enter a valid phone number",
        });
        setIsSubmitting(false);
        return;
      }

      if (!params.examId || !selectedExam) {
        alert("Exam ID is missing or invalid. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Optional file validation (OSCE-only)
      if (!selectedExamType) {
        if (
          signaturePreview === null ||
          medicalLicensePreview === null ||
          passportBioPreview === null
        ) {
          setWarning(true);
          setIsSubmitting(false);
          return;
        }
        setWarning(false);
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
      });

      if (!result.isConfirmed) {
        setIsSubmitting(false);
        return;
      }

      const isPendingAvailable =
        selectedExam.receivingApplicationsCount <
        selectedExam.applicationsLimit;
      const isWaitingAvailable =
        selectedExam.receivingApplicationsCount <
        selectedExam.applicationsLimit + selectedExam.waitingLimit;

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
        dateOfRegistration: data.dateOfRegistration
          ? new Date(data.dateOfRegistration)
          : new Date(),

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
                ? new Date(
                    (data as AktsFormValues).QualificationDate
                  ).toISOString()
                : "",
              candidateId: (data as AktsFormValues).candidateId || "",
              candidateStatementA:
                (data as AktsFormValues).candidateStatementA || false,
              candidateStatementB:
                (data as AktsFormValues).candidateStatementB || false,
              candidateStatementC:
                (data as AktsFormValues).candidateStatementC || false,
              examinationCenter:
                (data as AktsFormValues).examinationCenter || "",
              attachments: attachments.map((att: any) => ({
                id: att.id,
                attachmentUrl: att.attachmentUrl || "",
                title: att.title || "",
              })),
            }
          : {
              medicalLicenseUrl: medicalLicensePreview || "",
              part1EmailUrl: part1EmailPreview || "",
              passportBioUrl: passportBioPreview || "",
              part1PassingEmailUrl: part1EmailPreview || "",
            }),
      };

      // Decide status and dispatch
      if (isPendingAvailable) {
        application.status = "pending";
      } else if (isWaitingAvailable) {
        application.status = "waiting";
      } else {
        dispatch(toggleBlockExam(params.examId));
        Swal.fire({
          title: "Error",
          text: "No more slots available for this exam.",
          icon: "error",
          confirmButtonColor: "#6366f1",
        });
        setIsSubmitting(false);
        return;
      }

      // Final dispatch
      dispatch(addApplication(application));
      dispatch(incrementApplicationsCount(params.examId));

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
          document
            .getElementById("pdf-preview-link")
            ?.addEventListener("click", (e) => {
              e.preventDefault();
              document.getElementById("pdf-download-link")?.click();
            });
        },
      }).then(() => {
        setTimeout(() => window.location.reload(), 2000);
      });
    } catch (err) {
      console.error("Submission error:", err);
      Swal.fire({
        title: "Error",
        text: "Something went wrong during submission.",
        icon: "error",
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const validateFile = async (file: File, inputId: string) => {
    // List of input IDs that require validation
    const validateThese = ["passport-image"];

    // Reset error
    setFileError(null);

    // Only validate if inputId is in the validation list
    if (validateThese.includes(inputId)) {
      // Check file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setFileError(
          `Invalid file format. Only PNG and JPG formats are supported.`
        );
        const fileInput = document.getElementById(inputId) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        return false;
      }

      // Check file size (2MB = 2 * 1024 * 1024 bytes)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        setFileError(
          `File size exceeds 2MB limit. Please choose a smaller file.`
        );
        const fileInput = document.getElementById(inputId) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        return false;
      }
    }

    // Upload to Supabase
    const fileName = `${inputId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from("restaurant-images")
      .upload(fileName, file);

    if (error) {
      setFileError("Upload failed. Please try again.");
      return false;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("restaurant-images")
      .getPublicUrl(fileName);
    const publicUrl = publicUrlData?.publicUrl;

    if (!publicUrl) {
      setFileError("Could not retrieve image URL.");
      return false;
    }

    // Set image URL in preview state
    switch (inputId) {
      case "passport-image":
        setPassportPreview(publicUrl);
        break;
      case "medical-license":
        setMedicalLicensePreview(publicUrl);
        break;
      case "part1-email":
        setPart1EmailPreview(publicUrl);
        break;
      case "passport-bio":
        setPassportBioPreview(publicUrl);
        break;
      case "signature":
        setSignaturePreview(publicUrl);
        break;
      case "attachment":
        setAttachmentUrl(publicUrl);
        return publicUrl; // Return URL for attachments
        break;
    }

    return true;
  };

  useEffect(() => {
    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      if (passportPreview) URL.revokeObjectURL(passportPreview);
      if (medicalLicensePreview) URL.revokeObjectURL(medicalLicensePreview);
      if (part1EmailPreview) URL.revokeObjectURL(part1EmailPreview);
      if (passportBioPreview) URL.revokeObjectURL(passportBioPreview);
      if (signaturePreview) URL.revokeObjectURL(signaturePreview);
    };
  }, [
    passportPreview,
    medicalLicensePreview,
    part1EmailPreview,
    passportBioPreview,
    signaturePreview,
  ]);

  // Update selected dates when form values change

  const candidateId = currentForm.watch("candidateId");

  useEffect(() => {
    if (candidateId && candidateId.length > 7) {
      currentForm.setValue("candidateId", "");
    }
  }, [candidateId]);

  function test() {
    setTimeout(() => {
      const pdfBlob = document.getElementById("pdf-download-preview-link");
      if (pdfBlob) {
        // @ts-ignore
        const pdfUrl = pdfBlob.href;
        window.open(pdfUrl, "_blank");
      }
    }, 200);
  }

  if (isExamClosed) {
    return <ExamClosed />;
  }
  if (isClosed) {
    return <ExamClosedApp />;
  }
  if (selectedExam === undefined) return <NotFound />;

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
              {selectedExam
                ? selectedExam.name + " - " + selectedExam.location
                : ""}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Form {...currentForm}>
            <form
              onSubmit={currentForm.handleSubmit(onSubmit)}
              className="space-y-8"
            >
              {/* Personal and Contact Information */}

              {!selectedExamType ? (
                <OsceFeilds
                  currentForm={currentForm}
                  selectedExamType={selectedExamType}
                  setPassportPreview={setPassportPreview}
                  passportPreview={passportPreview}
                  fileError={fileError}
                  validateFile={validateFile}
                  warning={warning}
                  setMedicalLicensePreview={setMedicalLicensePreview}
                  medicalLicensePreview={medicalLicensePreview}
                  setPart1EmailPreview={setPart1EmailPreview}
                  part1EmailPreview={part1EmailPreview}
                  setPassportBioPreview={setPassportBioPreview}
                  passportBioPreview={passportBioPreview}
                  setSignaturePreview={setSignaturePreview}
                  signaturePreview={signaturePreview}
                  selectedExam={selectedExam}
                />
              ) : (
                <AktFeilds
                  currentForm={currentForm}
                  selectedExamType={selectedExamType}
                  setPassportPreview={setPassportPreview}
                  passportPreview={passportPreview}
                  fileError={fileError}
                  validateFile={validateFile}
                  selectedExam={selectedExam}
                  attachmentUrl={attachmentUrl}
                  attachments={attachments}
                  setAttachments={setAttachments}
                />
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <PDFDownloadLink
                  id="pdf-download-link"
                  document={
                    <ApplicationPDFComplete
                      data={currentForm.getValues()}
                      images={pdfImages}
                    />
                  }
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
                  document={
                    <ApplicationPDFCompletePreview
                      data={currentForm.getValues()}
                      images={pdfImages}
                    />
                  }
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
                    currentForm.handleSubmit(test)();
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
                      const pdfBlob =
                        document.getElementById("pdf-download-link");
                      if (pdfBlob) {
                        // @ts-ignore
                        const pdfUrl = pdfBlob.href;
                        window.open(pdfUrl, "_blank");
                        currentForm.reset();
                        setPassportPreview(null);
                        setMedicalLicensePreview(null);
                        setPart1EmailPreview(null);
                        setPassportBioPreview(null);
                        setSignaturePreview(null);
                      }
                    }, 500); // Increased timeout to ensure PDF generation completes
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
  );
}
export default ApplicationForm;
