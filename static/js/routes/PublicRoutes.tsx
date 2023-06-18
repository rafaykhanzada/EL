// Router import
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

// Container import
import Home from '../Components/LandingPage/Home';
import Auth from '../Containers/Auth';
import EmailVerification from '../Containers/EmailVerification';
import PasswordUpdate from '../Containers/PasswordUpdate';
import OrgSignUp from '../Containers/OrgSignUp';

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/auth' element={<Auth />} />
      <Route path='/users/verify/:id' element={<EmailVerification />} />
      <Route path='/users/update-password/:id' element={<PasswordUpdate />} />
      <Route path='/:organizationIdParam/signup' element={<OrgSignUp />} />
      <Route path='*' element={<Navigate to='/' />} />
    </Routes>
  );
};

export default PublicRoutes;