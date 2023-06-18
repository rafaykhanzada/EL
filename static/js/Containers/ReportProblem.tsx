import { TextField, Button, Dialog, DialogContent, IconButton } from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { decryptString } from "../app.utils";

type Props = {
  open: boolean;
  onClose: () => void;
};

const ReportProblem = ({ open, onClose }: Props) => {
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [formErrors, setFormErrors] = useState<any>({});
  const [touchedFields, setTouchedFields] = useState<any>({});

  const handleInputChange = (event: any) => {
    let errors: any = {};
    const { name, value } = event.target;
    switch (name) {
      case "emailSubject": {
        if (value.length <= 100) {
          setEmailSubject(value);
        }
        if (!value) {
          errors.emailSubject = "Email Subject is required";
        }
        else {
          delete formErrors.emailSubject;
        }
        break;
      }
      case "emailMessage": {
        if (value.length <= 500) {
          setEmailMessage(value);
        }
        if (!value) {
          errors.emailMessage = "Email Message is required";
        } else {
          delete formErrors.emailMessage;
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

  const sendEmail = () => {
    if (emailSubject && emailMessage) {
      axios.post(`${process.env.REACT_APP_API_NEST_URL}/users/feedback`, { emailSubject, emailMessage }, {
        headers: {
          Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
        },
      }).then((res) => {
        toast.success("Email sent successfully.");
        setEmailMessage('');
        setEmailSubject('');
        onClose();
      }).catch((err) => {
        toast.error("Failed to send email.");
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
            <p className="text-2xl font-bold mt-1 mb-2 text-[#6c5dd3]">Report a Problem</p>
            <div className="flex flex-col gap-2">
              <label className='text-gray-500'>Email Subject<b className="text-[#6c5dd3] ml-1">*</b></label>
              <TextField
                size="small"
                required
                name="emailSubject"
                placeholder="Enter Email Subject"
                value={emailSubject}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={!!(formErrors.emailSubject && touchedFields.emailSubject)}
                helperText={
                  touchedFields.emailSubject ? formErrors.emailSubject : ""
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className='text-gray-500'>Email Message<b className="text-[#6c5dd3] ml-1">*</b></label>
              <TextField
                rows={6}
                multiline={true}
                required
                size="small"
                id="emailMessage"
                name="emailMessage"
                placeholder="Please describe your issue/suggestion here."
                value={emailMessage}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={!!(formErrors.emailMessage && touchedFields.emailMessage)}
                helperText={
                  touchedFields.emailMessage ? formErrors.emailMessage : ""
                }
              />
            </div>

          </form>
          <div className="mt-3">
            <Button
              className="w-full"
              disabled={(emailMessage.length === 0 || emailSubject.length === 0) || Object.keys(formErrors).length > 0}
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
              onClick={() => sendEmail()}
            >
              Send Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

  );
}
export default ReportProblem;