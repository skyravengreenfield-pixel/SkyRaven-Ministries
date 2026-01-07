/**
 * Validation Schemas
 * Zod schemas for runtime validation
 */

import { z } from 'zod';
import { VALIDATION } from '../config/constants';

// User validation
export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['Administrator', 'Supporter', 'Guest']),
});

// Project validation
export const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  goal: z
    .number()
    .min(VALIDATION.MIN_PROJECT_GOAL, `Goal must be at least $${VALIDATION.MIN_PROJECT_GOAL}`)
    .max(VALIDATION.MAX_PROJECT_GOAL, `Goal cannot exceed $${VALIDATION.MAX_PROJECT_GOAL}`),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  image: z.string().optional(),
});

// Donation validation
export const donationSchema = z.object({
  amount: z
    .number()
    .min(VALIDATION.MIN_DONATION_AMOUNT, `Minimum donation is $${VALIDATION.MIN_DONATION_AMOUNT}`)
    .max(
      VALIDATION.MAX_DONATION_AMOUNT,
      `Maximum donation is $${VALIDATION.MAX_DONATION_AMOUNT}`
    ),
  projectId: z.number().int().positive(),
  message: z.string().max(500, 'Message too long').optional(),
});

// Expense validation
export const expenseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  receipt: z.string().url().optional(),
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= VALIDATION.MAX_FILE_SIZE, 'File too large')
    .refine(
      (file) => VALIDATION.ALLOWED_FILE_TYPES.includes(file.type),
      'Invalid file type'
    ),
});

// Login validation
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Admin login validation
export const adminLoginSchema = z.object({
  passcode: z.string().min(1, 'Passcode is required'),
});

export type User = z.infer<typeof userSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Donation = z.infer<typeof donationSchema>;
export type Expense = z.infer<typeof expenseSchema>;
