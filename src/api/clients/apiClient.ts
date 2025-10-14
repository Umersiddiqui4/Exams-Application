import { logger } from '@/lib/logger';
import { safeLocalStorage } from '@/lib/errorHandler';

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type ApiClientOptions = {
	baseUrl?: string;
	token?: string | null;
};

function getDefaultOptions(): Required<ApiClientOptions> {
	return {
		baseUrl: import.meta.env.VITE_API_BASE_URL ?? "https://mrcgp-api.omnifics.io",
		token: (typeof localStorage !== "undefined" ? localStorage.getItem("auth_token") : null) ?? (import.meta.env.VITE_API_TOKEN ?? null),
	};
}

export async function apiRequest<T>(
	path: string,
	method: HttpMethod,
	body?: unknown,
	opts?: ApiClientOptions,
): Promise<T> {
	const { baseUrl, token } = { ...getDefaultOptions(), ...opts };
	if (!baseUrl) throw new Error("API base URL is not configured (VITE_API_BASE_URL)");
	const url = `${baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	if (token) headers["Authorization"] = `Bearer ${token}`;
	let res = await fetch(url, {
		method,
		headers,
		body: body === undefined ? undefined : JSON.stringify(body),
	});
	if (!res.ok && res.status === 401) {
		// Try refresh once
		const refreshed = await refreshAccessToken(baseUrl, 4);
		if (refreshed) {
			headers["Authorization"] = `Bearer ${refreshed}`;
			res = await fetch(url, {
				method,
				headers,
				body: body === undefined ? undefined : JSON.stringify(body),
			});
		}
	}
	if (!res.ok) {
		if (res.status === 401) {
			safeLocalStorage(() => {
				localStorage.removeItem("auth_token");
				localStorage.removeItem("refresh_token");
			}, 'Failed to clear auth tokens');
			// Immediate redirect if a request hits 401 without successful refresh
			redirectToLoginIfUnauthenticated();
		}
		const text = await res.text().catch(() => "");
		throw new Error(`API ${method} ${url} failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
	}
	// Try to parse JSON; allow empty body
	const contentType = res.headers.get("content-type") || "";
	if (contentType.includes("application/json")) return (await res.json()) as T;
	return (undefined as unknown) as T;
}

let refreshingPromise: Promise<string | null> | null = null;

async function refreshAccessToken(baseUrl: string, maxAttempts: number = 4): Promise<string | null> {
	if (refreshingPromise) return refreshingPromise;
	refreshingPromise = (async () => {
		try {
			const refreshToken = typeof localStorage !== "undefined" ? localStorage.getItem("refresh_token") : null;
			if (!refreshToken) return null;

		// Generate device token if not exists
		let deviceToken = typeof localStorage !== "undefined" ? localStorage.getItem("device_token") : null;
		if (!deviceToken) {
			deviceToken = crypto.randomUUID();
			safeLocalStorage(() => {
				localStorage.setItem("device_token", deviceToken!);
			}, 'Failed to save device token');
		}

			// Get timezone
			const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

			const url = `${baseUrl.replace(/\/$/, "")}/api/v1/auth/refresh`;

			for (let attempt = 1; attempt <= maxAttempts; attempt++) {
				const res = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-refresh-token": refreshToken
					},
					body: JSON.stringify({
						deviceToken: deviceToken,
						timeZone: timeZone
					}),
				});
				if (!res.ok) {
					// If refresh API returns 401, refresh token is invalid, don't retry
					if (res.status === 401) {
						return null;
					}
					// try again until attempts exhausted for other errors
					continue;
				}
				const data = await res.json().catch(() => ({}));
				// Support several shapes from backend
				const accessToken =
					data?.data?.tokens?.access?.token ||
					data?.tokens?.access?.token ||
					data?.accessToken ||
					data?.access?.token ||
					data?.token ||
					null;
				const nextRefreshToken =
					data?.data?.tokens?.refresh?.token ||
					data?.tokens?.refresh?.token ||
					data?.refreshToken ||
					data?.refresh?.token ||
					null;
			if (accessToken) {
				safeLocalStorage(() => {
					localStorage.setItem("auth_token", accessToken as string);
					if (nextRefreshToken) localStorage.setItem("refresh_token", nextRefreshToken as string);
				}, 'Failed to save auth tokens');
				return accessToken as string;
			}
				// If response had no token, try next attempt
		}
		return null;
	} catch (error) {
		logger.warn('Token refresh failed', error);
		return null;
	} finally {
			const t = refreshingPromise;
			refreshingPromise = null;
			void t; // no-op
		}
	})();
	return refreshingPromise;
}

export function redirectToLoginIfUnauthenticated() {
	try {
		const token = localStorage.getItem("auth_token");
		if (!token && window.location.pathname !== "/login") {
			window.location.replace("/login");
		}
	} catch (error) {
		logger.warn('Failed to check authentication status', error);
	}
}


