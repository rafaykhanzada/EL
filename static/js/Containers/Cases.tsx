// React imports
import React, { useEffect, useState } from 'react';

// Material imports
import {
  Autocomplete,
  Button as Button,
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

// Third party imports
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Component imports
import Loader from '../Components/extras/Loader';
import RecordCount from '../Components/RecordsCount';

// Container imports
import Judgment from './Judgment';
import SaveSearchButton from './SaveSearchButton';

// Constants imports
import { constants } from '../app.constants';

// Util imports
import { decryptString, isAuthorised } from '../app.utils';

// Service imports
import { getStatutesByTitleorYear } from '../services/statutes.service';
import { logout } from '../services/auth.service';
import TabList from '../Components/TabList';
import ContainerLoader from '../Components/extras/ContainerLoader';

const Cases = () => {
  // initializing hooks
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Declaring and initializing states
  const [heirarchies, setHeirarchies] = useState([]);
  const [hierarchy, setHeirarchy] = useState<any>('');
  const [Courts, setCourts] = useState([]);
  const [court, setCourt] = useState<any>('');
  const [judges, setJudges] = useState([]);
  const [judge, setJudge] = useState<any>('');
  const [selectedStatute, setSelectedStatute] = useState<any>('');
  const [cases, setCases] = useState([]);
  const [statues, setStatutes] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchCitationYear, setSearchCitationYear] = useState('');
  const [checkCitationJournal, setCheckCitationJournal] = useState([]);
  const [searchCitationJournal, setSearchCitationJournal] = useState('');
  const [searchCitationJournalCat, setSearchCitationJournalCat] = useState('');
  const [searchCitationPageNo, setSearchCitationPageNo] = useState('');
  const [isCaseSearching, setIsCaseSearching] = useState(false);
  const [isHierarchiesLoading, setIsHierarchiesLoading] = useState(true);
  const [isCourtsLoading, setIsCourtsLoading] = useState(false);
  const [isJudgeLoading, setIsJudgeLoading] = useState(false);
  const [isStatutesLoading, setIsStatutesLoading] = useState(false);
  const [isJournalSearching, setIsJournalSearching] = useState(true);
  const [journals, setJournals] = useState([]);
  const [selectedTab, setSelectedTab] = useState('searchByCitation');

  const pageSize = constants.pageSize;
  const tabs = [
    { id: 'searchByCitation', label: 'Search by Citation' },
    { id: 'searchByJudgeStatute', label: 'Search by Judge/Statute' },
  ];

  // Fetch hierarchies on component init
  useEffect(() => {
    if (!searchParams.get('selectedTab')) {
      searchParams.set('selectedTab', 'searchByCitation');
      navigate({ search: searchParams.toString() });
    }
    fetchHierarchies();
    fetchJournals();
  }, []);

  // Handle search params from the history to populate the selected fields
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const casesPageNoParam = !isAuthorised() ? 1 : Number.parseInt(searchParams.get('casesPageNo') || '1');
    const selectedTabParam = searchParams.get('selectedTab');
    if (selectedTabParam) {
      setSelectedTab(selectedTabParam);
      switch (selectedTabParam) {
        case 'searchByCitation': {
          navigate({ search: searchParams.toString() });
          const citationYear = (searchParams.get('citationYear') || '').toString();
          const citationJournal = (searchParams.get('citationJournal') || '').toString();
          const citationPageNo = (searchParams.get('citationPageNo') || '').toString();
          const citationJournalCat = (searchParams.get('citationJournalCat') || '').toString();
          setSearchCitationYear(citationYear);
          setSearchCitationJournal(citationJournal);
          setSearchCitationPageNo(citationPageNo);
          setSearchCitationJournalCat(citationJournalCat);
          if (citationYear !== '' || citationJournal !== '' || citationPageNo !== '') {
            setPageNo(casesPageNoParam);
            searchCasesByCitation(citationYear, citationJournal, citationPageNo, casesPageNoParam, citationJournalCat);
          }
          break;
        }
        case 'searchByJudgeStatute': {
          const judgeParam = searchParams.get('judge') || '';
          const statuteIdParam = searchParams.get('statuteId') || '';
          const statuteTitleParam = searchParams.get('statuteTitle') || '';
          const hierarchyParam = searchParams.get('hierarchy') || '';
          setPageNo(casesPageNoParam);
          if (judgeParam !== '' && hierarchyParam !== '') {
              handleChangeHierarchy(hierarchyParam);
          }
          if (statuteIdParam !== '') {
            handleStatuteTileChange(statuteTitleParam);
          }
          searchCases(judgeParam, statuteIdParam, casesPageNoParam);
          break;
        }
      }
    }
  }, [location.search]);

  useEffect(() => {
    setFilteredResults(cases);
  }, [cases])

  // Handle change in hierarchy
  const handleChangeHierarchy = (value: any) => {
    setHeirarchy(value);
    fetchCourts(value);
  };

  // Handle change in court
  const handleChangeCourt = (value: any) => {
    setCourt(value);
    fetchJudges(value);
  };

  // Handle change in judge
  const handleChangeJudge = (event: any) => {
    setJudge(event);
  };

  // Handler for statute title change
  const handleStatuteTileChange = (value: any) => {
    if (value !== '') {
      setIsStatutesLoading(true);
      getStatutesByTitleorYear(value)
        .then((res: any) => {
          setIsStatutesLoading(false);
          if (res.length > 0 && searchParams.get('statuteId')) {
            const statuteParam = searchParams.get('statuteId')?.toString();
            setSelectedStatute(statuteParam);
          }
          setStatutes(res);
        })
        .catch((err: any) => {
          setIsStatutesLoading(false);
        });
    } else if (value === '' && judge === '') {
      resetCases();
      setStatutes([]);
    }
  };

  const handleTabChange = (tabId: string) => {
    resetCases();
    setPageNo(1);
    searchParams.set('casesPageNo', '1');
    searchParams.set('selectedTab', tabId);
    navigate({ search: searchParams.toString() });
    setSelectedTab(tabId);
  };

  // Function to reset cases selection
  const resetCases = () => {
    setCases([]);
    setTotalPages(1);
    setTotalRecords(0);
  }

  // Open judgment dialog
  const openJudgment = (item: any) => {
    navigate('/cases/judgment?judgmentId=' + item?._id?.$oid);
  };

  // Handler for filtering cases on search
  const searchFilter = (searchValue: any) => {
    setSearchInput(searchValue);
    if (searchInput !== '') {
      const filteredData = cases.filter((item) => {
        return Object.values(item)
          .join('')
          .toLowerCase()
          .includes(searchInput.toLowerCase());
      });
      setFilteredResults(filteredData);
    }
  };

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
    setPageNo(value);
  };

  const fetchHierarchies = async () => {
    setIsHierarchiesLoading(true);
    await axios
      .get(
        `${process.env.REACT_APP_API_NEST_URL}/court-search/fetch-hierarchies`, {
        headers: {
          Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
        },
      })
      .then((response: any) => {
        setHeirarchies(response.data);
        setIsHierarchiesLoading(false);
      })
      .catch((error) => {
        setIsHierarchiesLoading(false);
        // logout; if unauthorised
        if (error.response.status === 401) {
          logout();
        }
        toast.error('Failed to fetch court hierarchies.');
      });
  }

  const fetchCourts = async (hier = hierarchy) => {
    setIsCourtsLoading(true);
    await axios.get(
      `${process.env.REACT_APP_API_NEST_URL}/court-search/courts-by-hier/${hier}`,
      {
        headers: {
          Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
        },
      }
    )
      .then((response) => {
        setCourts(response.data);
        // if search params has selected Court id call handleChangeCourt
        if (response.data.length > 0 && searchParams.get('court')) {
          const courtParam = searchParams.get('court')?.toString();
          handleChangeCourt(courtParam);
        }
        setIsCourtsLoading(false);
      })
      .catch((error) => {
        setIsCourtsLoading(false);
        // logout; if unauthorised
        if (error.response.status === 401) {
          logout();
        }
        toast.error('Failed to fetch courts for the Selected hierarchy.');
      });
  }

  const fetchJudges = async (selectedCourt = court) => {
    setIsJudgeLoading(true);
    await axios.post(
      `${process.env.REACT_APP_API_NEST_URL}/judge-search/judges-by-courts/`, {
      court: selectedCourt,
    },
      {
        headers: {
          Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
        },
      }
    )
      .then((response) => {
        setIsJudgeLoading(false);
        setJudges(response.data);
        // if search params has selected judge id call setJudge
        if (response.data.length > 0 && searchParams.get('judge')) {
          const judgeParam = searchParams.get('judge')?.toString();
          setJudge(judgeParam);
        }
      })
      .catch((error) => {
        setIsJudgeLoading(false);
        // logout; if unauthorised
        if (error.response.status === 401) {
          logout();
        }
        toast.error('Failed to fetch judges of the selected court.');
      });
  }

  /**
   * Function for searching cases for the selected judge or statute
   * @param selectedJudge
   * @param selectedStatuteId
   * @param casesPageNo
   */
  const searchCases = (selectedJudge = judge, selectedStatuteId = selectedStatute, casesPageNo = pageNo) => {
    if (selectedJudge !== '' || selectedStatuteId !== '') {
      let params: any = {
        pageNo: casesPageNo,
        pageSize,
      };
      if (selectedJudge) {
        params.judgeId = selectedJudge;
      }
      if (selectedStatuteId) {
        params.statuteId = selectedStatuteId;
      }
      setIsCaseSearching(true);
      axios
        .get(`${process.env.REACT_APP_API_NEST_URL}/case-search/advance-search`, {
          params,
          headers: {
            Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
          },
        })
        .then((response: any) => {
          setIsCaseSearching(false);
          if (response.data) {
            if (response.data?.data.length === 0) {
              toast.info('No cases found for the selected Statute/Judge.');
              resetCases();
            } else {
              setCases(response.data?.data);
              setTotalPages(response.data?.totalPages);
              setTotalRecords(response.data?.totalRecords);
            }
          }
        })
        .catch((error) => {
          setIsCaseSearching(false);
          if (error.response.status === 401) {
            logout();
          }
          toast.error('Failed to fetch cases.');
        });
    }
  };

  /**
   * Function for searching cases for the selected citation
   * @param citationYear
   * @param citationJournel
   * @param citationPageNo
   * @param casesPageNo
   */
  const searchCasesByCitation = (citationYear = searchCitationYear, citationJournel = searchCitationJournal, citationPageNo = searchCitationPageNo, casesPageNo = pageNo, citationJournalCat = searchCitationJournalCat) => {
    if (citationYear !== '' || citationJournel !== '' || citationPageNo !== '') {
      setIsCaseSearching(true);
      axios
        .get(
          `${process.env.REACT_APP_API_NEST_URL}/citation-search/case-by-citation`,
          {
            params: {
              citationYear,
              citationJournel,
              citationPageNo,
              citationCategory: citationJournalCat,
              pageNo: casesPageNo,
              pageSize,
            },
            headers: {
              Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
            },
          }
        )
        .then((response: any) => {
          setIsCaseSearching(false);
          if (response.data) {
            if (response.data?.totalPages !== 0 && response.data?.totalPages < casesPageNo) {
              searchParams.set('casesPageNo', '1');
              navigate({ search: searchParams.toString() });
              setPageNo(1);
            } else {
              if (response.data?.data.length === 0) {
                toast.info('No cases found for this citation.');
                resetCases();
              } else {
                setCases(response.data?.data);
                setTotalPages(response.data?.totalPages);
                setTotalRecords(response.data?.totalRecords);
              }
            }
          }
        })
        .catch((error) => {
          setIsCaseSearching(false);
          // logout; if unauthorised
          if (error.response.status === 401) {
            logout();
          }
          toast.error('Failed to fetch cases.');
        });
    }
  };

  const fetchJournals = () => {
    setIsJournalSearching(true);
    axios
      .get(
        `${process.env.REACT_APP_API_NEST_URL}/citation-search/journals`,
        {
          headers: {
            Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
          },
        }
      )
      .then((response: any) => {
        setIsJournalSearching(false);
        setJournals(response.data?.data);
        // HOT-Fix
        // if (searchParams.get('citationJournalCat') !== '' && searchParams.get('citationJournal') !== '') {
        //   const selectedJournal: any = response.data?.data.find((journal: any) => journal.name === searchParams.get('citationJournal')?.toString());
        //   if (selectedJournal) {
        //     setCheckCitationJournal(selectedJournal.categories || []);
        //     setCheckCitationJournal([]);
        //   }
        // }
      })
      .catch((error) => {
        setIsJournalSearching(false);
        // logout; if unauthorised
        if (error.response.status === 401) {
          logout();
        }
        toast.error('Failed to fetch cases.');
      });
  }

  return (
    <div className='flex flex-col w-full h-full gap-6 relative' key={location.pathname + location.search}>
      <TabList tabs={tabs} activeTab={selectedTab} onTabChange={handleTabChange} />
      {selectedTab === 'searchByCitation' && (
        <div className='flex flex-col gap-5 bg-white p-5 rounded-xl shadow-xl'>
          <div className='flex flex-row justify-between items-center'>
            <div className='flex flex-row justify-start items-center gap-2'>
              <span className='text-2xl font-bold'>
                Search by Citation
              </span>
            </div>
            <SaveSearchButton />
          </div>
          <div className='flex flex-col w-100 gap-4'>
            <div className='flex flex-row w-100 gap-4'>
              <FormControl fullWidth>
                <TextField size='small'
                  type='number'
                  placeholder='Year'
                  value={searchCitationYear}
                  onChange={(e) => setSearchCitationYear(e.target.value)}
                />
              </FormControl>
              <FormControl fullWidth size='small'>
                <InputLabel id='select-journal'>
                  Journal
                </InputLabel>
                <Select
                  labelId='select-journal'
                  MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                  variant='outlined'
                  defaultValue={''}
                  value={journals?.find((journal: any) => journal.name === searchCitationJournal) || ''}
                  label='Journal'
                  onChange={(e: any) => {
                    setSearchCitationJournal((e.target.value).name);
                    // HOT-FIX
                    // setSearchCitationJournalCat('');
                    // setCheckCitationJournal((e.target.value).categories);
                    // setCheckCitationJournal([])
                  }}
                >
                  {journals.map((item: any, index) => (
                    <MenuItem value={item} key={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* {checkCitationJournal.length > 0 && (
                <FormControl fullWidth size='small'>
                  <InputLabel id='select-journal-cat'>
                    Journal Category
                  </InputLabel>
                  <Select
                    labelId='select-journal-cat'
                    MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                    variant='outlined'
                    defaultValue={''}
                    value={checkCitationJournal.find((cat: any) => cat === searchCitationJournalCat) || ''}
                    label='Journal Category'
                    onChange={(e: any) =>
                      setSearchCitationJournalCat(e.target.value)
                    }
                  >
                    {checkCitationJournal.map((item: any, index) => (
                      <MenuItem value={item} key={index}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )} */}
              <FormControl fullWidth>
                <TextField size='small'
                  type='text'
                  placeholder='Page No.'
                  value={searchCitationPageNo}
                  onChange={(e) => setSearchCitationPageNo(e.target.value)}
                />
              </FormControl>
              <div className='min-w-[9rem] max-w-[10rem]'>
                <Button
                  className='w-full h-full'
                  variant='contained'
                  color='primary'
                  onClick={() => {
                    searchParams.set('citationYear', searchCitationYear.toString());
                    searchParams.set('citationJournal', searchCitationJournal.toString());
                    // if (checkCitationJournal.length > 0 && searchCitationJournalCat !== '') {
                    //   searchParams.set('citationJournalCat', searchCitationJournalCat.toString());
                    // }
                    searchParams.set('citationPageNo', searchCitationPageNo.toString());
                    navigate({ search: searchParams.toString() });
                  }}
                >
                  Search Cases
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedTab === 'searchByJudgeStatute' && (
        <div className='flex flex-col gap-5 bg-white p-5 rounded-xl shadow-xl'>
          <div className='flex flex-row justify-between items-center'>
            <div className='flex flex-row justify-start items-center gap-2'>
              <span className='text-2xl font-bold'>
                Search by Judges/Statutes
              </span>
            </div>
            <SaveSearchButton />
          </div>
          <div className='flex flex-col w-100 gap-4'>
            <>
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
                      setCourts([]);
                      setJudges([]);
                      searchParams.delete('court');
                      setCourt('');
                      searchParams.delete('judge');
                      setJudge('');
                      searchParams.set('hierarchy', e.target.value.toString());
                      searchParams.set('casesPageNo', '1');
                      setPageNo(1);
                      navigate({ search: searchParams.toString() });
                      resetCases();
                      handleChangeHierarchy(e.target.value);
                    }}
                  >
                    {heirarchies.map((heir: any, index) => (
                      <MenuItem value={heir.name} key={`${heir}${index}`}>
                        {heir.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size='small' disabled={!Courts}>
                  <InputLabel id='select-court-label'>
                    {hierarchy !== '' && Courts.length === 0 ? 'No courts found' : 'Select Court'}
                  </InputLabel>
                  <Select
                    labelId='select-court-label'
                    MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                    id='select-court'
                    variant='outlined'
                    defaultValue={''}
                    value={court}
                    disabled={Courts.length === 0}
                    label='Select Court'
                    onChange={(e: any) => {
                      setJudges([]);
                      searchParams.delete('judge');
                      setJudge('');
                      searchParams.set('court', e.target.value.toString());
                      searchParams.set('casesPageNo', '1');
                      setPageNo(1);
                      navigate({ search: searchParams.toString() });
                      resetCases();
                      handleChangeCourt(e.target.value);
                    }}
                  >
                    {Courts.map((item: any, index) => (
                      <MenuItem value={item.name} key={`${item}${index}`}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size='small'>
                  <InputLabel id='select-judge-label'>
                    {Object.keys(court).length !== 0 && judges.length === 0 ? 'No judges found' : 'Select Judge'}
                  </InputLabel>
                  <Select
                    labelId='select-judge-label'
                    MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                    id='select-judge'
                    variant='outlined'
                    defaultValue={''}
                    value={judge}
                    label='Select Judge'
                    disabled={judges.length === 0}
                    onChange={(e: any) => {
                      searchParams.set('casesPageNo', '1');
                      searchParams.set('judge', e.target.value.toString());
                      setPageNo(1);
                      navigate({ search: searchParams.toString() });
                      resetCases();
                      handleChangeJudge(e.target.value);
                    }}
                  >
                    {judges.map((item: any, index) => (
                      <MenuItem value={item.id} key={`${item}${index}`}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div className='flex flex-row w-100 gap-4'>
                <FormControl fullWidth size='small'>
                  <Autocomplete
                    size='small'
                    disablePortal
                    loading={isStatutesLoading}
                    defaultValue={statues.find((statute: any) => statute.id === selectedStatute)}
                    value={selectedStatute ? statues.find((statute: any) => statute.id === selectedStatute) : ''}
                    onChange={(e: any, selectedValue: any) => {
                      if (selectedValue) {
                        searchParams.set('casesPageNo', '1');
                        searchParams.set('statuteId', selectedValue.id.toString());
                        searchParams.set('statuteTitle', selectedValue.title.toString());
                        setPageNo(1);
                        setSelectedStatute(selectedValue.id);
                      } else {
                        searchParams.delete('statuteId');
                        searchParams.delete('statuteTitle');
                        setSelectedStatute('');
                      }
                      navigate({ search: searchParams.toString() });
                    }}
                    options={statues}
                    getOptionLabel={(option: any) => option?.title || ''}
                    renderOption={(props: any, option: any) => {
                      return (
                        <li {...props} key={option?.id}>
                          {option?.title}
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        onChange={(e: any) => {
                          handleStatuteTileChange(e.target.value);
                        }}
                        key={params.id}
                        label='Statutes'
                      />
                    )}
                  />
                </FormControl>
                <Tooltip title={!judge && !selectedStatute ? 'Select judge/statute to search cases' : ''}>
                  <span>
                    <Button
                      disabled={!judge && !selectedStatute}
                      className='w-[9rem] h-full'
                      variant='contained'
                      color='primary'
                      onClick={() => {
                        setPageNo(1);
                        searchParams.set('casesPageNo', '1');
                        navigate({ search: searchParams.toString() });
                        searchCases();
                      }}
                    >
                      Search Cases
                    </Button>
                  </span>
                </Tooltip>
              </div>
            </>
          </div>
        </div>
      )}
      <div className='flex flex-col gap-4 bg-white p-5 rounded-xl shadow-xl'>
        <div className='flex flex-row justify-between items-center pb-0'>
          <p className='text-2xl font-bold'>Cases</p>
          {/* <Tooltip title={!isAuthorised() ? constants.tooltips.upgradePlan : ''} placement={'left'}>
            <span>
              <TextField
                sx={{
                  minWidth: 400,
                }}
                disabled={!isAuthorised()}
                size='small'
                type='text'
                placeholder='Search here'
                onChange={(e) => searchFilter(e.target.value)}
              />
            </span>
          </Tooltip> */}
        </div>
        <div className='flex flex-col justify-between h-100'>
          <div
            className={
              !isAuthorised() ? `overflow-auto border ${(selectedTab === 'searchByCitation' && 'h-[calc(100vh-30.4rem)]')} ${(selectedTab === 'searchByJudgeStatute' && 'h-[calc(100vh-33.9rem)]')}`
                : `overflow-auto border ${(selectedTab === 'searchByCitation' && 'h-[calc(100vh-28.5rem)]')} ${(selectedTab === 'searchByJudgeStatute' && 'h-[calc(100vh-32rem)]')}`
            }
          >
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
                    <span className='font-bold text-md'>Judgment Date</span>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cases.length > 0 ? (
                  cases.map((item: any, index) => (
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
                      <TableCell className='min-w-[10rem]'>
                        {item.result || 'N/A'}
                      </TableCell>
                      <TableCell >
                        {item.judgment_date || 'N/A'}
                      </TableCell>
                      <TableCell align='right'>
                        <Tooltip title={(!isAuthorised() && index > 2) ? constants.tooltips.upgradePlan : ''} placement='bottom-start'>
                          <span>
                            <Button
                              disabled={!isAuthorised() && index > 2}
                              className='w-[5.7rem] action'
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
                  ))) : (
                  <TableRow>
                    <TableCell colSpan={4} align={'center'}>
                      No Cases found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className={searchInput === '' ? 'flex flex-row justify-between items-center' : 'flex flex-row justify-end items-center'}>
            {searchInput === '' && (
              <div className='mt-4'>
                <RecordCount pageNo={pageNo} pageSize={Number.parseInt(pageSize)} totalRecords={totalRecords} />
              </div>
            )}
            <Stack spacing={2} className='flex flex-row mt-4 justify-end'>
              <Tooltip title={(!isAuthorised()) ? constants.tooltips.upgradePlan : ''} placement='left'>
                <span>
                  <Pagination
                    page={pageNo}
                    disabled={!isAuthorised()}
                    count={totalPages}
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
      <ContainerLoader isLoading={isCaseSearching || isJudgeLoading || isCourtsLoading || isHierarchiesLoading || isJournalSearching} />
    </div>
  );
};

export default Cases;
