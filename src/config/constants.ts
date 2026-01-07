/**
 * Application Constants
 * Central location for all app-wide constants
 */

export const APP_CONFIG = {
  name: 'SkyRaven Ministries',
  version: '1.0.0',
  description: 'Enterprise Donations and Expense Tracking Platform',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
  },
  PROJECTS: {
    LIST: '/projects',
    DETAIL: (id: number) => `/projects/${id}`,
    CREATE: '/projects',
    UPDATE: (id: number) => `/projects/${id}`,
    DELETE: (id: number) => `/projects/${id}`,
  },
  DONATIONS: {
    LIST: '/donations',
    CREATE: '/donations',
    USER_HISTORY: '/donations/user',
  },
  EXPENSES: {
    LIST: '/expenses',
    CREATE: '/expenses',
    UPDATE: (id: number) => `/expenses/${id}`,
    VERIFY: (id: number) => `/expenses/${id}/verify`,
  },
  GOALS: {
    LIST: '/ministry-goals',
    CREATE: '/ministry-goals',
    UPDATE: (id: number) => `/ministry-goals/${id}`,
  },
  DOCUMENTS: {
    LIST: '/documents',
    UPLOAD: '/documents/upload',
    DELETE: (id: number) => `/documents/${id}`,
  },
} as const;

export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  DONATE: '/donate',
  EXPENSES: '/expenses',
  DOCUMENTS: '/documents',
  PROFILE: '/profile',
  ADMIN: '/admin',
} as const;

export const CACHE_KEYS = {
  PROJECTS: 'projects',
  EXPENSES: 'expenses',
  DONATIONS: 'donations',
  MINISTRY_GOALS: 'ministry-goals',
  USER_PROFILE: 'user-profile',
} as const;

export const CACHE_TIMES = {
  SHORT: 1000 * 60 * 5, // 5 minutes
  MEDIUM: 1000 * 60 * 15, // 15 minutes
  LONG: 1000 * 60 * 60, // 1 hour
} as const;

export const ROLES = {
  ADMIN: 'Administrator',
  SUPPORTER: 'Supporter',
  GUEST: 'Guest',
} as const;

export const PROJECT_CATEGORIES = [
  'Community',
  'Aid',
  'Infrastructure',
  'Evangelism',
  'Education',
  'Healthcare',
] as const;

export const EXPENSE_CATEGORIES = [
  'Infrastructure',
  'Events',
  'Aid',
  'Logistics',
  'Admin',
  'Salaries',
  'Marketing',
] as const;

export const EXPENSE_STATUS = {
  PENDING: 'Pending Audit',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
} as const;

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export const VALIDATION = {
  MIN_DONATION_AMOUNT: 1,
  MAX_DONATION_AMOUNT: 1000000,
  MIN_PROJECT_GOAL: 100,
  MAX_PROJECT_GOAL: 10000000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
} as const;
