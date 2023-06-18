import { TextField, Button, Dialog, DialogContent, IconButton } from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { useLocation } from "react-router-dom";
import { NavigationMap } from "../Components/Navigation";
import { decryptString } from "../app.utils";

type Props = {
  open: boolean;
  onClose: () => void;
};

const SaveSelectionDialog = ({ open, onClose }: Props) => {
  const location = useLocation();
  const [searchLabel, setSearchLabel] = useState("");
  const [formErrors, setFormErrors] = useState<any>({});
  const [touchedFields, setTouchedFields] = useState<any>({});

  const handleInputChange = (event: any) => {
    let errors: any = {};
    const { name, value } = event.target;
    switch (name) {
      case "searchLabel": {
        if (value.length <= 100) {
          setSearchLabel(value);
        }
        if (!value) {
          errors.searchLabel = "Search label is required";
        }
        else {
          delete formErrors.searchLabel;
        }
        break;
      }
      default:
        break;
    }
    setFormErrors((prevErrors: any) => {
      return { ...prevErrors, ...errors };
    });
  };

  const handleFieldBlur = (event: any) => {
    const { name } = event.target;
    setTouchedFields((prevTouched: any) => {
      return { ...prevTouched, [name]: true };
    });
  };

  const saveSelection = () => {
    if (searchLabel) {
      console.log('Selection saved successfully', location.pathname + location.search);
      axios.post(`${process.env.REACT_APP_API_NEST_URL}/search-history`,
      {
        label: searchLabel,
        url: (location.pathname + location.search),
        userId: decryptString(localStorage.getItem('userId')),
        typeName: NavigationMap[location.pathname],
      }, {
        headers: {
          Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
        },
      }).then((res) => {
        toast.success("Search saved in history Successfully.");
        setSearchLabel('');
        onClose();
      }).catch((err) => {
        if (err.response?.status === 412) {
          toast.error("Search history already exists.");
        } else {
          toast.error("Failed to save search.");
        }
      });
    }
  };

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <div className="flex flex-row bg-black opacity-90 justify-end p-2 gap-2 items-center border-b-[0.1px] border-b-black border-opacity-50">
        <IconButton
          onClick={onClose}
          size="small"
          className='action'
          sx={{ color: '#6c5dd3' }}>
          <HighlightOffIcon fontSize='small' />
        </IconButton>
      </div>
      <DialogContent>
        <div className="flex flex-col">
          <form className="flex flex-col gap-5 w-full h-full">
            <p className="text-2xl font-bold mt-1 mb-2 text-[#6c5dd3]">Save your search</p>
            <div className="flex flex-col gap-2">
              <label className='text-gray-500'>Search label<b className="text-[#6c5dd3] ml-1">*</b></label>
              <TextField
                size="small"
                required
                name="searchLabel"
                placeholder="Enter a label for the search"
                value={searchLabel}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={!!(formErrors.searchLabel && touchedFields.searchLabel)}
                helperText={
                  touchedFields.searchLabel ? formErrors.searchLabel : ""
                }
              />
            </div>
          <p className="text-sm break-words bg-yellow-100 border border-yellow-400 rounded py-1 px-2"><b>Your search: </b>{location.pathname + location.search}</p>

          </form>
          <div className="mt-3">
            <Button
              className="w-full"
              disabled={(searchLabel.length === 0) || Object.keys(formErrors).length > 0}
              variant="contained"
              sx={{
                zIndex: "10",
                background: "#6c5dd3",
                ":hover": {
                  bgcolor: "#645DD3",
                  color: "white",
                },
                textTransform: 'none',
                marginTop: '1rem'
              }}
              onClick={() => saveSelection()}
            >
              Save Selection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

  );
}
export default SaveSelectionDialog;