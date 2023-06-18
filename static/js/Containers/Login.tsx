import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import { toast } from "react-toastify";
import { getSigninMethods, signIn } from "../services/auth.service";
import Loader from "../Components/extras/Loader";
import { useNavigate } from "react-router-dom";
import { encryptString } from "../app.utils";
import ContainerLoader from "../Components/extras/ContainerLoader";
import PasswordResetDialog from "./PasswordResetDialog";

const Login = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userPass, setUserPass] = useState("");
  const [formErrors, setFormErrors] = useState<any>({});
  const [touchedFields, setTouchedFields] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [openPasswordResetDialog, setOpenPasswordResetDialog] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [loginMethod, setLoginMethod] = useState('');

  const handleInputChange = (event: any) => {
    let errors: any = {};
    const { name, value } = event.target;
    switch (name) {
      case 'userEmail': {
        setUserEmail(value);
        if (!value) {
          errors.userEmail = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errors.userEmail = 'Email is invalid';
        } else {
          delete formErrors.userEmail;
        }
        break;
      }
      case 'userPass': {
        setUserPass(value);
        if (!value) {
          errors.userPass = 'Password is required';
        }
        else if (value.length < 8) {
          errors.userPass = 'Password must be at least 8 characters';
        } else {
          delete formErrors.userPass;
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

  const resetPasswordDialog = (event: any) => {
    console.log('Open password reset dialog');
    setOpenPasswordResetDialog(true);
  };

  const handleClose = () => {
    if(openPasswordResetDialog) {
      setOpenPasswordResetDialog(false);
    }
  }

  const signInUser = (e: any) => {
    e.preventDefault();
    if (Object.keys(formErrors).length === 0) {
      setIsLoading(true);
      signIn({ email: userEmail, password: userPass })
        .then((res: any) => {
          setIsLoading(false);
          // On Success save user info and goto Dashboard screen
          if (res.user && res.token) {
            localStorage.setItem('isAuthenticated', encryptString('true'));
            localStorage.setItem('username', encryptString(res.user.name));
            localStorage.setItem('userId', encryptString(res.user.id));
            localStorage.setItem('role', encryptString(res.user.role));
            localStorage.setItem('token', encryptString(res.token));
            localStorage.setItem('isVerified', encryptString((res.user.emailVerified).toString()));
            if (res.user.emailVerified === true) {
              toast.success('Logged in successfully!');
              window.location.href = '/dashboard';
            }
            else {
              toast.info('Email is not verified; please verify email to continue.');
            }
          }
        })
        .catch((err: any) => {
          setIsLoading(false);
          if (err.response.status) {
            toast.error("Incorrect email or password.");
          } else {
            toast.error("Something went wrong.");
          }
        });
    }
  };

  const onNext = (e: any) => {
    e.preventDefault();
    if (userEmail !== '') {
      setIsLoading(true);
      getSigninMethods({email: userEmail}).then((res: any) => {
        setIsLoading(false);
        if (res.user && res.token) {
          localStorage.setItem('isAuthenticated', encryptString('true'));
          localStorage.setItem('username', encryptString(res.user.name));
          localStorage.setItem('userId', encryptString(res.user.id));
          localStorage.setItem('role', encryptString(res.user.role));
          localStorage.setItem('token', encryptString(res.token));
          localStorage.setItem('isVerified', encryptString((res.user.emailVerified).toString()));
          if (res.user.emailVerified === true) {
            toast.success('Logged in successfully!');
            window.location.href = '/dashboard';
          }
          else {
            toast.info('Email is not verified; please verify email to continue.');
          }
        }
      }).catch((err: any) => {
        setIsLoading(false);
        if (err.response.status === 403) {
          setIsUserLoggedIn(false);
          setLoginMethod('password');
        } else {
          toast.error("Something went wrong.");
        }
      });
    }
  }

  return (
    <>
      <form className="flex flex-col bg-white" onSubmit={signInUser}>
        <div className="flex flex-col gap-2 w-full h-full">
          <p className="text-2xl font-bold my-2 text-[#6c5dd3]">{!isUserLoggedIn && loginMethod === 'password' ? 'Please enter your password' : 'Login to your account'}</p>
          <label className='text-gray-500'>Email<b className="text-[#6c5dd3] ml-1">*</b></label>
          <TextField
            size="small"
            name="userEmail"
            placeholder="Enter your email address"
            value={userEmail}
            onChange={handleInputChange}
            onBlur={handleFieldBlur}
            error={!!(formErrors.userEmail && touchedFields.userEmail)}
            helperText={touchedFields.userEmail ? formErrors.userEmail : ""}
            required
          />
          {
            !isUserLoggedIn && loginMethod === 'password' && (
              <>
                <label className='text-gray-500'>Password<b className="text-[#6c5dd3] ml-1">*</b></label>
                <TextField
                  size="small"
                  required
                  id="userPass"
                  name="userPass"
                  type="password"
                  placeholder="Enter your password"
                  value={userPass}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={!!(formErrors.userPass && touchedFields.userPass)}
                  helperText={touchedFields.userPass ? formErrors.userPass : ""}
                />
              </>
            )
          }
        </div>
        <div className="mt-3">
          {
            !isUserLoggedIn && loginMethod === 'password' ? (
              <Button
                type="submit"
                className="w-full"
                disabled={(userEmail.length === 0 || userPass.length === 0) || Object.keys(formErrors).length > 0}
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
                onClick={signInUser}
              >
                Login
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full"
                disabled={userEmail.length === 0}
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
                onClick={onNext}
              >
                Next
              </Button>
            )
          }
          {
            !isUserLoggedIn && loginMethod === 'password' && (
              <div className="flex flex-row justify-end w-full mt-2">
                <Button onClick={resetPasswordDialog}>
                  Forgot password?
                </Button>
              </div>
            )}

        </div>
      </form>
      <ContainerLoader isLoading={isLoading}/>
      { openPasswordResetDialog ? <PasswordResetDialog onClose={handleClose} open={openPasswordResetDialog} /> : null }
    </>
  );
};

export default Login;
