import React, { useEffect, useRef, useState } from 'react';
import { Button, MenuItem, Modal, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { updatePatient, createPatient, checkCznValid, setUndefinedCznValid } from 'store/patientSlicer';
import { parsePatientDataToFormData, parseCzn } from 'utils/patients-utils';

const styles = {
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '4px',
    outline: 'none'
  },
  textField: {
    marginBottom: '1rem'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '1rem'
  }
};

const AddPatientModal = ({ open, onClose, patient, genders }) => {
  const dispatch = useDispatch();
  const { cznValid } = useSelector((state) => state.patients);
  AddPatientModal.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    patient: PropTypes.any,
    genders: PropTypes.array
  };
  useEffect(() => {
    setFormData(parsePatientDataToFormData(patient, initialFormData));
    checkCzn(patient?.resource?.id || undefined, parseCzn(patient?.resource));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient]);
  const gendersAsCodes = genders.map((gender) => gender.code);
  const patientSchema = yup.object().shape({
    given: yup.string().required('First Name is required'),
    family: yup.string().required('Last Name is required'),
    gender: yup.string().required('Gender is required').oneOf(gendersAsCodes, 'Gender is required'),
    birthDate: yup
      .string()
      .required('Birth Date is required')
      .matches(/^\d{4}-\d{2}-\d{2}$/, 'Birth Date must be in the format "yyyy-mm-dd"'),
    telecom: yup.string().required('Telecom is required'),
    citizenNumber: yup
      .string()
      .required('Citizenship number is required')
      .matches(/^[1-9]{1}[0-9]{9}[02468]{1}$/, 'Citizen number is not valid!')
    // ppn: yup.string().required('Passport number is required').matches("^[A-Z][0-9]{8}$")
  });
  const initialFormData = {
    given: '',
    family: '',
    gender: '',
    birthDate: '',
    telecom: '',
    citizenNumber: '',
    id: undefined
  };

  const [formData, setFormData] = useState(parsePatientDataToFormData(patient, initialFormData));
  const [formErrors, setFormErrors] = useState({ ...initialFormData });

  const handleClose = () => {
    setFormData({});
    setFormErrors({});
    dispatch(setUndefinedCznValid());
    onClose();
  };

  const parseFormData = () => {
    var finalRequestBody = {
      id: undefined,
      name: undefined,
      gender: undefined,
      birthDate: undefined,
      telecom: undefined
    };
    finalRequestBody.id = formData.id;
    finalRequestBody.name = [{ given: formData.given.split(' '), family: formData.family }];
    finalRequestBody.gender = formData.gender;
    finalRequestBody.birthDate = formData.birthDate;
    finalRequestBody.telecom = [{ system: 'phone', value: formData.telecom, use: 'mobile', rank: 1 }];
    finalRequestBody.identifier = [
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'CZ'
            }
          ]
        },
        value: formData.citizenNumber
      }
    ];
    return finalRequestBody;
  };
  const citizenNumberFieldRef = useRef();

  const handleSave = () => {
    patientSchema
      .validate(formData, { abortEarly: false })
      .then(() => {
        if (!cznValid) {
          setFormErrors({ citizenNumber: 'Citizen number already exists!' });
          return;
        }
        setFormErrors({});
        const params0 = parseFormData();
        handleSavePatient(params0);
        handleClose();
      })
      .catch((validationErrors) => {
        const errors = {};
        validationErrors?.inner?.forEach((error) => {
          errors[error.path] = error.message;
        });
        setFormErrors(errors);
        return;
      });
  };

  const addPatient = (params0) => {
    dispatch(createPatient(params0));
  };

  const editpatient = (params0) => {
    dispatch(updatePatient(params0));
  };

  const handleSavePatient = (params0) => {
    var patientId = patient?.resource?.id || undefined;
    if (!patientId) {
      addPatient(params0);
    } else if (patientId) {
      editpatient(params0);
    }
  };

  const checkCzn = (id, czn) => {
    if (!id || !czn) {
      if (cznValid === undefined) {
        dispatch(checkCznValid({ id: formData.id, czn: formData.citizenNumber }));
        return;
      }
      return;
    }
    if (cznValid === undefined) {
      dispatch(checkCznValid({ id, czn }));
    }
  };

  return (
    <Modal open={open} onClose={() => handleClose(id)} style={styles.modal}>
      <Box style={styles.modalContent}>
        <Typography variant="h4" id="create-patient-modal" padding={1}>
          {patient?.resource?.id ? 'Update Patient' : 'Create Patient'}
        </Typography>
        <TextField
          name="citizenNumber"
          label="Citizen Number"
          variant="outlined"
          ref={citizenNumberFieldRef}
          fullWidth
          style={styles.textField}
          value={formData.citizenNumber}
          onChange={(event) => {
            setFormData({
              ...formData,
              citizenNumber: event.target.value
            });
            setFormErrors({
              ...formErrors,
              citizenNumber: ''
            });
            if (event.target.value.match(/^[1-9]{1}[0-9]{9}[02468]{1}$/) || cznValid === undefined) {
              dispatch(checkCznValid({ id: formData.id, czn: event.target.value }));
            }
          }}
          error={cznValid === false || Boolean(formErrors.citizenNumber)}
          helperText={cznValid === false ? 'Citizen number already exist!' : formErrors.citizenNumber}
        ></TextField>
        <TextField
          name="given"
          label="First Name"
          variant="outlined"
          // ref={formReferances.given}
          fullWidth
          style={styles.textField}
          value={formData.given}
          onChange={(event) => {
            setFormData({
              ...formData,
              given: event.target.value
            });
            setFormErrors({
              ...formErrors,
              given: ''
            });
          }}
          error={Boolean(formErrors.given)}
          helperText={formErrors.given}
        />
        <TextField
          name="family"
          label="Last Name"
          variant="outlined"
          // ref={formReferances.family}
          fullWidth
          style={styles.textField}
          value={formData.family}
          onChange={(event) => {
            setFormData({
              ...formData,
              family: event.target.value
            });
            setFormErrors({
              ...formErrors,
              family: ''
            });
          }}
          error={Boolean(formErrors.family)}
          helperText={formErrors.family}
        />
        <TextField
          name="gender"
          label="Gender"
          select
          variant="outlined"
          fullWidth
          // ref={formReferances.gender}
          selectprops={{
            native: true
          }}
          style={styles.textField}
          value={formData.gender}
          onChange={(event) => {
            setFormData({
              ...formData,
              gender: event.target.value
            });
            setFormErrors({
              ...formErrors,
              gender: ''
            });
          }}
          error={Boolean(formErrors.gender)}
          helperText={formErrors.gender}
        >
          {genders?.map((option) => (
            <MenuItem key={option.code} value={option.code}>
              {option.display}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          name="birthDate"
          label="BirthDate"
          variant="outlined"
          // ref={formReferances.birthDate}
          fullWidth
          style={styles.textField}
          value={formData.birthDate}
          onChange={(event) => {
            setFormData({
              ...formData,
              birthDate: event.target.value
            });
            setFormErrors({
              ...formErrors,
              birthDate: ''
            });
          }}
          error={Boolean(formErrors.birthDate)}
          helperText={formErrors.birthDate}
        />
        <TextField
          name="telecom"
          label="Telecom"
          variant="outlined"
          // ref={formReferances.telecom}
          fullWidth
          style={styles.textField}
          value={formData.telecom}
          onChange={(event) => {
            setFormData({
              ...formData,
              telecom: event.target.value
            });
            setFormErrors({
              ...formErrors,
              telecom: ''
            });
          }}
          error={Boolean(formErrors.telecom)}
          helperText={formErrors.telecom}
        />
        <div style={styles.buttonContainer}>
          <Button variant="contained" onClick={handleClose}>
            Cancel
          </Button>
          <Button disabled={cznValid === undefined} variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default AddPatientModal;
