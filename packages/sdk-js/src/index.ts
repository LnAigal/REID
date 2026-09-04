export interface SendEmailOptions {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  subject: string;
  html?: string;
  text?: string;
  headers?: Record<string, string>;
}

export interface EmailResponse {
  id: string;
  from: string;
  to: string[];
  subject: string;
  status: string;
  createdAt: string;
}

export interface APIError {
  success: false;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export class REIDError extends Error {
  code: string;
  details?: Record<string, unknown>;

  constructor(error: APIError) {
    super(error.message);
    this.name = "REIDError";
    this.code = error.code ?? "REQUEST_FAILED";
    this.details = error.details;
  }
}

export interface DomainData {
  id: string;
  name: string;
  status: string;
  verificationToken?: string;
  records: Array<{ type: string; name: string; value: string }>;
  createdAt: string;
}

export interface ApiKeyData {
  id: string;
  name: string;
  prefix: string;
  type: string;
  isActive: boolean;
  lastUsed?: string;
  createdAt: string;
}

class REID {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, options?: { baseUrl?: string }) {
    if (!apiKey) {
      throw new Error("API key is required");
    }
    this.apiKey = apiKey;
    this.baseUrl = options?.baseUrl || "https://api.reid.dev/api/v1";
  }

  get emails() {
    return {
      send: (options: SendEmailOptions): Promise<EmailResponse> =>
        this.request("POST", "/emails", options),
    };
  }

  get domains() {
    return {
      list: () => this.request<{ success: boolean; data: DomainData[] }>("GET", "/domains"),
      get: (id: string) => this.request<{ success: boolean; data: DomainData }>("GET", `/domains/${id}`),
      create: (data: { name: string }) => this.request<{ success: boolean; data: DomainData }>("POST", "/domains", data),
      verify: (id: string) => this.request<{ success: boolean; data: DomainData }>("POST", `/domains/${id}/verify`),
      delete: (id: string) => this.request<{ success: boolean; message: string }>("DELETE", `/domains/${id}`),
    };
  }

  get apiKeys() {
    return {
      list: () => this.request<{ success: boolean; data: ApiKeyData[] }>("GET", "/api-keys"),
      create: (data: { name: string; type: "LIVE" | "TEST" }) =>
        this.request<{ success: boolean; data: ApiKeyData & { key: string } }>("POST", "/api-keys", data),
      delete: (id: string) => this.request<{ success: boolean; message: string }>("DELETE", `/api-keys/${id}`),
      regenerate: (id: string) => this.request<{ success: boolean; data: ApiKeyData & { key: string } }>("POST", `/api-keys/${id}/regenerate`),
    };
  }

  private async request<T = unknown>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };

    const config: RequestInit = { method, headers };
    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);
    const data = (await response.json().catch(() => null)) as
      | Record<string, unknown>
      | null;

    if (!response.ok) {
      throw new REIDError(
        (data ?? {
          success: false,
          message: `Request failed with status ${response.status}`,
        }) as unknown as APIError,
      );
    }

    return (data?.data ?? data ?? {}) as T;
  }
}

export default REID;
