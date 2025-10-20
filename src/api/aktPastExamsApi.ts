import { apiRequest } from "./clients/apiClient";

export type AktPastExam = {
	id: string;
	name: string;
	description?: string;
	createdAt?: string;
	updatedAt?: string;
};

export type CreateAktPastExamDto = {
	name: string;
	description?: string;
};

export type UpdateAktPastExamDto = Partial<CreateAktPastExamDto>;

const BASE = "/api/v1/akt-past-exams";

export async function createAktPastExam(payload: CreateAktPastExamDto): Promise<AktPastExam> {
	return apiRequest<AktPastExam>(BASE, "POST", payload);
}

export async function listAktPastExams(): Promise<AktPastExam[]> {
	return apiRequest<AktPastExam[]>("/api/v1/akt-past-exams?page=1&take=100&q=AKT", "GET");
}

export async function getAktPastExam(id: string): Promise<AktPastExam> {
	return apiRequest<AktPastExam>(`${BASE}/${id}`, "GET");
}

export async function updateAktPastExam(id: string, payload: UpdateAktPastExamDto): Promise<AktPastExam> {
	return apiRequest<AktPastExam>(`${BASE}/${id}`, "PATCH", payload);
}

export async function deleteAktPastExam(id: string): Promise<{ id: string } | undefined> {
	await apiRequest<unknown>(`${BASE}/${id}`, "DELETE");
	return { id };
}


