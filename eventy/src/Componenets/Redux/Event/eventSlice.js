// src/Components/Redux/Event/eventSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/events';

export const fetchEvents = createAsyncThunk(
  'event/GetAllEvents',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get("http://localhost:5000/api/events/GetAllEvents");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const createNewEvent = createAsyncThunk(
  'event/createNewEvent',
  async (formData, thunkAPI) => {
    try {
      // Debug: Verify all fields
      console.log('Final FormData before submit:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await axios.post(`${API_URL}/CreateNewEvent`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${thunkAPI.getState().auth.token}`
        },
        transformRequest: (data) => data,
      });

      return response.data;
    } catch (error) {
      // ====== ADD THE ENHANCED ERROR LOGGING HERE ======
      console.error('Full backend error response:', {
        status: error.response?.status,
        data: error.response?.data,  // This contains validation errors
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        }
      });
      // ====== END OF ADDED CODE ======

      // Existing error handling
      const backendError = error.response?.data?.message || 
                         error.response?.data?.error ||
                         error.message;
      
      return thunkAPI.rejectWithValue(backendError);
    }
  }
);
export const updateEvent = createAsyncThunk(
  'event/updateEvent',
  async ({ id, formData }, thunkAPI) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'event/deleteEvent',
  async (id, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  events: [],
  status: 'idle',
  error: null,
  currentEvent: null,
};

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    resetEventState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // fetchEvents
      .addCase(fetchEvents.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.events = action.payload;
        state.error = null;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // createNewEvent
      .addCase(createNewEvent.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createNewEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.events.push(action.payload);
        state.error = null;
      })
      .addCase(createNewEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // updateEvent
      .addCase(updateEvent.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.events.findIndex(event => event._id === action.payload._id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // deleteEvent
      .addCase(deleteEvent.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.events = state.events.filter(event => event._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetEventState } = eventSlice.actions;
export default eventSlice.reducer;
