import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Tour, TourProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useGetUserInfoQuery, useUpdateUserInfoMutation } from '../../api/auth';
import { message } from 'antd';
import { getErrorMessage } from '../../helpers/error';
import { ADMIN_ROLE_ID, STUDENT_ROLE_ID, FACULTY_ROLE_ID } from '../../api/role';
import { getStudentSteps, getFacultySteps, getAdminSteps } from './TourSteps';

const TOUR_STEP_STORAGE_KEY = 'currentTourStep';

export default function TourComponent(): JSX.Element {
  const { data: userInfo } = useGetUserInfoQuery();
  const [updateUserInfo] = useUpdateUserInfoMutation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const savedStep = localStorage.getItem(TOUR_STEP_STORAGE_KEY); // Get the saved step from local storage if it exists
    return savedStep ? parseInt(savedStep, 10) : 0;
  });
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
        setIsOpen(true);
      }
    }
  }, [userInfo, navigate]);

  const handleTourStepChange = (step: number) => {
    setCurrentStep(step);
    localStorage.setItem(TOUR_STEP_STORAGE_KEY, step.toString());
  };

  const handleTourClose = async () => {
    if (!userInfo) return;

    setIsOpen(false);

    try {
      await updateUserInfo({
        userId: userInfo.userId,
        hasCompletedTour: true,
      }).unwrap();
      localStorage.removeItem(TOUR_STEP_STORAGE_KEY);
    } catch (error) {
      console.error(getErrorMessage(error));
      message.error('Failed to update tour completion status.');
    }
  };

  return (
    <Tour
      open={isOpen}
      onClose={handleTourClose}
      current={currentStep}
      onChange={handleTourStepChange}
      steps={roleSteps}
      disabledInteraction={true}
      mask={false}
      type="primary"
    />
  );
}
