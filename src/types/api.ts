// Common API Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
  success: boolean;
}

// Attachment Types
export interface Attachment {
  id: string;
  fileName: string;
  fileType: 'image' | 'document';
  fileUrl?: string;
  category: string;
  entityType: string;
  entityId: string;
  examOccurrenceId?: string;
  createdAt?: string;
  updatedAt?: string;
  base64Data?: string | null;
}

// Application Types
export interface Application {
  id: string;
  examOccurrenceId: string;
  candidateId?: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'under_review' | 'waiting';
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
  attachments?: Attachment[];
  formData?: Record<string, unknown>;
  [key: string]: unknown; // For dynamic fields
}

export interface ApplicationCreatePayload {
  examOccurrenceId: string;
  fullName: string;
  email: string;
  phone?: string;
  candidateId?: string;
}

export interface ApplicationUpdatePayload {
  fullName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  status?: string;
  formData?: Record<string, unknown>;
  [key: string]: unknown;
}

// Exam Types
export interface ExamOccurrence {
  id: string;
  examId: string;
  title: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  maxParticipants?: number;
  currentParticipants?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  type: 'AKT' | 'OSCE' | 'CSA' | 'other';
  duration?: number;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
  occurrences?: ExamOccurrence[];
}

// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'user' | 'candidate';
  createdAt: string;
  updatedAt: string;
}

// Dashboard/Statistics Types
export interface DashboardStats {
  total: number;
  approved: number;
  rejected: number;
  submitted: number;
  underReview: number;
  pending: number;
}

export interface CurrentExamStats {
  total: number;
  approved: number;
  rejected: number;
  submitted: number;
  underReview: number;
  pending: number;
  examTitle: string;
  examDate: string;
}

export interface StatisticsResponse {
  approvedApplications: number;
  rejectedApplications: number;
  submittedApplications: number;
  inReviewApplications: number;
  waitingApplications: number;
}

// Email Template Types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables?: string[];
  createdAt: string;
  updatedAt: string;
}

// Field Configuration Types
export interface FieldConfig {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'email' | 'phone' | 'select' | 'textarea' | 'file' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: Record<string, unknown>;
  visible?: boolean;
  order?: number;
}

// Form Field Types
export interface FormField {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  value?: unknown;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    pattern?: string;
    message?: string;
    min?: number;
    max?: number;
  };
}

// Past Exam Types
export interface PastExam {
  id: string;
  title: string;
  examDate: string;
  year: number;
  type: string;
  status: 'available' | 'unavailable';
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// React Query Response Types
export interface QueryResponse<T> {
  data?: T;
  error?: Error;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

// File Upload Types
export interface FileUploadResponse {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  size: number;
  message?: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Types
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// Generic Record Types for flexible objects
export type StringRecord = Record<string, string>;
export type UnknownRecord = Record<string, unknown>;

