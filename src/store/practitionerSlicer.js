import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';
import { extractGetpagesoffsetValue } from '../utils/patients-utils';

import { toast } from 'react-toastify';

export const practitionerResourceType = 'Practitioner';

export const fetchPractitioners = createAsyncThunk('patients/fetchPractitioners', async (params0) => {
  var searchType = params0?.searchType;
  var searchParams = params0?.searchParams;
  var oldBundle = params0?.bundle;

  var newBundle = {};

  if (searchType?.match(/^next$/)) {
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
      resourceType: practitionerResourceType,
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
    const params1 = {
      resourceType: practitionerResourceType,
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
  }

  return newBundle;
});

const initialState = {
  bundle: {},
  loading: false,
  error: ''
};

//#region SLICE CREATION
const practitionersSlicer = createSlice({
  name: 'practitioners',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPractitioners.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPractitioners.fulfilled, (state, action) => {
        state.loading = false;
        state.bundle = action.payload;
        state.error = '';
      })
      .addCase(fetchPractitioners.rejected, (state, action) => {
        state.loading = false;
        state.bundle = {};
        state.error = action.error.message;
        toast.error('Error occured while fetching practitioners!');
      });
  }
});

//#endregion
export default practitionersSlicer.reducer;
