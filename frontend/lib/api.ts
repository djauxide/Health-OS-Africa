export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function getToken() {
  if (typeof document === "undefined") return null;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("healthos_token="))
    ?.split("=")[1];
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers
    }
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body?.error?.message ?? "API request failed");
  }

  return body.data as T;
}

export function setSession(token: string) {
  document.cookie = `healthos_token=${token}; path=/; max-age=28800; SameSite=Lax`;
}

export function clearSession() {
  document.cookie = "healthos_token=; path=/; max-age=0; SameSite=Lax";
}

