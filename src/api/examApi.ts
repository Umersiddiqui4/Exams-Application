import { apiRequest } from "./clients/apiClient";

export type Exam = {
	id: string;
	name: string;
	description?: string;
	createdAt?: string;
	updatedAt?: string;
};

export type CreateExamDto = {
	name: string;
	description?: string;
};

export type UpdateExamDto = Partial<CreateExamDto>;

const BASE = "/api/v1/exams";

export async function createExam(payload: CreateExamDto): Promise<Exam> {
	return apiRequest<Exam>(BASE, "POST", payload);
}

export async function listExams(): Promise<Exam[]> {
	return apiRequest<Exam[]>("/api/v1/exams?page=1&take=20", "GET");
}

export async function getExam(id: string): Promise<Exam> {
	return apiRequest<Exam>(`${BASE}/${id}`, "GET");
}

export async function updateExam(id: string, payload: UpdateExamDto): Promise<Exam> {
	return apiRequest<Exam>(`${BASE}/${id}`, "PATCH", payload);
}

export async function deleteExam(id: string): Promise<{ id: string } | undefined> {
	await apiRequest<unknown>(`${BASE}/${id}`, "DELETE");
	return { id };
}


