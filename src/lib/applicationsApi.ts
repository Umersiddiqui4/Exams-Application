import { apiRequest } from "./apiClient";

export type ExamOccurrence = {
  id: string;
  createdAt: string;
  updatedAt: string;
  examId: string;
  title: string;
  type: string;
  examDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  applicationLimit: number;
  waitingListLimit: number;
  isActive: boolean;
  location: string[];
  instructions: string;
};

export type AktDetails = {
  id: string;
  applicationId: string;
  usualForename: string;
  lastName: string;
  gender: string | null;
  previousAKTAttempts: number;
  graduatingSchoolName: string;
  graduatingSchoolLocation: string;
  dateOfQualification: string;
  aktEligibility: any[];
  examinationCenterPreference: string;
  aktCandidateStatement: any[];
};

export type OsceDetails = {
  id: string;
  applicationId: string;
  aktPassingDate: string;
  previousOSCEAttempts: number;
  preferenceDate1: string;
  preferenceDate2: string;
  preferenceDate3: string;
  osceCandidateStatement: boolean;
};

export type Attachment = {
  id: string;
  key: string;
  url: string;
  fileName: string;
  fileType: string;
  size: number;
  uploadedAt: string;
  examOccurrenceId: string;
  entityType: string;
  entityId: string;
  category: string;
  uploadedById: string | null;
  deletedById: string | null;
  deletedAt: string | null;
};

export type ApplicationData = {
  id: string;
  createdAt: string;
  updatedAt: string;
  examOccurrenceId: string;
  examOccurrence: ExamOccurrence;
  email: string;
  candidateId: string;
  fullName: string;
  streetAddress: string;
  district: string;
  city: string;
  province: string;
  country: string;
  personalContact: string;
  emergencyContact: string;
  originCountry: string;
  clinicalExperienceCountry: string;
  registrationAuthority: string;
  registrationNumber: string;
  registrationDate: string;
  date: string;
  status: "APPROVED" | "REJECTED" | "PENDING" | "WAITING" | "SUBMITTED";
  isWaiting: boolean;
  notes?: string;
  adminNotes?: string;
  reviewedById?: string;
  reviewedAt?: string;
  aktDetails: AktDetails;
  osceDetails: OsceDetails;
  attachments: Attachment[];
  // Legacy fields for backward compatibility
  applicantName?: string;
  examId?: string;
  submittedDate?: string;
  examName?: string;
  name?: string;
  whatsapp?: string;
  passportUrl?: string;
  poBox?: string;
  dateOfPassingPart1?: string;
  countryOfOrigin?: string;
  preferenceDate1?: string;
  preferenceDate2?: string;
  preferenceDate3?: string;
  medicalLicenseUrl?: string;
  part1EmailUrl?: string;
  passportBioUrl?: string;
  signatureUrl?: string;
  previousOsceAttempts?: string;
  countryOfExperience?: string;
  agreementName?: string;
  agreementDate?: string;
  termsAgreed?: boolean;
};

export type CreateApplicationDto = Omit<ApplicationData, "id" | "submittedDate">;
export type UpdateApplicationDto = Partial<CreateApplicationDto>;
export type UpdateApplicationStatusDto = { status: "APPROVED" | "REJECTED" | "PENDING" | "WAITING" };

const BASE = "/api/v1/applications";

export async function listApplications(examOccurrenceId?: string, status?: string, page = 1, take = 1000): Promise<{ data: ApplicationData[]; meta: { itemCount: number; pageCount: number; hasPreviousPage: boolean; hasNextPage: boolean } }> {
  const params = new URLSearchParams({
    page: page.toString(),
    take: take.toString(),
  });
  if (examOccurrenceId) {
    params.append('examOccurrenceId', examOccurrenceId);
  }
  if (status) {
    params.append('status', status);
  }
  return apiRequest<{ data: ApplicationData[]; meta: { itemCount: number; pageCount: number; hasPreviousPage: boolean; hasNextPage: boolean } }>(`${BASE}?${params.toString()}`, "GET");
}

export async function getApplication(id: string): Promise<ApplicationData> {
  return apiRequest<ApplicationData>(`${BASE}/${id}`, "GET");
}

export async function createApplication(payload: CreateApplicationDto): Promise<ApplicationData> {
  return apiRequest<ApplicationData>(BASE, "POST", payload);
}

export async function updateApplication(id: string, payload: UpdateApplicationDto): Promise<ApplicationData> {
  return apiRequest<ApplicationData>(`${BASE}/${id}`, "PATCH", payload);
}

export async function updateApplicationStatus(id: string, payload: UpdateApplicationStatusDto): Promise<ApplicationData> {
  return apiRequest<ApplicationData>(`${BASE}/${id}/status`, "PATCH", payload);
}

export async function reviewApplication(id: string, status: "APPROVED" | "REJECTED", adminNotes?: string): Promise<ApplicationData> {
  return apiRequest<ApplicationData>(`${BASE}/${id}/review`, "PATCH", { status, adminNotes });
}

export async function startReview(id: string): Promise<void> {
  return apiRequest<void>(`${BASE}/${id}/start-review`, "GET");
}

export async function deleteApplication(id: string): Promise<{ id: string } | undefined> {
  await apiRequest<unknown>(`${BASE}/${id}`, "DELETE");
  return { id };
}