import { Box, Tab, Tabs, Typography } from "@mui/material";
import React from "react";
import SubscriptionPackages from "./SubscriptionPackages";
import { useLocation, useNavigate } from "react-router-dom";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tab-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tab-${index}`,
  };
}
const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [selectedTab, setSelectedTab] = React.useState('subscriptions');
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row justify-between bg-white items-center w-full text-lg font-bold p-4 rounded-xl shadow-xl">
        <div className="flex flex-row gap-1">
          {/* <span className={
            selectedTab === 'profileSettings' ? "text-white py-2 px-4 rounded-md shadow cursor-pointer min-w-max text-center bg-[#6c5dd3]"
              : "bg-white py-2 px-4 min-w-max text-center text-[#6c5dd3] cursor-pointer"}
            onClick={() => {
              searchParams.set('selectedTab', 'profileSettings');
              navigate({ search: searchParams.toString() }); setSelectedTab('profileSettings')
            }}>
            Profile Settings
          </span> */}
          <span className={
            selectedTab === 'subscriptions' ? "text-white py-2 px-4 rounded-md shadow cursor-pointer min-w-max text-center bg-[#6c5dd3]"
              : "bg-white py-2 px-4 min-w-max text-center text-[#6c5dd3] cursor-pointer"}
            onClick={() => {
              searchParams.set('selectedTab', 'subscriptions');
              navigate({ search: searchParams.toString() }); setSelectedTab('subscriptions')
            }}>
            Subscriptions
          </span>
        </div>
      </div>
      {
        selectedTab === 'subscriptions' && (
          <div className="flex flex-col bg-white w-full text-lg font-bold p-4 rounded-xl shadow-xl">
            <SubscriptionPackages />
          </div>
        )
      }
    </div>
  );
}

export default Settings;