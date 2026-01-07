/**
 * API Type Definitions
 * Centralized type definitions for API requests and responses
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Domain-specific types
export interface Project {
  id: number;
  title: string;
  description?: string;
  goal: number;
  raised: number;
  category: ProjectCategory;
  image: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ProjectCategory {
  Community = 'Community',
  Aid = 'Aid',
  Infrastructure = 'Infrastructure',
  Evangelism = 'Evangelism',
  Education = 'Education',
  Healthcare = 'Healthcare',
}

export enum ProjectStatus {
  Active = 'active',
  Completed = 'completed',
  Paused = 'paused',
  Cancelled = 'cancelled',
}

export interface MinistryGoal {
  id: number;
  title: string;
  description: string;
  goal: number;
  raised: number;
  icon: string;
  color: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: number;
  title: string;
  description?: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  status: ExpenseStatus;
  receiptUrl?: string;
  approvedBy?: string;
  projectId?: number;
  createdAt: string;
  updatedAt: string;
}

export enum ExpenseCategory {
  Infrastructure = 'Infrastructure',
  Events = 'Events',
  Aid = 'Aid',
  Logistics = 'Logistics',
  Admin = 'Admin',
  Payroll = 'Payroll',
  Marketing = 'Marketing',
}

export enum ExpenseStatus {
  Pending = 'Pending Audit',
  Verified = 'Verified',
  Rejected = 'Rejected',
}

export interface Donation {
  id: number;
  amount: number;
  projectId?: number;
  project?: Project;
  donorName?: string;
  donorEmail?: string;
  message?: string;
  isAnonymous: boolean;
  status: DonationStatus;
  paymentMethod: PaymentMethod;
  transactionId: string;
  createdAt: string;
}

export enum DonationStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
  Refunded = 'refunded',
}

export enum PaymentMethod {
  Card = 'card',
  BankTransfer = 'bank_transfer',
  PayPal = 'paypal',
  Crypto = 'crypto',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  Admin = 'Administrator',
  Manager = 'Manager',
  Supporter = 'Supporter',
  Volunteer = 'Volunteer',
  Guest = 'Guest',
}

export enum Permission {
  ViewDashboard = 'view:dashboard',
  ViewProjects = 'view:projects',
  CreateProject = 'create:project',
  EditProject = 'edit:project',
  DeleteProject = 'delete:project',
  ViewExpenses = 'view:expenses',
  CreateExpense = 'create:expense',
  ApproveExpense = 'approve:expense',
  ViewDonations = 'view:donations',
  ExportData = 'export:data',
  ManageUsers = 'manage:users',
  ViewAnalytics = 'view:analytics',
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
  goal: number;
  category: ProjectCategory;
  image: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateExpenseRequest {
  title: string;
  description?: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  projectId?: number;
  receipt?: File;
}

export interface CreateDonationRequest {
  amount: number;
  projectId?: number;
  donorName?: string;
  donorEmail?: string;
  message?: string;
  isAnonymous: boolean;
  paymentMethod: PaymentMethod;
}
