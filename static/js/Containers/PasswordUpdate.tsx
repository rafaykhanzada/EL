import { Button, TextField } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../Components/extras/Loader";
import ContainerLoader from "../Components/extras/ContainerLoader";

const PasswordUpdate = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [formValue, setFormValues] = useState({
    id: '',
    password: '',
    cPassword: '',
  });
  const [formErrors, setFormErrors] = useState<any>({});
  const [touchedFields, setTouchedFields] = useState<any>({});

  const handleFieldBlur = (event: any) => {
    const { name } = event.target;
    setTouchedFields((prevTouched: any) => {
      return { ...prevTouched, [name]: true };
    });
  };

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    let newErrors: any = {};
    let updatedFormValue = { ...formValue, [name]: value };
    switch (name) {
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 8) {
          newErrors.password = 'Password length must have atleast 8 characters';
        } else {
          delete formErrors.password;
        }
        if (formValue.cPassword) {
          formValue.cPassword += '';
        }
        break;
      case 'cPassword':
        if (!value) {
          newErrors.cPassword = 'Confirmation password is required';
        } else if (value !== formValue.password) {
          newErrors.cPassword = 'Password not matched';
        } else {
          delete formErrors.cPassword;
        }
        break;
      default:
        break;
    }

    setFormValues(updatedFormValue);
    setFormErrors((prevErrors: any) => {
      return { ...prevErrors, ...newErrors };
    });
  };

  const updatePassword = () => {
    setIsLoading(true);
    axios.put(`${process.env.REACT_APP_API_NEST_URL}/auth/set-password`, { id, password: formValue.password }).then(
      (res: any) => {
        if (res.status === 201 || res.status === 200) {
          toast.success('Password Update successfully');
          navigate('/auth')
        } else {
          toast.error("Failed to update password")
        }
        setIsLoading(false);
      }
    ).catch(
      (err: any) => {
        toast.error("Failed to update password")
        setIsLoading(false);
      }
    );
  }

  return (
    <>
      <ContainerLoader isLoading={isLoading} />
      {!isLoading && (<div className="flex flex-row w-full h-full justify-center items-center">
        <div className="rounded-xl mt-[4rem] shadow-lg bg-white flex flex-col gap-4 justify-center items-center w-[30rem]">
          <form className="flex flex-col px-[3rem] py-[2rem] w-full">
            <div className="flex flex-col gap-2 w-full h-full">
              <p className="text-2xl font-bold my-2 text-[#6c5dd3]">Set Password</p>
              <label className='text-gray-500'>Password<b className="text-[#6c5dd3] ml-1">*</b></label>
              <TextField
                size="small"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formValue.password}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={!!(formErrors.password && touchedFields.password)}
                helperText={touchedFields.password ? formErrors.password : ""}
                required
              />
              <label className='text-gray-500'>Confirm Password<b className="text-[#6c5dd3] ml-1">*</b></label>
              <TextField
                size="small"
                required
                id="userPass"
                name="cPassword"
                type="password"
                placeholder="Confirm your password"
                value={formValue.cPassword}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={!!(formErrors.cPassword && touchedFields.cPassword)}
                helperText={touchedFields.cPassword ? formErrors.cPassword : ""}
              />

            </div>
            <div className="mt-3">
              <Button
                className="w-full"
                disabled={(formValue.cPassword.length === 0 || formValue.password.length === 0) || Object.keys(formErrors).length > 0}
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
                onClick={updatePassword}>Update Password</Button>
            </div>
          </form>
        </div>
      </div>)}
    </>
  );
};

export default PasswordUpdate;