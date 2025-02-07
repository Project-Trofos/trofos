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
  START_TOUR_BUTTON = 'start-tour-button',

  // Faculty
  CREATE_COURSE_BUTTON = 'create-course-button',
  IMPORT_CSV_BUTTON = 'import-csv-button',
  BULK_CREATE_BUTTON = 'bulk-create-button',

  // Admin
  ADMIN_TAB = 'admin-tab',
  API_KEY_TAB = 'api-key-tab',
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
    nextButtonProps: { onClick: () => navigate('/') },
  },
  {
    title: "That's it!",
    description: (
      <Space direction="vertical" size="large">
        <Row>Congratulations! You’re now ready to fully navigate and use Trofos effectively.</Row>
        <Row>
          If you need help at any time, click the "Start Tour" button to revisit this guide. Enjoy your journey with
          Trofos!
        </Row>
      </Space>
    ),
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.START_TOUR_BUTTON}]`) as HTMLElement,
    nextButtonProps: {
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate('/');
      },
    },
    prevButtonProps: { onClick: () => navigate('/project/example/sprint') },
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
    nextButtonProps: { onClick: () => navigate('/') },
  },
  {
    title: "You're ready to go!",
    description: (
      <Space direction="vertical">
        <Row>You're all set! Enjoy using Trofos to manage your courses and projects.</Row>
        <Row>If you need help at any time, click the "Start Tour" button to revisit this guide.</Row>
      </Space>
    ),
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.START_TOUR_BUTTON}]`) as HTMLElement,
    nextButtonProps: {
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate('/');
      },
    },
    prevButtonProps: { onClick: () => navigate('/course/example/overview') },
  },
];

/**
 * Returns the steps for the admin onboarding tour.
 * @param navigate the react-router-dom navigate function
 * @returns an array of steps for the onboarding tour
 */
export const getAdminSteps = (navigate: NavigateFunction): TourProps['steps'] => [
  {
    title: 'Welcome to Trofos!',
    description: (
      <Space direction="vertical" size="large">
        <Row>Welcome to the Trofos application.</Row>
        <Row>
          This is your main hub for administrative functions. You can manage courses, projects, user roles, settings,
          and more to support smooth application operations.
        </Row>
      </Space>
    ),
  },
  {
    title: 'Access the admin dashboard',
    description: 'Click the Admin tab to open the admin console and explore administrative features.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.ADMIN_TAB}]`) as HTMLElement,
    nextButtonProps: { onClick: () => navigate('/admin') },
  },
  {
    title: 'Administrative tools',
    description:
      'This dashboard allows you to perform key administrative tasks, such as managing users and roles, adjusting settings, and toggling feature flags.',
    prevButtonProps: { onClick: () => navigate('/') },
  },
  {
    title: 'API key management',
    description: 'Navigate to the API Keys tab to manage and generate API keys for integrations.',
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.API_KEY_TAB}]`) as HTMLElement,
    nextButtonProps: { onClick: () => navigate('/manage-api-key') },
  },
  {
    title: 'Generate and manage API Keys',
    description:
      'Here, you can view existing API keys or generate new ones. These keys are essential for integrating Trofos with external systems.',
    nextButtonProps: { onClick: () => navigate('/') },
    prevButtonProps: { onClick: () => navigate('/admin') },
  },
  {
    title: "You're all set!",
    description: (
      <Space direction="vertical">
        <Row>
          That's it! You are now ready to manage courses, users, and settings through the admin dashboard. Enjoy using
          Trofos!
        </Row>
        <Row>If you need help at any time, click the "Start Tour" button to revisit this guide.</Row>
      </Space>
    ),
    target: () => document.querySelector(`[${STEP_PROP}=${StepTarget.START_TOUR_BUTTON}]`) as HTMLElement,
    nextButtonProps: {
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate('/');
      },
    },
    prevButtonProps: { onClick: () => navigate('/manage-api-key') },
  },
];
