import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
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
  Button as Button,
  TextField,
  Tooltip,
  IconButton,
  Dialog,
  DialogContent,
} from '@mui/material';
import { getStatuteFile, getStatutes } from '../services/statutes.service';
import { toast } from 'react-toastify';
import Loader from '../Components/extras/Loader';
import { constants } from '../app.constants';
import { Download, Description, Bookmark, BookmarkAddOutlined } from '@mui/icons-material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PDFViewer from '../Components/PDFViewer';
import { downloadFile } from '../common/helper';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import axios from 'axios';
import { logout } from '../services/auth.service';
import RecordCount from '../Components/RecordsCount';
import SaveSearchButton from './SaveSearchButton';
import { decryptString, isAuthorised } from '../app.utils';
import StatuteDocumentPreviewDialog from '../Components/StatuteDocumentPreviewDialog';
import ContainerLoader from '../Components/extras/ContainerLoader';

type TBookmark = {
  id: string,
  typeName?: string,
  targetId?: string,
  userId?: string,
  header?: string,
  detail?: string,
  createdOn?: string,
  createdBy?: string
};

const Statutes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [isStatuteLoading, setIsStatutesLoading] = useState(true);
  const [isCaseSearching, setIsCaseSearching] = useState(false);
  const [selectedType, setSelectedType] = useState<any>('all');
  const [statutes, setStatutes] = useState([]);
  const [statutePageNo, setStatutePageNo] = useState(1);
  const [statutuesCount, setStatutuesCount] = useState(0);
  const [statuteTotalPages, setStatuteTotalPages] = useState(1);
  const [casesTotalPages, setCasesTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [cases, setCases] = useState([]);
  const [pdfData, setPdfData] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [casesPageNo, setCasesPageNo] = useState(1);
  const [casesTotalRecords, setCasesTotalRecords] = useState(0);
  const [filteredResults, setFilteredResults] = React.useState([]);
  const [searchInput, setSearchInput] = React.useState('');
  const [selectedStatute, setSelectedStatute] = useState('');
  const [selectedStatuteTitle, setSelectedStatuteTitle] = useState('');
  const [selectedStatuteAct, setSelectedStatuteAct] = useState('');
  const pageSize = constants.pageSize;

  useEffect(() => {
    if (!searchParams.get('selectedType')) {
      searchParams.set('selectedType', 'all');
      navigate({ search: searchParams.toString() });
    }
  }, []);

  const fetchStatutesList = (statutesSearchTerm = searchTerm, selectedStatuteType = selectedType, currentStatutePage = statutePageNo) => {
    setIsStatutesLoading(true);
    getStatutes(statutesSearchTerm, currentStatutePage, selectedStatuteType, pageSize).then((res: any) => {
      if (res.data && res.totalRecords && res.totalPages) {
        if (res.totalPages < currentStatutePage) {
          searchParams.set('statutePageNo', '1');
          navigate({ search: searchParams.toString() });
          setStatutePageNo(1);
        }
        if (res.data?.length === 0) {
          setStatutuesCount(0);
          setStatutes([]);
          setStatuteTotalPages(1);
        } else {
          setStatutuesCount(res.totalRecords);
          setStatutes(res.data);
          setStatuteTotalPages(res.totalPages);
        }
      } else {
        toast.info("No statute found");
        setStatutuesCount(0);
        setStatutes([]);
        setStatuteTotalPages(1);
      }
      setIsStatutesLoading(false);
    }).catch((err) => {
      setIsStatutesLoading(false);
      setStatutuesCount(0);
      setStatutes([]);
      setStatuteTotalPages(1);
      toast.error('Failed to fetch statutes.');
    });
  }

  const fetchStatuteCases = async (statuteId: any, currentCasesPage = casesPageNo) => {
    setSelectedStatute(statuteId);
    setIsCaseSearching(true);
    axios
      .get(`${process.env.REACT_APP_API_NEST_URL}/case-search/advance-search`, {
        params: {
          pageNo: currentCasesPage,
          pageSize,
          statuteId,
        },
        headers: {
          Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
        },
      })
      .then((response: any) => {
        setIsCaseSearching(false);
        if (response.data) {
          if (response.data?.totalPages < casesPageNo) {
            searchParams.set('casesPageNo', '1');
            navigate({ search: searchParams.toString() });
            setCasesPageNo(1);
          }
          if (response.data?.data.length === 0) {
            toast.info('No cases found for the selected Statute.');
            resetCasesSection();
          } else {
            setCases(response.data?.data);
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
        toast.error('Failed to fetch cases of the selected statute.');
      });
  }

  const previewStatuteDoc = async (statuteId: any, statuteTitle: any, statuteAct: any) => {
    if (statuteId !== selectedStatute) {
      setCases([]);
    }
    setSelectedStatute(statuteId);
    setSelectedStatuteTitle(statuteTitle);
    setSelectedStatuteAct(statuteAct);
    setOpen(true);
  }

  /**
   * Function to handle statute page change
   * @param {Event} event
   * @param {number} value
   */
  const handleStatutePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    resetCasesSection();
    searchParams.set('statutePageNo', value.toString());
    navigate({ search: searchParams.toString() });
    setStatutePageNo(value);
  };

  /**
   * Function to handle cases page change
   * @param {Event} event
   * @param {number} value
   */
  const handleCasesPageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    searchParams.set('casesPageNo', value.toString());
    navigate({ search: searchParams.toString() });
    setCasesPageNo(value);
  };

  const handleClose = () => {
    setOpen(false);
    if (cases.length === 0) {
      setSelectedStatute('');
    }
  };

  const openJudgment = (item: any) => {
    navigate('/cases/judgment?judgmentId=' + item?._id?.$oid);
  };

  const searchFilter = (searchValue: any) => {
    setSearchInput(searchValue);
    if (searchValue !== '') {
      const filteredData = cases.filter((item) => {
        return Object.values(item)
          .join('')
          .toLowerCase()
          .includes(searchValue.toLowerCase());
      });
      setFilteredResults(filteredData);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const casesPageNoParam = !isAuthorised() ? 1 : Number.parseInt(searchParams.get('casesPageNo') || '1');
    const statutePageNoParam = !isAuthorised() ? 1 : Number.parseInt(searchParams.get('statutePageNo') || '1');
    const selectedTypeParam = searchParams.get('selectedType') || '';
    const searchTermParam = searchParams.get('searchTermStatutes') || '';
    const searchInputParam = searchParams.get('searchTermCases') || '';
    const statuteIdParam = searchParams.get('selectedStatuteId') || '';
    setSelectedStatute(statuteIdParam);
    setSearchTerm(searchTermParam);
    setSelectedType(selectedTypeParam);
    setStatutePageNo(statutePageNoParam);
    setCasesPageNo(casesPageNoParam);
    setSearchInput(searchInputParam);
    if (selectedTypeParam !== '') {
      fetchStatutesList(searchTermParam, selectedTypeParam, statutePageNoParam);
      if (statuteIdParam !== '') {
        fetchStatuteCases(statuteIdParam, casesPageNoParam);
      }
    }
  }, [location.search]);

  const resetCasesSection = () => {
    setCases([]);
    setSearchInput('');
    setCasesPageNo(1);
    setCasesTotalPages(1);
    setCasesTotalRecords(0);
    setSelectedStatute('');
    searchParams.delete('selectedStatuteId');
    searchParams.delete('casesPageNo');
    navigate({ search: searchParams.toString() });
  }

  return (
    <div className='flex flex-col w-full h-full gap-6 relative'>
      <div className='flex flex-col gap-3 bg-white p-5 rounded-xl shadow-xl'>
        <div className='flex flex-row justify-between items-center'>
          <p className='text-2xl font-bold'>Statutes Search</p>
          <SaveSearchButton />
        </div>
        <form className='flex flex-row gap-4'
          onSubmit={(e: any) => {
            e.preventDefault();
            searchParams.set('searchTermStatutes', searchTerm.toString());
            navigate({ search: searchParams.toString() });
            resetCasesSection();
          }}>
          <FormControl fullWidth>
            <TextField
              size='small'
              id='titleoryear'
              label='Enter Title or Year'
              variant='outlined'
              type={'Text'}
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
            />
          </FormControl>
          <Button
            type='submit'
            variant='contained'
            color='primary'
            className='w-[8rem]'
            onClick={(e: any) => {
              e.preventDefault();
              searchParams.set('searchTermStatutes', searchTerm.toString());
              navigate({ search: searchParams.toString() });
              resetCasesSection();
            }}
          >
            Search
          </Button>
        </form>
      </div>
      <div className='flex flex-row gap-4 w-full'>
        <div className={cases?.length > 0 && selectedStatute !== '' ? 'flex flex-col gap-3 bg-white p-5 rounded-xl shadow-xl w-[49%]' : 'flex flex-col gap-3 bg-white p-5 rounded-xl shadow-xl w-full'}>
          <div className='flex flex-row justify-between'>
            <p className='text-2xl font-bold'>Filtered Statutes</p>
            <FormControl className='w-[12rem]' size='small'>
              <InputLabel id='select-type'>Select Type</InputLabel>
              <Select
                labelId='select-type'
                id='demo-simple-select-helper'
                variant='outlined'
                value={selectedType}
                label='Select Type'
                onChange={(e: any) => {
                  setStatutePageNo(1);
                  searchParams.set('statutePageNo', '1');
                  searchParams.set('selectedType', e.target.value.toString());
                  navigate({ search: searchParams.toString() });
                  setSelectedType(e.target.value);
                }}
              >
                <MenuItem value={'all'}>All</MenuItem>
                <MenuItem value={'primary'}>Primary</MenuItem>
                <MenuItem value={'secondary'}>Secondary</MenuItem>
                <MenuItem value={'bills'}>Bills</MenuItem>
                <MenuItem value={'amendment act'}>Amendments</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className='flex flex-col gap-2 mt-1'>
            <div className={!isAuthorised() ? 'h-[calc(100vh-24.4rem)] overflow-auto border' : 'h-[calc(100vh-22.5rem)] overflow-auto border'}>
              <Table aria-label='simple table' size='small' className='overflow-auto'>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <span className='font-bold text-md'>Statute Title</span>
                    </TableCell>
                    <TableCell colSpan={2}>
                      <span className='font-bold text-md'>Dated</span>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statutes.length > 0 ? (statutes.map((statute: any, index) => (
                    <TableRow key={statute.id} className='border-b-0 show-actions-on-hover' hover={true} selected={statute.id === selectedStatute}>
                      <TableCell className='max-w-[15rem]' sx={{ verticalAlign: 'top' }}>
                        <Tooltip title={statute.title}>
                          <p className='mt-1 truncate'>{statute.title}</p>
                        </Tooltip>
                      </TableCell>
                      <TableCell className='min-w-[10rem]' sx={{ verticalAlign: 'top' }}>
                        <p className='mt-1'>
                          {statute.date?.includes('Promulgation Date:')
                            ? statute.date?.split(':')[1]
                            : statute.date || 'N/A'}
                        </p>
                      </TableCell>
                      <TableCell align='right' sx={{ verticalAlign: 'top' }}>
                        <div className={statute.id === selectedStatute ? 'flex flex-row gap-2 mt-1 justify-end' : 'flex flex-row gap-2 mt-1 action justify-end'}>
                          <Tooltip title={(!isAuthorised() && index > 2) ? constants.tooltips.upgradePlan : 'Preview Statute Document'} placement='bottom'>
                            <span>
                              <IconButton
                                onClick={() => previewStatuteDoc(statute.id, statute.title, statute.act)}
                                disabled={!isAuthorised() && index > 2 || (selectedStatute !== '' && statute.id !== selectedStatute)}
                                size='small'
                                color='primary'>
                                <Description fontSize='small' />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title={(!isAuthorised() && index > 2) ? constants.tooltips.upgradePlan : ''} placement='bottom-start'>
                            <span>
                              <Button
                                endIcon={statute.id === selectedStatute && cases?.length > 0 ? (<ArrowBackIosNewIcon fontSize='small' />) : (<ArrowForwardIosIcon fontSize='small' />)}
                                disabled={!isAuthorised() && index > 2}
                                variant='contained'
                                size='small'
                                color='primary'
                                className='w-[7.3rem]'
                                onClick={(e) => {
                                  if (statute.id === selectedStatute && cases?.length > 0) {
                                    setCases([]);
                                    setSelectedStatute('');
                                    searchParams.delete('selectedStatuteId');
                                    searchParams.delete('casesPageNo');
                                    navigate({ search: searchParams.toString() });
                                  } else {
                                    setCases([]);
                                    searchParams.set('selectedStatuteId', statute.id.toString());
                                    searchParams.set('casesPageNo', '1');
                                    navigate({ search: searchParams.toString() });
                                  }
                                }}
                              >
                                {(statute.id === selectedStatute && cases?.length > 0) ? 'Hide Cases' : 'View Cases'}
                              </Button>
                            </span>
                          </Tooltip>
                        </div>
                      </TableCell>

                    </TableRow>
                  ))) : (<TableRow><TableCell colSpan={3} align={'center'}>No statutes found.</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </div>
            <div className='flex flex-row mt-4 justify-between items-center'>
              <div className='mt-1'>
                <RecordCount pageNo={statutePageNo} pageSize={Number.parseInt(pageSize)} totalRecords={statutuesCount} />
              </div>
              <Stack spacing={2} >
                <Tooltip title={(!isAuthorised()) ? constants.tooltips.upgradePlan : ''} placement='left'>
                  <span className='mt-1'>
                    <Pagination
                      disabled={!isAuthorised()}
                      page={statutePageNo}
                      count={statuteTotalPages}
                      siblingCount={0}
                      boundaryCount={1}
                      onChange={handleStatutePageChange}
                      shape={'rounded'}
                    />
                  </span>
                </Tooltip>
              </Stack>

            </div>
          </div>
        </div>
        {cases.length > 0 && (
          <div className='flex flex-col gap-4 bg-white p-5 rounded-xl shadow-xl w-1/2'>
            <div className='flex flex-row justify-between items-center pb-0'>
              <p className='text-2xl font-bold'>Cases</p>
              <div className='flex flex-row gap-2'>
                {/* <Tooltip title={!isAuthorised() ? constants.tooltips.upgradePlan : ''} placement={'left'}>
                  <span>
                    <TextField
                      sx={{
                        minWidth: 400,
                      }}
                      disabled={!isAuthorised()}
                      size='small'
                      value={searchInput}
                      type='text'
                      placeholder='Search here'
                      onChange={(e) => {
                        searchFilter(e.target.value)
                      }}
                    />
                  </span>
                </Tooltip> */}
                {/* <FormControl
                  sx={{
                    minWidth: 180,
                  }}
                  size='small'
                >
                  <InputLabel id='select-judge-label'>{sections.length > 0 ? 'Section' : 'No Sections'}</InputLabel>
                  <Select
                    disabled={sections.length === 0}
                    labelId='select-judge-label'
                    id='select-judge'
                    variant='outlined'
                    value={selectedSection}
                    label={sections.length > 0 ? 'Section' : 'No Sections'}
                    onChange={(e: any) => {
                      setSelectedSection(e.target.value);
                    }}
                  >
                    {sections.length > 0 ? (
                      sections.map((section: any) => (
                        <MenuItem value={section.id}>
                          {section.title}
                        </MenuItem>
                      ))
                    ) : (<MenuItem value=''>No Sections</MenuItem>)}
                  </Select>
                </FormControl> */}
              </div>
            </div>
            <div className='flex flex-col justify-between h-100 gap-3'>
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
                        <span className='font-bold text-md'>Judgment Date</span>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      cases.length > 0 ? (
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
                            <TableCell>
                              <Tooltip placement='bottom-start' title={item.result}>
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
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align={'center'}>
                            No Cases found.
                          </TableCell>
                        </TableRow>
                      )
                    }
                  </TableBody>
                </Table>
              </div>
              <div className={searchInput === '' ? 'flex flex-row justify-between items-center' : 'flex flex-row justify-end items-center'}>
                {searchInput === '' && (
                  <div className='mt-4'>
                    <RecordCount pageNo={casesPageNo} pageSize={Number.parseInt(pageSize)} totalRecords={casesTotalRecords} />
                  </div>
                )}
                <Stack spacing={2} className='flex flex-row mt-4 justify-end'>
                  <Tooltip title={(!isAuthorised()) ? constants.tooltips.upgradePlan : ''} placement='left'>
                    <span>
                      <Pagination
                        page={casesPageNo}
                        disabled={!isAuthorised()}
                        count={casesTotalPages}
                        siblingCount={0}
                        boundaryCount={1}
                        onChange={handleCasesPageChange}
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
      <ContainerLoader isLoading={isStatuteLoading || isCaseSearching} />
      {selectedStatute && (selectedStatuteTitle !== '') && (
        <StatuteDocumentPreviewDialog open={open} onClose={handleClose} selectedStatute={selectedStatute} selectedStatuteTitle={selectedStatuteTitle} selectedStatuteAct={selectedStatuteAct || ''} />
      )}
    </div>
  );
};
export default Statutes;
