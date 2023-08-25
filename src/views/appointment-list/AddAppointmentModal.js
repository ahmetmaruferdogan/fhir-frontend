import { Button, Modal, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import PropTypes from 'prop-types';
import { useState } from 'react';
// import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SelectPatientModal from './SelectPatientModal';
import SelectPractitionerModal from './SelectPractitionerModal';
import { useEffect } from 'react';
import { createAppointment } from 'store/appointmentSlicer';
import { useDispatch } from 'react-redux';
// import { useDispatch } from 'react-redux';
// import { useSelector } from 'react-redux';

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

const AddAppointmentModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  //   const {} = useSelector((state) => state.appointments);
  const [t] = useTranslation('global');
  const initialFormData = {
    patient: undefined,
    practitioners: undefined,
    date: '',
    hour: '',
    duration: ''
  };

  const [formData, setFormData] = useState({ ...initialFormData });
  const [formErrors, setFormErrors] = useState({ ...initialFormData });

  const [selectPatientModalOpen, setSelectPatientModalOpen] = useState(false);
  const [selectPractitionerModalOpen, setSelectPractitionerModalOpen] = useState(false);

  const [patient, setPatient] = useState(undefined);
  const [practitioner, setPractitioner] = useState(undefined);

  useEffect(() => {
    setFormData({ ...formData, patient: patient });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient]);

  useEffect(() => {
    setFormData({ ...formData, practitioner: practitioner });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practitioner]);

  const handleClose = () => {
    setFormData({});
    setFormErrors({});
    onClose();
  };

  const handleSave = () => {
    dispatch(createAppointment({ formData }));
    handleClose();
  };

  const handleSelectPractitionerModalClose = () => {
    setSelectPractitionerModalOpen(false);
  };

  const handleSelectPatientModalClose = () => {
    setSelectPatientModalOpen(false);
  };

  const handleSelectPatientModalOpen = () => {
    setSelectPatientModalOpen(true);
  };

  const handleSelectPractitionerModalOpen = () => {
    setSelectPractitionerModalOpen(true);
  };

  return (
    <Modal open={open} onClose={handleClose} style={styles.modal}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row'
        }}
      >
        <Box
          style={styles.modalContent}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: '300px',
            '& > .MuiTextField-root': {
              maxHeight: '60px'
            }
          }}
        >
          <Typography variant="h4" id="create-appointment-modal" padding={1}>
            {t('appointment.addModal.title.create')}
          </Typography>
          <TextField
            name="date"
            label={t('appointment.list.columns.date')}
            style={styles.textField}
            value={formData.date}
            onChange={(event) => {
              setFormData({
                ...formData,
                date: event.target.value
              });
              setFormErrors({
                ...formErrors,
                date: ''
              });
            }}
            error={Boolean(formErrors.date)}
            helperText={formErrors.date}
          ></TextField>
          <TextField
            name="hour"
            label={t('appointment.list.columns.hour')}
            style={styles.textField}
            value={formData.hour}
            onChange={(event) => {
              setFormData({
                ...formData,
                hour: event.target.value
              });
              setFormErrors({
                ...formErrors,
                hour: ''
              });
            }}
            error={Boolean(formErrors.hour)}
            helperText={formErrors.hour}
          ></TextField>
          <TextField
            name="duration"
            label={t('appointment.list.columns.duration')}
            style={styles.textField}
            value={formData.duration}
            onChange={(event) => {
              setFormData({
                ...formData,
                duration: event.target.value
              });
              setFormErrors({
                ...formErrors,
                duration: ''
              });
            }}
            error={Boolean(formErrors.duration)}
            helperText={formErrors.duration}
          ></TextField>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Button
                variant="outlined"
                onClick={() => {
                  handleSelectPatientModalOpen();
                  setFormErrors({ ...formErrors, patient: '' });
                }}
              >
                {t('appointment.addModal.select.patient')}
              </Button>
              <Typography variant="body2">{formErrors.patient}</Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Button
                variant="outlined"
                onClick={() => {
                  handleSelectPractitionerModalOpen();
                  setFormErrors({ ...formErrors, practitioners: '' });
                }}
              >
                {t('appointment.addModal.select.practitioners')}
              </Button>
              <Typography variant="body2">{formErrors.practitioners}</Typography>
            </Box>
          </Box>
          <div style={styles.buttonContainer}>
            <Button variant="contained" onClick={handleClose}>
              {t('general.cancel')}
            </Button>
            <Button variant="contained" onClick={handleSave}>
              {t('general.save')}
            </Button>
          </div>
        </Box>
        <SelectPatientModal
          open={selectPatientModalOpen}
          onClose={handleSelectPatientModalClose}
          patientSetter={setPatient}
        ></SelectPatientModal>
        <SelectPractitionerModal
          open={selectPractitionerModalOpen}
          onClose={handleSelectPractitionerModalClose}
          practitionerSetter={setPractitioner}
        ></SelectPractitionerModal>
      </Box>
    </Modal>
  );
};

AddAppointmentModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default AddAppointmentModal;
