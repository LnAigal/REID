export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EmailData {
  id: string;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  replyTo?: string;
  subject: string;
  html?: string;
  text?: string;
  headers?: Record<string, string>;
  status: EmailStatus;
  provider: EmailProvider;
  latency?: number;
  errorMessage?: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  bouncedAt?: string;
  createdAt: string;
}

export interface ApiKeyData {
  id: string;
  name: string;
  prefix: string;
  type: 'LIVE' | 'TEST';
  isActive: boolean;
  lastUsed?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface DomainData {
  id: string;
  name: string;
  status: DomainStatus;
  verificationToken: string;
  spfRecord?: string;
  dkimRecord?: string;
  dmarcRecord?: string;
  verifiedAt?: string;
  records: DomainRecordData[];
  createdAt: string;
}

export interface DomainRecordData {
  id: string;
  type: string;
  name: string;
  value: string;
  status: string;
}

export interface UserData {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN';
  emailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface AnalyticsData {
  emailsSent: number;
  successRate: number;
  failureRate: number;
  bounceRate: number;
  totalDomains: number;
  totalApiKeys: number;
  recentActivity: ActivityItem[];
  chartData: ChartDataPoint[];
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

export interface ChartDataPoint {
  date: string;
  sent: number;
  delivered: number;
  failed: number;
  bounced: number;
}

export type EmailStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'SENT'
  | 'DELIVERED'
  | 'OPENED'
  | 'CLICKED'
  | 'BOUNCED'
  | 'FAILED';

export type EmailProvider = 'BREVO' | 'SES' | 'MAILGUN' | 'SMTP2GO' | 'CUSTOM_SMTP';

export type DomainStatus = 'PENDING' | 'VERIFIED' | 'FAILED';

export interface TemplateData {
  id: string;
  name: string;
  subject: string;
  html: string;
  text?: string;
  variables?: Record<string, string>;
  isActive: boolean;
  createdAt: string;
}
