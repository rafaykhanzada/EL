
import { Card, CardHeader, CardContent, Divider, List, ListItem, ListItemIcon, ListItemText, Typography, Button } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import React from 'react';

const features = [
  "Free text search for cases.",
  "Access to all pages in all searches.",
  "Download and view All statute documents.",
  "10 save search selection are allowed.",
  "Bookmark unlimited Case judgments."
];
const SubscriptionCard = () => {

  return (
    <div className='flex flex-col rounded-xl gap-2 bg-stone-50 border border-slate-300 shadow-lg p-4'>
      <div className='rounded-t-md flex flex-col p-4 gap-3'>
        <p>Monthly Subscription</p>
        <p className='text-md font-normal'><b className='text-2xl'>Rs. 8000</b>/month</p>
      </div>
      <Divider />
      <div className='px-3'>
        {features.map((feature, index) => (
          <div key={index} className='flex flex-row text-sm items-center my-3 gap-3 font-normal'>
            <CheckCircle className='text-green-500' />
            <p >{feature}</p>
          </div>
        ))}
      </div>
      <div className='p-3'>
        <Button color='primary' variant='contained' className='w-full'>Subscribe</Button>
      </div>
    </div>
  );
}

export default SubscriptionCard;