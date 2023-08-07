import { combineReducers } from 'redux';

// reducer import
import customizationReducer from './customizationReducer';
import patientReducer from './patientSlicer';

// ==============================|| COMBINE REDUCER ||============================== //

const reducer = combineReducers({
  customization: customizationReducer,
  patients: patientReducer
});

export default reducer;
