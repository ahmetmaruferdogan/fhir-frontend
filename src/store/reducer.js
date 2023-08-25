import { combineReducers } from 'redux';

// reducer import
import customizationReducer from './customizationReducer';
import patientReducer from './patientSlicer';
import appointmentReducer from './appointmentSlicer';
import practitionerReducer from './practitionerSlicer';
// ==============================|| COMBINE REDUCER ||============================== //

const reducer = combineReducers({
  customization: customizationReducer,
  patients: patientReducer,
  appointments: appointmentReducer,
  practitioners: practitionerReducer
});

export default reducer;
