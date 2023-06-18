// React import
import React, { useEffect, useState } from 'react';

// Material import
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

// Router imports
import { useLocation, useNavigate } from 'react-router-dom';

// Contants import
import { constants } from '../app.constants';

// Container import
import Judgment from './Judgment';
import SaveSearchButton from './SaveSearchButton';

// Component import
import Loader from '../Components/extras/Loader';

// Service import
import { logout } from '../services/auth.service';

// Third party imports
import axios from 'axios';
import { toast } from 'react-toastify';
import { areStringArraysEqual, decryptString, isAuthorised } from '../app.utils';
import RecordCount from '../Components/RecordsCount';
import ContainerLoader from '../Components/extras/ContainerLoader';


const Judges = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const [isPanelLoading, setIsPanelsLoading] = useState(false);
  const [judge, setJudge] = useState<any>('');
  const [hierarchy, setHeirarchy] = useState('');
  const [hierarchies, setHeirarchies] = useState([]);
  const [judges, setJudges] = useState([]);
  const [panel, setPanel] = useState<any>([]);
  const [Court, setCourt] = useState('');
  const [Courts, setCourts] = useState([]);
  const [show_case, setShowCase] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [aloneCases, setAloneCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [viewCasesAs, setViewCasesAs] = useState('bench');
  const [casesPageNo, setCasesPageNo] = useState(1);
  const [casesTotalRecords, setCasesTotalRecords] = useState(0);
  const [totalCasesPages, setCasesTotalPages] = useState(1);
  const [totalStandaloneCasesPages, setTotalStandaloneCasesPages] = useState(1);
  const [totalStandaloneCases, setTotalStandaloneCases] = useState(0);
  const [selectCasesListToDisplay, setSelectCasesListToDisplay] = useState([]);
  const [selectedPanel, setSelectedPanel] = useState<any>();
  const [openJudgmentDialog, setOpenJudgmentDialog] = useState(false);
  const [isCaseSearching, setIsCaseSearching] = useState(false);
  const [isHierarchiesLoading, setIsHierarchiesLoading] = useState(true);
  const [isCourtsLoading, setIsCourtsLoading] = useState(false);
  const [isJudgeLoading, setIsJudgeLoading] = useState(false);

  useEffect(() => {
    setIsHierarchiesLoading(true);
    axios
      .get(
        `${process.env.REACT_APP_API_NEST_URL}/court-search/fetch-hierarchies`,
        {
          headers: {
            Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
          },
        }
      )
      .then((response: any) => {
        setHeirarchies(response.data);
        setIsHierarchiesLoading(false);
      })
      .catch((error) => {
        setIsHierarchiesLoading(false);
        if (error.response.status === 401) {
          logout();
        }
        toast.error('Failed to fetch hierarchies.');
      });
  }, []);

  const handleChangeHeirarchy = (event: any) => {
    resetSelections();
    setHeirarchy(event);
    setCourt('');
    setJudge('');
    setPanel([]);
    setCourts([]);
    setJudges([]);
    const value = event;
    setIsCourtsLoading(true);
    axios
      .get(
        `${process.env.REACT_APP_API_NEST_URL}/court-search/courts-by-hier/${value}`,
        {
          headers: {
            Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
          },
        }
      )
      .then((response) => {
        setCourts(response.data);
        if (response.data.length > 0 && searchParams.get('court')) {
          const courtParam = searchParams.get('court')?.toString();
          handleChangeCourt(courtParam);
        }
        setIsCourtsLoading(false);
      })
      .catch((error) => {
        setIsCourtsLoading(false);
        if (error.response.status === 401) {
          logout();
        }
        toast.error('Failed to fetch courts of the selected court hierarchy.');
      });
  };

  const handleChangeCourt = (event: any) => {
    resetSelections();
    setCourt(event);
    setJudge('');
    setJudges([]);
    setIsJudgeLoading(true);
    axios
      .post(
        `${process.env.REACT_APP_API_NEST_URL}/judge-search/judges-by-courts/`,
        {
          court: event,
        },
        {
          headers: {
            Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
          },
        }
      )
      .then((response) => {
        setJudges(response.data);
        if (response.data.length > 0 && searchParams.get('judge')) {
          const judgeParam = searchParams.get('judge')?.toString();
          handleChangeJudge(judgeParam, event);
        }
        setIsJudgeLoading(false);
      })
      .catch((error) => {
        setIsJudgeLoading(false);
        if (error.response.status === 401) {
          logout();
        }
        toast.error('Failed to fetch judges of selected court.');
      });
  };

  const handleChangeJudge = (event: any, selectedCourt = Court) => {
    resetSelections();
    setJudge(event);
    fetchPanels(event, selectedCourt);
    fetchStandAloneCases(event, selectedCourt);
  };

  const fetchPanels = (selectedJudge = judge, selectedCourt = Court) => {
    setIsPanelsLoading(true);
    axios
      .post(
        `${process.env.REACT_APP_API_NEST_URL}/judge-search/judges-panels`,
        {
          judge: selectedJudge,
          court: selectedCourt,
        },
        {
          headers: {
            Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
          },
        }
      )
      .then((res) => {
        setIsPanelsLoading(false);
        if (res.data) {
          setPanel(res.data);
          if (Object.keys(res.data).length > 0 && searchParams.get('panelIds')) {
            const panelIdsParams = searchParams.get('panelIds');
            const panelIds = panelIdsParams ? panelIdsParams.split(',') : [];
            setSelectedPanel(panelIds);
            if (panelIds.length > 0) {
              fetchBenchCases(panelIds);
            }
          }
        }
      })
      .catch((err) => {
        setIsPanelsLoading(false);
        if (err.response.status === 401) {
          logout();
        }
        toast.error('Failed to fetch panels.');
      });
  }

  const fetchStandAloneCases = (selectedJudge = judge, selectedCourt = Court) => {
    setIsCaseSearching(true);
    axios
      .post(
        `${process.env.REACT_APP_API_NEST_URL}/judge-search/stand-alone-cases`,
        {
          judge: selectedJudge,
          court: selectedCourt,
          pageNo: casesPageNo.toString(),
          pageSize: constants.pageSize,
        },
        {
          headers: {
            Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
          },
        }
      )
      .then((res: any) => {
        if (res.data?.data && res.data?.totalPages && res.data?.totalRecords) {
          if (res.data?.data.length === 0) {
            toast.info('No cases found for the selected Judge.');
            setAloneCases([]);
            setTotalStandaloneCasesPages(1);
            setTotalStandaloneCases(0);
          } else {
            setAloneCases(res.data?.data);
            setTotalStandaloneCasesPages(res.data?.totalPages);
            setTotalStandaloneCases(res.data?.totalRecords);
          }
        }
        setIsCaseSearching(false);
      })
      .catch((err) => {
        setIsCaseSearching(false);
        if (err.response.status === 401) {
          logout();
        }
        toast.error('Failed to fetch stand alone cases.');
      });
  }

  const resetSelections = () => {
    setShowCase([]);
    setAloneCases([]);
    setViewCasesAs('bench');
    setSelectedPanel(null);
    setTotalStandaloneCases(0);
    setCasesTotalPages(1);
    setTotalStandaloneCasesPages(1);
    setTotalStandaloneCases(0);
    setSelectedCase(null);
    setSearchInput('');
    setPanel([]);
  }

  const searchFilter = (searchValue: any) => {
    setSearchInput(searchValue);
    if (searchInput !== '') {
      const filteredData = selectCasesListToDisplay.filter((item) => {
        return Object.values(item)
          .join('')
          .toLowerCase()
          .includes(searchInput.toLowerCase());
      });
      setFilteredResults(filteredData);
    } else {
      setFilteredResults(selectCasesListToDisplay);
    }
  };

  const fetchBenchCases = (panel = selectedPanel) => {
    if (panel) {
      setIsCaseSearching(true);
      axios
        .post(`${process.env.REACT_APP_API_NEST_URL}/judge-search/panel-cases`, {
          panel_case: panel,
          pageNo: casesPageNo.toString(),
          pageSize: constants.pageSize,
        },
          {
            headers: {
              Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
            },
          })
        .then((response) => {
          if (response.data?.data && response.data?.totalPages) {
            setIsCaseSearching(false);
            if (response.data?.data.length === 0) {
              toast.info('No cases found for the selected Statute.');
              setShowCase([]);
              setCasesTotalPages(1);
              setCasesTotalRecords(0);
            } else {
              setShowCase(response.data?.data);
              setCasesTotalPages(response.data?.totalPages);
              setCasesTotalRecords(response.data?.totalRecords);
            }
          }
        })
        .catch((error) => {
          setIsCaseSearching(false);
          if (error.response.status === 401) {
            logout();
          }
          toast.error('Failed to fetch panel cases.');
        });
    }
  }

  /**
   * Function to handle page change
   * @param {Event} event
   * @param {number} value
   */
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    searchParams.set('casesPageNo', value.toString());
    navigate({ search: searchParams.toString() });
    setCasesPageNo(value);
  };

  const openJudgment = (item: any) => {
    navigate('/cases/judgment?judgmentId=' + item?._id?.$oid);
  };


  // const handleClose = () => {
  //   setSelectedCase(null);
  //   setOpenJudgmentDialog(false);
  // };

  useEffect(() => {
    if (judge && viewCasesAs === 'alone') {
      setSearchInput('');
      setSelectCasesListToDisplay([]);
      fetchStandAloneCases();
    }
    if (selectedPanel && viewCasesAs === 'bench') {
      setSearchInput('');
      setSelectCasesListToDisplay([]);
      fetchBenchCases();
    }
  }, [judge, casesPageNo, viewCasesAs, selectedPanel]);

  useEffect(() => {
    setSelectCasesListToDisplay(show_case);
    if (viewCasesAs === 'alone') {
      setSelectCasesListToDisplay(aloneCases);
    }
    if (searchInput.length > 0) {
      setSelectCasesListToDisplay(filteredResults);
    }
  }, [show_case, viewCasesAs, searchInput, judge, casesPageNo, aloneCases]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const casesPageNoParam = !isAuthorised() ? 1 : Number.parseInt(searchParams.get('casesPageNo') || '1');
    setCasesPageNo(casesPageNoParam);
    const hierarchyParam = searchParams.get('hierarchy') || '';
    if (hierarchyParam !== '' && hierarchyParam !== hierarchy) {
      handleChangeHeirarchy(hierarchyParam);
    }
    if (panel.length > 0 || aloneCases.length > 0) {
      const viewAsParam = searchParams.get('viewAs') || 'bench';
      setViewCasesAs(viewAsParam);
    }
  }, [location.search, panel, aloneCases]);

  return (

    <div className={!isAuthorised() ? 'flex flex-col gap-6 w-full h-[calc(100vh-5.5rem)] relative' : 'flex flex-col gap-6 w-full h-[calc(100vh-3.5rem)] relative'}>
      <div className='flex flex-col gap-5 bg-white p-5 rounded-xl shadow-xl'>
        <div className='flex flex-row justify-between items-center'>
          <p className='text-2xl font-bold'>Judge Filter</p>
          <SaveSearchButton />
        </div>
        <div className='flex flex-row w-100 gap-4'>
          <FormControl fullWidth size='small'>
            <InputLabel id='select-judge-hierarchy'>
              Select Hierarchy
            </InputLabel>
            <Select
              labelId='select-judge-hierarchy'
              MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
              id='demo-simple-select-helper'
              variant='outlined'
              value={hierarchy}
              label='Select Hierarchy'
              onChange={(e: any) => {
                searchParams.delete('judge');
                searchParams.delete('court');
                searchParams.set('hierarchy', e.target.value.toString());
                navigate({ search: searchParams.toString() });
                handleChangeHeirarchy(e.target.value);
              }}
            >
              {hierarchies.map((heir: any, index) => (
                <MenuItem value={heir.name} key={`${heir}${index}`}>
                  {heir.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size='small'>
            <InputLabel id='select-court-label'>{hierarchy !== '' && Courts.length === 0 ? 'No courts found' : 'Select Court'}</InputLabel>
            <Select
              labelId='select-court-label'
              MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
              id='select-court'
              variant='outlined'
              value={Court}
              disabled={Courts.length === 0}
              label='Select Court'
              onChange={(e: any) => {
                searchParams.delete('judge');
                searchParams.set('court', e.target.value.toString());
                navigate({ search: searchParams.toString() });
                handleChangeCourt(e.target.value);
              }}
            >
              {Courts.map((court: any, index) => (
                <MenuItem value={court.name} key={`${court}${index}`}>
                  {court.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size='small'>
            <InputLabel id='select-judge-label'>{Court !== '' && judges.length === 0 ? 'No judges found' : 'Select Judge'}</InputLabel>
            <Select
              labelId='select-judge-label'
              MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
              id='select-judge'
              variant='outlined'
              value={judge}
              label='Select Judge'
              disabled={judges.length === 0}
              onChange={(e: any) => {
                searchParams.set('judge', e.target.value.toString());
                navigate({ search: searchParams.toString() });
                handleChangeJudge(e.target.value);
              }}
            >
              {judges.map((judge: any, index) => (
                <MenuItem value={judge.name} key={`${judge}${index}`}>
                  {judge.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>
      {(hierarchy === '' || Court === '' || judge === '') ? (
        <div className='bg-white p-5 rounded-xl shadow-xl'>
          <div>
            <p className='text-sm'>Please select Judge to view Panel/Single Judge cases.</p>
          </div>
        </div>
      ) : (
        <div className='flex flex-row gap-4'>
          {viewCasesAs === 'bench' && (
            <div className='h-100 grow bg-white p-5 rounded-xl shadow-xl'>
              <div className='flex flex-row justify-between items-center pb-0'>
                <p className='text-2xl font-bold'>Panels</p>
                <FormControl
                  sx={{
                    minWidth: 230,
                  }}
                  size='small'
                >
                  <InputLabel id='select-judge-label'>View</InputLabel>
                  <Select
                    labelId='select-judge-label'
                    id='select-judge'
                    variant='outlined'
                    value={viewCasesAs}
                    label='View'
                    onChange={(e: any) => {
                      setShowCase([]);
                      setFilteredResults([]);
                      setViewCasesAs(e.target.value);
                      setCasesPageNo(1);
                      setSelectedPanel(null);
                      searchParams.set('viewAs', e.target.value.toString());
                      searchParams.delete('panelIds');
                      searchParams.set('casesPageNo', '1');
                      navigate({ search: searchParams.toString() });
                    }}
                  >
                    <MenuItem value={'alone'} key={'alone'}>
                      Stand Alone cases ({totalStandaloneCases})
                    </MenuItem>
                    <MenuItem value={'bench'} key={'bench'}>
                      Bench Cases ({Object.keys(panel).length})
                    </MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div className='flex flex-col justify-between mt-5'>
                <div className={!isAuthorised() ? 'h-[calc(100vh-21.4rem)] overflow-auto border' : 'h-[calc(100vh-19.6rem)] overflow-auto border'}>
                  <Table aria-label='simple table' size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell colSpan={2}>
                          <span className='font-bold text-md'>Panel Judges</span>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.keys(panel).length > 0 ? (
                        Object.keys(panel).map((item: any, index) => (
                          <TableRow key={index} className='border-b-0 show-actions-on-hover' hover={true} selected={areStringArraysEqual(selectedPanel, panel[item])}>
                            <TableCell className='max-w-[20rem]'>
                              {item || 'N/A'}
                            </TableCell>
                            <TableCell align='right'>
                              <Tooltip title={(!isAuthorised() && index > 2) ? constants.tooltips.upgradePlan : ''} >
                                <span>
                                  <Button
                                    endIcon={areStringArraysEqual(selectedPanel, panel[item]) ? (<ArrowBackIosNewIcon fontSize='small' />) : (<ArrowForwardIosIcon fontSize='small' />)}
                                    disabled={!isAuthorised() && index > 2}
                                    className={areStringArraysEqual(selectedPanel, panel[item]) ? '' : 'action'}
                                    variant='contained'
                                    size='small'
                                    color='primary'
                                    onClick={
                                      (e) => {
                                        if (areStringArraysEqual(selectedPanel, panel[item])) {
                                          setFilteredResults([]);
                                          setShowCase([]);
                                          setSelectedPanel(null);
                                          setCasesPageNo(1);
                                          searchParams.delete('panelIds');
                                          searchParams.set('casesPageNo', '1');
                                          navigate({ search: searchParams.toString() });
                                        } else {
                                          searchParams.set('panelIds', panel[item].join(',').toString());
                                          searchParams.set('casesPageNo', '1');
                                          navigate({ search: searchParams.toString() });
                                          setSelectedPanel(panel[item]);
                                          fetchBenchCases(panel[item]);
                                        }
                                      }
                                    }
                                  >
                                    {
                                      (areStringArraysEqual(selectedPanel, panel[item])) ? 'Hide Cases' : 'View Cases'
                                    }
                                  </Button>
                                </span>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        )))
                        : (
                          <TableRow><TableCell colSpan={5} align='center'>No Panels found!</TableCell></TableRow>
                        )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          {(show_case.length > 0 || viewCasesAs === 'alone') && (
            <div className={viewCasesAs === 'alone' ? 'h-100 w-full bg-white p-5 rounded-xl shadow-xl' : 'h-100 w-[55rem] overflow-auto bg-white p-5 rounded-xl shadow-xl'}>
              <div className='flex flex-row justify-between items-center pb-0'>
                <p className='text-2xl font-bold'>Cases</p>
                <div className='flex flex-row justify-start gap-2 items-center'>
                  {/* <Tooltip title={!isAuthorised() ? constants.tooltips.upgradePlan : ''} placement={'left'}>
                    <span>
                      <TextField
                        disabled={!isAuthorised()}
                        className='w-[30rem]'
                        size='small'
                        type='text'
                        placeholder='Search Here'
                        value={searchInput}
                        onChange={(e) => searchFilter(e.target.value)}
                      />
                    </span>
                  </Tooltip> */}
                  {viewCasesAs === 'alone' && (
                    <FormControl
                      sx={{
                        minWidth: 230,
                      }}
                      size='small'
                    >
                      <InputLabel id='select-judge-label'>View</InputLabel>
                      <Select
                        labelId='select-judge-label'
                        id='select-judge'
                        variant='outlined'
                        value={viewCasesAs}
                        label='View'
                        onChange={(e: any) => {
                          setShowCase([]);
                          setFilteredResults([]);
                          setViewCasesAs(e.target.value);
                          setCasesPageNo(1);
                          setSelectedPanel(null);
                          searchParams.set('casesPageNo', '1');
                          searchParams.set('viewAs', e.target.value.toString());
                          searchParams.delete('panelIds');
                          navigate({ search: searchParams.toString() });
                        }}
                      >
                        <MenuItem value={'alone'}>
                          Stand Alone cases ({totalStandaloneCases})
                        </MenuItem>
                        <MenuItem value={'bench'}>
                          Bench Cases ({Object.keys(panel).length})
                        </MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </div>
              </div>
              <div className='flex flex-col justify-between mt-5'>
                <div className={!isAuthorised() ? 'h-[calc(100vh-24.4rem)] overflow-auto border' : 'h-[calc(100vh-22.5rem)] overflow-auto border'}>
                  <Table aria-label='simple table' size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <span className='font-bold text-md'>Party Name</span>
                        </TableCell>
                        <TableCell>
                          <span className='font-bold text-md'>Appeal</span>
                        </TableCell>
                        <TableCell>
                          <span className='font-bold text-md'>Result</span>
                        </TableCell>
                        <TableCell colSpan={2}>
                          <span className='font-bold text-md'>
                            Judgment Date
                          </span>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectCasesListToDisplay.length > 0 ?
                        selectCasesListToDisplay.map((item: any, index) => (
                          <TableRow key={item._id?.$oid} className='border-b-0 show-actions-on-hover' hover={true}>
                            <TableCell>
                              <Tooltip title={(item.appeallant || 'N/A') + ' vs ' + (item.respondant || 'N/A')} placement='bottom-start'>
                                <p className='max-w-[28rem] truncate'>
                                  {(item.appeallant || 'N/A') + ' vs ' + (item.respondant || 'N/A')}
                                </p>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Tooltip placement='bottom-start' title={item.appeal}>
                                <p className='w-[19rem] truncate'>
                                  {item.appeal || 'N/A'}
                                </p>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Tooltip title={item.result}>
                                <p className='w-[10rem] truncate'>
                                  {item.result || 'N/A'}
                                </p>
                              </Tooltip>
                            </TableCell>
                            <TableCell className='min-w-[8rem]'>
                              {item.judgment_date || 'N/A'}
                            </TableCell>
                            <TableCell align='right'>
                              <Tooltip title={(!isAuthorised() && index > 2) ? constants.tooltips.upgradePlan : ''} placement='bottom-start'>
                                <span>
                                  <Button
                                    disabled={!isAuthorised() && index > 2}
                                    className='w-[5.6rem] action'
                                    variant='contained'
                                    size='small'
                                    color='primary'
                                    onClick={(e) => {
                                      openJudgment(item);
                                    }}
                                  >
                                    View Detail
                                  </Button>
                                </span>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={4} align={'center'}>
                              No Cases found!
                            </TableCell>
                          </TableRow>
                        )}
                    </TableBody>
                  </Table>
                </div>
                <div className={searchInput === '' ? 'flex flex-row mt-4 justify-between' : 'flex flex-row mt-4 justify-end'}>
                  {searchInput === '' && (
                    <div>
                      <RecordCount pageNo={casesPageNo} pageSize={Number.parseInt(constants.pageSize)} totalRecords={show_case.length > 0 ? casesTotalRecords : totalStandaloneCases} />
                    </div>
                  )}
                  <Stack spacing={2} className='flex flex-row justify-end'>
                    <Tooltip title={(!isAuthorised()) ? constants.tooltips.upgradePlan : ''} placement='left'>
                      <span>
                        <Pagination
                          disabled={!isAuthorised()}
                          page={casesPageNo}
                          count={viewCasesAs === 'bench' ? totalCasesPages : totalStandaloneCasesPages}
                          siblingCount={0}
                          boundaryCount={1}
                          onChange={handlePageChange}
                          shape={'rounded'}
                        />
                      </span>
                    </Tooltip>
                  </Stack>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <ContainerLoader isLoading={isPanelLoading || isCaseSearching || isCourtsLoading || isJudgeLoading || isHierarchiesLoading} />
    </div>
  );
};

export default Judges;
