import React, { FC, useEffect, useState } from 'react'
import { Button } from '@mui/material';
import Login from './Login';
import SignUp from './SignUp';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { encryptString } from '../app.utils';
import { authOrg } from '../services/auth.service';
import Loader from '../Components/extras/Loader';
// import Login from '../Components/Auth/Login';

interface ILoginHeaderProps {
	isNewUser?: boolean;
};
const LoginHeader: FC<ILoginHeaderProps> = ({ isNewUser }) => {
	if (isNewUser) {
		return (
			<>
				<div className='text-center h1 fw-bold mt-5'>Create Account,</div>
				<div className='text-center h4 text-muted mb-5'>Sign up to get started!</div>
			</>
		);
	}
	return (
		<>
			<div className='text-center h1 fw-bold mt-5'>Welcome,</div>
			<div className='text-center h4 text-muted mb-5'>Sign in to continue!</div>
		</>
	);
};

interface ILoginProps {
	isSignUp?: boolean;
}
const Auth = () => {

	const [selectedOption, setSelectedOption] = useState('signin');

	const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const orgId = searchParams.get('orgId') || '';
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const signinOrg = () => {
    setIsLoading(true);
    authOrg(orgId).then((res: any) => {
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
      }
    }).catch((err: any) => {
      setIsLoading(false);
      navigate('/');
    });
  }

  useEffect(()=>{
    if (orgId !== '') {
      signinOrg();
    }
  },[]);

	return (
		<>
			<div className='flex flex-row w-full h-[calc(100vh-7.5rem)]'>
				<div className='flex flex-col w-1/2 justify-center items-center h-full bg-black'>

					{selectedOption === 'signin' ? (
						<div className='flex flex-col gap-4 justify-center items-center'>
							<p className='text-white text-3xl text-center'>Don't have an account?<br />Register your account to get started.</p>
							<Button variant='contained' sx={{
								zIndex: "10",
								background: "#6c5dd3",
								":hover": {
									bgcolor: "#645DD3",
									color: "white",
								},
								textTransform: 'none',
								marginTop: '1rem'
							}} className='w-[10rem]' onClick={() => setSelectedOption('signup')}>Register</Button>
						</div>
					) : (
						<div className='flex flex-col gap-4 justify-center items-center'>
							<p className='text-white text-3xl text-center'>Already have an account?<br />Login to continue.</p>
							<Button variant='contained' sx={{
								zIndex: "10",
								background: "#6c5dd3",
								textTransform: 'none',
								":hover": {
									bgcolor: "#645DD3",
									color: "white",
								},
								marginTop: '1rem'
							}} className='w-[10rem]' onClick={() => setSelectedOption('signin')}>Login</Button>
						</div>
					)}
				</div>
				<div className='flex flex-col w-1/2 justify-center items-center'>
					<form className='flex flex-col h-full w-full bg-[#f3f2f2] justify-center px-[7rem] relative'>
						<div className='px-[3rem] pt-[3rem] pb-[2rem] bg-white rounded-xl overflow-auto shadow-xl'>
							{selectedOption === 'signup' ? (
								<SignUp />
							) : (
								<Login />

							)}
						</div>
					</form>
				</div>
			</div>
			<Loader isLoading={isLoading} />
		</>
	);
};

export default Auth;
