import { apiRequest } from "./clients/apiClient";

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
	phone?: string;
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
	};
	message: string;
	statusCode: number;
	success: boolean;
};

export async function loginWithEmailPassword(email: string, password: string): Promise<LoginResponse> {
	const baseUrl = import.meta.env.VITE_API_BASE_URL;
	return apiRequest<LoginResponse>("/api/v1/auth/email/login", "POST", { email, password }, { baseUrl });
}

export async function signupWithEmail(data: SignupRequest): Promise<SignupResponse> {
	const baseUrl = import.meta.env.VITE_API_BASE_URL;
	return apiRequest<SignupResponse>("/api/v1/auth/email/signup", "POST", data, { baseUrl });
}

export type EmailVerificationResponse = {
	message: string;
	statusCode: number;
	success: boolean;
	data: {
		success: boolean;
		requiresPasswordReset: boolean;
	};
};

export async function verifyEmail(token: string): Promise<EmailVerificationResponse> {
	const baseUrl = import.meta.env.VITE_API_BASE_URL;
	return apiRequest<EmailVerificationResponse>(`/api/v1/auth/email/verify/api?token=${token}`, "POST", undefined, { baseUrl });
}

export type ResendEmailResponse = {
	data: object;
	message: string;
	statusCode: number;
	success: boolean;
};

export async function resendConfirmationEmail(email: string): Promise<ResendEmailResponse> {
	const baseUrl = import.meta.env.VITE_API_BASE_URL;
	return apiRequest<ResendEmailResponse>(`/api/v1/auth/email/resend?email=${email}`, "GET", undefined, { baseUrl });
}

export type ForgotPasswordRequest = {
	email: string;
};

export type ForgotPasswordResponse = {
	data: object;
	message: string;
	statusCode: number;
	success: boolean;
};

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
	const baseUrl = import.meta.env.VITE_API_BASE_URL;
	return apiRequest<ForgotPasswordResponse>("/api/v1/auth/password/forgot", "POST", { email }, { baseUrl });
}

export type ResetPasswordRequest = {
    token: string;
    password: string;
    shouldLogoutAllSessions?: boolean;
};

export type ResetPasswordResponse = {
    data?: object;
    message: string;
    statusCode: number;
    success: boolean;
};

export async function resetPassword(params: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const query = `token=${encodeURIComponent(params.token)}`;
    const body = {
        password: params.password,
        shouldLogoutAllSessions: params.shouldLogoutAllSessions ?? false,
    };
    return apiRequest<ResetPasswordResponse>(`/api/v1/auth/password/reset?${query}`, "POST", body, { baseUrl });
}

export type ChangePasswordRequest = {
    password: string;
    confirmPassword: string;
    shouldLogoutAllSessions?: boolean;
};

export type ChangePasswordResponse = {
    data?: object;
    message: string;
    statusCode: number;
    success: boolean;
};

export async function changePassword(payload: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    return apiRequest<ChangePasswordResponse>(
        "/api/v1/auth/password/change",
        "POST",
        {
            password: payload.password,
            confirmPassword: payload.confirmPassword,
            shouldLogoutAllSessions: payload.shouldLogoutAllSessions ?? false,
        },
        { baseUrl }
    );
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
	data?: {
		id: string;
		fileName: string;
		fileUrl?: string;
		fileType: string;
	};
};

export async function uploadImage(data: UploadImageRequest): Promise<UploadImageResponse> {
	const baseUrl = import.meta.env.VITE_API_BASE_URL;
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


