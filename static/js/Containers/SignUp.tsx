import React, { useEffect, useState } from 'react';
import { Button, FormControl, MenuItem, Select, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import { signUp } from '../services/auth.service';
import { fetchOrganizationTypes } from '../services/misc.service';
import Loader from '../Components/extras/Loader';
import ContainerLoader from '../Components/extras/ContainerLoader';
import PhoneInputWithCountrySelect from 'react-phone-number-input';
import 'react-phone-number-input/style.css'

const SignUp = () => {
  const [orgTypes, setOrgTypes] = useState<any>([]);
  const [formValue, setFormValues] = useState({
    loginFirstName: '',
    loginLastName: '',
    loginEmail: '',
    loginPhone: '',
    loginOrg: '',
    loginOrgType: '',
    loginCity: '',
    loginCountry: '',
  });
  const [formErrors, setFormErrors] = useState<any>({});
  const [touchedFields, setTouchedFields] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    let newErrors: any = {};
    let updatedFormValue = { ...formValue, [name]: value };
    switch (name) {
      case 'loginFirstName':
        if (!value) {
          newErrors.loginFirstName = 'First Name is required';
        } else {
          delete formErrors.loginFirstName;
        }
        break;
      case 'loginLastName':
        if (!value) {
          newErrors.loginLastName = 'Last Name is required';
        } else {
          delete formErrors.loginLastName;
        }
        break;
      case 'loginEmail':
        if (!value) {
          newErrors.loginEmail = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.loginEmail = 'Email is invalid';
        } else {
          delete formErrors.loginEmail;
        }
        break;
      case 'loginOrg':
        if (!value) {
          newErrors.loginOrg = 'Organization is required';
        } else {
          delete formErrors.loginOrg;
        }
        break;
      case 'loginOrgType':
        if (!value) {
          newErrors.loginOrgType = 'Organization type is required';
        } else {
          delete formErrors.loginOrgType;
        }
        break;
      case 'loginCity':
        if (!value) {
          newErrors.loginCity = 'City is required';
        } else {
          delete formErrors.loginCity;
        }
        break;
      case 'loginCountry':
        if (!value) {
          newErrors.loginCountry = 'Country is required';
        } else {
          delete formErrors.loginCountry;
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

  const handlePhoneInputChange = (value: string, name: string) => {
    let newErrors: any = {};
    let updatedFormValue = { ...formValue, [name]: value };
    switch (name) {
      case 'loginPhone': {
        if (!value) {
          newErrors.loginPhone = 'Phone No. is required';
        } else {
          delete formErrors.loginPhone;
        }
        break;
      }
      default:
        break;
    }
    setFormValues(updatedFormValue);
    setFormErrors((prevErrors: any) => {
      return { ...prevErrors, ...newErrors };
    });
  };

  const handleFieldBlur = (event: any) => {
    const { name } = event.target;
    setTouchedFields((prevTouched: any) => {
      return { ...prevTouched, [name]: true };
    });
  };

  const resetFormFields = (organizationId: string) => {
    setFormValues({
      loginFirstName: '',
      loginLastName: '',
      loginEmail: '',
      loginPhone: '',
      loginOrg: '',
      loginOrgType: organizationId,
      loginCity: '',
      loginCountry: ''
    });
  }

  const onSignUp = (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    signUp(formValue)
      .then((res: any) => {
        setIsLoading(false);
        resetFormFields(orgTypes[0]?.id);
        toast.success('User Created successfully.\nWe have sent you a verification email please verify to continue');
      })
      .catch((err: any) => {
        setIsLoading(false);
        toast.error('Failed to create the user');
      });
  };

  const isFormInvalid = () => {
    if (Object.keys(formErrors).length > 0 || !formValue.loginFirstName ||
      !formValue.loginLastName || !formValue.loginEmail || !formValue.loginPhone ||
      !formValue.loginOrg ||
      !formValue.loginOrgType || !formValue.loginCity ||
      !formValue.loginCountry) {
      return true;
    }
    return false;
  }

  useEffect(() => {
    fetchOrganizationTypes().then((res: any) => {
      setIsLoading(false);
      setOrgTypes(res);
      resetFormFields(res[0]?.id,);
    }).catch((error) => {
      setIsLoading(false);
      setOrgTypes([]);
      toast.error('Failed to load organization types.');
    })
  }, []);

  return (
    <>
      <form className='flex flex-col gap-4 bg-white' onSubmit={onSignUp}>
        <p className='text-2xl font-bold my-2 text-[#6c5dd3]'>Register your account</p>
        <div className='flex flex-row gap-3 w-full'>
          <div className='flex flex-col w-full gap-2'>
            <label className='text-gray-500'>First Name<b className="text-[#6c5dd3] ml-1">*</b></label>
            <TextField
              name='loginFirstName'
              size='small'
              placeholder='Enter your first name'
              onChange={handleInputChange}
              value={formValue.loginFirstName}
              required
              onBlur={handleFieldBlur}
              error={!!(formErrors.loginFirstName && touchedFields.loginFirstName)}
              helperText={touchedFields.loginFirstName ? formErrors.loginFirstName : ""}
            />
          </div>
          <div className='flex flex-col w-full gap-2'>
            <label className='text-gray-500'>Last Name<b className="text-[#6c5dd3] ml-1">*</b></label>
            <TextField
              size='small'
              name='loginLastName'
              placeholder='Enter your last name'
              onChange={handleInputChange}
              value={formValue.loginLastName}
              required
              onBlur={handleFieldBlur}
              error={!!(formErrors.loginLastName && touchedFields.loginLastName)}
              helperText={touchedFields.loginLastName ? formErrors.loginLastName : ""}
            />
          </div>
        </div>
        <div className='flex flex-row gap-4 w-full'>
          <div className='flex flex-col w-full gap-2'>
            <label className='text-gray-500'>Email<b className="text-[#6c5dd3] ml-1">*</b></label>
            <TextField
              size='small'
              name='loginEmail'
              placeholder='Enter your email'
              onChange={handleInputChange}
              value={formValue.loginEmail}
              required
              onBlur={handleFieldBlur}
              error={!!(formErrors.loginEmail && touchedFields.loginEmail)}
              helperText={touchedFields.loginEmail ? formErrors.loginEmail : ""}
            />
          </div>
          <div className='flex flex-col w-full'>
            <label className='text-gray-500 mb-2'>Phone Number<b className="text-[#6c5dd3] ml-1">*</b></label>
            <PhoneInputWithCountrySelect
              className={`w-full px-4 py-2 text-gray-500 bg-white border rounded ${touchedFields.loginPhone && formErrors.loginPhone ? 'border-[#d32f2f]' : 'border-gray-300'}`}
              defaultCountry='PK'
              name='loginPhone'
              placeholder="Enter your phone no."
              onBlur={handleFieldBlur}
              error={!!(formErrors.loginPhone && touchedFields.loginPhone)}
              value={formValue.loginPhone}
              onChange={(value: any) => handlePhoneInputChange(value, 'loginPhone')} />
            <span className="text-[0.75rem] text-[#d32f2f] mt-[4px] ml-[14px]">{touchedFields.loginPhone ? formErrors.loginPhone : ""}</span>
          </div>
        </div>
        <div className='flex flex-row gap-3 w-full'>
          <div className='flex flex-col w-full gap-2'>
            <label className='text-gray-500'>Company Name<b className="text-[#6c5dd3] ml-1">*</b></label>
            <TextField
              size='small'
              name='loginOrg'
              placeholder='Enter your company name'
              onChange={handleInputChange}
              value={formValue.loginOrg}
              required
              onBlur={handleFieldBlur}
              error={!!(formErrors.loginOrg && touchedFields.loginOrg)}
              helperText={touchedFields.loginOrg ? formErrors.loginOrg : ""}
            />
          </div>
          <FormControl className='flex flex-col w-full gap-2'>
            <label className='text-gray-500'>Profession<b className="text-[#6c5dd3] ml-1">*</b></label>
            <Select
              size='small'
              name='loginOrgType'
              onChange={handleInputChange}
              value={formValue.loginOrgType || ''}
              MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
              required
              onBlur={handleFieldBlur}
              error={!!(formErrors.loginOrgType && touchedFields.loginOrgType)}
            >
              {orgTypes.map((orgType: any) => (
                <MenuItem key={orgType.id} value={orgType.id}>{orgType.OrganizationType}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className='flex flex-col w-full gap-2'>
          <label className='text-gray-500'>City<b className="text-[#6c5dd3] ml-1">*</b></label>
          <TextField
            size='small'
            name='loginCity'
            placeholder='Enter your city'
            onChange={handleInputChange}
            value={formValue.loginCity}
            required
            onBlur={handleFieldBlur}
            error={!!(formErrors.loginCity && touchedFields.loginCity)}
            helperText={touchedFields.loginCity ? formErrors.loginCity : ""}
          />
        </div>
        <div className='flex flex-col w-full gap-2'>
          <label className='text-gray-500'>Country<b className="text-[#6c5dd3] ml-1">*</b></label>
          <TextField
            size='small'
            name='loginCountry'
            placeholder='Enter your country'
            onChange={handleInputChange}
            value={formValue.loginCountry}
            required
            onBlur={handleFieldBlur}
            error={!!(formErrors.loginCountry && touchedFields.loginCountry)}
            helperText={touchedFields.loginCountry ? formErrors.loginCountry : ""}
          />
        </div>
        <div className='mt-3'>
          <Button
            type='submit'
            className='w-full'
            disabled={isFormInvalid()}
            variant='contained'
            sx={{
              zIndex: '10',
              background: '#6c5dd3',
              ':hover': {
                bgcolor: '#645DD3',
                color: 'white',
              },
              textTransform: 'none',
            }}
            onClick={onSignUp}
          >
            Register
          </Button>
        </div>
      </form>
      <ContainerLoader isLoading={isLoading} />
    </>
  );
};

export default SignUp;
