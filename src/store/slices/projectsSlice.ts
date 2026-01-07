/**
 * Projects Redux Slice
 * Manages projects state
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { projectsService } from '../../services/projectsService';
import type { Project, CreateProjectRequest, PaginationParams } from '../../types/api.types';

interface ProjectsState {
  items: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}

const initialState: ProjectsState = {
  items: [],
  selectedProject: null,
  isLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
};

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (params: PaginationParams | undefined, { rejectWithValue }) => {
    const [projects, error] = await projectsService.getProjects(params);
    if (error) {
      return rejectWithValue(error.message);
    }
    return projects!;
  }
);

export const fetchProjectById = createAsyncThunk(
  'projects/fetchProjectById',
  async (id: number, { rejectWithValue }) => {
    const [project, error] = await projectsService.getProjectById(id);
    if (error) {
      return rejectWithValue(error.message);
    }
    return project!;
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (data: CreateProjectRequest, { rejectWithValue }) => {
    const [project, error] = await projectsService.createProject(data);
    if (error) {
      return rejectWithValue(error.message);
    }
    return project!;
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, data }: { id: number; data: Partial<Project> }, { rejectWithValue }) => {
    const [project, error] = await projectsService.updateProject(id, data);
    if (error) {
      return rejectWithValue(error.message);
    }
    return project!;
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id: number, { rejectWithValue }) => {
    const [success, error] = await projectsService.deleteProject(id);
    if (error || !success) {
      return rejectWithValue(error?.message || 'Failed to delete project');
    }
    return id;
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedProject: (state, action: PayloadAction<Project | null>) => {
      state.selectedProject = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch projects
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch project by ID
    builder
      .addCase(fetchProjectById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        state.selectedProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create project
    builder
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update project
    builder
      .addCase(updateProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedProject?.id === action.payload.id) {
          state.selectedProject = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete project
    builder
      .addCase(deleteProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.items = state.items.filter((p) => p.id !== action.payload);
        if (state.selectedProject?.id === action.payload) {
          state.selectedProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedProject } = projectsSlice.actions;
export default projectsSlice.reducer;
