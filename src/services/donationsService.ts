/**
 * Donations Service
 * Handles all donation-related API operations
 */

import { httpClient } from './httpClient';
import { logger } from '../utils/logger';
import { handleAsync } from '../utils/errorHandler';
import type {
  Donation,
  CreateDonationRequest,
  ApiResponse,
  PaginationParams,
} from '../types/api.types';

class DonationsService {
  private readonly BASE_PATH = '/donations';

  async createDonation(data: CreateDonationRequest): Promise<[Donation | null, Error | null]> {
    logger.info('Creating donation', { 
      amount: data.amount, 
      projectId: data.projectId 
    });

    const [response, error] = await handleAsync(
      httpClient.post<Donation>(this.BASE_PATH, data)
    );

    if (error || !response?.data) {
      logger.error('Failed to create donation', error);
      return [null, error];
    }

    logger.info('Donation created successfully', { 
      id: response.data.id,
      transactionId: response.data.transactionId
    });
    return [response.data, null];
  }

  async getDonations(params?: PaginationParams): Promise<[Donation[] | null, Error | null]> {
    logger.debug('Fetching donations', params);

    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    const [response, error] = await handleAsync(
      httpClient.get<Donation[]>(`${this.BASE_PATH}${queryString}`)
    );

    if (error || !response?.data) {
      logger.error('Failed to fetch donations', error);
      return [null, error];
    }

    logger.info('Donations fetched successfully', { count: response.data.length });
    return [response.data, null];
  }

  async getDonationById(id: number): Promise<[Donation | null, Error | null]> {
    logger.debug('Fetching donation', { id });

    const [response, error] = await handleAsync(
      httpClient.get<Donation>(`${this.BASE_PATH}/${id}`)
    );

    if (error || !response?.data) {
      logger.error('Failed to fetch donation', { id, error });
      return [null, error];
    }

    logger.info('Donation fetched successfully', { id });
    return [response.data, null];
  }

  async getMyDonations(): Promise<[Donation[] | null, Error | null]> {
    logger.debug('Fetching my donations');

    const [response, error] = await handleAsync(
      httpClient.get<Donation[]>(`${this.BASE_PATH}/my-donations`)
    );

    if (error || !response?.data) {
      logger.error('Failed to fetch my donations', error);
      return [null, error];
    }

    logger.info('My donations fetched successfully', { count: response.data.length });
    return [response.data, null];
  }

  async getDonationReceipt(id: number): Promise<[Blob | null, Error | null]> {
    logger.info('Downloading donation receipt', { id });

    try {
      const response = await fetch(
        `${httpClient['baseURL']}${this.BASE_PATH}/${id}/receipt`,
        {
          headers: {
            Authorization: `Bearer ${httpClient.getAuthToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download receipt');
      }

      const blob = await response.blob();
      logger.info('Receipt downloaded successfully', { id });
      return [blob, null];
    } catch (error) {
      logger.error('Failed to download receipt', { id, error });
      return [null, error as Error];
    }
  }
}

export const donationsService = new DonationsService();
