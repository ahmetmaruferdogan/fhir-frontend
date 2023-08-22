import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';
import { toast } from 'react-toastify';

export const appointmentResourceType = 'Appointment';

export const fetchAppointments = createAsyncThunk('appointments/fetchAppointments', async (params0) => {
  // console.log('params0', params0);
  var searchType = params0?.searchType || '';
  var searchParams = params0?.searchParams || undefined;
  var oldBundle = params0?.bundle || {};
  // console.log('a1');
  var newBundle = {};
  // console.log('a2');
  if (searchType?.match(/^next$/)) {
    // console.log('a3');
    if (!oldBundle) {
      return {};
    }
    newBundle = await api.nextPage({
      bundle: oldBundle,
      options: {
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    });
  } else if (searchType?.match(/^prev(ious)?$/)) {
    // console.log('a4');
    if (!oldBundle) {
      return {};
    }
    newBundle = await api.prevPage({
      bundle: oldBundle,
      options: {
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    });
  } else if (searchType?.match(/^self$/)) {
    // console.log('a5');
    const selfLink = oldBundle?.link?.find((link) => link.relation.match(/^self$/));
    const offsetValue = extractGetpagesoffsetValue(selfLink?.url || 0);
    searchParams = {
      ...searchParams,
      _getpagesoffset: offsetValue
    };
    if (!searchParams._getpagesoffset) {
      return oldBundle;
    }
    const params1 = {
      resourceType: appointmentResourceType,
      searchParams: {
        ...searchParams,
        _total: 'accurate'
      },
      options: {
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    };
    newBundle = await api.search(params1);
  } else {
    // console.log('a6');
    const params1 = {
      resourceType: appointmentResourceType,
      searchParams: {
        ...searchParams,
        _total: 'accurate'
      },
      options: {
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    };
    // console.log(params1);
    newBundle = await api.search(params1);
  }
  // console.log('newBundle', newBundle);
  return newBundle;
});

const initialState = {
  bundle: {},
  loading: false,
  error: ''
};

//#region SLICE CREATION
const appointmentSlicer = createSlice({
  name: 'appointments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.bundle = action.payload;
        state.error = '';
        // console.log('action.payload of appointment', action.payload);
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.bundle = {};
        state.error = action.error.message;
        toast.error('Error occured while fetching appointments!');
      });
  }
});

//#endregion
export const { setUndefinedCznValid } = appointmentSlicer.actions;
export default appointmentSlicer.reducer;
