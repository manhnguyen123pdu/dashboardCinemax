import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../../services/api'

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const getUserFromLocalStorage = () => {
  try {
    const user = localStorage.getItem('admin_user')
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getUserFromLocalStorage(),
    loading: false,
    error: null,
    isAuthenticated: !!getUserFromLocalStorage()
  },
  reducers: {
    logout: (state) => {
      state.user = null
      state.loading = false
      state.error = null
      state.isAuthenticated = false
      localStorage.removeItem('admin_user')
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
        localStorage.setItem('admin_user', JSON.stringify(action.payload))
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
  }
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer