import { TourProps, Row, Space } from 'antd';
import { NavigateFunction } from 'react-router-dom';

// The data-tour attribute is used to target specific elements in the application
export const STEP_PROP = 'data-tour';

// Enum for tour step targets
export enum StepTarget {
  // Student
  COURSES_TAB = 'courses-tab',
  PROJECTS_TAB = 'projects-tab',
  CREATE_PROJECT_BUTTON = 'create-project-button',
  PROJECT_USERS_TAB = 'project-users-tab',
  PROJECT_SPRINT_TAB = 'project-sprint-tab',
  NEW_SPRINT_BUTTON = 'new-sprint-button',
  NEW_BACKLOG_BUTTON = 'new-backlog-button',
  START_SPRINT_BUTTON = 'start-sprint-button',
  COMPLETE_SPRINT_BUTTON = 'complete-sprint-button',
  RETROSPECTIVE_TAB = 'retrospective-tab',

  // Faculty
  CREATE_COURSE_BUTTON = 'create-course-button',
  IMPORT_CSV_BUTTON = 'import-csv-button',
  BULK_CREATE_BUTTON = 'bulk-create-button',

  // Admin
  ADMIN_MENU = 'admin-menu',
}

/**
 * Returns the steps for the student onboarding tour.
 * @param navigate the react-router-dom navigate function
 * @returns an array of steps for the onboarding tour
 */
export const getStudentSteps = (navigate: NavigateFunction): TourProps['steps'] => [
  {
    title: 'Welcome to Trofos!',
    description: (
      <Space direction="vertical" size="large">
        <Row>This is the home page of the application.</Row>
        <Row>
          This is where you can view your personalized statistics, projects, and assigned backlogs. It's a great place
          to start when you're looking for an overview of your current work.
        </Row>
      </Space>
    ),
  },
  {
    title: 'View courses',
    description: 'Navigate to your courses from this menu.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.COURSES_TAB}]`) as HTMLElement,
  },
  {
    title: 'View projects',
    description: 'Navigate to your projects from this menu.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.PROJECTS_TAB}]`) as HTMLElement,
    nextButtonProps: { onClick: () => navigate('/projects') },
  },
  {
    title: 'Your projects',
    description:
      'A list of your projects will be displayed here. You can either select an existing project or create a new one by clicking on the "Create Project" button.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.CREATE_PROJECT_BUTTON}]`) as HTMLElement,
    nextButtonProps: { onClick: () => navigate('/project/example/users') },
    prevButtonProps: { onClick: () => navigate('/') },
  },
  {
    title: 'View project users',
    description: 'Navigate to the Users tab to view all people in the project.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.PROJECT_USERS_TAB}]`) as HTMLElement,
    nextButtonProps: { onClick: () => navigate('/project/example/sprint') },
    prevButtonProps: { onClick: () => navigate('/projects') },
  },
  {
    title: 'View project sprints',
    description: 'Navigate to the Sprint tab to view all project sprints.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.PROJECT_SPRINT_TAB}]`) as HTMLElement,
    prevButtonProps: { onClick: () => navigate('/project/example/users') },
  },
  {
    title: 'Start a new sprint',
    description: 'Create a new sprint by clicking on the "New Sprint" button.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.NEW_SPRINT_BUTTON}]`) as HTMLElement,
  },
  {
    title: 'Create a new backlog',
    description: 'Create a new backlog for your sprint by clicking on the "New Backlog" button.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.NEW_BACKLOG_BUTTON}]`) as HTMLElement,
  },
  {
    title: 'Begin your sprint',
    description:
      'Start your sprint by clicking on the "Start Sprint" button and begin completing the assigned backlogs.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.START_SPRINT_BUTTON}]`) as HTMLElement,
  },
  {
    title: 'Complete your sprint',
    description: (
      <Space direction="vertical">
        <Row>Complete your current sprint by either:</Row>
        <Row>1. Clicking the "Complete Sprint" button.</Row>
        <Row>2. Dragging and dropping to the "Completed Sprints" area below.</Row>
      </Space>
    ),
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.COMPLETE_SPRINT_BUTTON}]`) as HTMLElement,
  },
  {
    title: 'Finish your sprint',
    description: 'Complete the post-sprint retrospective by navigating to the Retrospective tab.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.RETROSPECTIVE_TAB}]`) as HTMLElement,
  },
  {
    title: "That's it!",
    description: (
      <Space direction="vertical">
        <Row>You're all set to start using Trofos. Enjoy your experience!</Row>
      </Space>
    ),
    nextButtonProps: {
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate('/');
      },
    },
  },
];

/**
 * Returns the steps for the faculty onboarding tour.
 * @param navigate the react-router-dom navigate function
 * @returns an array of steps for the onboarding tour
 */
export const getFacultySteps = (navigate: NavigateFunction): TourProps['steps'] => [
  {
    title: 'Welcome to Trofos!',
    description: (
      <Space direction="vertical" size="large">
        <Row>This is the home page of the application.</Row>
        <Row>
          This is where you can view all courses and projects you are in charge of. It's a great place to start when
          you're looking for an overview of your current work.
        </Row>
      </Space>
    ),
  },
  {
    title: 'View courses',
    description: 'Navigate to your courses from this menu.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.COURSES_TAB}]`) as HTMLElement,
    nextButtonProps: { onClick: () => navigate('/courses') },
  },

  {
    title: 'Your courses',
    description:
      'A list of your courses will be displayed here. You can either select an existing course or create a new one by clicking on the "Create Course" button.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.CREATE_COURSE_BUTTON}]`) as HTMLElement,
    nextButtonProps: { onClick: () => navigate('/course/example/overview') },
    prevButtonProps: { onClick: () => navigate('/') },
  },
  {
    title: 'Course Overview',
    description: 'View an overview of the course, including announcements, milestones and associated projects.',
    prevButtonProps: { onClick: () => navigate('/courses') },
  },
  {
    title: 'Import CSV Data',
    description: (
      <Space direction="vertical" size="large">
        <Row>
          Click on the "Import CSV Data" button to quickly create projects and assign users for the course. This feature
          is useful for large classes where you know the project allocations in advance.
        </Row>
        <Row>IMPORTANT: Download the csv template and follow the correct csv format before importing!</Row>
      </Space>
    ),
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.IMPORT_CSV_BUTTON}]`) as HTMLElement,
  },
  {
    title: 'Bulk create projects',
    description:
      'Alternatively, you can also create projects in bulk by clicking on the "Bulk Create" button. This feature is useful when you want to randomly allocate students to projects.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.BULK_CREATE_BUTTON}]`) as HTMLElement,
  },
  {
    title: "That's it!",
    description: (
      <Space direction="vertical">
        <Row>You're all set to start using Trofos. Enjoy your experience!</Row>
      </Space>
    ),
    nextButtonProps: {
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate('/');
      },
    },
  },
];

/**
 * Returns the steps for the admin onboarding tour.
 * @param navigate the react-router-dom navigate function
 * @returns an array of steps for the onboarding tour
 */
export const getAdminSteps = (navigate: NavigateFunction): TourProps['steps'] => [
  {
    title: 'Admin Dashboard',
    description:
      'This dashboard gives you an overview of platform activity, including user statistics and system metrics.',
    // target: () => document.getElementById('admin-dashboard') as HTMLElement,
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.ADMIN_MENU}]`) as HTMLElement,
    nextButtonProps: { onClick: () => navigate('/admin') },
  },
  {
    title: 'User Management',
    description: 'Manage platform users here. You can add, remove, or modify user information and roles.',
    // target: () => document.getElementById('user-management') as HTMLElement,
    prevButtonProps: { onClick: () => navigate('/') },
  },
  {
    title: 'Reports and Analytics',
    description: 'View detailed reports on application usage, performance metrics, and activity logs.',
    // target: () => document.getElementById('reports-section') as HTMLElement,
  },
  {
    title: 'Settings',
    description: 'Configure system-wide settings, including application preferences and security options.',
    // target: () => document.getElementById('settings-section') as HTMLElement,
  },
  {
    title: 'Notifications Panel',
    description: 'Keep track of important alerts and announcements from this panel.',
    // target: () => document.getElementById('notifications-panel') as HTMLElement,
  },
];
