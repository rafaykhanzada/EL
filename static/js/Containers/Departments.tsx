import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { toast } from 'react-toastify';

import 'react-datepicker/dist/react-datepicker.css';

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Button as Button,
  Stack,
  Pagination,
  Divider,
  Tooltip,
  IconButton,
  Dialog,
  DialogContent
} from '@mui/material';

import Loader from '../Components/extras/Loader';
import PDFViewer from '../Components/PDFViewer';

import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { Download, RemoveRedEye, Save } from '@mui/icons-material';
import { constants } from '../app.constants';
import { logout } from '../services/auth.service';
import { useNavigate, useLocation } from 'react-router-dom';
import SaveSelectionDialog from './SaveSelectionDialog';
import SaveSearchButton from './SaveSearchButton';
import { decryptString, isAuthorised } from '../app.utils';
import { downloadFile } from '../common/helper';
import DocumentViewer from '../Components/DocumentViewer';
import DepartmentDocumentPreviewDialog from '../Components/DepartmentDocumentPreviewDialog';
import ContainerLoader from '../Components/extras/ContainerLoader';


const Departments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [searchDepartment, setSearchDepartment] = useState('');
  const [searchSubDepartment, setSearchSubDepartment] = useState('');
  const [subDepartments, setSubDepartments] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [searchYear, setSearchYear] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [searchId, setSearchId] = useState('');
  const [isAdvanceSearchOn, setIsAdvanceSearch] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedFileId, setSelectedFileId] = useState('');
  const [selectedDepartTitle, setSelectedDepartTitle] = useState('');

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(
        `${process.env.REACT_APP_API_NEST_URL}/department-search/department-parents`,
        {
          headers: {
            Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
          },
        }
      )
      .then((res) => {
        setDepartments(res.data);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        toast.error("Failed to fetch departments.");
      });
  }, []);

  const handleDepartmentChange = (event: any) => {
    searchParams.set('departmentId', event.target.value.toString());
    navigate({ search: searchParams.toString() });
    setSearchDepartment(event.target.value);
  };

  useEffect(() => {
    if (searchDepartment) {
      setSearchSubDepartment('');
      setSearchId('');
      setSearchTitle('');
      viewAllFiles();
    }
  }, [searchDepartment]);

  const viewAllFiles = () => {
    setIsLoading(true);
    axios
      .get(
        `${process.env.REACT_APP_API_NEST_URL}/department-search/department-by-id/${searchDepartment}`,
        {
          headers: {
            Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
          },
        }
      )
      .then((res) => {
        setSearchResult(res.data.files);
        handleSelectDepartment(searchDepartment);
        setIsLoading(false);
      })
      .catch((error) => {
        setSearchResult([]);
        setIsLoading(false);
        if (error.response.status === 401) {
          logout();
        }
        toast.error("Failed to fetch department details.");
      });
  };

  const handleSelectDepartment = (department: any) => {
    setIsLoading(true);
    axios
      .get(
        `${process.env.REACT_APP_API_NEST_URL}/department-search/department-children/${department}`,
        {
          headers: {
            Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
          },
        }
      )
      .then((res) => {
        setSubDepartments(res.data);
        setIsLoading(false);
      })
      .catch((error) => {
        setSubDepartments([]);
        setIsLoading(false);
        if (error.response.status === 401) {
          logout();
        }
        toast.error("Failed to fetch subdepartment of the selected department.");
      });
  };

  const handleSelectSubDepartment = (event: any) => {
    searchParams.set('subDepartmentId', event.target.value.toString());
    navigate({ search: searchParams.toString() });
    setSearchSubDepartment(event.target.value);
  };

  const fetchDepartmentFiles = (selectedParentDepartment = searchDepartment, selectedChildDepartment = searchSubDepartment, selectedYear = searchYear, selectedNo = searchId, selectedTitle = searchTitle, currentPage = pageNo) => {
    setIsLoading(true);
    axios
      .post(`${process.env.REACT_APP_API_NEST_URL}/department-search/search-by-year-for-files`,
        {
          parentDepartment: selectedParentDepartment,
          childDepartment: selectedChildDepartment || '',
          year: Number.parseInt(selectedYear) || 0,
          no: selectedNo || '',
          title: selectedTitle || '',
          pageNo: currentPage,
          pageSize: Number.parseInt(constants.pageSize),
        },
        {
          headers: {
            Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
          },
        }
      )
      .then((res: any) => {
        if (res.data?.data?.length === 0) {
          setSearchResult([]);
          setTotalPages(1);
          setPageNo(1);
        }
        else if (res.data?.data?.length > 0 && res.data?.totalRecords && res.data?.totalPages) {
          setSearchResult(res.data.data);
          setTotalPages(res.data.totalPages);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        setSearchResult([]);
        setIsLoading(false);
        if (error.response.status === 401) {
          logout();
        }
        toast.error("Failed to fetch files for the selcted filter.");
      });
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
    searchParams.set('pageNo', value.toString());
    navigate({ search: searchParams.toString() });
    setPageNo(value);
  };

  const previewDepartmentDoc = async (item: any) => {
    setSelectedFile(item.wordFile);
    setSelectedFileId(item.fileId);
    setSelectedDepartTitle(item.title);
    setOpen(true);
  }

  const handleCloseDocPreview = () => {
    setOpen(false);
    setSelectedFile('');
    setSelectedFileId('');
    setSelectedDepartTitle('');
  };

  useEffect(() => {
    if (departments.length > 0) {
      const searchParams = new URLSearchParams(location.search);
      const advancedSearch = searchParams.get('advancedSearch');
      if (advancedSearch && advancedSearch === 'true') {
        setIsAdvanceSearch(true);
        const departmentIdParam = (searchParams.get('departmentId') || '').toString();
        setSearchDepartment(departmentIdParam);
        const subDepartmentIdParam = (searchParams.get('subDepartmentId') || '').toString();
        if (subDepartments.length > 0) {
          setSearchSubDepartment(subDepartmentIdParam);
        }
        const searchIdParam = (searchParams.get('searchId') || '').toString();
        const selectedTitle = (searchParams.get('title') || '').toString();
        const selectedYear = (searchParams.get('year') || '').toString();
        const currentPage = Number.parseInt(searchParams.get('pageNo') || '1');
        setSearchId(searchIdParam);
        setSearchTitle(selectedTitle);
        setSearchYear(selectedYear);
        setPageNo(Number.parseInt(searchParams.get('pageNo') || '1'));
        if (departmentIdParam !== '' && (subDepartmentIdParam !== '' || searchIdParam !== '' || selectedTitle !== '' || selectedYear !== '')) {
          fetchDepartmentFiles(departmentIdParam, subDepartmentIdParam, selectedYear, searchIdParam, selectedTitle, currentPage);
        }
      } else {
        setIsAdvanceSearch(false);
        const departmentIdParam = (searchParams.get('departmentId') || '').toString();
        setSearchDepartment(departmentIdParam);
        const subDepartmentIdParam = (searchParams.get('subDepartmentId') || '').toString();
        if (subDepartments.length > 0) {
          setSearchSubDepartment(subDepartmentIdParam);
        }
        const selectedYear = (searchParams.get('year') || '').toString();
        const currentPage = !isAuthorised() ? 1 : Number.parseInt(searchParams.get('pageNo') || '1');
        setSearchYear(selectedYear);
        setPageNo(currentPage);
        if (departmentIdParam !== '' && (subDepartmentIdParam !== '' || selectedYear !== '')) {
          fetchDepartmentFiles(departmentIdParam, subDepartmentIdParam, selectedYear, undefined, undefined, currentPage);
        }
      }
    }
  }, [location.search, departments, subDepartments]);

  return (
    <>
      <div className={!isAuthorised() ? 'flex flex-col gap-6 w-full h-[calc(100vh-5.5rem)] relative' : 'flex flex-col gap-6 w-full h-[calc(100vh-3.5rem)] relative'}>
        <div className='flex flex-col gap-5 bg-white p-5 rounded-xl shadow-xl'>
          <div className='flex flex-row justify-between items-center'>
            <p className='text-2xl font-bold'>Departments</p>
            <SaveSearchButton />
          </div>
          <div>
            {departments ? (
              <>
                <div className='flex flex-row w-full gap-4'>
                  <FormControl fullWidth size='small'>
                    <InputLabel id='select-department-hierarchy'>
                      Select Department
                    </InputLabel>
                    <Select
                      labelId='select-department-hierarchy'
                      MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                      id='select-depart'
                      variant='outlined'
                      value={searchDepartment}
                      label='Select Department'
                      onChange={handleDepartmentChange}
                    >
                      {departments.map((department: any) => (
                        <MenuItem value={department.id} key={department.id}>
                          {department.DeptName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <div className='min-w-[11rem] max-w-[12rem]'>
                    <Button
                      variant='contained'
                      color='primary'
                      className='w-full h-full'
                      onClick={() => {
                        searchParams.set('advancedSearch', '' + (!isAdvanceSearchOn));
                        navigate({ search: searchParams.toString() });
                        setIsAdvanceSearch(!isAdvanceSearchOn);
                      }}
                    >
                      {isAdvanceSearchOn ? 'Basic Search' : 'Advanced Search'}
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
          {isAdvanceSearchOn && (
            <>
              <div className='mt-2 mb-1'>
                <Divider />
              </div>
              <div className='flex flex-col gap-3 bg-white'>
                <p className='text-2xl font-bold'>Advanced Search</p>
                <div className='flex flex-row w-full gap-4'>
                  <FormControl fullWidth>
                    <TextField
                      size='small'
                      id='No'
                      placeholder='Enter No'
                      variant='outlined'
                      value={searchId}
                      type={'Text'}
                      onChange={(e) => {
                        setSearchId(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormControl fullWidth>
                    <TextField
                      size='small'
                      id='No'
                      placeholder='Enter Title'
                      variant='outlined'
                      value={searchTitle}
                      type={'Text'}
                      onChange={(e) => {
                        setSearchTitle(e.target.value);
                      }}
                    />
                  </FormControl>
                  <Button
                    variant='contained'
                    color='primary'
                    className='w-[9rem]'
                    onClick={() => {
                      searchParams.set('searchId', searchId.toString());
                      searchParams.set('title', searchTitle.toString());
                      navigate({ search: searchParams.toString() });
                      fetchDepartmentFiles();
                    }}
                  >
                    Search
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
        <>
          {(searchDepartment === '') ? (
            <div className="bg-white p-5 rounded-xl shadow-xl">
              <div>
                <p className="text-sm">Please select Department to view related files.</p>
              </div>
            </div>
          ) : (
            <div className='flex flex-col bg-white p-5 rounded-xl shadow-xl gap-3'>
              <div className='flex flex-row justify-between items-center'>
                <p className='text-2xl font-bold'>Files</p>
                <div className='flex flex-row gap-4'>
                  <FormControl className='w-[20rem]' size='small'>
                    <InputLabel id='select-sub-department-hierarchy'>
                      Select Sub-Department
                    </InputLabel>
                    <Select
                      labelId='select-sub-department-hierarchy'
                      MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                      id='select-sub-depart'
                      variant='outlined'
                      value={searchSubDepartment}
                      disabled={!searchDepartment}
                      label='Select Sub-Department'
                      onChange={handleSelectSubDepartment}
                    >
                      {subDepartments.map((department: any) => (
                        <MenuItem value={department.id} key={department.id}>
                          {department.DeptName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl className='w-[7rem]'>
                    <TextField
                      size='small'
                      id='year'
                      label='Year'
                      variant='outlined'
                      type='number'
                      value={searchYear}
                      onChange={(e) => {
                        searchParams.set('year', e.target.value.toString());
                        navigate({ search: searchParams.toString() });
                        setSearchYear(e.target.value);
                      }}
                    />
                  </FormControl>
                </div>
              </div>
              <div className={
                isAdvanceSearchOn ? 'flex flex-col gap-2 w-full justify-between' : 'flex flex-col gap-2 w-full justify-between'}>
                <div
                  className={
                    isAdvanceSearchOn
                      ? (!isAuthorised() ? 'h-[calc(100vh-32.9rem)] overflow-auto border' : 'h-[calc(100vh-31.1rem)] overflow-auto border')
                      : (!isAuthorised() ? 'h-[calc(100vh-24.4rem)] overflow-auto border' : 'h-[calc(100vh-22.5rem)] overflow-auto border')
                  }
                >
                  <Table aria-label='simple table' size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <span className='font-bold text-md'>No</span>
                        </TableCell>
                        <TableCell>
                          <span className='font-bold text-md'>Date</span>
                        </TableCell>
                        <TableCell colSpan={2}>
                          <span className='font-bold text-md'>Title</span>
                        </TableCell>
                        {/* <TableCell colSpan={2}>
                          <span className='font-bold text-md'>File</span>
                        </TableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {searchResult.length > 0 ? (
                        searchResult.map((item: any, index) => (
                          <TableRow key={index} className='border-b-0 show-actions-on-hover' hover={true}>
                            <TableCell className='w-[3rem]'>{item.No || 'N/A'}</TableCell>
                            <TableCell className='w-[5rem]'>{item.DDate || 'N/A'}</TableCell>
                            <TableCell className='max-w-[34rem]'>
                              <Tooltip title={item.title || '-'} placement="bottom-start">
                                <p className='truncate'>
                                  {item.title || 'N/A'}
                                </p>
                              </Tooltip>
                            </TableCell>
                            {/* <TableCell className='flex flex-row max-w-[23rem]'>
                              <Tooltip title={item.wordFile || '-'} placement="bottom-start">
                                <p className='truncate'>
                                  {item.wordFile || 'N/A'}
                                </p>
                              </Tooltip>
                            </TableCell> */}
                            <TableCell align='right'>
                                <Tooltip title={(!isAuthorised() && index > 2) ? constants.tooltips.upgradePlan : ''} placement='bottom-start'>
                                  <span>
                                    <IconButton
                                      onClick={() => {
                                        previewDepartmentDoc(item)
                                      }}
                                      disabled={!isAuthorised() && index > 2}
                                      size="small"
                                      className='action'
                                      color='primary'>
                                      <RemoveRedEye fontSize='small' />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align={'center'}>
                            No records found!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className='flex flex-row mt-4 justify-end w-full'>
                  <Stack spacing={2}>
                    <Tooltip title={(!isAuthorised()) ? constants.tooltips.upgradePlan : ''} placement='left'>
                      <span>
                        <Pagination
                          disabled={!isAuthorised()}
                          page={pageNo}
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
          )}
        </>
        <ContainerLoader isLoading={isLoading} />
        {selectedFile !== '' && selectedFileId !== '' && selectedDepartTitle !== '' && (
          <DepartmentDocumentPreviewDialog open={open} onClose={handleCloseDocPreview} selectedDepartTitle={selectedDepartTitle} selectedFile={selectedFile} selectedFileId={selectedFileId} />
        )}
      </div>
    </>
  );
};

export default Departments;
