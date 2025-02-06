import { ProjectData, CourseData, User, Backlog, Project } from '../../api/types';
import { Sprint } from '../../api/sprint';

export const exampleProject: ProjectData = {
  id: 1,
  pname: 'Example Agile Project',
  pkey: 'EXP123',
  description: 'A sample project for demonstration and onboarding purposes.',
  course_id: 1,
  public: true,
  created_at: '2025-01-01T10:00:00Z',
  course: {
    id: 1,
    code: 'CS101',
    startYear: 2024,
    startSem: 1,
    endYear: 2024,
    endSem: 2,
    cname: 'Introduction to Agile Methodologies',
    description: 'A beginner-friendly course on agile practices.',
    public: true,
    created_at: '2024-08-01T12:00:00Z',
    shadow_course: false,
    is_archive: false,
  },
  is_archive: false,
  users: [
    {
      user: {
        user_id: 101,
        user_email: 'student1@example.edu',
        user_display_name: 'Alice Johnson',
        courses: [],
      },
    },
    {
      user: {
        user_id: 102,
        user_email: 'faculty1@example.edu',
        user_display_name: 'Dr. Bob Smith',
        courses: [],
      },
    },
  ],
  sprints: [
    { id: 1, name: 'Sprint 1: Planning' },
    { id: 2, name: 'Sprint 2: Execution' },
  ],
  backlogStatuses: [
    { name: 'To Do', type: 'todo', order: 1 },
    { name: 'In Progress', type: 'in_progress', order: 2 },
    { name: 'Done', type: 'done', order: 3 },
  ],
  telegramChannelLink: 'https://t.me/exampleproject',
  owner_id: 101,
};

export const exampleUsers: User[] = [
  {
    user_email: 'student1@example.edu',
    user_display_name: 'Alice Johnson',
    user_id: 101,
    projects: [exampleProject],
    courses: [],
    basicRoles: [],
  },
  {
    user_email: 'faculty1@example.edu',
    user_display_name: 'Dr. Bob Smith',
    user_id: 102,
    projects: [],
    courses: [],
    basicRoles: [],
  },
];

export const exampleBacklog: Backlog[] = [
  {
    backlog_id: 1,
    summary: 'Create project overview',
    type: 'story',
    priority: 'high',
    reporter_id: 101,
    assignee_id: 101,
    sprint_id: 1,
    points: 5,
    description: 'Design and implement the project overview page.',
    project_id: 1,
    status: 'To do',
    assignee: {
      created_at: '2025-01-01T12:00:00Z',
      project_id: 1,
      user_id: 101,
      user: {
        user_email: 'student1@example.edu',
        user_display_name: 'Alice Johnson',
      },
    },
  },
];

export const exampleSprints: Sprint[] = [
  {
    id: 1,
    name: 'Sprint 1: Planning and Setup',
    duration: 14,
    goals: 'Define project scope and setup environment.',
    start_date: '2025-02-01',
    end_date: '2025-02-14',
    project_id: 1,
    status: 'completed',
    backlogs: [
      {
        backlog_id: 1,
        summary: 'Set up project environment',
        type: 'task',
        priority: 'high',
        reporter_id: 101,
        assignee_id: 101,
        sprint_id: 1,
        points: 3,
        description: 'Initialize project repository and configure CI/CD pipelines.',
        project_id: 1,
        status: 'Done',
        assignee: {
          created_at: '2025-02-01',
          project_id: 1,
          user_id: 101,
          user: {
            user_email: 'student1@example.edu',
            user_display_name: 'Alice Johnson',
          },
        },
      },
    ],
  },
  {
    id: 2,
    name: 'Sprint 2: Feature Development',
    duration: 14,
    goals: 'Implement core features of the application.',
    start_date: '2025-02-15',
    end_date: '2025-02-28',
    project_id: 1,
    status: 'current',
    backlogs: [
      {
        backlog_id: 2,
        summary: 'Develop user login feature',
        type: 'story',
        priority: 'medium',
        reporter_id: 102,
        assignee_id: 101,
        sprint_id: 2,
        points: 8,
        description: 'Create login UI and backend authentication service.',
        project_id: 1,
        status: 'In Progress',
        assignee: {
          created_at: '2025-02-15',
          project_id: 1,
          user_id: 101,
          user: {
            user_email: 'student1@example.edu',
            user_display_name: 'Alice Johnson',
          },
        },
      },
    ],
  },
  {
    id: 3,
    name: 'Sprint 3: Testing and Bug Fixes',
    duration: 14,
    goals: 'Thorough testing and resolving issues.',
    start_date: '2025-03-01',
    end_date: '2025-03-14',
    project_id: 1,
    status: 'upcoming',
    backlogs: [],
  },
];

export const exampleCourse: CourseData = {
  id: 1,
  code: 'CS101',
  startYear: 2024,
  startSem: 1,
  endYear: 2024,
  endSem: 2,
  cname: 'Introduction to Agile Methodologies',
  description: 'A beginner-friendly course on agile practices and project management principles.',
  public: true,
  created_at: '2024-08-01T12:00:00Z',
  shadow_course: false,
  is_archive: false,
  milestones: [
    {
      id: 1,
      name: 'Milestone 1: Project Proposal',
      start_date: '2024-09-01',
      deadline: '2024-09-15',
      course_id: 1,
      created_at: '2024-08-20T10:00:00Z',
    },
    {
      id: 2,
      name: 'Milestone 2: Sprint 1 Review',
      start_date: '2024-10-01',
      deadline: '2024-10-10',
      course_id: 1,
      created_at: '2024-09-25T10:00:00Z',
    },
  ],
  announcements: [
    {
      id: 1,
      title: 'Welcome to CS101!',
      content: 'Our first class will cover agile fundamentals. Please review the syllabus.',
      user_id: 101,
      created_at: '2024-08-01T15:00:00Z',
    },
    {
      id: 2,
      title: 'Milestone 1 Submission Reminder',
      content: "Don't forget to submit your project proposal by the deadline.",
      user_id: 101,
      created_at: '2024-09-10T10:00:00Z',
    },
  ],
  users: [
    {
      user: {
        user_id: 101,
        user_email: 'student1@example.edu',
        user_display_name: 'Alice Johnson',
        courses: [],
      },
    },
    {
      user: {
        user_id: 102,
        user_email: 'faculty1@example.edu',
        user_display_name: 'Dr. Bob Smith',
        courses: [],
      },
    },
  ],
};

export const exampleProjects: Project[] = [
  {
    id: 1,
    pname: 'Agile Learning Platform',
    pkey: 'ALP101',
    description: 'A platform to help students learn agile methodologies through interactive content.',
    course_id: 1,
    public: true,
    created_at: '2024-09-01T10:00:00Z',
    is_archive: false,
  },
  {
    id: 2,
    pname: 'Project Tracker App',
    pkey: 'PTA202',
    description: 'A simple tool to track project progress and manage agile sprints effectively.',
    course_id: 1,
    public: false,
    created_at: '2024-09-10T11:00:00Z',
    is_archive: false,
  },
  {
    id: 3,
    pname: 'Scrum Management Tool',
    pkey: 'SMT303',
    description: 'A tool to help agile teams visualize workflows and manage Scrum events.',
    course_id: 1,
    public: true,
    created_at: '2024-09-20T13:00:00Z',
    is_archive: false,
  },
];
