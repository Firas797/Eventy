import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Helper to manage auth data in localStorage
const persistAuthData = (data) => {
  if (data) {
    localStorage.setItem('auth', JSON.stringify(data));
  } else {
    localStorage.removeItem('auth');
  }
};

// Get initial state from localStorage
const getInitialState = () => {
  const authData = localStorage.getItem('auth');
  if (authData) {
    try {
      const parsedData = JSON.parse(authData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsedData.token}`;
      return {
        user: parsedData.user,
        token: parsedData.token,
        isAuthenticated: true,
        loading: false,
        error: null,
        savedEvents: parsedData.user?.savedEvents || [],
        interestedEvents: parsedData.user?.interestedEvents || []
      };
    } catch (err) {
      localStorage.removeItem('auth');
      return getDefaultState();
    }
  }
  return getDefaultState();
};

const getDefaultState = () => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  savedEvents: [],
  interestedEvents: []
});

// Async Thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/signup`, formData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/login`, formData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);
export const toggleSaveEvent = createAsyncThunk(
  'auth/toggleSave',
  async (eventId, { rejectWithValue, getState, dispatch }) => {
    try {
      // 1. First make the save/unsave request
      const response = await axios.post(`${API_URL}/save-event/${eventId}`);
      
      // 2. Then fetch the updated saved events list
      const savedResponse = await axios.get(`${API_URL}/saved-events`);
      
      return {
        action: response.data.action,
        savedEvents: savedResponse.data.data, // Full event objects
        eventId // For optimistic updates
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to save event');
    }
  }
);
export const toggleInterestedEvent = createAsyncThunk(
  'auth/toggleInterested',
  async (eventId, { rejectWithValue, getState }) => {
    try {
      const response = await axios.post(`${API_URL}/interested-event/${eventId}`);
      return {
        eventId,
        action: response.data.action,
        user: response.data.user || getState().auth.user // Fallback to current user
      };
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.message || 'Failed to mark interest',
        status: err.response?.status
      });
    }
  }
);
export const fetchSavedEvents = createAsyncThunk(
  'auth/fetchSaved',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/saved-events`);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch saved events');
    }
  }
);

export const fetchInterestedEvents = createAsyncThunk(
  'auth/fetchInterested',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/interested-events`);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch interested events');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    logout: (state) => {
      localStorage.removeItem('auth');
      delete axios.defaults.headers.common['Authorization'];
      return getDefaultState();
    },
    clearError: (state) => {
      state.error = null;
    },
    syncSavedEvents: (state, action) => {
      state.savedEvents = action.payload;
    },
    syncInterestedEvents: (state, action) => {
      state.interestedEvents = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        const { token, data } = action.payload;
        const user = data.user;

        persistAuthData({ token, user });
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        state.loading = false;
        state.token = token;
        state.user = user;
        state.isAuthenticated = true;
        state.savedEvents = user.savedEvents || [];
        state.interestedEvents = user.interestedEvents || [];
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        persistAuthData(action.payload);
        axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
        
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.savedEvents = action.payload.user?.savedEvents || [];
        state.interestedEvents = action.payload.user?.interestedEvents || [];
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Save Event
  .addCase(toggleSaveEvent.fulfilled, (state, action) => {
  // Update with full event objects from the saved-events endpoint
  state.savedEvents = action.payload.savedEvents;
  
  // Update user object if it exists
  if (state.user) {
    state.user.savedEvents = action.payload.savedEvents.map(e => e._id);
    persistAuthData({
      token: state.token,
      user: state.user
    });
  }
})


      // Interested Event
      .addCase(toggleInterestedEvent.fulfilled, (state, action) => {
        const { user } = action.payload;
        state.user = user;
        state.interestedEvents = user.interestedEvents;
        persistAuthData({
          token: state.token,
          user: state.user
        });
      })
      
      // Fetch Saved Events
      .addCase(fetchSavedEvents.fulfilled, (state, action) => {
        state.savedEvents = action.payload;
      })
      
      // Fetch Interested Events
      .addCase(fetchInterestedEvents.fulfilled, (state, action) => {
        state.interestedEvents = action.payload;
      });
  }
});

export const { 
  logout, 
  clearError,
  syncSavedEvents,
  syncInterestedEvents 
} = authSlice.actions;

export default authSlice.reducer;