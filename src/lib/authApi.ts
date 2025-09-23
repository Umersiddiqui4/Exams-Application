import { apiRequest } from "./apiClient";

export type LoginResponse = {
	data: {
		user: {
			id: string;
			createdAt: string;
			updatedAt: string;
			firstName: string;
			lastName: string;
			email: string;
			phone: string;
			role: string;
		};
		tokens: {
			access: { token: string; expiresIn: string };
			refresh: { token: string; expiresIn: string };
		};
		isPasswordReset: boolean;
	};
	message: string;
	statusCode: number;
	success: boolean;
};

export type SignupRequest = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	phone: string;
};

export type SignupResponse = {
	data: {
		user: {
			id: string;
			createdAt: string;
			updatedAt: string;
			firstName: string;
			lastName: string;
			email: string;
			phone: string;
			role: string;
		};
		tokens: {
			access: { token: string; expiresIn: string };
			refresh: { token: string; expiresIn: string };
		};
	};
	message: string;
	statusCode: number;
	success: boolean;
};

export async function loginWithEmailPassword(email: string, password: string): Promise<LoginResponse> {
	const baseUrl = "https://mrcgp-api.omnifics.io";
	return apiRequest<LoginResponse>("/api/v1/auth/email/login", "POST", { email, password }, { baseUrl });
}

export async function signupWithEmail(data: SignupRequest): Promise<SignupResponse> {
	const baseUrl = "https://mrcgp-api.omnifics.io";
	return apiRequest<SignupResponse>("/api/v1/auth/email/signup", "POST", data, { baseUrl });
}

export type UploadImageRequest = {
	examOccurrenceId?: string;
	entityType: string;
	entityId: string;
	category: string;
	fileName: string;
	file: File;
};

export type UploadImageResponse = {
	message: string;
	statusCode: number;
	success: boolean;
	data?: any;
};

export async function uploadImage(data: UploadImageRequest): Promise<UploadImageResponse> {
	const baseUrl = "https://mrcgp-api.omnifics.io";
	const url = `${baseUrl.replace(/\/$/, "")}/api/v1/attachments/upload/image`;

	const formData = new FormData();
	formData.append('file', data.file);
	if (data.examOccurrenceId) formData.append('examOccurrenceId', data.examOccurrenceId);
	formData.append('entityType', data.entityType);
	formData.append('entityId', data.entityId);
	formData.append('category', data.category);
	formData.append('fileName', data.fileName);

	const token = localStorage.getItem("auth_token");
	const headers: Record<string, string> = {};
	if (token) headers["Authorization"] = `Bearer ${token}`;

	const res = await fetch(url, {
		method: "POST",
		headers,
		body: formData,
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`Upload failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
	}

	return res.json();
}


