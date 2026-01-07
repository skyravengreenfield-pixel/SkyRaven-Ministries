/**
 * Test Utilities
 * Helper functions for testing
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/slices/authSlice';
import projectsReducer from '../store/slices/projectsSlice';
import expensesReducer from '../store/slices/expensesSlice';
import donationsReducer from '../store/slices/donationsSlice';
import uiReducer from '../store/slices/uiSlice';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any;
  store?: any;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        auth: authReducer,
        projects: projectsReducer,
        expenses: expensesReducer,
        donations: donationsReducer,
        ui: uiReducer,
      },
      preloadedState,
    }),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Mock data generators
export const mockUser = (overrides = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'Supporter',
  ...overrides,
});

export const mockProject = (overrides = {}) => ({
  id: 1,
  title: 'Test Project',
  goal: 10000,
  raised: 5000,
  category: 'Community',
  image: 'blue',
  ...overrides,
});

export const mockExpense = (overrides = {}) => ({
  id: 1,
  title: 'Test Expense',
  amount: 100,
  date: '2024-01-01',
  category: 'Admin',
  status: 'Verified',
  ...overrides,
});

export const mockDonation = (overrides = {}) => ({
  id: 1,
  amount: 50,
  date: '2024-01-01',
  project: 'Test Project',
  ...overrides,
});

// Re-export testing library utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
