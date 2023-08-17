import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';
import { extractGetpagesoffsetValue } from '../utils/patients-utils';

import { toast } from 'react-toastify';

export const resourceType = 'Patient';

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
      resourceType,
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
      resourceType,
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

export const updatePatient = createAsyncThunk('patients/updatePatient', async (params0) => {
  const finalRequestBody = {
    resourceType,
    id: params0.id,
    body: { resourceType, id: params0.id, ...params0 }
  };
  api
    .update(finalRequestBody)
    .then(() => {
      toast.success('Patient updated successfully!');
    })
    .catch(() => {
      toast.success('Could not update patient!');
    });
});

export const createPatient = createAsyncThunk('patients/createPatient', async (params0) => {
  const finalRequestBody = {
    resourceType,
    body: { resourceType, ...params0 }
  };
  await api.create(finalRequestBody);
});

export const fetchGenders = createAsyncThunk('patients/fetchGenders', async () => {
  // var administrativeGenders = [];
  const finalRequestBody = {
    resourceType: 'CodeSystem',
    id: 'administrative-gender'
  };
  const apiResponse = await api.read(finalRequestBody);
  // console.log('apiResponse', apiResponse);
  // apiResponse.concept.forEach((concept) => {
  //   const administrativeGender = {
  //     code: concept.code,
  //     display: concept.display,
  //     definition: concept.definition
  //   };

  //   if (concept.extension && concept.extension.length > 0) {
  //     administrativeGender.comments = concept.extension[0].valueString;
  //   }

  //   administrativeGenders.push(administrativeGender);
  // });
  return apiResponse;
});

export const deletePatientWithId = createAsyncThunk('patients/deletePatientWithId', async (id) => {
  if (id < 0) {
    toast.error('Invalid id!');
    return;
  }
  const finalRequestBody = {
    resourceType,
    id
  };
  await api
    .delete(finalRequestBody)
    .then(() => {
      toast.success('Patient deleted successfully');
    })
    .catch(() => {
      toast.error('Could not delete patient!');
    });
});

export const checkCznValid = createAsyncThunk('patients/checkCznExist', async ({ id, czn }) => {
  if (!czn) return undefined;
  const result = api
    .search({
      resourceType,
      searchParams: {
        identifier: czn,
        _total: 'accurate'
      }
    })
    .then((response) => {
      if (response?.total < 1) {
        return true;
      } else if (id && response?.total === 1) {
        const otherId = response?.entry[0]?.resource?.id;
        const idsMatch = otherId === id;
        return idsMatch;
      } else {
        return false;
      }
    });
  return result;
});

const initialState = {
  bundle: {},
  loading: false,
  error: '',
  genders: [],
  cznValid: undefined
};

//#region SLICE CREATION
const patientsSlicer = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    setUndefinedCznValid(state) {
      state.cznValid = undefined;
    }
  },
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
      .addCase(updatePatient.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePatient.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updatePatient.rejected, (state) => {
        state.loading = false;
      })
      .addCase(deletePatientWithId.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePatientWithId.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deletePatientWithId.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchGenders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGenders.fulfilled, (state, action) => {
        state.loading = false;
        state.genders = action.payload;
      })
      .addCase(fetchGenders.rejected, (state) => {
        state.loading = false;
      })
      .addCase(checkCznValid.pending, (state) => {
        state.cznValid = undefined;
      })
      .addCase(checkCznValid.fulfilled, (state, action) => {
        state.cznValid = action.payload;
      })
      .addCase(checkCznValid.rejected, (state) => {
        state.cznValid = false;
      });
  }
});

//#endregion
export const { setUndefinedCznValid } = patientsSlicer.actions;
export default patientsSlicer.reducer;
