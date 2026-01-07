/**
 * Donations Redux Slice
 * Manages donations state
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { donationsService } from '../../services/donationsService';
import type { Donation, CreateDonationRequest, PaginationParams } from '../../types/api.types';

interface DonationsState {
  items: Donation[];
  myDonations: Donation[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DonationsState = {
  items: [],
  myDonations: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchDonations = createAsyncThunk(
  'donations/fetchDonations',
  async (params: PaginationParams | undefined, { rejectWithValue }) => {
    const [donations, error] = await donationsService.getDonations(params);
    if (error) {
      return rejectWithValue(error.message);
    }
    return donations!;
  }
);

export const fetchMyDonations = createAsyncThunk(
  'donations/fetchMyDonations',
  async (_, { rejectWithValue }) => {
    const [donations, error] = await donationsService.getMyDonations();
    if (error) {
      return rejectWithValue(error.message);
    }
    return donations!;
  }
);

export const createDonation = createAsyncThunk(
  'donations/createDonation',
  async (data: CreateDonationRequest, { rejectWithValue }) => {
    const [donation, error] = await donationsService.createDonation(data);
    if (error) {
      return rejectWithValue(error.message);
    }
    return donation!;
  }
);

const donationsSlice = createSlice({
  name: 'donations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch donations
    builder
      .addCase(fetchDonations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDonations.fulfilled, (state, action: PayloadAction<Donation[]>) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchDonations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch my donations
    builder
      .addCase(fetchMyDonations.fulfilled, (state, action: PayloadAction<Donation[]>) => {
        state.myDonations = action.payload;
      });

    // Create donation
    builder
      .addCase(createDonation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDonation.fulfilled, (state, action: PayloadAction<Donation>) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
        state.myDonations.unshift(action.payload);
      })
      .addCase(createDonation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = donationsSlice.actions;
export default donationsSlice.reducer;
