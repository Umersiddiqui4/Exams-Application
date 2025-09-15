export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type ApiClientOptions = {
	baseUrl?: string;
	token?: string | null;
};

function getDefaultOptions(): Required<ApiClientOptions> {
	return {
		baseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
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
		const refreshed = await refreshAccessToken(baseUrl);
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
		const text = await res.text().catch(() => "");
		throw new Error(`API ${method} ${url} failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
	}
	// Try to parse JSON; allow empty body
	const contentType = res.headers.get("content-type") || "";
	if (contentType.includes("application/json")) return (await res.json()) as T;
	return (undefined as unknown) as T;
}

let refreshingPromise: Promise<string | null> | null = null;

async function refreshAccessToken(baseUrl: string): Promise<string | null> {
	if (refreshingPromise) return refreshingPromise;
	refreshingPromise = (async () => {
		try {
			const refreshToken = typeof localStorage !== "undefined" ? localStorage.getItem("refresh_token") : null;
			if (!refreshToken) return null;
			const refreshPath = (import.meta as any).env?.VITE_API_REFRESH_PATH ?? "/api/v1/auth/tokens/refresh";
			const url = `${baseUrl.replace(/\/$/, "")}${refreshPath}`;
			const res = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ refreshToken }),
			});
			if (!res.ok) {
				// Clear tokens if refresh fails
				try {
					localStorage.removeItem("auth_token");
					localStorage.removeItem("refresh_token");
				} catch {}
				return null;
			}
			const data = await res.json().catch(() => ({}));
			// Support several shapes
			const token = data?.data?.tokens?.access?.token || data?.access?.token || data?.token || null;
			if (token) {
				try { localStorage.setItem("auth_token", token); } catch {}
				return token as string;
			}
			// If response had no token, clear tokens
			try {
				localStorage.removeItem("auth_token");
				localStorage.removeItem("refresh_token");
			} catch {}
			return null;
		} catch {
			try {
				localStorage.removeItem("auth_token");
				localStorage.removeItem("refresh_token");
			} catch {}
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
			window.location.href = "/login";
		}
	} catch {}
}


