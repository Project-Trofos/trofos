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
        <Row>This is your personalized dashboard.</Row>
        <Row>
          Here, you can get an overview of your assigned projects, tasks, and backlogs. It's a good starting point to
          track your progress.
        </Row>
      </Space>
    ),
  },
  {
    title: 'View courses',
    description: 'Use this tab to access and explore all your enrolled courses.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.COURSES_TAB}]`) as HTMLElement,
  },
  {
    title: 'View projects',
    description: 'Switch to the Projects tab to manage or view your active projects.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.PROJECTS_TAB}]`) as HTMLElement,
    nextButtonProps: { onClick: () => navigate('/projects') },
  },
  {
    title: 'Create or select a project',
    description:
      'Here you can view all your projects. Click on "Create Project" to start a new one or select an existing project to continue working on it.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.CREATE_PROJECT_BUTTON}]`) as HTMLElement,
    nextButtonProps: { onClick: () => navigate('/project/example/users') },
    prevButtonProps: { onClick: () => navigate('/') },
  },
  {
    title: 'View project users',
    description: 'The Users tab shows everyone involved in this project, including team members and collaborators.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.PROJECT_USERS_TAB}]`) as HTMLElement,
    nextButtonProps: { onClick: () => navigate('/project/example/sprint') },
    prevButtonProps: { onClick: () => navigate('/projects') },
  },
  {
    title: 'Manage sprints',
    description: 'Navigate to the Sprints tab to view, create, and manage your project sprints.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.PROJECT_SPRINT_TAB}]`) as HTMLElement,
    prevButtonProps: { onClick: () => navigate('/project/example/users') },
  },
  {
    title: 'Start a new sprint',
    description: 'Click "New Sprint" to define goals and tasks for your next sprint.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.NEW_SPRINT_BUTTON}]`) as HTMLElement,
  },
  {
    title: 'Add a backlog item',
    description: 'Use the "New Backlog" button to add tasks that need to be completed during this sprint.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.NEW_BACKLOG_BUTTON}]`) as HTMLElement,
  },
  {
    title: 'Start your sprint',
    description: (
      <Space direction="vertical">
        <Row>Click "Start Sprint" to begin working on your tasks.</Row>
        <Row>Assigned too many backlogs? You can always reassign them to other sprints by dragging and dropping.</Row>
      </Space>
    ),
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.START_SPRINT_BUTTON}]`) as HTMLElement,
  },
  {
    title: 'Complete the sprint',
    description: 'When all tasks are finished or the sprint ends, click "Complete Sprint" to close it.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.COMPLETE_SPRINT_BUTTON}]`) as HTMLElement,
  },
  {
    title: 'Review retrospective',
    description: 'Navigate to the Retrospective tab to document and review lessons learned from the sprint.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.RETROSPECTIVE_TAB}]`) as HTMLElement,
  },
  {
    title: "That's it!",
    description: 'Congratulations! You’re now ready to fully navigate and use Trofos effectively.',
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
        <Row>Welcome to the Trofos application.</Row>
        <Row>
          This is your central hub where you can manage all the courses and projects you're responsible for. Use this
          page to get an overview of your ongoing work and tasks.
        </Row>
      </Space>
    ),
  },
  {
    title: 'Access your courses',
    description: "Click here to navigate to the courses you're currently teaching.",
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.COURSES_TAB}]`) as HTMLElement,
    nextButtonProps: { onClick: () => navigate('/courses') },
  },

  {
    title: 'Course management',
    description:
      'Here, you’ll find a list of your courses. You can select an existing course or create a new one by clicking the "Create Course" button.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.CREATE_COURSE_BUTTON}]`) as HTMLElement,
    nextButtonProps: { onClick: () => navigate('/course/example/overview') },
    prevButtonProps: { onClick: () => navigate('/') },
  },
  {
    title: 'Course overview',
    description:
      'This page gives you a summary of your course, including announcements, milestones, and related projects.',
    prevButtonProps: { onClick: () => navigate('/courses') },
  },
  {
    title: 'Import CSV Data',
    description: (
      <Space direction="vertical" size="large">
        <Row>
          Use the "Import CSV Data" button to quickly create multiple projects and assign users to them for your course.
          This is especially useful for large classes with pre-planned project allocations.
        </Row>
        <Row>IMPORTANT: Be sure to download and follow the CSV template format before importing data!</Row>
      </Space>
    ),
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.IMPORT_CSV_BUTTON}]`) as HTMLElement,
  },
  {
    title: 'Bulk create projects',
    description:
      'Alternatively, you can bulk create projects using the "Bulk Create" button. This option is great for randomly assigning students to projects.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.BULK_CREATE_BUTTON}]`) as HTMLElement,
  },
  {
    title: "You're ready to go!",
    description: (
      <Space direction="vertical">
        <Row>You're all set! Enjoy using Trofos to manage your courses and projects.</Row>
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
