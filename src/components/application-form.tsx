"use client";

import Swal from "sweetalert2";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { CardDescription } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye } from "lucide-react";
import "react-phone-number-input/style.css";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import {
  incrementApplicationsCount,
} from "@/redux/examDataSlice";
import { addApplication } from "@/redux/applicationsSlice";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useMemo } from "react";
import NotFound from "./ui/notFound";
import "../App.css";

import {
  ApplicationPDFComplete,
  ApplicationPDFCompleteAkt,
  ApplicationPDFCompleteAktPreview,
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
import { examOccurrenceAvailability, Availability, getExamOccurrence, ExamOccurrence } from "@/lib/examOccurrencesApi";
import ExamClosed from "./ui/examClosed";
import { pdfToImages } from "./ui/pdfToImage";


export type Attachment = {
  id: string;
  title: string;
  file: File | null;
  attachmentUrl?: string;
};

// utils/fileToBase64.ts (ya isi file mein component se upar)
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file); // file -> base64 string
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};


export function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileErrors, setFileErrors] = useState<{ [key: string]: string }>({});
  const [passportPreview, setPassportPreview] = useState<string | null>("https://cdn.mos.cms.futurecdn.net/v2/t:0,l:420,cw:1080,ch:1080,q:80,w:1080/Hpq4NZjKWjHRRyH9bt3Z2e.jpg");
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [medicalLicensePreview, setMedicalLicensePreview] = useState<any>(null);
  const [part1EmailPreview, setPart1EmailPreview] = useState<any>(null);
  const [passportBioPreview, setPassportBioPreview] = useState<any>(null);
  const [signaturePreview, setSignaturePreview] = useState<any>(null);
  const [signatureIsPdf, setSignatureIsPdf] = useState<boolean | null>(null);
  const [medicalLicenseIsPdf, setMedicalLicenseIsPdf] = useState<boolean | null>(null);
  const [part1EmailIsPdf, setPart1EmailIsPdf] = useState<boolean | null>(null);
  const [passportBioIsPdf, setPassportBioIsPdf] = useState<boolean | null>(null);
  const [pdfGenerating] = useState(false);
  const [warning, setWarning] = useState(false);
  const [examOccurrence, setExamOccurrence] = useState<Availability | null>(null);
  const [examDto, setExamDto] = useState<ExamOccurrence | null>(null);
  const [occurrenceLoading, setOccurrenceLoading] = useState(false);
  const [occurrenceError, setOccurrenceError] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [isCreatingApplication, setIsCreatingApplication] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<{ file: File; inputId: string; localPreviewUrl: string; title?: string; }[]>([]);
  const [uploadedFileIds, setUploadedFileIds] = useState<{ [inputId: string]: string }>({});
  const [applicationCreateTime, setApplicationCreateTime] = useState(false);
  const [applicationExists, setApplicationExists] = useState(false);
  const [triggerApplicationCheck, setTriggerApplicationCheck] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isEligible, setIsEligible] = useState<boolean | null>(null); // null = not checked, true = eligible, false = not eligible
  const params = useParams();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const prevValuesRef = useRef<any>(null);

  if (!params.examId) return null;

  // Map examOccurrence to selectedExam structure for compatibility
  const selectedExam = examDto ? {
    id: examDto.id,
    name: examDto.title,
    location: Array.isArray(examDto.location) ? examDto.location.join(', ') : examDto.location,
    openingDate: examDto.registrationStartDate,
    closingDate: examDto.registrationEndDate,
    slot1: examDto.examSlots?.[0] ? `${examDto.examSlots[0].startDate} | ${examDto.examSlots[0].endDate}` : '',
    slot2: examDto.examSlots?.[1] ? `${examDto.examSlots[1].startDate} | ${examDto.examSlots[1].endDate}` : '',
    slot3: examDto.examSlots?.[2] ? `${examDto.examSlots[2].startDate} | ${examDto.examSlots[2].endDate}` : '',
    applicationsLimit: examDto.applicationLimit,
    waitingLimit: examDto.waitingListLimit,
    formLink: '',
    isBlocked: !examDto.isActive,
    // receivingApplicationsCount: examDto.applicationsCount,
    examType: examDto.type,
    examSlots: examDto.examSlots, // Add full examSlots for AktFeilds
  } : null;

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
    if (params.examId) {
      const fetchOccurrence = async () => {
        setOccurrenceLoading(true);
        setOccurrenceError(null);
        try {
          const occurrence = await examOccurrenceAvailability(params.examId as string);
          const examData: any = await getExamOccurrence(params.examId as string);

          setExamOccurrence(occurrence);
          setExamDto(examData?.data);
        } catch (error) {
          setOccurrenceError("Failed to load exam occurrence.");
          console.error(error);
        } finally {
          setOccurrenceLoading(false);
        }
      };
      fetchOccurrence();
    }
  }, [params.examId]);

  useEffect(() => {
    if (examDto && examDto.type === "AKT") {
      setSelectedExamType(true);
    }
  }, [examDto]);

  // Auto-create application when fullname and email have values or when email blur triggers check
  useEffect(() => {
    const currentForm = selectedExamType ? aktsForm : osceForm;
    const values = currentForm.getValues();

    if (
      values.email &&
      values.email.trim() !== "" &&
      values.fullName &&
      values.fullName.trim() !== "" &&
      !applicationId &&
      !isCreatingApplication &&
      !applicationExists &&
      params.examId &&
      triggerApplicationCheck &&
      applicationCreateTime
    ) {
      const createApplication = async () => {
        try {
          setIsCreatingApplication(true);

          const apiEmailPayload = {
            examOccurrenceId: params.examId,
            fullName: values.fullName,
            email: values.email,
          };

          const response = await fetch("https://mrcgp-api.omnifics.io/api/v1/applications", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(apiEmailPayload),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `Application creation failed: ${response.status} ${response.statusText}`;

            // Check for specific 409 conflict error
            if (response.status === 409 && errorData.message === "Application already exists for this exam occurrence") {
              setApplicationExists(true);
              toast({
                title: "Application Already Exists",
                description: "An application with this email already exists for this exam. Please use a different email address.",
                variant: "destructive",
              });
              return;
            }

            toast({
              title: "Application Creation Failed",
              description: errorMessage,
              variant: "destructive",
            });

            console.warn(`Auto-application creation failed: ${response.status} ${response.statusText}`);
            return; // Don't throw error, just log and continue
          }

          const apiResponse = await response.json();

          // Extract application ID from response
          const appId = apiResponse.id || apiResponse.applicationId || apiResponse.data?.id;
          if (appId) {
            setApplicationId(appId);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Network error occurred";

          toast({
            title: "Application Creation Error",
            description: errorMessage,
            variant: "destructive",
          });

          console.warn("Auto-application creation error:", error);
        } finally {
          setIsCreatingApplication(false);
          setTriggerApplicationCheck(false); // Reset the trigger
        }
      };

      createApplication();
    }
  }, [
    selectedExamType,
    aktsForm,
    osceForm,
    applicationId,
    isCreatingApplication,
    params.examId,
    applicationCreateTime,
    triggerApplicationCheck,
  ]);

  useEffect(() => {
    const subscription = (selectedExamType ? aktsForm : osceForm).watch(
      (values) => {

        const currentForm = selectedExamType ? aktsForm : osceForm;
        const errors = currentForm.formState.errors;
        const emailValid = !errors.email;
        const fullNameFilled = values.fullName && values.fullName.trim() !== '';

        if (emailValid && fullNameFilled) {
          if (prevValuesRef.current) {
            // Check if any other field changed
            const otherFieldsChanged = Object.keys(values).some(key => {
              if (key === 'email' || key === 'fullName') return false;
              return (values as any)[key] !== (prevValuesRef.current as any)[key];
            });
            if (otherFieldsChanged) {
              setApplicationCreateTime(true);
            } else {
              setApplicationCreateTime(false);
            }
          }
          prevValuesRef.current = values;
        } else {
          // Reset if conditions not met
          prevValuesRef.current = null;
        }
      }
    ) as unknown as { unsubscribe: () => void }; // 🔥 Trick TypeScript here

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedExamType]);

  // Function to trigger application creation check
  const handleEmailBlur = () => {
    setTriggerApplicationCheck(true);
  };

  // Function to trigger application creation check for full name
  const handleFullNameBlur = () => {
    setTriggerApplicationCheck(true);
  };

  // Function to check candidate eligibility
  const handleCandidateIdBlur = async (candidateId: string) => {
    if (!candidateId || candidateId.trim() === "") return;

    try {
      const response = await fetch("https://mrcgp-api.omnifics.io/api/v1/applications/can-apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateId: candidateId.trim(),
          examOccurrenceId: params.examId,
        }),
      });

      const data = await response.json();

      if (data.canApply) {
        // Candidate is eligible
        setIsEligible(true);
      } else {
        // Candidate is not eligible
        setIsEligible(false);
        toast({
          title: "Eligibility Check Failed",
          description: data.reason || "You are not eligible to submit the application.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Eligibility check error:", error);
      toast({
        title: "Eligibility Check Error",
        description: "Unable to verify eligibility. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  // Reset application exists state when email changes
  useEffect(() => {
    if (applicationExists) {
      setApplicationExists(false);
    }
  }, [currentForm.watch("email")]);

  // Process pending uploads when applicationId becomes available
  useEffect(() => {
    if (applicationId && pendingUploads.length > 0) {
      const processPendingUploads = async () => {
        for (const { file, inputId, title } of pendingUploads) {
          // Check if file is PDF
          const isPdf = file.type === 'application/pdf';

          // Delete existing file if it exists
          const existingFileId = uploadedFileIds[inputId];
          if (existingFileId) {
            try {
              const deleteResponse = await fetch(`https://mrcgp-api.omnifics.io/api/v1/attachments/${existingFileId}`, {
                method: 'DELETE'
              });

              if (!deleteResponse.ok) {
                console.warn(`Failed to delete existing file ${existingFileId} for ${inputId}`);
              }
            } catch (error) {
              console.warn(`Error deleting existing file for ${inputId}:`, error);
            }
          }

          // Determine filename based on exam type and input
          let fileName = file.name;

          if (selectedExamType && inputId === "attachment") {
            // For AKT attachments, find the attachment with the matching file
            if (title) {
              fileName = title; // ✅ direct use karo
            }
          } else if (!selectedExamType) {
            // For OSCE applications, use standard titles for all file types
            switch (inputId) {
              case "passport-image":
                fileName = "passport-image";
                break;
              case "medical-license":
                fileName = "medical license";
                break;
              case "part1-email":
                fileName = "part 1 passing email";
                break;
              case "passport-bio":
                fileName = "passport bio page";
                break;
              case "signature":
                fileName = "signature";
                break;
              default:
                fileName = file.name; // fallback to original name
            }
          }

          // Upload to API based on file type
          let response;

          if (isPdf) {
            // PDF upload using document API - send file with API body
            const formData = new FormData();
            formData.append('file', file);
            formData.append('examOccurrenceId', params.examId as string);
            formData.append('entityType', 'application');
            formData.append('entityId', applicationId as string);
            formData.append('category', 'application_other');
            formData.append('fileName', fileName || file.name);

            response = await fetch('https://mrcgp-api.omnifics.io/api/v1/attachments/upload/document', {
              method: 'POST',
              body: formData
            });
          } else {
            // Image upload using existing API
            const formData = new FormData();
            formData.append('file', file);
            formData.append('examOccurrenceId', params.examId as string);
            formData.append('entityType', 'application');
            formData.append('entityId', applicationId as string);
            formData.append('category', getCategory(inputId));
            formData.append('fileName', fileName);

            response = await fetch('https://mrcgp-api.omnifics.io/api/v1/attachments/upload/image', {
              method: 'POST',
              body: formData
            });
          }

          try {

            if (!response.ok) {
              console.error(`Upload failed for ${inputId}`);
              continue;
            }

            const data = await response.json();
            const newFileId = data.id; // Capture the new file ID
            // const serverUrl = data.url; // Capture server URL from response
      
            // Store the new file ID for future deletions
            setUploadedFileIds(prev => ({
              ...prev,
              [inputId]: newFileId
            }));
      
            // Clear any previous errors and show success
            // setFileError(null);
            const fieldName = title ? title.replace('-', ' ').toUpperCase() : inputId.replace('-', ' ').toUpperCase();
            toast({
              title: "File Uploaded Successfully",
              description: `${fieldName} has been uploaded successfully.`,
              variant: "default",
            });
      
            // Keep the local preview URL, don't replace with server URL
          } catch (error) {
            console.error(`Upload error for ${inputId}:`, error);
            const fieldName = title ? title.replace('-', ' ').toUpperCase() : inputId.replace('-', ' ').toUpperCase();
            toast({
              title: "File Upload Failed",
              description: `${fieldName} upload failed. Please try again.`,
              variant: "destructive",
            });
          }
        }
        // Clear pending uploads after processing
        setPendingUploads([]);
      };
    
      processPendingUploads();
    }
  }, [applicationId, pendingUploads, params.examId]);

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


  const getCategory = (inputId: string) => {
    switch (inputId) {
      case "passport-image":
        return "application_photo";
      case "signature":
        return "application_signature";
      default:
        return "application_other";
    }
  };

  const deleteUploadedFile = async (inputId: string) => {
    const existingFileId = uploadedFileIds[inputId];
    if (existingFileId) {
      try {
        const deleteResponse = await fetch(`https://mrcgp-api.omnifics.io/api/v1/attachments/${existingFileId}`, {
          method: 'DELETE'
        });

        if (!deleteResponse.ok) {
          console.warn(`Failed to delete existing file ${existingFileId} for ${inputId}`);
        } else {
          setUploadedFileIds(prev => {
            const newState = { ...prev };
            delete newState[inputId];
            return newState;
          });
        }
      } catch (error) {
        console.warn(`Error deleting existing file for ${inputId}:`, error);
      }
    }
  };

  async function onSubmit(data: AktsFormValues | FormValues) {

    if (!examOccurrence) {
      alert("Exam occurrence not loaded.");
      return;
    }

    try {
      setIsSubmitting(true);

      const isValid = await currentForm.trigger();
      if (!isValid) {
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
          !signaturePreview ||
          !medicalLicensePreview ||
          !passportBioPreview ||
          !passportPreview
        ) {
          setWarning(true);
          setIsSubmitting(false);
          return;
        }
        setWarning(false);
      }

      // Show confirmation dialog
      const confirmationResult = await Swal.fire({
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

      if (!confirmationResult.isConfirmed) {
        setIsSubmitting(false);
        return;
      }

      // Build API payload based on exam type
      let apiPayload: any;

      if (selectedExamType) {
        // AKTs full payload
        apiPayload = {
          examOccurrenceId: params.examId,
          candidateId: (data as AktsFormValues).candidateId || "",
          fullName: data.fullName,
          streetAddress: data.poBox,
          district: data.district,
          city: data.city,
          province: data.province,
          country: data.country,
          personalContact: data.whatsapp,
          emergencyContact: data.emergencyContact,
          originCountry: data.countryOfOrigin,
          clinicalExperienceCountry: data.countryOfExperience,
          registrationAuthority: data.registrationAuthority,
          registrationNumber: data.registrationNumber,
          registrationDate: data.dateOfRegistration ? new Date(data.dateOfRegistration).toISOString() : "",
          usualForename: data.fullName.split(' ')[0] || "",
          gender: "MALE", // Default, could be added to form
          previousAKTAttempts: (data as AktsFormValues).previousAktsAttempts || 0,
          graduatingSchoolName: (data as AktsFormValues).schoolName || "",
          graduatingSchoolLocation: (data as AktsFormValues).schoolLocation || "",
          dateOfQualification: (data as AktsFormValues).QualificationDate ? new Date((data as AktsFormValues).QualificationDate).toISOString() : "",
          aktEligibility: "A", // Default, could be mapped from eligibility fields
          examinationCenterPreference: (data as AktsFormValues).examinationCenter || "null",
          aktCandidateStatement: "A", // Default, could be mapped from candidateStatement fields
          date: new Date().toISOString(),
          examType: examDto?.type || "AKT",
          "shouldSubmit": true,
          // notes: ""
        };
      } else {
        // OSCE full payload
        apiPayload = {
          examOccurrenceId: params.examId,
          candidateId: data.candidateId,
          streetAddress: data.poBox,
          district: data.district,
          city: data.city,
          province: data.province,
          country: data.country,
          personalContact: data.whatsapp,
          emergencyContact: data.emergencyContact,
          originCountry: data.countryOfOrigin,
          clinicalExperienceCountry: data.countryOfExperience,
          registrationAuthority: data.registrationAuthority,
          registrationNumber: data.registrationNumber,
          registrationDate: data.dateOfRegistration ? new Date(data.dateOfRegistration).toISOString().split('T')[0] : "",
          date: data.agreementDate ? new Date(data.agreementDate).toISOString().split('T')[0] : "",
          usualForename: data.fullName.split(' ')[0] || "",
          // gender: "MALE",
          previousAKTAttempts: 0,
          aktPassingDate: data.dateOfPassingPart1 || "",
          previousOSCEAttempts: (data as FormValues).previousOsceAttempts || 0,
          preferenceDate1: data.preferenceDate1 || "00/00/0000",
          preferenceDate2: data.preferenceDate2 || "00/00/0000",
          preferenceDate3: data.preferenceDate3 || "00/00/0000",
          osceCandidateStatement: (data as FormValues).termsAgreed || false,
          examType: examDto?.type || "OSCE",
          "shouldSubmit": true,
        };
      }

      // Check if application was auto-created
      if (!applicationId) {
        throw new Error("Application not created yet. Please ensure fullname and email are filled.");
      }

      // Make confirmation API call with retry logic
      let confirmationAttempts = 0;
      const maxConfirmationAttempts = 2;

      while (confirmationAttempts < maxConfirmationAttempts) {
        try {
          confirmationAttempts++;

          const confirmationResponse = await fetch(`https://mrcgp-api.omnifics.io/api/v1/applications/${applicationId}`, {
            method: "PATCH", // Changed to PUT as per API spec
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(apiPayload),
          });

          if (!confirmationResponse.ok) {
            const errorData = await confirmationResponse.json().catch(() => ({}));
            const errorMessage = errorData.message || `Application confirmation failed: ${confirmationResponse.status} ${confirmationResponse.statusText}`;
            throw new Error(errorMessage);
          }

          break; // Success, exit retry loop

        } catch (error) {
          console.warn(`Confirmation attempt ${confirmationAttempts} failed:`, error);

          if (confirmationAttempts >= maxConfirmationAttempts) {
            const errorMessage = `${error instanceof Error ? error.message : 'Unknown error'}`;
            throw new Error(errorMessage);
          }

          // Wait 1 second before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Also dispatch to Redux for local state management
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
        status: "submitted",
        date: new Date().toISOString(),
        name: data.fullName,
        dateOfRegistration: data.dateOfRegistration
          ? new Date(data.dateOfRegistration)
          : new Date(),
        preferenceDate1: data.preferenceDate1 || "00/00/0000",
        preferenceDate2: data.preferenceDate2 || "00/00/0000",
        preferenceDate3: data.preferenceDate3 || "00/00/0000",
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

      dispatch(addApplication(application));
      dispatch(incrementApplicationsCount(examOccurrence.examId));

      // Success Alert
      Swal.fire({
        html: `
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="/icon.png" alt="MRCGP Logo" style="width: 100px; height: 100px; margin: 0 auto 15px auto;">
        </div>
        <h1><b>Form Successfully Submitted!</b></h1>
        <p style="color: #666; font-size: 16px;">
          Your application has been submitted successfully. You should receive a confirmation email within 24 hours.
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
        setTimeout(() => window.location.href = "https://mrcgpintsouthasia.org/", 2000);
      });
    } catch (err) {
      console.error("Submission error:", err);
      Swal.fire({
        title: "Error",
        text: err instanceof Error ? err.message : "Something went wrong during submission.",
        icon: "error",
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const validateFile = async (file: File, inputId: string, title?: string, attachmentId?: string) => {
    // List of input IDs that require validation
    const validateThese = ["passport-image"];

    let fieldName: string;
    if (attachmentId) {
      // For attachments, use attachment ID for unique error key
      fieldName = `attachment-${attachmentId}`;
    } else {
      fieldName = title ? title.replace('-', ' ').toUpperCase() : inputId.replace('-', ' ').toUpperCase();
    }

    // Reset error for this field
    setFileErrors(prev => ({ ...prev, [fieldName]: '' }));

    // Check if file is PDF
    const isPdf = file.type === 'application/pdf';

    // Only validate if inputId is in the validation list or if it's a PDF
    if (validateThese.includes(inputId) || isPdf) {
      // Check file type for images
      if (!isPdf) {
        const validTypes = ["image/jpeg", "image/jpg", "image/png" ];
        const fieldName = title ? title.replace('-', ' ').toUpperCase() : inputId.replace('-', ' ').toUpperCase();
        if (!validTypes.includes(file.type)) {
          setFileErrors(prev => ({ ...prev, [fieldName]: `${fieldName}: Invalid file format. Only JPG, JPEG and PNG formats are supported.` }));
          const fileInput = document.getElementById(inputId) as HTMLInputElement;
          if (fileInput) fileInput.value = "";
          // Clear the preview on validation error
          if (title === "passport-image") {
            // AKT passport image
            setPassportPreview(null);
          } else {
            switch (inputId) {
              case "passport-image":
                setPassportPreview(null);
                break;
              case "medical-license":
                setMedicalLicensePreview(null);
                setMedicalLicenseIsPdf(null);
                break;
              case "part1-email":
                setPart1EmailPreview(null);
                setPart1EmailIsPdf(null);
                break;
              case "passport-bio":
                setPassportBioPreview(null);
                setPassportBioIsPdf(null);
                break;
              case "signature":
                setSignaturePreview(null);
                setSignatureIsPdf(null);
                break;
              case "attachment":
                setAttachmentUrl(null);
                break;
            }
          }
          return false;
        }
      } else {
        // For PDFs, reject for passport-image
        if (inputId === "passport-image") {
          const fieldName = title ? title.replace('-', ' ').toUpperCase() : inputId.replace('-', ' ').toUpperCase();
          setFileErrors(prev => ({ ...prev, [fieldName]: `${fieldName}: PDF files are not allowed for this field.` }));
          const fileInput = document.getElementById(inputId) as HTMLInputElement;
          if (fileInput) fileInput.value = "";
          setPassportPreview(null);
          return false;
        }
      }

      // Check file size (10MB = 10 * 1024 * 1024 bytes)
      const maxSize = 3 * 1024 * 1024;
      if (file.size > maxSize) {
        setFileErrors(prev => ({ ...prev, [fieldName]: `${fieldName}: File size exceeds 3MB limit. Please choose a smaller file.` }));
        const fileInput = document.getElementById(inputId) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        // Clear the preview on validation error
        if (title === "passport-image") {
          // AKT passport image
          setPassportPreview(null);
        } else {
          switch (inputId) {
            case "passport-image":
              setPassportPreview(null);
              break;
            case "medical-license":
              setMedicalLicensePreview(null);
              setMedicalLicenseIsPdf(null);
              break;
            case "part1-email":
              setPart1EmailPreview(null);
              setPart1EmailIsPdf(null);
              break;
            case "passport-bio":
              setPassportBioPreview(null);
              setPassportBioIsPdf(null);
              break;
            case "signature":
              setSignaturePreview(null);
              setSignatureIsPdf(null);
              break;
            case "attachment":
              setAttachmentUrl(null);
              break;
          }
        }
        return false;
      }
    }

    // Create local preview URL immediately
    const localPreviewUrl = await fileToBase64(file);
    console.log("localPreviewUrl", localPreviewUrl);
    
    // Set immediate preview with local URL
    if (title === "passport-image") {
      // AKT passport image
      setPassportPreview(localPreviewUrl);
    } else {
      switch (inputId) {
        case "passport-image":
          setPassportPreview(localPreviewUrl);
          break;
        case "medical-license":
          if (isPdf) {
            const reader = new FileReader();
            reader.onload = async (e) => {
              const base64Pdf = e.target?.result as string;
              const imagesArray = await pdfToImages(base64Pdf);
              setMedicalLicensePreview(imagesArray); // array of images
            };
            reader.readAsDataURL(file);
          } else {
            setMedicalLicensePreview([localPreviewUrl]);
          }
          setMedicalLicenseIsPdf(isPdf);
          break;
        case "part1-email":
          if (isPdf) {
            const reader = new FileReader();
            reader.onload = async (e) => {
              const base64Pdf = e.target?.result as string;
              const imagesArray = await pdfToImages(base64Pdf);
              setPart1EmailPreview(imagesArray);
            };
            reader.readAsDataURL(file);
          } else {
            setPart1EmailPreview([localPreviewUrl]);
          }
          setPart1EmailIsPdf(isPdf);
          break;
        case "passport-bio":
          if (isPdf) {
            const reader = new FileReader();
            reader.onload = async (e) => {
              const base64Pdf = e.target?.result as string;
              const imagesArray = await pdfToImages(base64Pdf);
              setPassportBioPreview(imagesArray);
            };
            reader.readAsDataURL(file);
          } else {
            setPassportBioPreview([localPreviewUrl]);
          }
          setPassportBioIsPdf(isPdf);
          break;
        case "signature":
          if (isPdf) {
            const reader = new FileReader();
            reader.onload = async (e) => {
              const base64Pdf = e.target?.result as string;
              const imagesArray = await pdfToImages(base64Pdf);
              setSignaturePreview(imagesArray);
            };
            reader.readAsDataURL(file);
          } else {
            setSignaturePreview([localPreviewUrl]);
          }
          setSignatureIsPdf(isPdf);
          break;
        case "attachment":
          setAttachmentUrl(localPreviewUrl);
          break;
      }
    }

    // Check if application is created
    if (!applicationId) {
      // Queue the file for upload once application is created
      setPendingUploads(prev => [...prev, { file, inputId, title, localPreviewUrl }]);
      setFileErrors(prev => ({ ...prev, [fieldName]: '' })); // Clear any previous errors
      return true; // Return true to indicate file is accepted but queued
    }

    // Determine filename based on exam type and input
    let fileName = file.name;

   if (inputId === "attachment") {
    if (title) {
      fileName = title; // ✅ direct use karo
    }
    } else if (!selectedExamType) {
      // For OSCE applications, use standard titles for all file types
      switch (inputId) {
        case "passport-image":
          fileName = "passport-image";
          break;
        case "medical-license":
          fileName = "medical license";
          break;
        case "part1-email":
          fileName = "part 1 passing email";
          break;
        case "passport-bio":
          fileName = "passport bio page";
          break;
        case "signature":
          fileName = "signature";
          break;
        default: {
          // find the attachment by file or id
          const att = attachments.find((a) => a.file === file || a.id === inputId);
          fileName = att?.title || file.name; // fallback
        }
      }
    }

    // Delete existing file if it exists (skip for attachments since each is independent)
    if (inputId !== "attachment") {
      const existingFileId = uploadedFileIds[inputId];
      if (existingFileId) {
        try {
          const deleteResponse = await fetch(`https://mrcgp-api.omnifics.io/api/v1/attachments/${existingFileId}`, {
            method: 'DELETE'
          });

          if (!deleteResponse.ok) {
            console.warn(`Failed to delete existing file ${existingFileId} for ${inputId}`);
          }
        } catch (error) {
          console.warn(`Error deleting existing file for ${inputId}:`, error);
        }
      }
    }

    // Upload to API based on file type
    let response;

    if (isPdf) {
      // PDF upload using document API - send file with API body
      const formData = new FormData();
      formData.append('file', file);
      formData.append('examOccurrenceId', params.examId as string);
      formData.append('entityType', 'application');
      formData.append('entityId', applicationId as string);
      formData.append('category', 'application_other');
      formData.append('fileName', fileName || file.name);

      response = await fetch('https://mrcgp-api.omnifics.io/api/v1/attachments/upload/document', {
        method: 'POST',
        body: formData
      });
    } else {
      // Image upload using existing API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('examOccurrenceId', params.examId as string);
      formData.append('entityType', 'application');
      formData.append('entityId', applicationId as string);
      formData.append('category', getCategory(inputId));
      const matchedAttachment = attachments.find(
        (att: any) => att.file === file || att.id === inputId
      );

      // File name preference: attachment title > computed fileName > actual file name
      const finalFileName = matchedAttachment?.title || fileName || file.name;

      formData.append('fileName', finalFileName);

      response = await fetch('https://mrcgp-api.omnifics.io/api/v1/attachments/upload/image', {
        method: 'POST',
        body: formData
      });
    }

    try {

      if (!response.ok) {
        const fieldName = title ? title.replace('-', ' ').toUpperCase() : inputId.replace('-', ' ').toUpperCase();
        let errorMessage = `${fieldName}: Upload failed. Please try again.`;
        try {
          const errorData = await response.json().catch(() => ({}));
          if (errorData.message) {
            errorMessage = `${fieldName}: Upload failed: ${errorData.message}`;
          } else if (response.status === 413) {
            errorMessage = `${fieldName}: File is too large. Please choose a smaller file.`;
          } else if (response.status === 415) {
            errorMessage = `${fieldName}: File type not supported. Please use JPG, PNG, GIF, or WebP.`;
          } else if (response.status >= 500) {
            errorMessage = `${fieldName}: Server error. Please try again later.`;
          }
        } catch (e) {
          // Keep default message if parsing fails
        }
        setFileErrors(prev => ({ ...prev, [fieldName]: errorMessage }));

        // Clear the preview image on upload error
        if (title === "passport-image") {
          // AKT passport image
          setPassportPreview(null);
        } else {
          switch (inputId) {
            case "passport-image":
              setPassportPreview(null);
              break;
            case "medical-license":
              setMedicalLicensePreview(null);
              setMedicalLicenseIsPdf(null);
              break;
            case "part1-email":
              setPart1EmailPreview(null);
              setPart1EmailIsPdf(null);
              break;
            case "passport-bio":
              setPassportBioPreview(null);
              setPassportBioIsPdf(null);
              break;
            case "signature":
              setSignaturePreview(null);
              setSignatureIsPdf(null);
              break;
            case "attachment":
              setAttachmentUrl(null);
              break;
          }
        }

        toast({
          title: isPdf ? "PDF Upload Failed" : "File Upload Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }

      const data = await response.json();
      const newFileId = data.id; // Capture the new file ID
      // const serverUrl = data.url; // Capture server URL from response

      // Store the new file ID for future deletions
      setUploadedFileIds(prev => ({
        ...prev,
        [inputId]: newFileId
      }));

      // Clear any previous errors for this field
      setFileErrors(prev => ({ ...prev, [fieldName]: '' }));

      // Show success message for PDF uploads
      if (isPdf) {
        toast({
          title: "PDF Uploaded Successfully",
          description: `${fieldName} PDF has been uploaded successfully.`,
          variant: "default",
        });
      } else {
        toast({
          title: "File Uploaded Successfully",
          description: `${fieldName} has been uploaded successfully.`,
          variant: "default",
        });
      }

      // Keep the local preview URL, don't replace with server URL
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Network error occurred";
      const fieldName = title ? title.replace('-', ' ').toUpperCase() : inputId.replace('-', ' ').toUpperCase();
      const fullErrorMessage = `${fieldName}: Upload failed: ${errorMessage}. Please check your connection and try again.`;
      setFileErrors(prev => ({ ...prev, [fieldName]: fullErrorMessage }));

      // Clear the preview image on any error
      if (title === "passport-image") {
        // AKT passport image
        setPassportPreview(null);
      } else {
        switch (inputId) {
          case "passport-image":
            setPassportPreview(null);
            break;
          case "medical-license":
            setMedicalLicensePreview(null);
            setMedicalLicenseIsPdf(null);
            break;
          case "part1-email":
            setPart1EmailPreview(null);
            setPart1EmailIsPdf(null);
            break;
          case "passport-bio":
            setPassportBioPreview(null);
            setPassportBioIsPdf(null);
            break;
          case "signature":
            setSignaturePreview(null);
            setSignatureIsPdf(null);
            break;
          case "attachment":
            setAttachmentUrl(null);
            break;
        }
      }

      toast({
        title: "File Upload Failed",
        description: fullErrorMessage,
        variant: "destructive",
      });
      return false;
    }

    // For queued uploads, return the local preview URL
    if (!applicationId) {
      return localPreviewUrl;
    }

    return true;
  };
  // console.error("validateFile:", validateFile);

  useEffect(() => {
    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      if (passportPreview) URL.revokeObjectURL(passportPreview);
      if (medicalLicensePreview && typeof medicalLicensePreview === 'string') URL.revokeObjectURL(medicalLicensePreview);
      if (part1EmailPreview && typeof part1EmailPreview === 'string') URL.revokeObjectURL(part1EmailPreview);
      if (passportBioPreview && typeof passportBioPreview === 'string') URL.revokeObjectURL(passportBioPreview);
      if (signaturePreview && typeof signaturePreview === 'string') URL.revokeObjectURL(signaturePreview);
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

  // Reset eligibility when candidate ID changes
  useEffect(() => {
    if (isEligible !== null) {
      setIsEligible(null);
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
    }, 1000); // Increased timeout to allow PDF generation to complete
  }

  if (occurrenceLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
        <Loader2 className="h-32 w-32 animate-spin text-indigo-500" />
        <p className="text-slate-600 dark:text-slate-400">Loading exam details...</p>
      </div>
    );
  }
  if (examOccurrence && !examOccurrence.canApply) {
    return <ExamClosed reason={examOccurrence.reason} />;
  }
  if (occurrenceError) {
    return <NotFound />;
  }
  if (!selectedExam) {
    return <NotFound />;
  }


  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <CardHeader className="space-y-1 bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              <div className="flex justify-start items-center gap-2">
                <div className="w-18 h-18 sm:h-20 sm:w-20 rounded-fullflex items-center justify-center">
                  <img src="/icon.png" alt="404" />
                </div>
                <div className="">
                <span>APPLICATION FORM</span>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                For the South Asia MRCGP [INT.] Part 2 (OSCE) Examination
              </CardDescription>

                </div>
              </div>
            </CardTitle>
            <div className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-md text-indigo-700 dark:text-indigo-300 font-medium text-sm">
              {selectedExam
                ? selectedExam.name + " - " + selectedExam.location
                : ""}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {examOccurrence && selectedExam && examOccurrence.applicationsCount === selectedExam.applicationsLimit && (
            <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
              <AlertDescription className="text-amber-800 dark:text-amber-200 font-medium">
                Please Note: All regular seats for this exam have been filled. Your application has been placed on the waiting list.
              </AlertDescription>
            </Alert>
          )}
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
                  fileErrors={fileErrors}
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
                  signatureIsPdf={signatureIsPdf}
                  setSignatureIsPdf={setSignatureIsPdf}
                  medicalLicenseIsPdf={medicalLicenseIsPdf}
                  setMedicalLicenseIsPdf={setMedicalLicenseIsPdf}
                  part1EmailIsPdf={part1EmailIsPdf}
                  setPart1EmailIsPdf={setPart1EmailIsPdf}
                  passportBioIsPdf={passportBioIsPdf}
                  setPassportBioIsPdf={setPassportBioIsPdf}
                  selectedExam={selectedExam}
                  deleteUploadedFile={deleteUploadedFile}
                  onEmailBlur={handleEmailBlur}
                  onFullNameBlur={handleFullNameBlur}
                  onCandidateIdBlur={handleCandidateIdBlur}
                />
              ) : (
                <AktFeilds
                  currentForm={currentForm}
                  selectedExamType={selectedExamType}
                  setPassportPreview={setPassportPreview}
                  passportPreview={passportPreview}
                  fileErrors={fileErrors}
                  validateFile={validateFile}
                  selectedExam={selectedExam}
                  attachmentUrl={attachmentUrl}
                  attachments={attachments}
                  setAttachments={setAttachments}
                  onEmailBlur={handleEmailBlur}
                  onFullNameBlur={handleFullNameBlur}
                  onCandidateIdBlur={handleCandidateIdBlur}
                />
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                {previewMode && (
                  <PDFDownloadLink
                    id="pdf-download-link"
                    document={
                      !selectedExamType ? (
                        <ApplicationPDFComplete
                          data={currentForm.getValues()}
                          images={pdfImages}
                        />
                      ) : (
                        <ApplicationPDFCompleteAkt
                          data={currentForm.getValues()}
                          image={attachments}
                          images={pdfImages}
                        />
                      )
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
                )}

                {/* // pdf completed // */}
                {previewMode && (
                  <PDFDownloadLink
                    id="pdf-download-preview-link"
                    document={
                      !selectedExamType ? (
                        <ApplicationPDFCompletePreview
                          data={currentForm.getValues()}
                          images={pdfImages}
                        />
                      ) : (
                        <ApplicationPDFCompleteAktPreview
                          data={aktsForm.getValues()}
                          image={attachments}
                          images={pdfImages}
                        />
                      )
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
                )}
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPreviewLoading}
                  onClick={() => {
                    setIsPreviewLoading(true);
                    setPreviewMode(true);
                    setTimeout(() => {
                      currentForm.handleSubmit(test)();
                      // Reset loading state after PDF opens
                      setTimeout(() => {
                        setIsPreviewLoading(false);
                      }, 2000); // Allow extra time for window to open
                    }, 100);
                  }}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  {isPreviewLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4 mr-2" />
                  )}
                  {isPreviewLoading ? "Generating PDF..." : "Preview"}
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
                        setMedicalLicenseIsPdf(null);
                        setPart1EmailPreview(null);
                        setPart1EmailIsPdf(null);
                        setPassportBioPreview(null);
                        setPassportBioIsPdf(null);
                        setSignaturePreview(null);
                        setSignatureIsPdf(null);
                        setSignatureIsPdf(null);
                      }
                    }, 500); // Increased timeout to ensure PDF generation completes
                  }}
                  className=" hidden items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                ></Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || applicationExists || isEligible === false}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : applicationExists ? (
                    "Application Already Exists - Change Email"
                  ) : isEligible === false ? (
                    "Not Eligible to Submit"
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
