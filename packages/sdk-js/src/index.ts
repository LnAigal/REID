export interface REIDConfig {
  apiKey: string;
  baseUrl?: string;
}

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
  code: string;
  details?: Record<string, unknown>;
}

class REIDError extends Error {
  code: string;
  details?: Record<string, unknown>;

  constructor(error: APIError) {
    super(error.message);
    this.name = "REIDError";
    this.code = error.code;
    this.details = error.details;
  }
}

export class REID {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, options?: { baseUrl?: string }) {
    if (!apiKey) {
      throw new Error("API key is required");
    }
    this.apiKey = apiKey;
    this.baseUrl = options?.baseUrl || "https://api.reid.dev/v1";
  }

  get emails() {
    return {
      send: (options: SendEmailOptions): Promise<EmailResponse> =>
        this.request("POST", "/emails", options),
    };
  }

  get domains() {
    return {
      list: () => this.request("GET", "/domains"),
      get: (id: string) => this.request("GET", `/domains/${id}`),
      create: (data: { name: string }) => this.request("POST", "/domains", data),
      verify: (id: string) => this.request("POST", `/domains/${id}/verify`),
      delete: (id: string) => this.request("DELETE", `/domains/${id}`),
    };
  }

  get apiKeys() {
    return {
      list: () => this.request("GET", "/api-keys"),
      create: (data: { name: string; type: "LIVE" | "TEST" }) =>
        this.request("POST", "/api-keys", data),
      delete: (id: string) => this.request("DELETE", `/api-keys/${id}`),
      regenerate: (id: string) => this.request("POST", `/api-keys/${id}/regenerate`),
    };
  }

  private async request<T = any>(
    method: string,
    path: string,
    body?: any
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
    const data: any = await response.json();

    if (!response.ok) {
      throw new REIDError(data as APIError);
    }

    return data.data || data;
  }
}

export default REID;
