// src/redux/slices/isAktSlice.ts
import { createSlice } from '@reduxjs/toolkit';

interface IsAktState {
  isAkt: boolean;
}

const initialState: IsAktState = {
  isAkt: false,
};

const isAktSlice = createSlice({
  name: 'isAkt',
  initialState,
  reducers: {
    toggleIsAkt: (state) => {
      state.isAkt = !state.isAkt;
    },
    setIsAktTrue: (state) => {
      state.isAkt = true;
    },
    setIsAktFalse: (state) => {
      state.isAkt = false;
    },
  },
});

export const { toggleIsAkt, setIsAktTrue, setIsAktFalse } = isAktSlice.actions;

export default isAktSlice.reducer;
