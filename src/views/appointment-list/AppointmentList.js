import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchAppointments } from 'store/appointmentSlicer';
import AddAppointmentModal from './AddAppointmentModal';

const AppointmentList = () => {
  const dispatch = useDispatch();
  const [t, i18n] = useTranslation('global');
  const { bundle, loading } = useSelector((state) => state.appointments);
  const [addAppointmentModalOpen, setAddAppointmentModalOpen] = useState(false);
  useEffect(() => {
    executeSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, i18n]);

  // useEffect(() => {
  //   console.log('bundle', bundle);
  // }, [bundle]);

  const executeSearch = (params0) => {
    params0 = { ...params0, bundle };
    dispatch(fetchAppointments(params0));
  };

  const [mainSearchText, setMainSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const handleSearchOnChange = (event) => {
    setMainSearchText(event.target.value);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      executeSearch({
        searchParams: {
          _id: mainSearchText
        }
      });
    }
  };

  const nextPageExists = (oldBundle) => {
    if (!oldBundle || !oldBundle.link) {
      return false;
    }
    const nextLinkObject = oldBundle?.link?.find((link) => link?.relation?.match(/^next$/));
    return nextLinkObject ? true : false;
  };

  const prevPageExists = (oldBundle) => {
    if (!oldBundle || !oldBundle.link) {
      return false;
    }
    const prevLinkObject = oldBundle?.link?.find((link) => link?.relation?.match(/^prev(ious)?$/));
    return prevLinkObject ? true : false;
  };

  const fetchNextPage = (oldBundle) => {
    if (!nextPageExists(oldBundle)) {
      toast.error('There is no next page!');
      return;
    }
    dispatch(
      fetchAppointments({
        searchType: 'next',
        bundle: oldBundle,
        searchParams: {}
      })
    );
  };

  const fetchPrevPage = (oldBundle) => {
    if (!prevPageExists(oldBundle)) {
      toast.error('There is no previous page!');
      return;
    }
    dispatch(
      fetchAppointments({
        searchType: 'prev',
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

  const columns = [{ id: 'id' }, { id: 'patient' }, { id: 'practitioners' }, { id: 'date' }, { id: 'duration' }, { id: 'status' }];

  const handleAddAppointmentModalClose = () => {
    setAddAppointmentModalOpen(false);
  };

  const handleAddAppointmentModalOpen = () => {
    setAddAppointmentModalOpen(true);
  };

  const parsePatient = (appointment) => {
    var patient = appointment?.participant?.filter((person) => person?.actor?.type?.toLowerCase().includes('patient'.toLowerCase()))[0];
    if (!patient) return '';
    return patient?.actor?.display ? patient?.actor?.display : patient?.actor?.id ? patient?.actor?.id : patient?.actor?.identifier;
  };
  const parsePractitioners = (appointment) => {
    var practitioner = appointment?.participant?.filter((person) =>
      person?.actor?.type?.toLowerCase().includes('practitioner'.toLowerCase())
    )[0];
    if (!practitioner) return '';
    return practitioner?.actor?.display
      ? practitioner?.actor?.display
      : practitioner?.actor?.id
      ? practitioner?.actor?.id
      : practitioner?.actor?.identifier;
  };
  const parseAppointmentDate = (appointment) => {
    if (appointment?.end && appointment?.minutesDuration) {
      const dateObject = new Date(appointment.end);
      dateObject.setMinutes(dateObject.getMinutes() - appointment?.minutesDuration);
      return dateObject.toISOString().slice(0, 19).replace('T', '/');
    }
    return '';
  };
  const parseAppointmentDuration = (appointment) => {
    return appointment?.minutesDuration || '';
  };

  return (
    <div>
      <AddAppointmentModal open={addAppointmentModalOpen} onClose={handleAddAppointmentModalClose}></AddAppointmentModal>
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
            onChange={handleSearchOnChange}
            onKeyDown={handleSearchKeyDown}
            disabled={loading}
            value={mainSearchText}
            sx={{ width: 200 }}
          ></TextField>
          <IconButton key="add-patient-button" onClick={handleAddAppointmentModalOpen} sx={{ marginLeft: 'auto' }}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Stack>
      <TableContainer component={Paper}>
        <Table aria-label="Patients">
          <TableHead>
            <TableRow>
              {columns?.map((column) => (
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
                  key={column?.id}
                  sx={{
                    textAlign: 'center'
                  }}
                >
                  {t('appointment.list.columns.' + column.id)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          {loading ? (
            <TableBody></TableBody>
          ) : (
            <TableBody>
              {bundle?.entry?.map((appointment) => (
                <TableRow
                  key={appointment?.reource?.id}
                  sx={{
                    height: '10px',
                    '& > td': {
                      padding: '1px',
                      textAlign: 'center'
                    }
                  }}
                >
                  <TableCell>{appointment?.resource?.id || '-'}</TableCell>
                  <TableCell>{parsePatient(appointment?.resource) || '-'}</TableCell>
                  <TableCell>{parsePractitioners(appointment?.resource) || '-'}</TableCell>
                  <TableCell>{parseAppointmentDate(appointment?.resource) || '-'}</TableCell>
                  <TableCell>{parseAppointmentDuration(appointment?.resource) || '-'}</TableCell>
                  <TableCell>{appointment?.resource?.status || '-'}</TableCell>
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
export default AppointmentList;
