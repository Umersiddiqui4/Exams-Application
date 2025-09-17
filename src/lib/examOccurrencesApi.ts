import { apiRequest } from "./apiClient";

export type ExamOccurrence = {
	id: string;
	examId: string;
	title: string;
	type: string; // e.g., AKT, OSCE
	examDate: string; // ISO date string
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

export type CreateExamOccurrenceDto = Omit<ExamOccurrence, "id" | "createdAt" | "updatedAt">;
export type UpdateExamOccurrenceDto = Partial<CreateExamOccurrenceDto>;

const BASE = "/api/v1/exam-occurrences";

export async function listExamOccurrences(): Promise<ExamOccurrence[]> {
	return apiRequest<ExamOccurrence[]>("/api/v1/exam-occurrences?page=1&take=10", "GET");
}

export async function listAvailableExamOccurrences(): Promise<ExamOccurrence[]> {
	return apiRequest<ExamOccurrence[]>(`${BASE}/available`, "GET");
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


