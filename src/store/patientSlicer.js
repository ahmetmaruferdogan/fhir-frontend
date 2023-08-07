import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';
import { extractGetpagesoffsetValue } from '../utils/patients-utils';

import { toast } from 'react-toastify';

const resourceType = 'Patient';

export const fetchPatients = createAsyncThunk('patients/fetchPatients', async (params0) => {
  var searchType = params0?.searchType;
  var searchParams = params0?.searchParams;
  var oldBundle = params0?.bundle;

  var newBundle = {};

  if (searchType?.match(/^next$/)) {
    if (!oldBundle) {
      return {};
    }
    newBundle = await api.nextPage({
      bundle: oldBundle
    });
  } else if (searchType?.match(/^prev(ious)?$/)) {
    if (!oldBundle) {
      return {};
    }
    newBundle = await api.prevPage({
      bundle: oldBundle
    });
  } else if (searchType?.match(/^self$/)) {
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
      resourceType,
      searchParams: {
        ...searchParams,
        _total: 'accurate'
      }
    };
    newBundle = await api.search(params1);
  } else {
    const params1 = {
      resourceType,
      searchParams: {
        ...searchParams,
        _total: 'accurate'
      }
    };
    newBundle = await api.search(params1);
  }

  return newBundle;
});

export const createPatient = createAsyncThunk('patients/createPatient', async (params0) => {
  const finalRequestBody = {
    resourceType,
    body: { resourceType, ...params0 }
  };
  await api.create(finalRequestBody);
});

export const deletePatientWithId = createAsyncThunk('patients/deletePatientWithId', (id, { rejectWithValue }) => {
  if (id < 0) {
    toast.error('Invalid id!');
    return rejectWithValue('invalid id!');
  }
  const finalRequestBody = {
    resourceType,
    id
  };
  api.delete(finalRequestBody).catch(() => {
    toast.error('Could not delete patient!');
  });
});

const initialState = {
  bundle: {},
  loading: false,
  error: ''
};

//#region SLICE CREATION
const patientsSlicer = createSlice({
  name: 'patients',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.bundle = action.payload;
        state.error = '';
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.bundle = {};
        state.error = action.error.message;
        toast.error('Error occured while fetching patients!');
      })
      .addCase(createPatient.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPatient.fulfilled, (state) => {
        state.loading = false;
        toast.success('Patient added successfully');
      })
      .addCase(createPatient.rejected, (state) => {
        state.loading = false;
        toast.error('Error occured while creating patient!');
      })
      .addCase(deletePatientWithId.pending, (state) => {
        state.loading = true;
        console.log('inside deletePatientWithId.pending');
      })
      .addCase(deletePatientWithId.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deletePatientWithId.rejected, (state) => {
        state.loading = false;
        console.log('inside deletePatientWithId.rejected');
      });
  }
});

//#endregion

export default patientsSlicer.reducer;
