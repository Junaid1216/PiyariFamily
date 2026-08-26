import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SuggestedMatch } from '../../API/mappers/matchMapper';

export type FilterFormState = {
  location: string;
  citySearch: string;
  education: string;
  profession: string;
  religion: string;
  marital: string;
  ageMin: number;
  ageMax: number;
  incomeRange: string;
  activeQuickFilters: Record<string, boolean>;
};

export type FilterState = {
  form: FilterFormState | null;
  results: SuggestedMatch[];
  total: number;
  applied: boolean;
};

export const EMPTY_FILTER_FORM: FilterFormState = {
  location: '',
  citySearch: '',
  education: 'Any',
  profession: 'Any',
  religion: 'Any',
  marital: '',
  ageMin: 18,
  ageMax: 60,
  incomeRange: 'Any',
  activeQuickFilters: {},
};

const initialState: FilterState = {
  form: null,
  results: [],
  total: 0,
  applied: false,
};

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setFilterForm: (state, action: PayloadAction<FilterFormState>) => {
      state.form = action.payload;
    },
    setFilterResults: (
      state,
      action: PayloadAction<{ results: SuggestedMatch[]; total: number }>,
    ) => {
      state.results = action.payload.results;
      state.total = action.payload.total;
      state.applied = true;
    },
    clearFilterResults: state => {
      state.results = [];
      state.total = 0;
      state.applied = false;
    },
    clearFilter: () => initialState,
  },
});

export const {
  setFilterForm,
  setFilterResults,
  clearFilterResults,
  clearFilter,
} = filterSlice.actions;

export const selectFilterForm = (state: { filter: FilterState }) =>
  state.filter.form;
export const selectFilterResults = (state: { filter: FilterState }) =>
  state.filter.results;
export const selectFilterTotal = (state: { filter: FilterState }) =>
  state.filter.total;
export const selectFilterApplied = (state: { filter: FilterState }) =>
  state.filter.applied;

export default filterSlice.reducer;
