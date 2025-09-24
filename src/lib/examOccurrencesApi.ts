import { apiRequest } from "./apiClient";

export type ExamSlot = {
	slotNumber: number;
	startDate: string; // ISO date string
	endDate: string; // ISO date string
	isActive: boolean;
	description: string;
};

export type ExamOccurrence = {
	id: string;
	examId: string;
	title: string;
	type: string; // e.g., AKT, OSCE
	examSlots: ExamSlot[];
	registrationStartDate: string; // ISO date string
	registrationEndDate: string; // ISO date string
	applicationLimit: number;
	waitingListLimit: number;
	isActive: boolean;
	location: string[];
	instructions?: string;
	createdAt?: string;
	updatedAt?: string;
};

export type Availability = ExamOccurrence & {
	canApply: boolean;
	reason: string;
	applicationsCount: number;
	waitingCount: number;
};

export type CreateExamOccurrenceDto = Omit<ExamOccurrence, "id" | "createdAt" | "updatedAt">;
export type UpdateExamOccurrenceDto = Partial<CreateExamOccurrenceDto>;

const BASE = "/api/v1/exam-occurrences";

export async function listExamOccurrences(sortBy: string = "createdAt", sortOrder: string = "desc"): Promise<ExamOccurrence[]> {
	const params = new URLSearchParams({
		page: "1",
		take: "10",
		sortBy,
		sortOrder,
	});
	return apiRequest<ExamOccurrence[]>(`/api/v1/exam-occurrences?${params.toString()}`, "GET");
}

export async function listAvailableExamOccurrences(): Promise<ExamOccurrence[]> {
	return apiRequest<ExamOccurrence[]>(`${BASE}`, "GET");
}

export async function getExamOccurrence(id: string): Promise<ExamOccurrence> {
	return apiRequest<ExamOccurrence>(`${BASE}/${id}`, "GET");
}

export async function createExamOccurrence(payload: CreateExamOccurrenceDto): Promise<ExamOccurrence> {
	return apiRequest<ExamOccurrence>(BASE, "POST", payload);
}

export async function updateExamOccurrence(id: string, payload: UpdateExamOccurrenceDto): Promise<ExamOccurrence> {
	return apiRequest<ExamOccurrence>(`${BASE}/${id}`, "PATCH", payload);
}

export async function deleteExamOccurrence(id: string): Promise<{ id: string } | undefined> {
	await apiRequest<unknown>(`${BASE}/${id}`, "DELETE");
	return { id };
}

export async function toggleActiveExamOccurrence(id: string, isActive: boolean): Promise<ExamOccurrence> {
	return apiRequest<ExamOccurrence>(`/api/v1/exam-occurrences/${id}/toggle-active`, "PATCH", { isActive });
}

export async function examOccurrenceAvailability(id: string): Promise<Availability> {
	return apiRequest<Availability>(`/api/v1/exam-occurrences/${id}/availability`, "GET");
}

