import {
  Box,
  Button,
  Grid,
  IconButton,
  Modal,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  debounce
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatients } from 'store/patientSlicer';
import { parseCzn, parseName, objectifyString } from 'utils/patients-utils';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useCallback } from 'react';
import { useMemo } from 'react';

const debounceDelay = 1000;
const styles = {
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: '500px',
    maxWidth: '500px'
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

const SelectPatientModal = ({ open, onClose, patientSetter }) => {
  const dispatch = useDispatch();
  const { bundle, loading } = useSelector((state) => state.patients);
  const [t, i18n] = useTranslation('global');
  useEffect(() => {
    if (open) executeSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, i18n]);
  const handleClose = () => {
    setAdvancedSearchOpen(false);
    setSearchData({});
    setMainSearchText('');
    setCurrentPage(0);
    onClose();
  };
  const handleSwitchAdvancedFilter = () => {
    setAdvancedSearchOpen(!advancedSearchOpen);
  };
  const parseSearchInputToParams = (searchParams0) => {
    // console.log('params', searchParams0);
    let result = {};
    if (searchParams0.name) result.name = searchParams0.name.trim().split(' ');
    if (searchParams0.id) result._id = searchParams0.id;
    if (searchParams0.czn) result.identifier = searchParams0.czn;
    return result;
  };
  const [mainSearchText, setMainSearchText] = useState('');
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [searchData, setSearchData] = useState({});
  const executeSearch = (params0) => {
    params0 = { ...params0, bundle };
    dispatch(fetchPatients(params0));
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
  const handleCloseAdvancedFilter = () => {
    setAdvancedSearchOpen(false);
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

  const searchAfterParsing = useCallback((searchText) => {
    var searchParameters0 = objectifyString(searchText);
    handleSearchWithParams(searchParameters0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const debounceOnChange = useMemo(() => {
    return debounce(searchAfterParsing, debounceDelay);
  }, [searchAfterParsing]);

  const onSearchChange = (event) => {
    // setSearchParams({ ...searchParams, [column.id]: event.target.value });
    setMainSearchText(event.target.value);
    // handleSearchWithParams({ ...searchParams, [column.id]: event.target.value });
    if (!advancedSearchOpen) debounceOnChange(event.target.value);
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

  const columns = [
    { id: 'select', search: false },
    { id: 'czn', search: true },
    { id: 'id', search: true },
    { id: 'name', search: true }
  ];
  return (
    <Modal open={open} onClose={handleClose} style={styles.modal}>
      <div
        style={{
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          outline: 'none' // Remove focus outline
        }}
      >
        <Stack
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '100%'
          }}
          direction="column"
          color="secondary"
        >
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
              <FilterAltIcon fontSize="small" color="secondary" />
            </IconButton>
            {advancedSearchOpen ? (
              <IconButton key="advanced-search-button" onClick={handleAdvancedSearch} color="secondary">
                <SearchIcon fontSize="small"></SearchIcon>
              </IconButton>
            ) : (
              <></>
            )}
          </Box>
          {advancedSearchOpen ? (
            <Grid container>
              {columns?.map((column) =>
                column.search ? (
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
                ) : (
                  <></>
                )
              )}
            </Grid>
          ) : (
            <></>
          )}
        </Stack>
        <TableContainer component={Paper} sx={{ maxHeight: '500px', maxWidth: '500px' }}>
          <Table aria-label="Patients" size="small" sx={{ maxHeight: '500px', maxWidth: '500px' }}>
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
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => {
                          patientSetter(patient);
                          handleClose();
                        }}
                      >
                        {t('general.select')}
                      </Button>
                    </TableCell>
                    <TableCell>{parseCzn(patient.resource) || '-'}</TableCell>
                    <TableCell>{patient.resource.id || '-'}</TableCell>
                    <TableCell>{parseName(patient.resource)}</TableCell>
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
    </Modal>
  );
};

SelectPatientModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  patientSetter: PropTypes.func
};

export default SelectPatientModal;
