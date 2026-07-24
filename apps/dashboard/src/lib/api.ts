const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

async function request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) searchParams.set(key, String(value));
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    ...fetchOptions,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  getProfile: () => request<{ success: boolean; data: any }>("/auth/profile"),
  updateProfile: (data: { name?: string; avatarUrl?: string }) =>
    request<{ success: boolean; data: any }>("/auth/profile", { method: "PATCH", body: JSON.stringify(data) }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ success: boolean; data: any }>("/auth/password", { method: "PATCH", body: JSON.stringify(data) }),

  // Emails
  getEmails: (page = 1, limit = 20, search?: string) =>
    request<{ success: boolean; data: any[]; pagination: any }>("/emails", { params: { page, limit, search } }),
  getEmailStats: () =>
    request<{ success: boolean; data: { total: number; sent: number; delivered: number; failed: number; bounced: number; successRate: number } }>("/emails/stats/overview"),

  // Domains
  getDomains: () =>
    request<{ success: boolean; data: any[] }>("/domains"),
  createDomain: (name: string) =>
    request<{ success: boolean; data: any }>("/domains", { method: "POST", body: JSON.stringify({ name }) }),
  verifyDomain: (id: string) =>
    request<{ success: boolean; data: any }>(`/domains/${id}/verify`, { method: "POST" }),
  deleteDomain: (id: string) =>
    request<{ success: boolean; message: string }>(`/domains/${id}`, { method: "DELETE" }),

  // API Keys
  getApiKeys: () =>
    request<{ success: boolean; data: any[] }>("/api-keys"),
  createApiKey: (name: string, type: "LIVE" | "TEST") =>
    request<{ success: boolean; data: any }>("/api-keys", { method: "POST", body: JSON.stringify({ name, type }) }),
  deleteApiKey: (id: string) =>
    request<{ success: boolean; message: string }>(`/api-keys/${id}`, { method: "DELETE" }),
  regenerateApiKey: (id: string) =>
    request<{ success: boolean; data: any }>(`/api-keys/${id}/regenerate`, { method: "POST" }),

  // Analytics
  getAnalyticsOverview: () =>
    request<{ success: boolean; data: any }>("/analytics/overview"),
  getChartData: (days = 30) =>
    request<{ success: boolean; data: any }>("/analytics/chart", { params: { days } }),

  // Templates
  getTemplates: () =>
    request<{ success: boolean; data: any[] }>("/templates"),
  createTemplate: (data: { name: string; subject: string; html: string; text?: string }) =>
    request<{ success: boolean; data: any }>("/templates", { method: "POST", body: JSON.stringify(data) }),
  deleteTemplate: (id: string) =>
    request<{ success: boolean; message: string }>(`/templates/${id}`, { method: "DELETE" }),
};
