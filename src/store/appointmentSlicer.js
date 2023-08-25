import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';
import { toast } from 'react-toastify';
import { parseName } from 'utils/patients-utils';

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

export const createAppointment = createAsyncThunk('appointments/createAppointment', async ({ formData }) => {
  console.log('formData', formData);
  var date = new Date(formData.date);
  date.setHours(date.getHours() + formData.hour);
  date.setMinutes(date.getMinutes() + formData.duration);
  var body = {
    resourceType: appointmentResourceType,
    end: date.toISOString().slice(0, 19),
    minutesDuration: formData.duration,
    participant: [
      {
        actor: {
          reference: formData.patient.fullUrl,
          type: 'Patient',
          id: formData.patient.resource.id,
          display: parseName(formData.patient.resource)
        }
      },
      {
        actor: {
          reference: formData.practitioner.fullUrl,
          type: 'Practitioner',
          id: formData.practitioner.resource.id,
          display: parseName(formData.practitioner.resource)
        }
      }
    ],
    status: 'booked'
  };
  const finalRequestBody = {
    resourceType: appointmentResourceType,
    body
  };
  console.log('finalRequestBody', finalRequestBody);
  var response = await api.create(finalRequestBody);
  return response;
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
      })
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.bundle = action.payload;
        state.error = '';
        console.log('create appointment response', action.payload);
        toast.success('appointment created with the id: ', action.payload.id);
        // console.log('action.payload of appointment', action.payload);
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.bundle = {};
        state.error = action.error.message;
        console.log('create appointment response', action.payload);
        toast.error('Error occured while creating appointment!');
      });
  }
});

//#endregion
export const { setUndefinedCznValid } = appointmentSlicer.actions;
export default appointmentSlicer.reducer;
