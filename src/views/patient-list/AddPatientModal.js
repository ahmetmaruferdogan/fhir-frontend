import React, { useEffect, useState } from 'react';
import { Button, MenuItem, Modal, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { updatePatient, createPatient } from 'store/patientSlicer';
import { parsePatientDataToFormData } from 'utils/patients-utils';

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
  AddPatientModal.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    patient: PropTypes.any,
    genders: PropTypes.array
  };
  useEffect(() => {
    setFormData(parsePatientDataToFormData(patient, initialFormData));
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
    telecom: yup.string().required('Telecom is required')
  });
  const initialFormData = {
    given: '',
    family: '',
    gender: '',
    birthDate: '',
    telecom: '',
    id: undefined
  };

  const [formData, setFormData] = useState(parsePatientDataToFormData(patient, initialFormData));
  const [formErrors, setFormErrors] = useState(initialFormData);

  const handleClose = () => {
    setFormData(initialFormData);
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
    return finalRequestBody;
  };

  const handleSave = () => {
    patientSchema
      .validate(formData, { abortEarly: false })
      .then(() => {
        const params0 = parseFormData();
        handleSavePatient(params0);
        handleClose();
      })
      .catch((validationErrors) => {
        console.log('formdata', formData);
        console.log('error', validationErrors);
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

  return (
    <Modal open={open} onClose={() => handleClose(id)} style={styles.modal}>
      <Box style={styles.modalContent}>
        <Typography variant="h4" id="create-patient-modal" padding={1}>
          Create New Patient
        </Typography>
        <TextField
          name="given"
          label="First Name"
          variant="outlined"
          // ref={formReferances.given}
          fullWidth
          style={styles.textField}
          value={formData.given}
          onChange={(event) =>
            setFormData({
              ...formData,
              given: event.target.value
            })
          }
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
          onChange={(event) =>
            setFormData({
              ...formData,
              family: event.target.value
            })
          }
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
          onChange={(event) =>
            setFormData({
              ...formData,
              gender: event.target.value
            })
          }
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
          onChange={(event) =>
            setFormData({
              ...formData,
              birthDate: event.target.value
            })
          }
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
          onChange={(event) =>
            setFormData({
              ...formData,
              telecom: event.target.value
            })
          }
          error={Boolean(formErrors.telecom)}
          helperText={formErrors.telecom}
        />
        <div style={styles.buttonContainer}>
          <Button variant="contained" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default AddPatientModal;
