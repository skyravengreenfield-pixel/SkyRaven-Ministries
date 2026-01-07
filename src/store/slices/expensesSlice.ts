/**
 * Expenses Redux Slice
 * Manages expenses state
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { expensesService } from '../../services/expensesService';
import type { Expense, CreateExpenseRequest, PaginationParams } from '../../types/api.types';

interface ExpensesState {
  items: Expense[];
  selectedExpense: Expense | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ExpensesState = {
  items: [],
  selectedExpense: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (params: PaginationParams | undefined, { rejectWithValue }) => {
    const [expenses, error] = await expensesService.getExpenses(params);
    if (error) {
      return rejectWithValue(error.message);
    }
    return expenses!;
  }
);

export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (data: CreateExpenseRequest, { rejectWithValue }) => {
    const [expense, error] = await expensesService.createExpense(data);
    if (error) {
      return rejectWithValue(error.message);
    }
    return expense!;
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async ({ id, data }: { id: number; data: Partial<Expense> }, { rejectWithValue }) => {
    const [expense, error] = await expensesService.updateExpense(id, data);
    if (error) {
      return rejectWithValue(error.message);
    }
    return expense!;
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id: number, { rejectWithValue }) => {
    const [success, error] = await expensesService.deleteExpense(id);
    if (error || !success) {
      return rejectWithValue(error?.message || 'Failed to delete expense');
    }
    return id;
  }
);

export const approveExpense = createAsyncThunk(
  'expenses/approveExpense',
  async (id: number, { rejectWithValue }) => {
    const [expense, error] = await expensesService.approveExpense(id);
    if (error) {
      return rejectWithValue(error.message);
    }
    return expense!;
  }
);

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch expenses
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action: PayloadAction<Expense[]>) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create expense
    builder
      .addCase(createExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update expense
    builder
      .addCase(updateExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
        const index = state.items.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });

    // Delete expense
    builder
      .addCase(deleteExpense.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((e) => e.id !== action.payload);
      });

    // Approve expense
    builder
      .addCase(approveExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
        const index = state.items.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { clearError } = expensesSlice.actions;
export default expensesSlice.reducer;
