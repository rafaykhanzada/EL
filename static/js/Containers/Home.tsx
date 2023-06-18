import axios from "axios";
import React, { useEffect, useState } from "react";

import {
  Button,
  IconButton,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import Loader from "../Components/extras/Loader";
import { Delete, RemoveRedEye } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "../services/auth.service";
import { constants } from "../app.constants";
import { toast } from "react-toastify";
import { decryptString, isAuthorised } from "../app.utils";
import StatuteDocumentPreviewDialog from "../Components/StatuteDocumentPreviewDialog";
import DepartmentDocumentPreviewDialog from "../Components/DepartmentDocumentPreviewDialog";
import TabList from "../Components/TabList";
import { BookmarkTypes } from "../app.enums";
import ContainerLoader from "../Components/extras/ContainerLoader";
import ForbiddenPrompt from "./ForbiddenPrompt";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const [isLoading, setIsLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [bookmarkPageNo, setBookmarkPageNo] = useState(1);
  const [historyPageNo, setHistoryPageNo] = useState(1);
  const [totalHistoryPages, setTotalHistoryPages] = useState(1);
  const [totalBookmarkPages, setTotalBookmarkPages] = useState(1);
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [bookmarkSearchInput, setBookmarkSearchInput] = useState("");
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [historySearchInput, setHistorySearchInput] = useState("");
  const [selectedTab, setSelectedTab] = useState('bookmark');
  const [selectedStatute, setSelectedStatute] = useState('');
  const [selectedStatuteTitle, setSelectedStatuteTitle] = useState('');
  const [selectedStatuteAct, setSelectedStatuteAct] = useState('');
  const [statuteOpen, setStatuteOpen] = useState(false);
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [selectedDepartmentFile, setSelectedDepartmentFile] = useState('');
  const [selectedDepartmentFileId, setSelectedDepartmentFileId] = useState('');
  const [selectedDepartTitle, setSelectedDepartTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openForbiddenPrompt, setOpenForbiddenPrompt] = useState(false);

  const tabs = [
    { id: 'bookmark', label: 'Bookmarks' },
    { id: 'history', label: 'History' },
  ];

  const handleTabChange = (tabId: string) => {
    searchParams.set('selectedTab', tabId);
    navigate({ search: searchParams.toString() });
    setSelectedTab(tabId);
  };

  /**
   * Function to handle bookmark page change
   * @param {Event} event
   * @param {number} value
   */
  const handleBookmarkPageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setBookmarkPageNo(value);
  };

  /**
   * Function to handle history page change
   * @param {Event} event
   * @param {number} value
   */
  const handleHistoryPageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setHistoryPageNo(value);
  };

  const searchBookmarkFilter = (searchValue: any) => {
    setBookmarkSearchInput(searchValue);
    if (bookmarkSearchInput !== "") {
      const filteredData = bookmarks.filter((item) => {
        return Object.values(item)
          .join("")
          .toLowerCase()
          .includes(bookmarkSearchInput.toLowerCase());
      });
      setFilteredBookmarks(filteredData);
    }
  };

  const searchHistoryFilter = (searchValue: any) => {
    setHistorySearchInput(searchValue);
    if (historySearchInput !== "") {
      const filteredData = history.filter((item) => {
        return Object.values(item)
          .join("")
          .toLowerCase()
          .includes(historySearchInput.toLowerCase());
      });
      setFilteredHistory(filteredData);
    }
  };

  const getBookmarks = () => {
    setIsLoading(true);
    axios
      .get(
        `${process.env.REACT_APP_API_NEST_URL}/bookmark`,
        {
          params: {
            pageNo: bookmarkPageNo,
            pageSize: constants.pageSize,
            userId: decryptString(localStorage.getItem('userId'))
          },
          headers: {
            Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
          },
        }
      )
      .then((response: any) => {
        setIsLoading(false);
        if (response.data) {
          setBookmarks(response.data?.data);
          setTotalBookmarkPages(response.data?.totalPages);
        }
      })
      .catch((error) => {
        setIsLoading(false);
        if (error.response.status === 401) {
          logout();
        }
        if (error.response.status === 403) {
          localStorage.setItem('outOfOrganization', 'true');
          setOpenForbiddenPrompt(true);
        }
      });
  };

  const getHistory = () => {
    setIsLoading(true);
    axios
      .get(
        `${process.env.REACT_APP_API_NEST_URL}/search-history`,
        {
          params: {
            pageNo: historyPageNo,
            pageSize: constants.pageSize,
            userId: decryptString(localStorage.getItem('userId'))
          },
          headers: {
            Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
          },
        }
      )
      .then((response: any) => {
        setIsLoading(false);
        if (response.data) {
          setHistory(response.data?.data);
          setTotalHistoryPages(response.data?.totalPages);
        }
      })
      .catch((error) => {
        setIsLoading(false);
        if (error.response.status === 401) {
          logout();
        }
      });
  };

  const handleClose = () => {
    setStatuteOpen(false);
    setDepartmentOpen(false);
    setSelectedStatute('');
    setSelectedStatuteTitle('');
    setSelectedDepartTitle('');
    setSelectedStatuteAct('');
    getBookmarks();
  };

  const openJudgment = (caseId: any) => {
    navigate('/cases/judgment?judgmentId=' + caseId);
  };

  const openStatuteDoc = (item: any) => {
    setSelectedStatute(item.targetId);
    setSelectedStatuteTitle(item.header);
    setSelectedStatuteAct(item.detail);
    setStatuteOpen(true);
  }

  const openDepartmentFile = (item: any) => {
    setSelectedDepartmentFileId(item.targetId);
    setSelectedDepartmentFile(item.detail);
    setSelectedDepartTitle(item.header);
    setDepartmentOpen(true);
  }

  const deleteBookmarkHandler = async (item: any) => {
    const userId = decryptString(localStorage.getItem('userId'));
    const bookmarkId = item.id;
    console.log('Bookmark deleted successfully');
    const URL = `${process.env.REACT_APP_API_NEST_URL}/bookmark?userId=${userId}&bookmarkIds=${bookmarkId}`;
    const response = await axios.delete(URL, {
      headers: {
        Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
      },
    }).catch(err => {
      toast.error('Failed to delete bookmark.');
    });
    if (response) {
      toast.success('Bookmark removed successfully.');
      getBookmarks();
    }
  }

  const deleteHistorykHandler = async (item: any) => {
    const userId = decryptString(localStorage.getItem('userId'));
    const historyId = item.id;
    const URL = `${process.env.REACT_APP_API_NEST_URL}/search-history?userId=${userId}&searchHistoryIds=${historyId}`;
    const response = await axios.delete(URL, {
      headers: {
        Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
      },
    }).catch(err => {
      toast.error('Failed to delete history.');
    });
    if (response) {
      toast.success('History deleted successfully.');
      getHistory();
    }
  }

  useEffect(() => {
    if (selectedTab === 'bookmark') {
      getBookmarks();
    } else if (selectedTab === 'history') {
      getHistory();
    }
  }, [historyPageNo, bookmarkPageNo, selectedTab]);

  useEffect(() => {
    setFilteredBookmarks(bookmarks);
  }, [bookmarks]);

  useEffect(() => {
    setFilteredHistory(history);
  }, [history]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const selectedTabParam = searchParams.get('selectedTab') || 'bookmark';
    setSelectedTab(selectedTabParam);
  }, [location.search]);


  return (
    <div className="flex flex-col w-full gap-5 h-full relative">
      <div className="flex flex-col gap-5 w-full h-full">
        <div className="flex flex-col gap-4 bg-white w-full h-full p-5 rounded-xl shadow-xl">
          <p className="text-2xl font-bold">Search Cases</p>
          <form className="flex flex-row gap-3 text-lg font-bold" onSubmit={
            (e: any) => {
              e.preventDefault();
              navigate('/home/search-result?searchTerm=' + searchTerm);
            }}>
            <TextField
              fullWidth
              size="small"
              type="text"
              placeholder="Enter keywords or phrases. For exact matches, please use quotes."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Tooltip title={searchTerm === '' ? 'Select atleast one filter.' : ''}>
              <span>
                <Button
                  type="submit"
                  disabled={searchTerm === ''}
                  className='w-[9rem] h-full'
                  variant='contained'
                  color='primary'
                  onClick={(e: any) => {
                    e.preventDefault();
                    navigate('/home/search-result?searchTerm=' + searchTerm);
                  }}
                >
                  Search
                </Button>
              </span>
            </Tooltip>
          </form>
        </div>
        <TabList tabs={tabs} activeTab={selectedTab} onTabChange={handleTabChange} />
      </div>
      {selectedTab === 'bookmark' && (
        <div className="flex flex-col gap-4 bg-white p-5 rounded-xl shadow-xl">
          <div className="flex flex-row justify-between items-center pb-0">
            <p className="text-2xl font-bold">Bookmarks</p>
            <Tooltip title={!isAuthorised() ? constants.tooltips.upgradePlan : ''} placement={'left'}>
              <span>
                <TextField
                  sx={{
                    minWidth: 400,
                  }}
                  disabled={!isAuthorised()}
                  size="small"
                  type="text"
                  placeholder="Search here"
                  onChange={(e) => searchBookmarkFilter(e.target.value)}
                />
              </span>
            </Tooltip>
          </div>
          <div className="flex flex-col justify-between h-100">
            <div className={!isAuthorised() ? "h-[calc(100vh-29.8rem)] overflow-auto border" : "h-[calc(100vh-27.9rem)] overflow-auto border"}>
              <Table aria-label="simple table" size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <span className="font-bold text-md">Type</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-md">Date</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-md">Title</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-md">Details</span>
                    </TableCell>
                    <TableCell>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBookmarks.length > 0 ? (
                    filteredBookmarks.map((item: any, index) => (
                      <TableRow key={item._id} className="border-b-0 show-actions-on-hover" hover={true}>
                        <TableCell className="w-[7rem] capitalize">
                          {item.typeName}
                        </TableCell>
                        <TableCell className="w-[8rem]">
                          {(item.createdOn?.split("T")[0]) || 'N/A'}
                        </TableCell>
                        <TableCell className="max-w-[23rem]">
                          <p className="truncate">{item.header || "N/A"}</p>
                        </TableCell>
                        <TableCell className="max-w-[20rem]">
                          <p className="truncate">{item.detail || "N/A"}</p>
                        </TableCell>
                        <TableCell align='right'>
                          <div className="flex flex-row justify-end gap-3">
                            <Tooltip title={(!isAuthorised() && index > 2) ? constants.tooltips.upgradePlan : 'View Bookmark'} placement='bottom-start'>
                              <span>
                                <IconButton size="small"
                                  disabled={!isAuthorised() && index > 2}
                                  className="action"
                                  sx={{
                                    zIndex: '10',
                                    color: "#6c5dd3",
                                    ":hover": {
                                      color: "#645DD3",
                                    },
                                  }}
                                  onClick={(event: any) => {
                                    switch (item.typeName) {
                                      case BookmarkTypes.STATUTE: {
                                        openStatuteDoc(item);
                                        break;
                                      }
                                      case BookmarkTypes.CASE: {
                                        openJudgment(item.targetId);
                                        break;
                                      }
                                      case BookmarkTypes.DEPARTMENT: {
                                        openDepartmentFile(item);
                                        break;
                                      }
                                    }
                                  }}
                                >
                                  <RemoveRedEye fontSize='small' />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title={(!isAuthorised()) ? constants.tooltips.upgradePlan : 'Delete Bookmark'} placement='bottom-start'>
                              <span>
                                <IconButton size="small"
                                  disabled={!isAuthorised()}
                                  className="action"
                                  sx={{
                                    zIndex: '10',
                                    color: "#6c5dd3",
                                    ":hover": {
                                      color: "#645DD3",
                                    },
                                  }}
                                  onClick={(event: any) => {
                                    deleteBookmarkHandler(item)
                                  }}
                                >
                                  <Delete fontSize='small' />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align={"center"}>
                        No Bookmarks found!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-row justify-end">
              <Stack spacing={2} className="flex flex-row mt-4 justify-end">
                <Tooltip title={(!isAuthorised()) ? constants.tooltips.upgradePlan : ''} placement='left'>
                  <span>
                    <Pagination
                      page={bookmarkPageNo}
                      disabled={!isAuthorised()}
                      count={totalBookmarkPages}
                      siblingCount={0}
                      boundaryCount={1}
                      onChange={handleBookmarkPageChange}
                      shape={"rounded"}
                    />
                  </span>
                </Tooltip>
              </Stack>
            </div>
          </div>
        </div>
      )}
      {selectedTab === 'history' && (
        <div className="flex flex-col gap-4 bg-white p-5 rounded-xl shadow-xl">
          <div className="flex flex-row justify-between items-center pb-0">
            <p className="text-2xl font-bold">History</p>
            <Tooltip title={!isAuthorised() ? constants.tooltips.upgradePlan : ''} placement={'left'}>
              <span>
                <TextField
                  sx={{
                    minWidth: 400,
                  }}
                  disabled={!isAuthorised()}
                  size="small"
                  type="text"
                  placeholder="Search here"
                  onChange={(e) => searchHistoryFilter(e.target.value)}
                />
              </span>
            </Tooltip>
          </div>
          <div className="flex flex-col justify-between h-100">
            <div className={!isAuthorised() ? "h-[calc(100vh-29.8rem)] overflow-auto border" : "h-[calc(100vh-27.9rem)] overflow-auto border"}>
              <Table aria-label="simple table" size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <span className="font-bold text-md">Screen</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-md">Date</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-md">Search label</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-md">Search</span>
                    </TableCell>
                    <TableCell>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((item: any, index) => (
                      <TableRow key={item._id} className="border-b-0 show-actions-on-hover" hover={true}>
                        <TableCell className="w-[7rem] capitalize">
                          {item.typeName || 'N/A'}
                        </TableCell>
                        <TableCell className="w-[8rem]">
                          {(item.createdOn?.split("T")[0]) || 'N/A'}
                        </TableCell>
                        <TableCell className="max-w-[22rem]">
                          <p className="truncate">{item.label || "-"}</p>
                        </TableCell>
                        <TableCell className="max-w-[30rem]">
                          <Tooltip title={item.url} placement='bottom-start'>
                            <p className="truncate select-none">
                              {item.url || 'N/A'}
                            </p>
                          </Tooltip>
                        </TableCell>
                        <TableCell align='right'>
                          <div className="flex flex-row justify-end gap-3">
                            <Tooltip title={(!isAuthorised() && index > 2) ? constants.tooltips.upgradePlan : 'View history'}>
                              <span>
                                <IconButton size="small"
                                  disabled={!isAuthorised() && index > 2}
                                  className="action"
                                  sx={{
                                    zIndex: '10',
                                    color: "#6c5dd3",
                                    ":hover": {
                                      color: "#645DD3",
                                    },
                                  }}
                                  onClick={(event: any) => {
                                    navigate(item.url);
                                  }}
                                >
                                  <RemoveRedEye fontSize='small' />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title={(!isAuthorised()) ? constants.tooltips.upgradePlan : 'Delete History'} placement='bottom-start'>
                              <span>
                                <IconButton size="small"
                                  disabled={!isAuthorised()}
                                  className="action"
                                  sx={{
                                    zIndex: '10',
                                    color: "#6c5dd3",
                                    ":hover": {
                                      color: "#645DD3",
                                    },
                                  }}
                                  onClick={(event: any) => {
                                    deleteHistorykHandler(item)
                                  }}
                                >
                                  <Delete fontSize='small' />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align={"center"}>
                        No History found!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-row justify-end">
              <Stack spacing={2} className="flex flex-row mt-4 justify-end">
                <Tooltip title={(!isAuthorised()) ? constants.tooltips.upgradePlan : ''} placement='left'>
                  <span>
                    <Pagination
                      page={historyPageNo}
                      disabled={!isAuthorised()}
                      count={totalHistoryPages}
                      siblingCount={0}
                      boundaryCount={1}
                      onChange={handleHistoryPageChange}
                      shape={"rounded"}
                    />
                  </span>
                </Tooltip>
              </Stack>
            </div>
          </div>
        </div>
      )}
      <ContainerLoader isLoading={isLoading} />
      {selectedStatute && (selectedStatuteTitle !== '') && (
        <StatuteDocumentPreviewDialog open={statuteOpen} onClose={handleClose} selectedStatute={selectedStatute} selectedStatuteTitle={selectedStatuteTitle} selectedStatuteAct={selectedStatuteAct} />
      )}
      {selectedDepartmentFile !== '' && selectedDepartmentFileId !== '' && selectedDepartTitle !== '' && (
        <DepartmentDocumentPreviewDialog open={departmentOpen && (selectedDepartmentFile !== '' && selectedDepartmentFileId !== '')} onClose={handleClose} selectedFile={selectedDepartmentFile} selectedFileId={selectedDepartmentFileId} selectedDepartTitle={selectedDepartTitle} />
      )}
      {openForbiddenPrompt && (<ForbiddenPrompt open={openForbiddenPrompt} showLogout={true} onClose={() => { setOpenForbiddenPrompt(false); logout() }} />)}
    </div>
  );
};

export default Home;
