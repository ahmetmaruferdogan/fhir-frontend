import React, { useEffect, useState } from 'react';
import { Button, MenuItem, Modal, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { updatePatient, createPatient, checkCznValid, setUndefinedCznValid } from 'store/patientSlicer';
import { parseCzn } from 'utils/patients-utils';
import { useTranslation } from 'react-i18next';
import LocationPicker from './LocationPicker';
const maxAge = 125;
const referenceDate = new Date();
referenceDate.setFullYear(Number(referenceDate.getFullYear() - maxAge));
console.log('reference date: ', referenceDate);
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
  const [t, i18n] = useTranslation('global');
  useEffect(() => {
    setFormData(parsePatientDataToFormData(patient, initialFormData));
    checkCzn(patient?.resource?.id || undefined, parseCzn(patient?.resource));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient]);
  // console.log('genders', genders);
  const patientSchema = yup.object().shape({
    given: yup.string().required(t('patient.addModal.errors.validations.required')),
    family: yup.string().required(t('patient.addModal.errors.validations.required')),
    gender: yup
      .string()
      .required('Gender is required')
      .oneOf(genders?.concept?.map((gender) => gender.code) || [], t('patient.addModal.errors.validations.required')),
    birthDate: yup
      .string()
      .required(t('patient.addModal.errors.validations.required'))
      .matches(/^\d{4}-\d{2}-\d{2}$/, t('patient.addModal.errors.validations.birthdateFormat')),
    telecom: yup.string().required(t('patient.addModal.errors.validations.required')),
    citizenNumber: yup
      .string()
      .required(t('patient.addModal.errors.validations.required'))
      .matches(/^[1-9]{1}[0-9]{9}[02468]{1}$/, t('patient.addModal.errors.validations.notValid')),
    country: yup.string().required(t('patient.addModal.errors.validations.required')),
    state: yup.string().required(t('patient.addModal.errors.validations.required')),
    city: yup.string().required(t('patient.addModal.errors.validations.required'))
    // ppn: yup.string().required('Passport number is required').matches("^[A-Z][0-9]{8}$")
  });

  const initialFormData = {
    given: '',
    family: '',
    gender: '',
    birthDate: '',
    telecom: '',
    citizenNumber: '',
    country: '',
    state: '',
    city: '',
    id: undefined
  };

  const parsePatientDataToFormData = (patientData, initialFormData) => {
    var result = { ...initialFormData };
    result.id = patientData?.resource?.id || undefined;
    if (!result.id) {
      return result;
    }
    result.given =
      patientData?.resource?.name
        ?.filter((nameEntry) => (nameEntry.given ? true : false))[0]
        ?.given.join(' ')
        .trim() || '';
    result.family = patientData?.resource?.name?.filter((nameEntry) => (nameEntry.family ? true : false))[0]?.family || '';
    result.gender = patientData?.resource?.gender || '';
    result.birthDate = patientData?.resource?.birthDate || '';
    result.telecom = patientData?.resource?.telecom?.filter((element) => element?.system === 'phone')[0]?.value || '';
    result.citizenNumber = parseCzn(patientData?.resource);
    const addressVariable =
      patientData?.resource?.address?.filter((element) => element?.use === 'home' && element?.type === 'physical')[0] || undefined;
    // console.log('patient', patientData);
    if (addressVariable) {
      // console.log('address parsed');
      result.country = addressVariable.country;
      result.state = addressVariable.state;
      result.city = addressVariable.city;
    }
    return result;
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
      telecom: undefined,
      address: undefined
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
    finalRequestBody.address = [
      {
        use: 'home',
        type: 'physical',
        country: formData.country,
        state: formData.state,
        city: formData.city
      }
    ];
    return finalRequestBody;
  };
  // const citizenNumberFieldRef = useRef();
  const birthdateIsValid = (date) => {
    const parsedDate = new Date(date);
    return Boolean(parsedDate > referenceDate);
  };
  const handleSave = () => {
    patientSchema
      .validate(formData, { abortEarly: false })
      .then(() => {
        if (!cznValid) {
          setFormErrors({ ...formErrors, citizenNumber: t('patient.addModal.errors.validations.alreadyExist') });
          return;
        }

        if (!birthdateIsValid(formData.birthDate)) {
          setFormErrors({ ...formErrors, birthDate: t('patient.addModal.errors.validations.notValid') });
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
        dispatch(checkCznValid({ id: formData?.id || '', czn: formData.citizenNumber }));
        return;
      }
      return;
    }
    if (cznValid === undefined) {
      dispatch(checkCznValid({ id, czn }));
    }
  };

  const handleAddressSelect = (addressParams) => {
    if (addressParams.country) setFormData({ ...formData, country: addressParams.country.name });
    if (addressParams.state) setFormData({ ...formData, state: addressParams.state.name });
    if (addressParams.city) setFormData({ ...formData, city: addressParams.city.name });
  };

  return (
    <Modal open={open} onClose={() => handleClose()} style={styles.modal}>
      <Box
        style={styles.modalContent}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          '& > .MuiTextField-root': {
            maxHeight: '60px'
          }
        }}
      >
        <Typography variant="h4" id="create-patient-modal" padding={1}>
          {patient?.resource?.id ? t('patient.addModal.title.update') : t('patient.addModal.title.create')}
        </Typography>
        <TextField
          name="citizenNumber"
          label={t('patient.list.columns.czn')}
          variant="standard"
          // ref={citizenNumberFieldRef}
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
            // if (event.target.value.match(/^[1-9]{1}[0-9]{9}[02468]{1}$/) || cznValid === undefined) {
            //   dispatch(checkCznValid({ id: formData?.id || '', czn: event.target.value }));
            // }
          }}
          error={Boolean(formErrors.citizenNumber)}
          helperText={formErrors.citizenNumber}
        ></TextField>
        <TextField
          name="given"
          label={t('patient.list.columns.firstName')}
          variant="standard"
          // ref={formReferances.given}

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
          label={t('patient.list.columns.lastName')}
          variant="standard"
          // ref={formReferances.family}

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
          label={t('patient.list.columns.gender')}
          // ref={formReferances.gender}
          select
          variant="standard"
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
          {genders?.concept?.map((option) => (
            <MenuItem key={option.code} value={option.code}>
              {option?.designation?.filter((element) => element.language === i18n.language)[0]?.value || option?.display || ''}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          name="birthDate"
          label={t('patient.list.columns.birthdate')}
          variant="standard"
          // ref={formReferances.birthDate}

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
          label={t('patient.list.columns.telecom')}
          variant="standard"
          // ref={formReferances.telecom}

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
        <LocationPicker onSelect={handleAddressSelect} errors={formErrors} data={formData} dynamicReturn={true} />
        <div style={styles.buttonContainer}>
          <Button variant="contained" onClick={handleClose}>
            {t('general.cancel')}
          </Button>
          <Button
            disabled={patient?.resource?.id ? cznValid === undefined : false}
            variant="contained"
            color="primary"
            onClick={handleSave}
          >
            {patient?.resource?.id ? t('general.update') : t('general.save')}
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

AddPatientModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  patient: PropTypes.any,
  genders: PropTypes.any
};

export default AddPatientModal;
