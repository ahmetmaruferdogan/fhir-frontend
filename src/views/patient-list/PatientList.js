import { fetchPatients, deletePatientWithId, fetchGenders } from '../../store/patientSlicer';
import { React, useEffect, useRef, useState } from 'react';
import { parseCzn, parseName, prevPageExists, nextPageExists } from '../../utils/patients-utils';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, IconButton, TablePagination } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import AddPatientModal from './AddPatientModal';
import { toast } from 'react-toastify';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import SkeletonPatientList from './skeleton/SkeletonPatientList';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';

const PatientList = () => {
  const dispatch = useDispatch();
  const { bundle, loading, genders } = useSelector((state) => state.patients);
  useEffect(() => {
    if (genders.length <= 0) {
      dispatch(fetchGenders());
    }
    executeSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const executeSearch = (params0) => {
    params0 = { ...params0, bundle };
    dispatch(fetchPatients(params0));
  };

  const [editedPatient, setEditedPatient] = useState({ id: undefined });
  const textInputRefs = useRef({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchParams, setSearchParams] = useState({});

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

  const parseSearchInputToParams = (searchParams0) => {
    let result = {};
    if (searchParams0.name) result.name = searchParams0.name;
    if (searchParams0.id) result._id = searchParams0.id;
    if (searchParams0.gender) result.gender = searchParams0.gender;
    if (searchParams0.birthdate) result.birthdate = searchParams0.birthdate;
    if (searchParams0.telecom) result._content = searchParams0.telecom;
    if (searchParams0.czn) result.identifier = searchParams0.czn;
    return result;
  };

  const handleSearchWithParams = (searchParams0) => {
    var searchParameters = parseSearchInputToParams(searchParams0);
    executeSearch({
      bundle: {},
      searchParams: searchParameters
    });
    setSearchParams({});
    setCurrentPage(0);
    Object.values(textInputRefs.current).forEach((ref) => (ref.value = ''));
  };

  const handleOpenAddPatientModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseAddPatientModal = () => {
    setIsModalOpen(false);
    setEditedPatient(undefined);
  };

  const fetchPrevPage = (oldBundle) => {
    if (!prevPageExists(oldBundle)) {
      toast.error('There is no previous page!');
      return;
    }
    dispatch(
      fetchPatients({
        searchType: 'prev',
        bundle: oldBundle,
        searchParams: {}
      })
    );
  };

  const fetchNextPage = (oldBundle) => {
    if (!nextPageExists(oldBundle)) {
      toast.error('There is no next page!');
      return;
    }
    dispatch(
      fetchPatients({
        searchType: 'next',
        bundle: oldBundle,
        searchParams: {}
      })
    );
  };

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
    deletePatient(patients);
    handleDeleteDialogClose();
  };

  const handleDeleteDialogClose = () => {
    setDialogOpen(false);
    setEditedPatient(undefined);
  };

  const columns = [
    { id: 'czn', label: 'Citizen Number', minWidth: 150, search: true },
    { id: 'id', label: 'id', minWidth: 100, search: true },
    { id: 'name', label: 'Full Name', minWidth: 200, search: true },
    { id: 'gender', label: 'Gender', minWidth: 100, search: true },
    { id: 'birthdate', label: 'Birthdate', minWidth: 150, search: true },
    { id: 'telecom', label: 'Telecom', minWidth: 150, search: true },
    { id: 'buttons', label: '', minWidth: 150 }
  ];

  return loading ? (
    <SkeletonPatientList></SkeletonPatientList>
  ) : (
    <div>
      <Dialog
        key="delete-dialog"
        open={dialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Confirm delete patient?'}</DialogTitle>
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
      <AddPatientModal
        key="add-patient-modal"
        open={isModalOpen}
        onClose={handleCloseAddPatientModal}
        patient={editedPatient}
        genders={genders}
      ></AddPatientModal>
      <TableContainer component={Paper}>
        <Table aria-label="Patients">
          <TableHead>
            <TableRow>
              {columns.map((column) =>
                column.search ? (
                  <TableCell key={column.id} align={column.align}>
                    {column.label}
                    <TextField
                      id={column.id + '-search-field'}
                      label={'Search for ' + column.label}
                      variant="outlined"
                      onChange={(event) => {
                        setSearchParams({ ...searchParams, [column.id]: event.target.value });
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          handleSearchWithParams(searchParams);
                        }
                      }}
                    ></TextField>
                  </TableCell>
                ) : (
                  <TableCell key={column.id}>
                    <Box>
                      <IconButton key="searc-button" onClick={() => handleSearchWithParams(searchParams)}>
                        <SearchIcon />
                      </IconButton>
                      <IconButton key="add-patient-button" onClick={handleOpenAddPatientModal}>
                        <AddIcon />
                      </IconButton>
                      <IconButton key="refresh-button" onClick={() => handleSearchWithParams(searchParams)}>
                        <RefreshIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {bundle?.entry?.map((patient) => (
              <TableRow key={patient.resource.id}>
                <TableCell>{parseCzn(patient.resource)}</TableCell>
                <TableCell>{patient.resource.id || '-'}</TableCell>
                <TableCell>{parseName(patient.resource)}</TableCell>
                <TableCell>{patient.resource.gender || '-'}</TableCell>
                <TableCell>{patient.resource.birthDate || '-'}</TableCell>
                <TableCell>{patient.resource.telecom?.[0]?.value || '-'}</TableCell>
                <TableCell>
                  <IconButton
                    key={'edit-button-of-' + patient.resource.id}
                    aria-label="edit"
                    variant="warn"
                    onClick={() => {
                      setEditedPatient(patient);
                      setIsModalOpen(true);
                    }}
                  >
                    <EditIcon></EditIcon>
                  </IconButton>
                  <IconButton
                    key={'delete-button-of-' + patient.resource.id}
                    aria-label="delete"
                    variant="error"
                    onClick={() => {
                      setEditedPatient(patient);
                      handleDeleteDialogOpen();
                    }}
                  >
                    <DeleteIcon></DeleteIcon>
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
      </TableContainer>
    </div>
  );
};

export default PatientList;
