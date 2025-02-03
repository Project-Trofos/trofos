import React, { useState } from 'react';
import { Tour, TourProps } from 'antd';
import { useGetUserInfoQuery } from '../../api/auth';
import { getSteps } from './TourSteps';

export default function TourComponent(): JSX.Element {
  const { data: userInfo } = useGetUserInfoQuery();
  // Get status of the tour

  // If not yet completed:
  // Redirect to main page
  // Open tour

  // Keep track of status of tour across multiple pages
  // Store tour progress in browser localStorage
  // On page load, check if tour is in progress and resume it

  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);

  return <Tour open={isOpen} onClose={onClose} steps={getSteps(userInfo?.userRoleId)} />;
}
