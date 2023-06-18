import { Bookmark, BookmarkAddOutlined, HighlightOff } from "@mui/icons-material";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import PDFViewer from "./PDFViewer";
import axios from "axios";
import { toast } from "react-toastify";
import { decryptString } from "../app.utils";
import DocumentViewer from "./DocumentViewer";
import { logout } from "../services/auth.service";
import Loader from "./extras/Loader";
import { BookmarkTypes } from "../app.enums";
import ContainerLoader from "./extras/ContainerLoader";

type Props = {
  open: boolean;
  onClose: () => void;
  selectedFile: string,
  selectedFileId: string,
  selectedDepartTitle: string,
};

const DepartmentDocumentPreviewDialog = ({ open, onClose, selectedFile, selectedFileId, selectedDepartTitle }: Props) => {

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmark, setBookmark] = useState('');
  const [docData, setDocData] = useState<any>(null);
  const [isDocLoading, setIsDocLoading] = useState(true);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(true);

  useEffect(() => {
    setIsDocLoading(true);
    getDepartmentFile().then((res: any) => {
      setIsDocLoading(false);
      if (res.data) {
        setDocData(selectedFile.substring(selectedFile.length - 3) === 'pdf' ? { blob: res.data, isPdf: true } : { blob: res.data, isPdf: false });
      } else {
        toast.error('Failed to fetch department file.');
      }
    }).catch((error) => {
      setIsDocLoading(false);
      toast.error('Failed to fetch department file.');
    });
    getBookmarkState();
  }, []);

  const getDepartmentFile = async () => {
    try {
      const response = await axios({
        method: 'GET',
        url: `${process.env.REACT_APP_API_NEST_URL}/department-search/department-file/${selectedFileId}`,
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
        },
      });
      if (response) {
        return response;
      }
    } catch (error: any) {
      if (error.response.status === 401) {
        logout();
      }
      return error;
    }
  }

  const bookmarkDepartmentFile = () => {
    axios.post(`${process.env.REACT_APP_API_NEST_URL}/bookmark`,
      {
        header: selectedDepartTitle,
        detail: selectedFile,
        targetId: selectedFileId,
        userId: decryptString(localStorage.getItem('userId')),
        typeName: BookmarkTypes.DEPARTMENT,
      }, {
      headers: {
        Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
      },
    }).then((res) => {
      toast.success('Bookmark created successfully.');
      setIsBookmarked(true);
    }).catch((err) => {
      toast.error("Failed to bookmark statute.");
    });
  };

  const deleteBookmark = async () => {
    const userId = decryptString(localStorage.getItem('userId'));
    const URL = `${process.env.REACT_APP_API_NEST_URL}/bookmark?userId=${userId}&bookmarkIds=${bookmark}`;
    const response = await axios.delete(URL, {
      headers: {
        Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
      },
    }).catch(err => {
      toast.error('Failed to delete bookmark.');
    });
    if (response) {
      toast.success('Bookmark removed successfully.');
      setIsBookmarked(false);
    }
  };

  const getBookmarkState = async () => {
    setIsBookmarkLoading(true);
    await axios.get(`${process.env.REACT_APP_API_NEST_URL}/bookmark?targetId=${selectedFileId}&typeName=${BookmarkTypes.DEPARTMENT}&userId=${decryptString(localStorage.getItem('userId'))}`, {
      headers: {
        Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
      },
    }).catch(err => {
      setIsBookmarked(false);
      setIsBookmarkLoading(false);
    }).then(response => {
      setIsBookmarkLoading(false);
      if (response) {
        if (response.data.data[0]) {
          response.data.data.map(
            (item: any) => {
              if (item.detail === selectedFile) {
                setIsBookmarked(true);
                setBookmark(response.data.data[0].id);
              } else {
                setIsBookmarked(false);
              }
            }
          );
        } else {
          setIsBookmarked(false);
        }
      }
    });
  }

  return (
    <>
      {(isBookmarkLoading || isDocLoading) ? (
        <ContainerLoader isLoading={isBookmarkLoading || isDocLoading}/>
      ) : (
        <Dialog
        maxWidth={false}
        open={open}
        onClose={onClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <div className='flex flex-row bg-black opacity-90 justify-between p-2 gap-2 items-center border-b-[0.1px] border-b-black border-opacity-50'>
          {/* Todo: Will replace This header with file name */}
          <p className='font-bold text-[#6c5dd3] mx-3'>Department Document</p>
          <div className='flex flex-row gap-2 items-center justify-center'>
            {isBookmarked ? (
              <IconButton
                sx={{ color: '#6c5dd3' }}
                onClick={() => {
                  deleteBookmark();
                }}
                size='small'
                className='action'
                color='primary'>
                <Bookmark fontSize='small' />
              </IconButton>
            ) : (
              <IconButton
                sx={{ color: '#6c5dd3' }}
                onClick={() => {
                  bookmarkDepartmentFile();
                }}
                size='small'
                className='action'
                color='primary'>
                <BookmarkAddOutlined fontSize='small' />
              </IconButton>
            )}
            <IconButton
              sx={{ color: '#6c5dd3' }}
              onClick={onClose}
              size='small'
              className='action'
              color='primary'>
              <HighlightOff fontSize='small' />
            </IconButton>
          </div>
        </div>
        <DialogContent>
          {docData ? (docData.isPdf ? (
            <PDFViewer blob={docData.blob} />
          ) : (
            <DocumentViewer blob={docData.blob} />
          )) : null}
        </DialogContent>
      </Dialog>
      )}
    </>
  );
}

export default DepartmentDocumentPreviewDialog;