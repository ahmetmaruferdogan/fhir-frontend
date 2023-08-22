import {
  Box,
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

const AppointmentList = () => {
  const dispatch = useDispatch();
  const [t, i18n] = useTranslation('global');
  const { bundle, loading } = useSelector((state) => state.appointments);
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
      //
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

  const columns = [
    {
      id: 'id'
    },
    {
      id: 'patient'
    },
    {
      id: 'practitioner'
    },
    {
      id: 'date'
    },
    {
      id: 'duration'
    }
  ];

  return (
    <div>
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
              {bundle?.entry?.map((appointment) => {
                if (
                  appointment?.participant?.filter(
                    (participant) =>
                      participant?.actor?.type.toLowerCase() === 'Hl7.Fhir.Model.Patient'.toLowerCase() ||
                      participant?.actor?.type.toLowerCase() === 'Patient'.toLowerCase()
                  )[0]
                ) {
                  console.log('appointment', appointment);
                }
                return (
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
                    <TableCell>place holder</TableCell>
                    <TableCell>place1 holder</TableCell>
                    <TableCell>place2 holder</TableCell>
                    <TableCell>place3 holder</TableCell>
                  </TableRow>
                );
              })}
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
