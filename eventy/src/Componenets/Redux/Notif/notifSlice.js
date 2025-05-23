import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for fetching notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.get('http://localhost:5000/api/Notif', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('API Response Data:', response.data); // Debug what's received
    return response.data;
  }
);

// Async thunk for marking notification as read
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { getState }) => {
    const token = getState().auth.user?.token;
    await axios.patch(`/api/Notif/mark-as-read/${notificationId}`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return notificationId;
  }
);

// Async thunk for deleting notification
export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { getState }) => {
    const token = getState().auth.user?.token;
    await axios.delete(`/api/Notif/${notificationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return notificationId;
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch notifications
       .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        
        // Safely sort notifications
        if (Array.isArray(action.payload)) {
          state.items = [...action.payload].sort((a, b) => {
            // Welcome notifications first
            if (a.isWelcome && !b.isWelcome) return -1;
            if (!a.isWelcome && b.isWelcome) return 1;
            // Newest first for others
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
        } else {
          state.items = [];
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch notifications';
      })
      
      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.items.find(item => item._id === action.payload);
        if (notification) {
          notification.read = true;
        }
      })
      
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload);
      });
  },
});

export default notificationSlice.reducer;