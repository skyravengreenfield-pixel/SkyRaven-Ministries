/**
 * Projects Service
 * Handles all project-related API operations
 */

import { httpClient } from './httpClient';
import { logger } from '../utils/logger';
import { handleAsync } from '../utils/errorHandler';
import type {
  Project,
  CreateProjectRequest,
  ApiResponse,
  PaginationParams,
} from '../types/api.types';

class ProjectsService {
  private readonly BASE_PATH = '/projects';

  async getProjects(params?: PaginationParams): Promise<[Project[] | null, Error | null]> {
    logger.debug('Fetching projects', params);

    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    const [response, error] = await handleAsync(
      httpClient.get<Project[]>(`${this.BASE_PATH}${queryString}`)
    );

    if (error || !response?.data) {
      logger.error('Failed to fetch projects', error);
      return [null, error];
    }

    logger.info('Projects fetched successfully', { count: response.data.length });
    return [response.data, null];
  }

  async getProjectById(id: number): Promise<[Project | null, Error | null]> {
    logger.debug('Fetching project', { id });

    const [response, error] = await handleAsync(
      httpClient.get<Project>(`${this.BASE_PATH}/${id}`)
    );

    if (error || !response?.data) {
      logger.error('Failed to fetch project', { id, error });
      return [null, error];
    }

    logger.info('Project fetched successfully', { id });
    return [response.data, null];
  }

  async createProject(data: CreateProjectRequest): Promise<[Project | null, Error | null]> {
    logger.info('Creating project', { title: data.title });

    const [response, error] = await handleAsync(
      httpClient.post<Project>(this.BASE_PATH, data)
    );

    if (error || !response?.data) {
      logger.error('Failed to create project', error);
      return [null, error];
    }

    logger.info('Project created successfully', { id: response.data.id });
    return [response.data, null];
  }

  async updateProject(id: number, data: Partial<Project>): Promise<[Project | null, Error | null]> {
    logger.info('Updating project', { id });

    const [response, error] = await handleAsync(
      httpClient.patch<Project>(`${this.BASE_PATH}/${id}`, data)
    );

    if (error || !response?.data) {
      logger.error('Failed to update project', { id, error });
      return [null, error];
    }

    logger.info('Project updated successfully', { id });
    return [response.data, null];
  }

  async deleteProject(id: number): Promise<[boolean, Error | null]> {
    logger.info('Deleting project', { id });

    const [response, error] = await handleAsync(
      httpClient.delete(`${this.BASE_PATH}/${id}`)
    );

    if (error) {
      logger.error('Failed to delete project', { id, error });
      return [false, error];
    }

    logger.info('Project deleted successfully', { id });
    return [true, null];
  }

  async getProjectsByCategory(category: string): Promise<[Project[] | null, Error | null]> {
    logger.debug('Fetching projects by category', { category });

    const [response, error] = await handleAsync(
      httpClient.get<Project[]>(`${this.BASE_PATH}?category=${category}`)
    );

    if (error || !response?.data) {
      logger.error('Failed to fetch projects by category', { category, error });
      return [null, error];
    }

    logger.info('Projects by category fetched successfully', { 
      category, 
      count: response.data.length 
    });
    return [response.data, null];
  }
}

export const projectsService = new ProjectsService();
