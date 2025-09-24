"use client";

import Swal from "sweetalert2";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { CardDescription } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
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

export function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [passportPreview, setPassportPreview] = useState<string | null>("https://cdn.mos.cms.futurecdn.net/v2/t:0,l:420,cw:1080,ch:1080,q:80,w:1080/Hpq4NZjKWjHRRyH9bt3Z2e.jpg");
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<any>([]);
  const [medicalLicensePreview, setMedicalLicensePreview] = useState<
    string | null
  >("https://qph.cf2.quoracdn.net/main-qimg-678953c86023297f1bc61f1221e5418b-lq");
  const [part1EmailPreview, setPart1EmailPreview] = useState<string | null>(
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4Ml67pFyDUglzvcBgFNJunKwo2rApmKrPRw&s"
  );
  const [passportBioPreview, setPassportBioPreview] = useState<string | null>(
    "https://pbs.twimg.com/media/FlZ2oDPakAAGGor.jpg"
  );
  const [signaturePreview, setSignaturePreview] = useState<string | null>("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREb9M5D4J58j_78uhZNxsLXUXNMuFuF2RWTg&s");
  const [pdfGenerating] = useState(false);
  const [warning, setWarning] = useState(false);
  const [examOccurrence, setExamOccurrence] = useState<Availability | null>(null);
  const [examDto, setExamDto] = useState<ExamOccurrence | null>(null);
  const [occurrenceLoading, setOccurrenceLoading] = useState(false);
  const [occurrenceError, setOccurrenceError] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [isCreatingApplication, setIsCreatingApplication] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<{ file: File; inputId: string; localPreviewUrl: string }[]>([]);
  const [uploadedFileIds, setUploadedFileIds] = useState<{ [inputId: string]: string }>({});
  const [applicationCreateTime, setApplicationCreateTime] = useState(false);
  const [applicationExists, setApplicationExists] = useState(false);
  const [triggerApplicationCheck, setTriggerApplicationCheck] = useState(false);
  const params = useParams();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const prevValuesRef = useRef<any>(null);

console.log("examDto", examDto);

  if (!params.examId) return null;

  // Map examOccurrence to selectedExam structure for compatibility
  const selectedExam = examDto ? {
    id: examDto.id,
    name: examDto.title,
    location: Array.isArray(examDto.location) ? examDto.location.join(', ') : examDto.location,
    openingDate: examDto.registrationStartDate,
    closingDate: examDto.registrationEndDate,
    slot1: examDto.examSlots?.[0]?.startDate || '',
    slot2: examDto.examSlots?.[1]?.startDate || '',
    slot3: examDto.examSlots?.[2]?.startDate || '',
    applicationsLimit: examDto.applicationLimit,
    waitingLimit: examDto.waitingListLimit,
    formLink: '',
    isBlocked: !examDto.isActive,
    // receivingApplicationsCount: examDto.applicationsCount,
    examType: examDto.type,
  } : null;
console.log("selectedExam", selectedExam);

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
              console.log(true, "chala");
              setApplicationCreateTime(true);
            }else{
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

  useEffect(() => {
    if (params.examId) {
      const fetchOccurrence = async () => {
        setOccurrenceLoading(true);
        setOccurrenceError(null);
        try {
          const occurrence = await examOccurrenceAvailability(params.examId as string);
          const examData: any = await getExamOccurrence(params.examId as string);
          console.log("Fetched occurrence:", occurrence);
          
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
 const values = currentForm.getValues();
    console.log("Auto-create check with values:", values, "applicationId:", applicationId, "isCreatingApplication:", isCreatingApplication);
    
  // Auto-create application when fullname and email have values or when email blur triggers check
  useEffect(() => {
    const currentForm = selectedExamType ? aktsForm : osceForm;
    const values = currentForm.getValues();
    console.log("Auto-create check with values:", values, "applicationId:", applicationId, "isCreatingApplication:", isCreatingApplication);


    // Check if we have both email and fullName, and haven't created application yet
    // Also check if application doesn't already exist
    if (
      values.email &&
      values.email.trim() !== "" &&
      values.fullName &&
      values.fullName.trim() !== "" &&
      !applicationId &&
      !isCreatingApplication &&
      !applicationExists &&
      params.examId &&
      triggerApplicationCheck
    ) {
      const createApplication = async () => {
        try {
          setIsCreatingApplication(true);

          const apiEmailPayload = {
            examOccurrenceId: params.examId,
            fullName: values.fullName,
            email: values.email,
          };

          console.log("Auto-creating application with:", apiEmailPayload);

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
          console.log("Auto-application creation response:", apiResponse);

          // Extract application ID from response
          const appId = apiResponse.id || apiResponse.applicationId || apiResponse.data?.id;
          if (appId) {
            setApplicationId(appId);
            console.log("Application auto-created with ID:", appId);
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
    triggerApplicationCheck
  ]);

  // Function to trigger application creation check
  const handleEmailBlur = () => {
    setTriggerApplicationCheck(true);
  };

  // Function to trigger application creation check for full name
  const handleFullNameBlur = () => {
    setTriggerApplicationCheck(true);
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
        for (const { file, inputId } of pendingUploads) {
          // Delete existing file if it exists
          const existingFileId = uploadedFileIds[inputId];
          if (existingFileId) {
            try {
              const deleteResponse = await fetch(`https://mrcgp-api.omnifics.io/api/v1/attachments/${existingFileId}`, {
                method: 'DELETE'
              });

              if (!deleteResponse.ok) {
                console.warn(`Failed to delete existing file ${existingFileId} for ${inputId}`);
              } else {
                console.log(`Successfully deleted existing file ${existingFileId} for ${inputId}`);
              }
            } catch (error) {
              console.warn(`Error deleting existing file for ${inputId}:`, error);
            }
          }

          // Determine filename based on exam type and input
          let fileName = file.name;
          console.log("Determining filename for:", { selectedExamType, inputId, file, attachments });
          
          if (selectedExamType && inputId === "attachment") {
            console.log("Finding attachment title for file:", file, attachments);
            
            // For AKT attachments, find the attachment with the matching file
            const attachment = attachments.find((att: any) => att.file === file);
            if (attachment && attachment.title) {
              fileName = attachment.title;
            }
          } else if (!selectedExamType) {
            // For OSCE applications, use standard titles for all file types
            switch (inputId) {
              case "passport-image":
                fileName = "passport size image";
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

          // Upload to API
          const formData = new FormData();
          formData.append('file', file);
          formData.append('examOccurrenceId', params.examId as string);
          formData.append('entityType', 'application');
          formData.append('entityId', applicationId as string);
          formData.append('category', getCategory(inputId));
          formData.append('fileName', fileName);

          try {
            const response = await fetch('https://mrcgp-api.omnifics.io/api/v1/attachments/upload/image', {
              method: 'POST',
              body: formData
            });

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

            console.log(`Upload successful for ${inputId}:`, data);
            // Keep the local preview URL, don't replace with server URL
          } catch (error) {
            console.error(`Upload error for ${inputId}:`, error);
          }
        }
        // Clear pending uploads after processing
        setPendingUploads([]);
      };

      processPendingUploads();
    }
  }, [applicationId, pendingUploads, params.examId]);

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
          console.log(`Successfully deleted existing file ${existingFileId} for ${inputId}`);
          // Remove from uploadedFileIds
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
    console.log("Form data being submitted:", data);

    if (!examOccurrence) {
      alert("Exam occurrence not loaded.");
      return;
    }

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
          email: data.email,
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
          registrationDate: data.dateOfRegistration ? new Date(data.dateOfRegistration).toISOString().split('T')[0] : "",
          date: data.agreementDate ? new Date(data.agreementDate).toISOString().split('T')[0] : "",
          usualForename: data.fullName.split(' ')[0] || "",
          lastName: data.fullName.split(' ').slice(1).join(' ') || "",
          gender: "MALE", // Default, could be added to form
          previousAKTAttempts: (data as AktsFormValues).previousAktsAttempts || 0,
          graduatingSchoolName: (data as AktsFormValues).schoolName || "",
          graduatingSchoolLocation: (data as AktsFormValues).schoolLocation || "",
          dateOfQualification: (data as AktsFormValues).QualificationDate || "",
          aktEligibility: "A", // Default, could be mapped from eligibility fields
          examinationCenterPreference: (data as AktsFormValues).examinationCenter || "",
          aktCandidateStatement: "A", // Default, could be mapped from candidateStatement fields
          aktPassingDate: data.dateOfPassingPart1 || "",
          previousOSCEAttempts: 0,
          preferenceDate1: data.preferenceDate1 || "00/00/0000",
          preferenceDate2: data.preferenceDate2 || "00/00/0000",
          preferenceDate3: data.preferenceDate3 || "00/00/0000",
          osceCandidateStatement: false,
          "shouldSubmit": true,
          // notes: ""
        };
      } else {
        // OSCE full payload
        apiPayload = {
          examOccurrenceId: params.examId,
          email: data.email,
          candidateId: data.candidateId,
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
          registrationDate: data.dateOfRegistration ? new Date(data.dateOfRegistration).toISOString().split('T')[0] : "",
          date: data.agreementDate ? new Date(data.agreementDate).toISOString().split('T')[0] : "",
          usualForename: data.fullName.split(' ')[0] || "",
          lastName: data.fullName.split(' ').slice(1).join(' ') || "",
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

      console.log("API Payload:", apiPayload);

      // Check if application was auto-created
      if (!applicationId) {
        throw new Error("Application not created yet. Please ensure fullname and email are filled.");
      }

      // Make confirmation API call with retry logic
      let confirmationApiResult;
      let confirmationAttempts = 0;
      const maxConfirmationAttempts = 2;

      while (confirmationAttempts < maxConfirmationAttempts) {
        try {
          confirmationAttempts++;
          console.log(`Confirmation attempt ${confirmationAttempts}/${maxConfirmationAttempts}`);

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

            toast({
              title: "Application Submission Failed",
              description: errorMessage,
              variant: "destructive",
            });

            throw new Error(errorMessage);
          }

          confirmationApiResult = await confirmationResponse.json();
          console.log("Application Confirmation Response:", confirmationApiResult);
          break; // Success, exit retry loop

        } catch (error) {
          console.warn(`Confirmation attempt ${confirmationAttempts} failed:`, error);

          if (confirmationAttempts >= maxConfirmationAttempts) {
            const errorMessage = `Application confirmation failed after ${maxConfirmationAttempts} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`;

            toast({
              title: "Application Submission Failed",
              description: errorMessage,
              variant: "destructive",
            });

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
        setTimeout(() => window.location.reload(), 2000);
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

    // Create local preview URL immediately
    const localPreviewUrl = URL.createObjectURL(file);

    // Set immediate preview with local URL
    switch (inputId) {
      case "passport-image":
        setPassportPreview(localPreviewUrl);
        break;
      case "medical-license":
        setMedicalLicensePreview(localPreviewUrl);
        break;
      case "part1-email":
        setPart1EmailPreview(localPreviewUrl);
        break;
      case "passport-bio":
        setPassportBioPreview(localPreviewUrl);
        break;
      case "signature":
        setSignaturePreview(localPreviewUrl);
        break;
      case "attachment":
        setAttachmentUrl(localPreviewUrl);
        break;
    }

    // Check if application is created
    if (!applicationId) {
      // Queue the file for upload once application is created
      setPendingUploads(prev => [...prev, { file, inputId, localPreviewUrl }]);
      setFileError(null); // Clear any previous errors
      return true; // Return true to indicate file is accepted but queued
    }

    // Determine filename based on exam type and input
    let fileName = file.name;
    if (selectedExamType && inputId === "attachment") {
      // For AKT attachments, find the attachment with the matching file
      const attachment = attachments.find((att: any) => att.file === file);
      if (attachment && attachment.title) {
        fileName = attachment.title;
      }
    } else if (!selectedExamType) {
      // For OSCE applications, use standard titles for all file types
      switch (inputId) {
        case "passport-image":
          fileName = "passport size image";
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
          } else {
            console.log(`Successfully deleted existing file ${existingFileId} for ${inputId}`);
          }
        } catch (error) {
          console.warn(`Error deleting existing file for ${inputId}:`, error);
        }
      }
    }

    // Upload to API
    const formData = new FormData();
    formData.append('file', file);
    formData.append('examOccurrenceId', params.examId as string);
    formData.append('entityType', 'application');
    formData.append('entityId', applicationId as string);
    formData.append('category', getCategory(inputId));
    formData.append('fileName', fileName);

    try {
      const response = await fetch('https://mrcgp-api.omnifics.io/api/v1/attachments/upload/image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        setFileError("Upload failed. Please try again.");
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

      console.log(`Upload successful for ${inputId}:`, data);
      // Keep the local preview URL, don't replace with server URL
    } catch (error) {
      setFileError("Upload failed. Please try again.");
      return false;
    }

    // For queued uploads, return the local preview URL
    if (!applicationId) {
      return localPreviewUrl;
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
console.log("Rendering ApplicationForm with selectedExam:", selectedExam);
console.log("Rendering ApplicationForm with occurrenceLoading:", occurrenceLoading);
console.log("Rendering ApplicationForm with occurrenceError:", occurrenceError);
console.log("date comparison", examOccurrence && new Date() > new Date(examOccurrence.examSlots?.[0]?.startDate || ''));

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
                  deleteUploadedFile={deleteUploadedFile}
                  onEmailBlur={handleEmailBlur}
                  onFullNameBlur={handleFullNameBlur}
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
                  onEmailBlur={handleEmailBlur}
                  onFullNameBlur={handleFullNameBlur}
                />
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-end">
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
                  disabled={isSubmitting || applicationExists}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : applicationExists ? (
                    "Application Already Exists - Change Email"
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
