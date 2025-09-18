import { apiRequest } from "./apiClient";

export type ApplicationData = {
  id: string;
  createdAt: string;
  updatedAt: string;
  candidateId: string;
  fullName: string;
  email: string;
  personalContact: string;
  emergencyContact: string;
  streetAddress: string;
  city: string;
  district: string;
  province: string;
  country: string;
  originCountry: string;
  clinicalExperienceCountry: string;
  registrationAuthority: string;
  registrationNumber: string;
  registrationDate: string;
  examOccurrenceId: string;
  status: "APPROVED" | "REJECTED" | "PENDING" | "WAITING";
  isWaiting: boolean;
  notes?: string;
  adminNotes?: string;
  reviewedAt?: string;
  reviewedById?: string;
  // Additional fields that might be present
  applicantName?: string;
  examId?: string;
  submittedDate?: string;
  examName?: string;
  date?: string;
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

export async function listApplications(examOccurrenceId?: string, status?: string, page = 1, take = 10): Promise<{ data: ApplicationData[]; meta: { itemCount: number; pageCount: number; hasPreviousPage: boolean; hasNextPage: boolean } }> {
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

export async function deleteApplication(id: string): Promise<{ id: string } | undefined> {
  await apiRequest<unknown>(`${BASE}/${id}`, "DELETE");
  return { id };
}