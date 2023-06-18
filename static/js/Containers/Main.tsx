    // React import

// Material import
import Box from '@mui/material/Box';
import React, { useState } from 'react';
import ProtectedRoutes from '../routes/ProtectedRoutes';
import Navigation from '../Components/Navigation';
import { Info } from '@mui/icons-material';
import { decryptString, isAuthorised } from '../app.utils';
import { upgradeUserPlanRequestEmail } from '../services/user.service';
import { toast } from 'react-toastify';

// Main Container
const Main = () => {
  const [upgradeRequestSent, setUpgradeRequestSent] = useState(localStorage.getItem('upgradeRequestSent') === 'true');
  const user = decryptString(localStorage.getItem('username') || '');
  const role = decryptString(localStorage.getItem('role'));
  const requestUpgrade = async () => {
    await upgradeUserPlanRequestEmail(user).then(
      (res) => {
        toast.success('You have requested an upgrade to Premium. Please follow instructions in the email received.')
        localStorage.setItem('upgradeRequestSent', 'true');
        setUpgradeRequestSent(true);
      }
    ).catch((err) => {
      setUpgradeRequestSent(false);
    });
  }
  return (
    <>
      {!isAuthorised() && (
        <div className='bg-[#6c5dd3] flex flex-row font-inter mb-1 px-5 py-2 text-md text-white shadow-md items-center z-50'>
          <Info />
          {role === 'organization' && localStorage.getItem('outOfOrganization') === 'true' ? (
            <span className='mx-1'>
              You do not have permission to access this resource. You might be accessing outside of your organization’s network.
            </span>
          ) : (
            upgradeRequestSent ? (
              <span className='mx-1'>
                You have requested an upgrade to Premium. Please follow instructions in the email received.
              </span>
            ) : (
              <span className='mx-1'>
                Upgrade to our premium plan for full access to all features. <a className='underline cursor-pointer' onClick={() => { requestUpgrade() }}>Click here</a> to upgrade to premium.
              </span>
            )
          )}
        </div>)}
      <Box className={!isAuthorised() ? 'flex flex-col w-full h-[calc(100vh-2.8rem)] font-inter bg-[#f3f2f2]' : 'flex flex-col w-full min-h-screen font-inter bg-[#f3f2f2]'}>
        <div className='flex-row w-full flex'>
          <div className={!isAuthorised() ? 'h-[calc(100vh-4.5rem)] z-50' : 'h-[calc(100vh-1.5rem)] z-50'}>
            <Navigation />
          </div>
          <div className={!isAuthorised() ? 'w-full h-[calc(100vh-2.8rem)] overflow-auto' : 'w-full h-[calc(100vh)] overflow-auto'}>
            <Box component='main' className={!isAuthorised() ? 'w-full px-7 py-[1.2rem] z-10' : 'w-full p-7 z-10'}>
              <ProtectedRoutes />
            </Box>
          </div>
        </div>
      </Box>
    </>
  );
};

export default Main;