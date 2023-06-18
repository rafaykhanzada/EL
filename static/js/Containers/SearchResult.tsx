import { Autocomplete, Button, Divider, FormControl, InputLabel, MenuItem, Select, TextField, Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";
import { decryptString, isAuthorised } from "../app.utils";
import SearchResultCard from "../Components/SearchResultCard";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { logout } from "../services/auth.service";
import SaveSearchButton from "./SaveSearchButton";
import { toast } from "react-toastify";
import { RemoveCircleOutline } from "@mui/icons-material";
import ContainerLoader from "../Components/extras/ContainerLoader";

const SearchResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const [searchTerm, setSearchTerm] = useState('');
  const [isCaseSearching, setIsCaseSearching] = useState(true);
  const [isHierarchiesLoading, setIsHierarchiesLoading] = useState(true);
  const [isCourtsLoading, setIsCourtsLoading] = useState(true);
  const [isJudgeLoading, setIsJudgeLoading] = useState(true);

  const [totalRecords, setTotalRecords] = useState(0);
  const [hierarchy, setHeirarchy] = useState('');
  const [court, setCourt] = useState('');
  const [judge, setJudge] = useState('');
  const [pageNo, setPageNo] = useState(1);

  // TODO will remove the comment code later
  const [cases, setCases] = useState<any>([]);

  const [hierarchies, setHierarchies] = useState<any>([]);

  const [courts, setCourts] = useState<any>({});
  const [filteredCourts, setFilteredCourts] = useState<any>({});

  const [judges, setJudges] = useState<any>({});

  const [searchText, setSearchText] = useState('');

  const filterCasesByCaseSummary = (inputArray: any[], includeNull = false): any[] => {
    if (includeNull) {
      return inputArray.filter(caseItem => !(new RegExp(searchTerm as string, "gi").test(caseItem.case_summary)))
    } else {
      return inputArray.filter(caseItem => new RegExp(searchTerm as string, "gi").test(caseItem.case_summary))
    }
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (!isAuthorised()) {
      searchParams.set('casesPageNo', '1');
      navigate({ search: searchParams.toString() });
    }
    const searchTermParam = searchParams.get('searchTerm') || '';
    setSearchTerm(searchTermParam);
    setSearchText(searchTermParam);
    const casesPageNoParam = Number.parseInt(searchParams.get('casesPageNo') || '1');
    setPageNo(casesPageNoParam);
    setSearchTerm(searchTermParam);
    const hierarchyParam = searchParams.get('hierarchy') || '';
    setHeirarchy(hierarchyParam);
    const courtParam = searchParams.get('court') || '';
    setCourt(courtParam);
    const judgeParam = searchParams.get('judge') || '';
    setJudge(judgeParam);
    fetchCasesByFilters(searchTermParam, casesPageNoParam, judgeParam, hierarchyParam, courtParam);
  }, [location.search]);

  useEffect(() => {
    fetchHierarchies();
    const searchTermParam = searchParams.get('searchTerm') || '';
    if (searchTermParam !== '') {
      fetchCourts(searchTermParam);
      fetchJudges(searchTermParam);
    }
  }, []);

  useEffect(() => {
    if (searchTerm !== '') {
      fetchJudges();
    }
  }, [court])

  // Open judgment dialog
  const openJudgment = (item: any) => {
    navigate('/cases/judgment?judgmentId=' + item?._id?.$oid + '&searchTerm=' + searchTerm);
  };

  const fetchCasesByFilters = async (searchTermVal = searchTerm, currentPageNo = pageNo, selectedJudge = judge, selectedHierarchy = hierarchy, selectedCourt = court) => {
    if (searchTermVal !== '') {
      setIsCaseSearching(true);
      await axios
        .post(
          `${process.env.REACT_APP_API_NEST_URL}/case-search/search-by-filter`,
          {
            searchTerm: searchTermVal,
            pageNo: currentPageNo || 1,
            hierarchyFilter: selectedHierarchy,
            judgeFilter: selectedJudge,
            courtFilter: selectedCourt,
            totalCount: '25',
          },
          {
            headers: {
              Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
            },
          }
        )
        .then((res) => {
          if (res.data) {
            setCases(res.data.data)
            setCases(res.data?.data || []);
            setTotalRecords(res.data?.recordsFound || 0);
          }
          setIsCaseSearching(false);
        })
        .catch((err) => {
          setIsCaseSearching(false);
          toast.error('Failed to search cases.');
          if (err.response.status === 401) {
            logout();
          }
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
    setPageNo(value);
  };

  const fetchJudges = async (searchTermParam = searchTerm, selectedCourt = court) => {
    setIsJudgeLoading(true);
    await axios
      .post(
        `${process.env.REACT_APP_API_NEST_URL}/case-search/filter-judges-stats`,
        {
          searchTerm: searchTermParam,
          courtFilter: selectedCourt,
        },
        {
          headers: {
            Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
          },
        }
      )
      .then((res) => {
        setJudges(res.data);
        setIsJudgeLoading(false);
      })
      .catch((err) => {
        setIsJudgeLoading(false);
        toast.error('Failed to fetch judges.');
        if (err.response.status === 401) {
          logout();
        }
      });
  }

  const fetchCourts = async (searchTermParam = searchTerm) => {
    setIsCourtsLoading(true);
    await axios
      .post(
        `${process.env.REACT_APP_API_NEST_URL}/case-search/filter-court-stats`,
        {
          searchTerm: searchTermParam,
        },
        {
          headers: {
            Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
          },
        }
      )
      .then((res) => {
        setCourts(res.data);
        setFilteredCourts(res.data);
        setIsCourtsLoading(false);
      })
      .catch((err) => {
        setIsCourtsLoading(false);
        toast.error('Failed to fetch courts.');
        if (err.response.status === 401) {
          logout();
        }
      });
  }

  const fetchHierarchies = async () => {
    setIsHierarchiesLoading(true);
    await axios
      .get(
        `${process.env.REACT_APP_API_NEST_URL}/court-search/fetch-hierarchies`,
        {
          headers: {
            Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
          },
        }
      )
      .then((res) => {
        if (res.data) {
          setHierarchies(res.data);
        }
        setIsHierarchiesLoading(false);
      })
      .catch((err) => {
        setIsHierarchiesLoading(false);
        toast.error('Failed to fetch hierarchies.');
        if (err.response.status === 401) {
          logout();
        }
      });
  }

  const resetSelection = () => {
    if (hierarchy !== '' || judge !== '' || court !== '') {
      setCases([]);
    }
    setCourt('');
    setJudge('');
    setHeirarchy('');
    setFilteredCourts(courts);
    searchParams.delete('court');
    searchParams.delete('judge');
    searchParams.delete('hierarchy');
    resetPagination()
  }
  const resetPagination = () => {
    setPageNo(1);
    searchParams.set('casesPageNo', '1');
    setCases([])
    navigate({ search: searchParams.toString() });
  }

  const resetSearch = () => {
    setCases([]);
    setSearchTerm('');
    setSearchText('');
    setCourt('');
    setJudge('');
    setHeirarchy('');
    searchParams.delete('court');
    searchParams.delete('judge');
    searchParams.delete('hierarchy');
    searchParams.delete('searchTerm');
    resetPagination()
  }

  return (
    <div className="flex flex-col gap-4 h-full w-full relative">
      <div className="flex flex-col gap-4 bg-white w-full h-full p-5 rounded-xl shadow-xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row gap-1 items-center">
              <p className='text-xl font-bold items-center'>Search Cases</p>
              <Button color="primary" onClick={resetSearch} endIcon={<RemoveCircleOutline />}>
                Clear
              </Button>
            </div>
            <SaveSearchButton />
          </div>
          <form className="flex flex-row gap-3 text-lg font-bold"
            onSubmit={(e: any) => {
              e.preventDefault();
              setCases([]);
              searchParams.set('searchTerm', searchText.toString());
              navigate({ search: searchParams.toString() });
              setSearchTerm(searchText);
            }}>
            <TextField
              value={searchText}
              fullWidth
              size="small"
              type="text"
              placeholder="Enter keywords or phrases. For exact matches, please use quotes."
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Tooltip title={searchText === '' ? 'Select atleast one filter.' : ''}>
              <span>
                <Button
                  type="submit"
                  disabled={searchText === '' || searchText === searchTerm}
                  className='w-[9rem] h-full'
                  variant='contained'
                  color='primary'
                  onClick={(e: any) => {
                    e.preventDefault();
                    setCases([]);
                    searchParams.set('searchTerm', searchText.toString());
                    navigate({ search: searchParams.toString() });
                    setSearchTerm(searchText);
                  }}
                >
                  Search
                </Button>
              </span>
            </Tooltip>
          </form>
          <Divider />
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row gap-1 items-center">
              <p className='text-xl font-bold items-center'>Filters</p>
              <Button color="primary" onClick={resetSelection} endIcon={<RemoveCircleOutline />}>
                Clear
              </Button>
            </div>
          </div>
          <div className="flex flex-row gap-4 justify-center items-center">
            <FormControl fullWidth size='small'>
              <InputLabel id='select-judge-hierarchy'>
                Select Hierarchy
              </InputLabel>
              <Select
                labelId='select-judge-hierarchy'
                MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                id='demo-simple-select-helper'
                variant='outlined'
                disabled={!!(!hierarchy && (court || judge))}
                value={hierarchy}
                label='Select Hierarchy'
                onChange={(e: any) => {
                  searchParams.set('hierarchy', e.target.value.toString());
                  searchParams.delete('judge');
                  searchParams.delete('court');
                  setCourt('');
                  setJudge('');
                  resetPagination();
                  setHeirarchy(e.target.value);
                  // Filter courts based on hirarichy
                  let tempFilteredCourts: any = {};
                  Object.keys(courts).forEach((key: string) => {
                    if (courts[key]['hierarchy'] === e.target.value) {
                      tempFilteredCourts[key] = courts[key];
                    }
                  })
                  setFilteredCourts(tempFilteredCourts);
                }}
              >
                <MenuItem value={''} key={0}>
                  None
                </MenuItem>
                {hierarchies.map((heir: any) => (
                  <MenuItem value={heir.name} key={heir.id}>
                    {heir.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size='small'>
              <Autocomplete
                size='small'
                disablePortal
                disabled={!!(!court && judge)}
                defaultValue={Object.keys(filteredCourts).find((item: any) => item === court) || ''}
                value={filteredCourts ? Object.keys(filteredCourts).find((item: any) => item === court) || '' : ''}
                onChange={(e: any, selectedValue: any) => {
                  if (selectedValue) {
                    searchParams.set('court', selectedValue.toString());
                  } else {
                    searchParams.delete('court');
                    setCourt('');
                  }
                  setJudge('')
                  searchParams.delete('judge');
                  resetPagination()
                }}
                options={Object.keys(filteredCourts)}
                getOptionLabel={(option: any) => option || ''}
                renderOption={(props: any, option: any) => {
                  return (
                    <li {...props} key={option}>
                      {option}
                      {/* ({filteredCourts[option].count}) */}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Court"
                    inputProps={{
                      ...params.inputProps,
                    }}
                  />
                )}
              />
            </FormControl>
            <FormControl fullWidth size='small'>
              <Autocomplete
                size='small'
                disablePortal
                disabled={!!(hierarchy && !court)}
                defaultValue={Object.keys(judges).find((item: any) => item === judge)}
                value={judge ? Object.keys(judges).find((item: any) => item === judge) || '' : ''}
                onChange={(e: any, selectedValue: any) => {
                  if (selectedValue) {
                    searchParams.set('judge', selectedValue.toString());
                  } else {
                    searchParams.delete('judge');
                    setJudge('');
                  }
                  resetPagination()
                }}
                options={Object.keys(judges)}
                getOptionLabel={(option: any) => option || ''}
                renderOption={(props: any, option: any) => {
                  return (
                    <li {...props} key={option}>
                      {option}
                      {/* ({judges[option].count}) */}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Judge"
                    inputProps={{
                      ...params.inputProps,
                    }}
                  />
                )}
              />
            </FormControl>
          </div>
        </div>
      </div>
      {searchTerm !== '' ? (
        <>
          <div className="flex flex-row gap-4 ">
            <div className="flex flex-col w-1/3 rounded-xl shadow-xl bg-white">
              <div className="flex flex-row gap-3 p-3">
                <p className="font-bold bg-[#6c5dd3] text-white py-1 px-3 rounded-xl">Summary Matches</p>
              </div>
              <Divider />
              <div className={!isAuthorised() ? "flex flex-col p-5 gap-4 h-[calc(100vh-29rem)] overflow-auto w-full" : "flex flex-col p-5 gap-4 h-[calc(100vh-27rem)] overflow-auto w-full"}>
                {filterCasesByCaseSummary(cases).length > 0 ? filterCasesByCaseSummary(cases).map((item: any, index) => (
                  <div onClick={() => {
                    if (!isAuthorised() && index > 2) {
                      toast.info('Please upgrade your plan to view the details of this case.');
                    } else {
                      openJudgment(item);
                    }
                  }}
                  >
                    <SearchResultCard caseDetail={item} isCaseSummaryNull={false} index={index + 1} />
                  </div>
                )) : (<p>No cases found.</p>)}
              </div>
              <Divider />
              <div className="flex flex-row p-3">
                <p className="text-sm">Search matched in summary of <b>{filterCasesByCaseSummary(cases).length}</b> case(s). </p>
              </div>
            </div>
            <div className="flex flex-col w-2/3 rounded-xl shadow-xl bg-white">
              <div className="flex flex-row gap-3 p-3">
                <p className="font-bold bg-[#6c5dd3] text-white py-1 px-3 rounded-xl">Judgments</p>
              </div>
              <Divider />
              <div className={!isAuthorised() ? "flex flex-col p-5 gap-4 h-[calc(100vh-29rem)] overflow-auto" : "flex flex-col p-5 gap-4 h-[calc(100vh-27rem)] overflow-auto"}>
                {filterCasesByCaseSummary(cases, true).length > 0 ? filterCasesByCaseSummary(cases, true).map((item: any, index) => (
                  <div onClick={() => {
                    if (!isAuthorised() && index > 2) {
                      toast.info('Please upgrade your plan to view the details of this case.');
                    } else {
                      openJudgment(item);
                    }
                  }}
                  >
                    <SearchResultCard caseDetail={item} isCaseSummaryNull={true} index={filterCasesByCaseSummary(cases).length + index + 1} />
                  </div>
                )) : (<p>No cases found.</p>)}
              </div>
              <Divider />
              <div className="flex flex-row p-3">
                <p className="text-sm">Search matched in judgments of <b>{filterCasesByCaseSummary(cases, true).length}</b> case(s). </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className='bg-white p-5 rounded-xl shadow-xl'>
          <div>
            <p className='text-sm'>Please enter search term to view matched cases.</p>
          </div>
        </div>
      )}

      <ContainerLoader isLoading={isCaseSearching || isCourtsLoading || isHierarchiesLoading || isJudgeLoading} text="Please wait while your search is being processed." />
    </div>
  );
}
export default SearchResult;