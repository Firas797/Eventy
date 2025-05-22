import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch notifications from backend
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.get('/api/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
);

// Mark notification as read
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { getState }) => {
    const token = getState().auth.token;
    await axios.patch(`/api/notifications/${notificationId}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return notificationId;
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    status: 'idle',
    error: null
  },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    //   showToast(action.payload.message);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.notifications;
        state.unreadCount = action.payload.notifications.filter(n => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.items.find(n => n._id === action.payload);
        if (notification) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  }
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;