import type { EmailData, ApiKeyData, DomainData, UserData, TemplateData, ChartDataPoint } from "@repo/shared";

function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_URL environment variable is required");
  }
  return url;
}

function getCsrfToken(): string | null {
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? match[1] : null;
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

async function request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;
  const method = (fetchOptions.method || "GET").toUpperCase();

  let url = `${getApiUrl()}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) searchParams.set(key, String(value));
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (method !== "GET" && method !== "HEAD") {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }
  }

  const res = await fetch(url, {
    ...fetchOptions,
    credentials: "include",
    headers,
  });

  if (!res.ok) {
    const body: Record<string, unknown> = await res.json().catch(() => ({}));
    throw new Error(typeof body.message === "string" ? body.message : `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  getProfile: () => request<{ success: boolean; data: UserData }>("/auth/profile"),
  updateProfile: (data: { name?: string; avatarUrl?: string }) =>
    request<{ success: boolean; data: UserData }>("/auth/profile", { method: "PATCH", body: JSON.stringify(data) }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ success: boolean; data: { message: string } }>("/auth/password", { method: "PATCH", body: JSON.stringify(data) }),
  sendVerification: () =>
    request<{ success: boolean; data: { message: string } }>("/auth/send-verification", { method: "POST" }),
  verifyEmail: (token: string) =>
    request<{ success: boolean; data: { message: string } }>("/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) }),
  forgotPassword: (email: string) =>
    request<{ success: boolean; data: { message: string } }>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (token: string, password: string) =>
    request<{ success: boolean; data: { message: string } }>("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) }),

  // Emails
  getEmails: (page = 1, limit = 20, search?: string) =>
    request<{ success: boolean; data: EmailData[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>("/emails", { params: { page, limit, search } }),
  getEmailStats: () =>
    request<{ success: boolean; data: { total: number; sent: number; delivered: number; failed: number; bounced: number; successRate: number } }>("/emails/stats/overview"),

  // Domains
  getDomains: () =>
    request<{ success: boolean; data: DomainData[] }>("/domains"),
  createDomain: (name: string) =>
    request<{ success: boolean; data: DomainData }>("/domains", { method: "POST", body: JSON.stringify({ name }) }),
  verifyDomain: (id: string) =>
    request<{ success: boolean; data: DomainData }>(`/domains/${id}/verify`, { method: "POST" }),
  deleteDomain: (id: string) =>
    request<{ success: boolean; message: string }>(`/domains/${id}`, { method: "DELETE" }),

  // API Keys
  getApiKeys: () =>
    request<{ success: boolean; data: ApiKeyData[] }>("/api-keys"),
  createApiKey: (name: string, type: "LIVE" | "TEST") =>
    request<{ success: boolean; data: ApiKeyData & { key: string } }>("/api-keys", { method: "POST", body: JSON.stringify({ name, type }) }),
  deleteApiKey: (id: string) =>
    request<{ success: boolean; message: string }>(`/api-keys/${id}`, { method: "DELETE" }),
  regenerateApiKey: (id: string) =>
    request<{ success: boolean; data: ApiKeyData & { key: string } }>(`/api-keys/${id}/regenerate`, { method: "POST" }),

  // Analytics
  getAnalyticsOverview: () =>
    request<{ success: boolean; data: { total: number; sent: number; delivered: number; failed: number; bounced: number } }>("/analytics/overview"),
  getChartData: (days = 30) =>
    request<{ success: boolean; data: ChartDataPoint[] }>("/analytics/chart", { params: { days } }),

  // Templates
  getTemplates: () =>
    request<{ success: boolean; data: TemplateData[] }>("/templates"),
  createTemplate: (data: { name: string; subject: string; html: string; text?: string }) =>
    request<{ success: boolean; data: TemplateData }>("/templates", { method: "POST", body: JSON.stringify(data) }),
  deleteTemplate: (id: string) =>
    request<{ success: boolean; message: string }>(`/templates/${id}`, { method: "DELETE" }),
};
