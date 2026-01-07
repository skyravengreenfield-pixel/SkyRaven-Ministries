/**
 * Expenses Service
 * Handles all expense-related API operations
 */

import { httpClient } from './httpClient';
import { logger } from '../utils/logger';
import { handleAsync } from '../utils/errorHandler';
import type {
  Expense,
  CreateExpenseRequest,
  ApiResponse,
  PaginationParams,
  ExpenseStatus,
} from '../types/api.types';

class ExpensesService {
  private readonly BASE_PATH = '/expenses';

  async getExpenses(params?: PaginationParams): Promise<[Expense[] | null, Error | null]> {
    logger.debug('Fetching expenses', params);

    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    const [response, error] = await handleAsync(
      httpClient.get<Expense[]>(`${this.BASE_PATH}${queryString}`)
    );

    if (error || !response?.data) {
      logger.error('Failed to fetch expenses', error);
      return [null, error];
    }

    logger.info('Expenses fetched successfully', { count: response.data.length });
    return [response.data, null];
  }

  async getExpenseById(id: number): Promise<[Expense | null, Error | null]> {
    logger.debug('Fetching expense', { id });

    const [response, error] = await handleAsync(
      httpClient.get<Expense>(`${this.BASE_PATH}/${id}`)
    );

    if (error || !response?.data) {
      logger.error('Failed to fetch expense', { id, error });
      return [null, error];
    }

    logger.info('Expense fetched successfully', { id });
    return [response.data, null];
  }

  async createExpense(data: CreateExpenseRequest): Promise<[Expense | null, Error | null]> {
    logger.info('Creating expense', { title: data.title, amount: data.amount });

    let response: ApiResponse<Expense> | null;
    let error: Error | null;

    if (data.receipt) {
      // Upload with file
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value instanceof File ? value : String(value));
        }
      });

      [response, error] = await handleAsync(
        httpClient.upload<Expense>(this.BASE_PATH, formData)
      );
    } else {
      // Regular JSON post
      const { receipt, ...jsonData } = data;
      [response, error] = await handleAsync(
        httpClient.post<Expense>(this.BASE_PATH, jsonData)
      );
    }

    if (error || !response?.data) {
      logger.error('Failed to create expense', error);
      return [null, error];
    }

    logger.info('Expense created successfully', { id: response.data.id });
    return [response.data, null];
  }

  async updateExpense(id: number, data: Partial<Expense>): Promise<[Expense | null, Error | null]> {
    logger.info('Updating expense', { id });

    const [response, error] = await handleAsync(
      httpClient.patch<Expense>(`${this.BASE_PATH}/${id}`, data)
    );

    if (error || !response?.data) {
      logger.error('Failed to update expense', { id, error });
      return [null, error];
    }

    logger.info('Expense updated successfully', { id });
    return [response.data, null];
  }

  async deleteExpense(id: number): Promise<[boolean, Error | null]> {
    logger.info('Deleting expense', { id });

    const [response, error] = await handleAsync(
      httpClient.delete(`${this.BASE_PATH}/${id}`)
    );

    if (error) {
      logger.error('Failed to delete expense', { id, error });
      return [false, error];
    }

    logger.info('Expense deleted successfully', { id });
    return [true, null];
  }

  async approveExpense(id: number): Promise<[Expense | null, Error | null]> {
    logger.info('Approving expense', { id });

    const [response, error] = await handleAsync(
      httpClient.post<Expense>(`${this.BASE_PATH}/${id}/approve`)
    );

    if (error || !response?.data) {
      logger.error('Failed to approve expense', { id, error });
      return [null, error];
    }

    logger.info('Expense approved successfully', { id });
    return [response.data, null];
  }

  async rejectExpense(id: number, reason: string): Promise<[Expense | null, Error | null]> {
    logger.info('Rejecting expense', { id, reason });

    const [response, error] = await handleAsync(
      httpClient.post<Expense>(`${this.BASE_PATH}/${id}/reject`, { reason })
    );

    if (error || !response?.data) {
      logger.error('Failed to reject expense', { id, error });
      return [null, error];
    }

    logger.info('Expense rejected successfully', { id });
    return [response.data, null];
  }

  async getExpensesByProject(projectId: number): Promise<[Expense[] | null, Error | null]> {
    logger.debug('Fetching expenses by project', { projectId });

    const [response, error] = await handleAsync(
      httpClient.get<Expense[]>(`${this.BASE_PATH}?projectId=${projectId}`)
    );

    if (error || !response?.data) {
      logger.error('Failed to fetch expenses by project', { projectId, error });
      return [null, error];
    }

    logger.info('Expenses by project fetched successfully', { 
      projectId, 
      count: response.data.length 
    });
    return [response.data, null];
  }
}

export const expensesService = new ExpensesService();
