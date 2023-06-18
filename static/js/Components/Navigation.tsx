// React import
import React, { useEffect, useState } from 'react';


// Material imports
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

// Router import
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Dialog, DialogContent, IconButton } from '@mui/material';

import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { logout } from '../services/auth.service';
import { AccountCircle, Balance, Domain, Gavel, Home, ReportGmailerrorred, SupervisedUserCircleSharp, VerifiedUser, Work } from '@mui/icons-material';
import ReportProblem from '../Containers/ReportProblem';
import { decryptString, isAdmin } from '../app.utils';
import UserManagement from '../Containers/UserManagement';
import OrganizationManagement from '../Containers/OrganizationManagement';


export const NavigationMap: { [key: string]: string } = {
  '/home': 'home',
  '/cases': 'cases',
  '/home/search-result': 'home',
  '/cases/judgment': 'cases',
  '/departments': 'departments',
  '/judges': 'judges',
  '/statutes': 'statutes',
  '/statutes/:id': 'statutes',
};

const Navigation = () => {
  let navigate = useNavigate();
  let location = useLocation();

  const NavigationItemsList = [
    {
      name: 'home',
      path: '/home',
      icon: (<Home />)
    },
    {
      name: 'cases',
      path: '/cases',
      icon: (<Work />)
    },
    {
      name: 'judges',
      path: '/judges',
      icon: (<Gavel />)
    },
    {
      name: 'departments',
      path: '/departments',
      icon: (<Domain />)
    },
    {
      name: 'statutes',
      path: '/statutes',
      icon: (<Balance />)
    },
  ];

  // Manages selectedScreen state
  const [selectedScreen, setSelectedScreen] = useState(
    NavigationMap[location.pathname]
  );

  /**
   * Toggles selected screen flag
   * @param {string} screen
   * @returns {boolean}
   */
  const isSelected = (screen: string) => screen === selectedScreen;

  useEffect(() => {
    if (location.pathname.includes('judgement')) {
      setSelectedScreen(NavigationMap['/cases']);
    } else {
      setSelectedScreen(NavigationMap[location.pathname]);
    }
  }, [selectedScreen, navigate, location]);


  const [openReportProblemDialog, setOpenReportProblemDialog] = useState(false);
  const [openUserManagementDialog, setOpenUserManagementDialog] = useState(false);
  const [openOrganizationManagementDialog, setOpenOrganizationManagementDialog] = useState(false);

  const handleClose = () => {
    if (openReportProblemDialog) {
      setOpenReportProblemDialog(false);
    }
    if (openUserManagementDialog) {
      setOpenUserManagementDialog(false);
    }
    if (openOrganizationManagementDialog) {
      setOpenOrganizationManagementDialog(false)
    }
  };

  return (
    <main className='bg-black opacity-90 rounded-xl drop-shadow-lg text-white h-full mt-3 ml-4 w-[12.5rem] z-50'>
      <List className='h-full w-full'>
        <div className='flex flex-col h-full w-full justify-between'>
          <div className='flex flex-col w-full'>
            <ListItem className='flex flex-col'>
              <img className='w-20 h-20 rounded-full' src={require("../assets/landing/logo.svg").default} alt="EastLaw" />
              <p className='text-[#6c5dd3] font-bold text-xl mt-1'>EastLaw</p>
            </ListItem>
            <div className='mt-2 w-full'>
              {NavigationItemsList.map((navItem) => (
                <ListItem
                  key={navItem.name}
                  onClick={() => {
                    navigate(navItem.path);
                  }}>
                  <div className={'flex flex-row items-center gap-2 px-2 py-2 cursor-pointer rounded-md w-[10rem]' + (isSelected(navItem.name) ? ' bg-[#6b57ea] text-white font-bold' : 'font-semibold')}>
                    {navItem.icon}
                    <p className='capitalize'>{navItem.name}</p>
                    <p>{isSelected(navItem.name)}</p>
                  </div>
                </ListItem>
              ))}
            </div>
          </div>
          <div className='mb-5 ml-1'>
            <ListItem
              className='min-w-[12rem]'
              key='Profile'
            >
              <Button variant="text" startIcon={<AccountCircle />}>
                <div className='flex flex-col justify-start items-start'>
                  <p className='text-[#6c5dd3] font-semibold max-w-[7rem] truncate'>
                    {decryptString(localStorage.getItem('username'))}
                  </p>
                  <p className='bg-[#6c5dd3] text-white rounded-md px-2 text-sm font-semibold shadow-xl capitalize'>
                    {decryptString(localStorage.getItem('role'))}
                  </p>
                </div>
              </Button>
            </ListItem>
            {isAdmin() && (
              <ListItem
                className='min-w-[15rem]'
                key='userManagement'>
                <Button variant="text" onClick={() => setOpenUserManagementDialog(true)} sx={{
                  color: '#6c5dd3',
                  fontWeight: '700',
                }} startIcon={<SupervisedUserCircleSharp />}>
                  User Management
                </Button>
              </ListItem>
            )}
            {isAdmin() && (
              <ListItem
                className='min-w-[12rem]'
                key='organizationManagement'>
              <Button variant="text" onClick={() => setOpenOrganizationManagementDialog(true)} sx={{
                color: '#6c5dd3',
                fontWeight: '700',
              }} startIcon={<Domain />}>
                Org Management
              </Button>
              </ListItem>
            )}
            <ListItem
              className='min-w-[12rem]'
              key='reportProb'
            >
              <Button variant="text" onClick={() => setOpenReportProblemDialog(true)} sx={{
                color: '#6c5dd3',
                fontWeight: '700',
              }} startIcon={<ReportGmailerrorred />}>
                Report Problem
              </Button>
            </ListItem>
            <ListItem
              key='logout'
            >
              <Button variant="text" onClick={() => { logout() }} sx={{
                color: '#6c5dd3',
                fontWeight: '700',
              }} startIcon={<PowerSettingsNewIcon />}>
                Logout
              </Button>
            </ListItem>

          </div>
        </div>
      </List>
      <ReportProblem open={openReportProblemDialog} onClose={handleClose} />
      {isAdmin() && (<UserManagement open={openUserManagementDialog} onClose={handleClose} />)}
      {isAdmin() && (<OrganizationManagement open={openOrganizationManagementDialog} onClose={handleClose} />)}
    </main>
  );
};

export default Navigation;