import React, { useState } from 'react';


import 'react-datepicker/dist/react-datepicker.css';

import {
  Tooltip,
  IconButton,
  Button,
} from '@mui/material';

import { Save } from '@mui/icons-material';
import SaveSelectionDialog from './SaveSelectionDialog';


const SaveSearchButton = () => {
  const [openSaveSelectionDialog, setOpenSaveSelectionDialog] = useState(false);

  const handleClose = () => {
    setOpenSaveSelectionDialog(false);
  };

  return (
    <>
      <div className='flex flex-row items-center'>
        <Tooltip title={'Save your search in history for later user.'} placement='left'>
          <span>
            <Button
              onClick={() => setOpenSaveSelectionDialog(true)}
              size="small"
              className='action'
              color='primary'
              endIcon ={(<Save fontSize='medium' />)}>
              Save Search
            </Button>
          </span>
        </Tooltip>
      </div>
      <SaveSelectionDialog open={openSaveSelectionDialog} onClose={handleClose} />
    </>
  );
};

export default SaveSearchButton;
