import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Tour, TourProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useGetUserInfoQuery, useUpdateUserInfoMutation } from '../../api/auth';
import { message } from 'antd';
import { getErrorMessage } from '../../helpers/error';
import { ADMIN_ROLE_ID, STUDENT_ROLE_ID, FACULTY_ROLE_ID } from '../../api/role';
import { getStudentSteps, getFacultySteps, getAdminSteps } from './TourSteps';
import { useTourContext } from './TourProvider';

export default function TourComponent(): JSX.Element {
  const { data: userInfo } = useGetUserInfoQuery();
  const { isTourOpen, startTour, endTour } = useTourContext();
  const [updateUserInfo] = useUpdateUserInfoMutation();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(0);
  const isFirstRender = useRef(true);

  const roleSteps = useMemo<TourProps['steps']>(() => {
    switch (userInfo?.userRoleId) {
      case ADMIN_ROLE_ID:
        return getAdminSteps(navigate);
      case STUDENT_ROLE_ID:
        return getStudentSteps(navigate);
      case FACULTY_ROLE_ID:
        return getFacultySteps(navigate);
      default:
        return [];
    }
  }, [navigate, userInfo?.userRoleId]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // Mark as already checked
      if (userInfo?.hasCompletedTour === false) {
        navigate('/'); // Redirect to the main page
        startTour(); // Start the tour
      }
    }
  }, [userInfo, navigate]);

  const handleTourClose = async () => {
    if (!userInfo) return;

    endTour();

    try {
      await updateUserInfo({
        userId: userInfo.userId,
        hasCompletedTour: true,
      }).unwrap();
      setCurrentStep(0);
    } catch (error) {
      console.error(getErrorMessage(error));
      message.error('Failed to update tour completion status.');
    }
  };

  return (
    <Tour
      open={isTourOpen}
      onClose={handleTourClose}
      current={currentStep}
      onChange={setCurrentStep}
      steps={roleSteps}
      disabledInteraction={true}
      mask={false}
      type="primary"
    />
  );
}
