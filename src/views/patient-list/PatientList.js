import { fetchPatients, deletePatientWithId, fetchGenders } from '../../store/patientSlicer';
import { React, useCallback, useEffect, useMemo, useState } from 'react';
import { parseCzn, parseName, prevPageExists, nextPageExists, objectifyString } from '../../utils/patients-utils';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, Grid, IconButton, MenuItem, Stack, TablePagination, debounce } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import AddPatientModal from './AddPatientModal';
import { toast } from 'react-toastify';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
// import SkeletonPatientList from './skeleton/SkeletonPatientList';
import EditIcon from '@mui/icons-material/Edit';
// import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import LocationPicker from './LocationPicker';

const PatientList = () => {
  const dispatch = useDispatch();
  const [t, i18n] = useTranslation('global');
  const { bundle, loading, genders } = useSelector((state) => state.patients);

  useEffect(() => {
    if (genders.length <= 0) {
      dispatch(fetchGenders());
    }
    executeSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, i18n]);

  const executeSearch = (params0) => {
    params0 = { ...params0, bundle };
    dispatch(fetchPatients(params0));
  };

  const [editedPatient, setEditedPatient] = useState({ id: undefined });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  // const [searchParams, setSearchParams] = useState({});

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
    console.log('params', searchParams0);
    let result = {};
    if (searchParams0.name) result.name = searchParams0.name.trim().split(' ');
    if (searchParams0.id) result._id = searchParams0.id;
    if (searchParams0.gender) result.gender = searchParams0.gender;
    if (searchParams0.birthdate) result.birthdate = searchParams0.birthdate;
    if (searchParams0.telecom) result._content = searchParams0.telecom;
    if (searchParams0.czn) result.identifier = searchParams0.czn;
    if (searchParams0.country) result['address-country'] = searchParams0.country;
    if (searchParams0.state) result['address-state'] = searchParams0.state;
    if (searchParams0.city) result['address-city'] = searchParams0.city;
    return result;
  };

  const handleSearchWithParams = (searchParams0) => {
    var searchParameters = parseSearchInputToParams(searchParams0);
    executeSearch({
      bundle: {},
      searchParams: searchParameters
    });
    // setSearchParams({});´
    // setSearchText('');
    setCurrentPage(0);
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
    { id: 'czn', search: true },
    { id: 'id', search: true },
    { id: 'name', search: true },
    { id: 'gender', search: true },
    { id: 'birthdate', search: true },
    { id: 'telecom', search: true },
    { id: 'buttons' }
  ];

  const searchColumns = [{ id: 'czn' }, { id: 'id' }, { id: 'birthDate' }, { id: 'telecom' }];

  const searchAfterParsing = useCallback((searchText) => {
    var searchParameters0 = objectifyString(searchText);
    handleSearchWithParams(searchParameters0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const debounceOnChange = useMemo(() => {
    return debounce(searchAfterParsing, 1000);
  }, [searchAfterParsing]);

  const onSearchChange = (event) => {
    // setSearchParams({ ...searchParams, [column.id]: event.target.value });
    setMainSearchText(event.target.value);
    // handleSearchWithParams({ ...searchParams, [column.id]: event.target.value });
    if (!advancedSearchOpen) debounceOnChange(event.target.value);
  };

  const getGenderValueBasedOnLanguage = (gender) => {
    const genderConceptObject = genders?.concept?.filter((element) => element.code === gender)[0] || undefined;
    return (
      genderConceptObject?.designation?.filter((element1) => element1.language === i18n.language)[0]?.value ||
      genderConceptObject?.display ||
      undefined
    );
  };

  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [searchData, setSearchData] = useState({});
  const [mainSearchText, setMainSearchText] = useState('');

  const handleSwitchAdvancedFilter = () => {
    setAdvancedSearchOpen(!advancedSearchOpen);
  };

  const handleCloseAdvancedFilter = () => {
    setAdvancedSearchOpen(false);
  };

  const handleAdvancedSearch = () => {
    let newSearchText = mainSearchText + ' ';
    for (const [key, value] of Object.entries(searchData)) {
      newSearchText += '"' + key + ':' + value + '" ';
    }
    searchAfterParsing(newSearchText);
    setMainSearchText(newSearchText);
    setSearchData({});
    handleCloseAdvancedFilter();
  };

  return (
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
      <Stack direction="column">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            minWidth: '100%'
          }}
        >
          <TextField
            id="search-field"
            label={t('general.search')}
            variant="outlined"
            // ref={mainSearchRef}
            onChange={onSearchChange}
            disabled={loading}
            value={mainSearchText}
            sx={{ width: 200 }}
          />
          <IconButton key="advanced-filter-button" onClick={handleSwitchAdvancedFilter}>
            <FilterAltIcon fontSize="small" />
          </IconButton>
          {advancedSearchOpen ? (
            <IconButton key="advanced-search-button" onClick={handleAdvancedSearch}>
              <SearchIcon fontSize="small"></SearchIcon>
            </IconButton>
          ) : (
            <></>
          )}
          <IconButton key="add-patient-button" onClick={handleOpenAddPatientModal} sx={{ marginLeft: 'auto' }}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
        {advancedSearchOpen ? (
          <Grid container>
            {searchColumns?.map((column) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={column.id}>
                <TextField
                  key={column.id + '-search-field'}
                  label={t('patient.list.columns.' + column.id)}
                  variant="standard"
                  disabled={loading}
                  sx={{ width: 200 }}
                  onChange={(event) => {
                    setSearchData({ ...searchData, [column.id]: event.target.value });
                  }}
                />
              </Grid>
            ))}
            <Grid item xs={12} sm={6} md={4} lg={3} key="advanced-search-button-grid">
              <LocationPicker
                onSelect={(data) => {
                  if (data.country) setSearchData({ ...searchData, country: data.country.name });
                  if (data.state) setSearchData({ ...searchData, state: data.state.name });
                  if (data.city) setSearchData({ ...searchData, city: data.city.name });
                }}
                disabled={loading}
                dynamicReturn={true}
              ></LocationPicker>
            </Grid>
            <Grid sx={{ alignItems: 'center' }} item xs={12} sm={6} md={4} lg={3} key="advanced-gender-search">
              <TextField
                disabled={loading}
                sx={{ width: 100 }}
                name="gender-search"
                label={t('patient.list.columns.gender')}
                select
                variant="standard"
                value={searchData?.gender || ''}
                selectprops={{
                  native: true
                }}
                onChange={(event) => {
                  setSearchData({ ...searchData, gender: event.target.value });
                }}
              >
                {genders?.concept?.map((option) => (
                  <MenuItem key={option.code} value={option.code}>
                    {option?.designation?.filter((element) => element.language === i18n.language)[0]?.value || option?.display || ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        ) : (
          <></>
        )}
      </Stack>
      <TableContainer component={Paper}>
        <Table aria-label="Patients">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                // !column.search ? (
                //   <TableCell key={column.id}>
                //     <Box>
                //       {/* <IconButton key="search-button" onClick={() => handleSearchWithParams(sear)}>
                //         <SearchIcon />
                //       </IconButton> */}
                //       {/* <IconButton key="refresh-button" onClick={() => handleSearchWithParams(searchParams)}>
                //         <RefreshIcon />
                //       </IconButton> */}
                //     </Box>
                //   </TableCell>
                // ) :
                <TableCell
                  key={column.id}
                  align={column.align}
                  sx={{
                    textAlign: 'center'
                  }}
                >
                  {t('patient.list.columns.' + column.id)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          {loading ? (
            <TableBody></TableBody>
          ) : (
            <TableBody>
              {bundle?.entry?.map((patient) => (
                <TableRow
                  key={patient.resource.id}
                  sx={{
                    height: '10px',
                    '& > td': {
                      padding: '1px',
                      textAlign: 'center'
                    }
                  }}
                >
                  <TableCell>{parseCzn(patient.resource)}</TableCell>
                  <TableCell>{patient.resource.id || '-'}</TableCell>
                  <TableCell>{parseName(patient.resource)}</TableCell>
                  <TableCell>{getGenderValueBasedOnLanguage(patient.resource.gender) || '-'}</TableCell>
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
                      <EditIcon fontSize="small" />
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
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
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
