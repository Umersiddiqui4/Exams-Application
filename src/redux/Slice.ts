import { createSlice } from '@reduxjs/toolkit'

interface AuthState {
  isAuthenticated: boolean
  user: null | { name: string; email: string }
  loading: boolean
  error: string | null
  errorType: 'invalid_username' | 'invalid_password' | 'email_exists' | 'validation_error' | 'general' | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  errorType: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest(state) {
      state.loading = true
      state.error = null
      state.errorType = null
    },
    loginSuccess(state, action) {
      state.isAuthenticated = true
      state.user = action.payload
      state.loading = false
      state.error = null
      state.errorType = null
    },
    loginFailure(state, action) {
      state.isAuthenticated = false
      state.user = null
      state.loading = false
      state.error = action.payload.message
      state.errorType = action.payload.type
    },
    signupRequest(state) {
      state.loading = true
      state.error = null
      state.errorType = null
    },
    signupSuccess(state, action) {
      state.isAuthenticated = true
      state.user = action.payload
      state.loading = false
      state.error = null
      state.errorType = null
    },
    signupFailure(state, action) {
      state.isAuthenticated = false
      state.user = null
      state.loading = false
      state.error = action.payload.message
      state.errorType = action.payload.type
    },
    clearError(state) {
      state.error = null
      state.errorType = null
    },
    logout(state) {
      state.isAuthenticated = false
      state.user = null
      state.loading = false
      state.error = null
      state.errorType = null
    },
  },
})

export const { loginRequest, loginSuccess, loginFailure, signupRequest, signupSuccess, signupFailure, clearError, logout } = authSlice.actions
export default authSlice.reducer
