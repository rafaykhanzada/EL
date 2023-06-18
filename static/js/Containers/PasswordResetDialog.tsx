import { TextField, Button, Dialog, DialogContent, IconButton } from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

type Props = {
  open: boolean;
  onClose: () => void;
};

const PasswordResetDialog = ({ open, onClose }: Props) => {
  const [email, setEmail] = useState("");
  const [formErrors, setFormErrors] = useState<any>({});
  const [touchedFields, setTouchedFields] = useState<any>({});

  const handleInputChange = (event: any) => {
    let errors: any = {};
    const { name, value } = event.target;
    switch (name) {
      case "email": {
        if (value.length <= 100) {
          setEmail(value);
        }
        if (!value) {
          errors.email = "Email Subject is required";
        }
        else {
          delete formErrors.email;
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

  const resetPassword = () => {
    if (email) {
      axios.post(`${process.env.REACT_APP_API_NEST_URL}/auth/reset-password`, { email })
      .then((res) => {
        toast.success("Email sent successfully.");
        setEmail('');
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
            <p className="text-2xl font-bold mt-1 mb-2 text-[#6c5dd3]">Reset your password</p>
            <div className="flex flex-col gap-2">
              <label className='text-gray-500'>Email<b className="text-[#6c5dd3] ml-1">*</b></label>
              <TextField
                size="small"
                required
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={!!(formErrors.email && touchedFields.email)}
                helperText={
                  touchedFields.email ? formErrors.email : ""
                }
              />
            </div>
          </form>
          <div className="mt-3">
            <Button
              className="w-full"
              disabled={(email.length === 0) || Object.keys(formErrors).length > 0}
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
              onClick={() => resetPassword()}
            >
              Reset Password
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

  );
}
export default PasswordResetDialog;