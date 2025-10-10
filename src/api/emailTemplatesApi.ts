import { apiRequest } from "./clients/apiClient";

export type EmailTemplate = {
	id: string;
	type: string;
	subject: string;
	content: string;
	isActive: boolean;
	description: string;
	createdAt?: string;
	updatedAt?: string;
};

export type CreateEmailTemplateDto = Omit<EmailTemplate, "id" | "createdAt" | "updatedAt">;
export type UpdateEmailTemplateDto = Partial<CreateEmailTemplateDto>;

const BASE = "/api/v1/email-templates";

export async function listEmailTemplates(): Promise<EmailTemplate[]> {
	return apiRequest<EmailTemplate[]>(BASE, "GET");
}

export async function getEmailTemplate(id: string): Promise<EmailTemplate> {
	return apiRequest<EmailTemplate>(`${BASE}/${id}`, "GET");
}

export async function createEmailTemplate(payload: CreateEmailTemplateDto): Promise<EmailTemplate> {
	return apiRequest<EmailTemplate>(BASE, "POST", payload);
}

export async function updateEmailTemplate(id: string, payload: UpdateEmailTemplateDto): Promise<EmailTemplate> {
	return apiRequest<EmailTemplate>(`${BASE}/${id}`, "PATCH", payload);
}

export async function deleteEmailTemplate(id: string): Promise<{ id: string } | undefined> {
	await apiRequest<unknown>(`${BASE}/${id}`, "DELETE");
	return { id };
}


