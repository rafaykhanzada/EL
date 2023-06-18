import { Bookmark, BookmarkAddOutlined, HighlightOff } from "@mui/icons-material";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import PDFViewer from "./PDFViewer";
import axios from "axios";
import { toast } from "react-toastify";
import { decryptString } from "../app.utils";
import { getStatuteFile } from "../services/statutes.service";
import Loader from "./extras/Loader";
import { BookmarkTypes } from "../app.enums";
import ContainerLoader from "./extras/ContainerLoader";

type Props = {
  open: boolean;
  onClose: () => void;
  selectedStatute: string,
  selectedStatuteTitle: string,
  selectedStatuteAct: string,
};

const StatuteDocumentPreviewDialog = ({ open, onClose, selectedStatute, selectedStatuteTitle, selectedStatuteAct }: Props) => {

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmark, setBookmark] = useState('');
  const [pdfData, setPdfData] = useState<any>(null);
  const [isDocLoading, setIsDocLoading] = useState(true);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(true);

  useEffect(() => {
    getBookmarkState();
    getStatuteFile(selectedStatute).then((res: any) => {
      setIsDocLoading(false);
      if (res.data) {
        setPdfData(res.data);
      } else {
        toast.error('Failed to fetch statute file.');
      }
    }).catch((error) => {
      setIsDocLoading(false);
      toast.error('Failed to fetch statute file.');
    });
  }, []);

  const bookmarkStatute = () => {
    axios.post(`${process.env.REACT_APP_API_NEST_URL}/bookmark`,
      {
        header: selectedStatuteTitle,
        detail: selectedStatuteAct,
        targetId: selectedStatute,
        userId: decryptString(localStorage.getItem('userId')),
        typeName: BookmarkTypes.STATUTE,
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
    await axios.get(`${process.env.REACT_APP_API_NEST_URL}/bookmark?targetId=${selectedStatute}&typeName=${BookmarkTypes.STATUTE}&userId=${decryptString(localStorage.getItem('userId'))}`, {
      headers: {
        Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
      },
    }).catch(err => {
      setIsBookmarkLoading(false);
      setIsBookmarked(false);
    }).then(response => {
      setIsBookmarkLoading(false);
      if (response) {
        if (response.data.data[0]) {
          setIsBookmarked(true);
          setBookmark(response.data.data[0].id);
        } else {
          setIsBookmarked(false);
        }
      }
    });
  }

  return (
    <>
    {(isDocLoading || isBookmarkLoading) ? (
      <ContainerLoader isLoading={isDocLoading || isBookmarkLoading}/>
    ): (
      <Dialog
        maxWidth={false}
        open={open}
        onClose={onClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <div className='flex flex-row bg-black opacity-90 justify-between p-2 gap-2 items-center border-b-[0.1px] border-b-black border-opacity-50'>
          {/* Todo: Will replace This header with file name */}
          <p className='font-bold text-[#6c5dd3] mx-3'>Statute Document</p>
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
                  bookmarkStatute();
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
          {pdfData && (
            <PDFViewer blob={pdfData} />
          )}
        </DialogContent>
      </Dialog>
    )}
    </>
  );
}

export default StatuteDocumentPreviewDialog;