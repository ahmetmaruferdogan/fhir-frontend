import { fetchPatients, createPatient, deletePatientWithId } from '../../store/patientSlicer';
import { React, useEffect, useRef, useState } from 'react';
import { parseName } from '../../utils/patients-utils';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, IconButton, TablePagination } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import AddPatientModal from './AddPatientModal';
import { toast } from 'react-toastify';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const PatientList = () => {
  const dispatch = useDispatch();
  const { bundle, loading } = useSelector((state) => state.patients);
  useEffect(() => {
    executeSearch();
  }, [dispatch]);

  const executeSearch = (params0) => {
    params0 = { ...params0, bundle };
    dispatch(fetchPatients(params0));
  };

  const addPatient = (params0) => {
    dispatch(createPatient(params0));
  };

  const [editedPatient, setEditedPatient] = useState(false);

  const deletePatient = (patients) => {
    if (!patients) {
      toast.error('Error occurred while deleting patient!');
      return;
    }
    if (!Array.isArray(patients)) {
      dispatch(deletePatientWithId(patients?.resource?.id || -1));
    } else {
      patients.map((patient) => deletePatient(patient));
    }
  };

  const [idString, setIdString] = useState('');
  const [nameString, setNameString] = useState('');
  const [genderString, setGenderString] = useState('');
  const [birthdateString, setbirthdateString] = useState('');
  const [telecomString, setTelecomString] = useState('');
  const textInputRefs = useRef({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const isNumeric = (str) => {
    return /^\d+$/.test(str);
  };

  const hasDatePattern = (str) => {
    const pattern = /\d{4}-\d{2}-\d{2}/;

    return pattern.test(str);
  };

  const valueChangeHandler = (id, value) => {
    if (!value) {
      return;
    }

    if (id.match(/^id$/)) {
      setIdString(value);
      return;
    }
    if (id.match(/^name$/)) {
      setNameString(value);
      return;
    }
    if (id.match(/^gender$/)) {
      setGenderString(value);
      return;
    }
    if (id.match(/^birthdate$/)) {
      setbirthdateString(value);
      return;
    }
    if (id.match(/^telecom$/)) {
      setTelecomString(value);
      return;
    }
  };

  const handleEnterPress = () => {
    var searchParameters = {};
    if (idString) {
      if (!isNumeric(idString)) {
        toast.error('id field must be a positive integer!');
        return;
      } else {
        searchParameters._id = idString;
      }
    }
    if (nameString) {
      searchParameters._content = nameString;
    }
    if (genderString) {
      searchParameters.gender = genderString;
    }
    if (birthdateString) {
      if (!hasDatePattern(birthdateString)) {
        toast.error(
          "for birthdate a pattern of 'yyyy-mm-dd' must be used! (write months and dates with 0 at the beginning if it is 1 digit)"
        );
        return;
      } else {
        searchParameters.birthdate = birthdateString;
      }
    }
    if (telecomString) {
      searchParameters.telecom = [telecomString];
    }
    executeSearch({
      bundle: {},
      searchParams: searchParameters
    });
    setIdString('');
    setNameString('');
    setGenderString('');
    setbirthdateString('');
    setTelecomString('');
    setCurrentPage(0);
    Object.values(textInputRefs.current).forEach((ref) => (ref.value = ''));
  };

  const handleOpenAddPatientModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseAddPatientModal = () => {
    setIsModalOpen(false);
  };

  const handleSavePatient = (data) => {
    addPatient(data);
  };

  const [currentPage, setCurrentPage] = useState(0);

  const handlePageChange = (event, newPage) => {
    if (loading) {
      toast.warn('wait for previous page change to finish!');
      return;
    }
    if (newPage > currentPage) {
      fetchNextPage(bundle);
    } else if (newPage < currentPage) {
      fetchPrevPage(bundle);
    }

    setCurrentPage(newPage);
  };
  const handleDeleteDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDeleteDialogConfirm = (patients) => {
    handleDeleteDialogClose();
    deletePatient(patients);
  };

  const handleDeleteDialogClose = () => {
    setDialogOpen(false);
  };

  const columns = [
    { id: 'id', label: 'id', minWidth: 100, search: true },
    { id: 'name', label: 'Full Name', minWidth: 200, search: true },
    { id: 'gender', label: 'Gender', minWidth: 100, search: true },
    { id: 'birthdate', label: 'Birth Date', minWidth: 150, search: true },
    { id: 'telecom', label: 'Telecom', minWidth: 150, search: true },
    { id: 'buttons', label: '', minWidth: 150 }
  ];

  return (
    <div>
      <Dialog
        open={dialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Use Google's location service?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the patient (id: {editedPatient?.resource?.id})?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>No</Button>
          <Button onClick={() => handleDeleteDialogConfirm(editedPatient)} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <IconButton onClick={handleOpenAddPatientModal}>
        <AddIcon fontSize="small"></AddIcon>
      </IconButton>
      <AddPatientModal open={isModalOpen} onClose={handleCloseAddPatientModal} onSave={handleSavePatient} />
      <TableContainer component={Paper}>
        <TablePagination
          component="div"
          rowsPerPageOptions={[]}
          count={bundle?.total || 0}
          page={currentPage}
          rowsPerPage={Number(bundle?.entry?.length) || 0}
          disabled={loading}
          onPageChange={(event, newPage) => {
            if (!loading) {
              handlePageChange(event, newPage);
            }
          }}
        ></TablePagination>
        <Table aria-label="Patients">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} align={column.align}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {columns.map((column) => {
                column.search ? (
                  <TextField
                    id={column.id + '_search_textfield'}
                    inputRef={(el) => (textInputRefs.current[column.id] = el)}
                    label={column.id}
                    variant="standard"
                    onChange={(event) => valueChangeHandler(column.id, event?.target?.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleEnterPress();
                      }
                    }}
                  />
                ) : (
                  <></>
                );
              })}
            </TableRow>
            {bundle?.entry?.map((patient) => (
              <TableRow key={patient.resource.id}>
                <TableCell>{patient.resource.id || '-'}</TableCell>
                <TableCell>{parseName(patient.resource)}</TableCell>
                <TableCell>{patient.resource.gender || '-'}</TableCell>
                <TableCell>{patient.resource.birthDate || '-'}</TableCell>
                <TableCell>{patient.resource.telecom?.[0]?.value || '-'}</TableCell>
                <TableCell>
                  <IconButton
                    aria-label="delete"
                    variant="error"
                    onClick={() => {
                      setEditedPatient(patient);
                      handleDeleteDialogOpen();
                    }}
                  >
                    <DeleteIcon fontSize="small"></DeleteIcon>
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default PatientList;
