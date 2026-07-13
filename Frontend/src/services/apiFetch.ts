import { API_BASE_URL } from "@/config/api";

/**
 * Authenticated fetch wrapper.
 * Automatically injects the Bearer token from localStorage
 * and prepends API_BASE_URL if a relative path is given.
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const res = await fetch(url, { ...options, headers });

  // Mirror the apiClient behaviour: redirect to login on 401
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("adminData");
    window.location.href = "/login";
  }

  return res;
}
