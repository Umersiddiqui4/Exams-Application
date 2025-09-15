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

export async function loginWithEmailPassword(email: string, password: string): Promise<LoginResponse> {
	const baseUrl = "https://mrcgp-api.omnifics.io";
	return apiRequest<LoginResponse>("/api/v1/auth/email/login", "POST", { email, password }, { baseUrl });
}


