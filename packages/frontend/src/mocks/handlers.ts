/* eslint-disable import/no-extraneous-dependencies */
import { rest } from 'msw';
import { STUDENT_ROLE_ID } from '../api/role';
import { Sprint, SprintWithBacklogs } from '../api/sprint';
import { BacklogHistory, BacklogHistoryType, CourseData, ProjectData, UserOnRolesOnCourse } from '../api/types';

const BASE_URL = 'http://localhost:3001/api';
const NUSMODS_URL = 'https://api.nusmods.com/v2/2022-2023/moduleList.json';

export const MSW_COURSE: CourseData = {
  id: 1,
  code: 'CS3203',
  cname: 'Software Engineering Project',
  startYear: 2022,
  endYear: 2022,
  startSem: 1,
  endSem: 1,
  description: null,
  shadow_course: false,
  is_archive: false,
  milestones: [
    {
      id: 1,
      name: 'Milestone 1',
      course_id: 1,
      start_date: '2022-12-31',
      deadline: '2022-01-09',
      created_at: '2021-12-18',
    },
    {
      id: 2,
      name: 'Milestone 2',
      course_id: 1,
      start_date: '2022-01-10',
      deadline: '2022-01-19',
      created_at: '2021-12-18',
    },
    {
      id: 3,
      name: 'Milestone 3',
      course_id: 1,
      start_date: '2022-01-20',
      deadline: '2022-01-30',
      created_at: '2021-12-18',
    },
  ],
  announcements: [
    {
      id: 1,
      user_id: 1,
      title: 'ANNOUNCEMENT_TITLE',
      content: 'ANNOUNCEMENT_CONTENT',
      created_at: '2022-09-14',
      updated_at: '2022-09-15',
    },
  ],
  users: [],
  public: false,
  created_at: '2022-09-14T03:33:34.960Z',
};

const NUSMODS_MODULE = {
  moduleCode: 'EL1101E',
  title: 'The Nature of Language',
  semesters: [1, 2],
};

export const MSW_BACKLOG_HISTORY: BacklogHistory[] = [
  {
    project_id: 1,
    backlog_id: 1,
    sprint_id: null,
    history_type: BacklogHistoryType.CREATE,
    type: 'task',
    priority: null,
    reporter_id: 1,
    assignee_id: null,
    points: null,
    status: 'To do',
    date: '2023-02-07T12:01:46.884Z',
  },
  {
    project_id: 1,
    backlog_id: 2,
    sprint_id: null,
    history_type: BacklogHistoryType.CREATE,
    type: 'task',
    priority: null,
    reporter_id: 1,
    assignee_id: null,
    points: null,
    status: 'To do',
    date: '2023-02-07T12:02:03.952Z',
  },
  {
    project_id: 1,
    backlog_id: 3,
    sprint_id: 4,
    history_type: BacklogHistoryType.CREATE,
    type: 'bug',
    priority: null,
    reporter_id: 1,
    assignee_id: null,
    points: null,
    status: 'To do',
    date: '2023-02-07T12:02:17.572Z',
  },
  {
    project_id: 1,
    backlog_id: 2,
    sprint_id: 2,
    history_type: BacklogHistoryType.UPDATE,
    type: 'task',
    priority: null,
    reporter_id: 1,
    assignee_id: null,
    points: null,
    status: 'To do',
    date: '2023-02-07T12:02:20.586Z',
  },
  {
    project_id: 1,
    backlog_id: 4,
    sprint_id: null,
    history_type: BacklogHistoryType.CREATE,
    type: 'task',
    priority: null,
    reporter_id: 1,
    assignee_id: null,
    points: null,
    status: 'To do',
    date: '2023-02-07T12:02:50.500Z',
  },
  {
    project_id: 1,
    backlog_id: 4,
    sprint_id: 3,
    history_type: BacklogHistoryType.UPDATE,
    type: 'task',
    priority: null,
    reporter_id: 1,
    assignee_id: null,
    points: null,
    status: 'To do',
    date: '2023-02-07T12:02:55.022Z',
  },
];

export const MSW_SPRINT: Sprint[] = [
  {
    id: 2,
    name: 'Sprint 1',
    duration: 1,
    start_date: '2023-02-01T11:43:08.000Z',
    end_date: '2023-02-02T11:43:08.000Z',
    project_id: 1,
    goals: null,
    status: 'closed',
    backlogs: [],
  },
  {
    id: 3,
    name: 'Sprint 2',
    duration: 1,
    start_date: '2023-02-02T11:43:08.000Z',
    end_date: '2023-02-03T11:43:08.000Z',
    project_id: 1,
    goals: null,
    status: 'current',
    backlogs: [
      {
        backlog_id: 2,
        summary: 's1',
        type: 'task',
        sprint_id: 3,
        priority: 'medium',
        reporter_id: 1,
        assignee_id: 1,
        project_id: 1,
        points: 2,
        description: null,
        status: 'In progress',
        assignee: {
          project_id: 1,
          user_id: 1,
          created_at: '2023-02-01T11:22:33.172Z',
          user: {
            user_display_name: 'User 1',
            user_email: 'testUser@test.com',
          },
        },
      },
      {
        backlog_id: 4,
        summary: 's2',
        type: 'task',
        sprint_id: 3,
        priority: null,
        reporter_id: 1,
        assignee_id: 1,
        project_id: 1,
        points: 3,
        description: null,
        status: 'Done',
        assignee: {
          project_id: 1,
          user_id: 1,
          created_at: '2023-02-01T11:22:33.172Z',
          user: {
            user_display_name: 'User 1',
            user_email: 'testUser@test.com',
          },
        },
      },
      {
        backlog_id: 3,
        summary: 's3',
        type: 'bug',
        sprint_id: 3,
        priority: null,
        reporter_id: 1,
        assignee_id: null,
        project_id: 1,
        points: 10,
        description: 'ssss',
        status: 'Done',
        assignee: null,
      },
    ],
  },
];

export const MSW_PROJECT: ProjectData = {
  id: 1,
  pname: 'project1',
  pkey: null,
  description: 'project1_description',
  course_id: 1,
  public: false,
  created_at: '2022-09-15T01:58:01.735Z',
  course: MSW_COURSE,
  backlogStatuses: [],
  sprints: MSW_SPRINT,
  telegramChannelLink: '',
  users: [
    {
      user: {
        courses: [],
        user_display_name: 'User 1',
        user_email: 'test@test.com',
        user_id: 1,
      },
    },
  ],
  is_archive: null,
  owner_id: null,
};

export const MSW_PROJECT_BY_ID: ProjectData = {
  id: 1,
  pname: 'project1',
  pkey: null,
  description: 'project1_description',
  course_id: 1,
  public: false,
  created_at: '2022-09-15T01:58:01.735Z',
  course: MSW_COURSE,
  backlogStatuses: [],
  sprints: [
    {
      id: 4,
      name: 'TestSprint x',
    },
    {
      id: 5,
      name: 'TestSprint last',
    },
    {
      id: 3,
      name: 'TestSprint 3',
    },
    {
      id: 1,
      name: 'TestSprint 1',
    },
  ],
  telegramChannelLink: '',
  users: [
    {
      user: {
        courses: [],
        user_display_name: 'User 1',
        user_email: 'test@test.com',
        user_id: 1,
      },
    },
  ],
  is_archive: null,
  owner_id: null,
};

export const MSW_COURSE_ROLES: UserOnRolesOnCourse[] = [
  {
    course_id: 1,
    id: 1,
    role: {
      id: STUDENT_ROLE_ID,
      role_name: 'STUDENT',
    },
    role_id: STUDENT_ROLE_ID,
    user_id: 1,
  },
];

export const MSW_SPRINT_WITH_BACKLOGS: SprintWithBacklogs = {
  sprints: [
    {
      id: 4,
      name: 'TestSprint x',
      duration: 2,
      start_date: '2024-08-23T03:12:33.000Z',
      end_date: '2024-09-06T03:12:33.000Z',
      project_id: 56,
      goals: '',
      status: 'closed',
      backlogs: [],
    },
    {
      id: 5,
      name: 'TestSprint last',
      duration: 2,
      start_date: '2024-08-23T03:12:33.000Z',
      end_date: '2024-09-06T03:12:33.000Z',
      project_id: 56,
      goals: '',
      status: 'closed',
      backlogs: [],
    },
    {
      id: 3,
      name: 'TestSprint 3',
      duration: 2,
      start_date: '2024-08-23T03:12:33.000Z',
      end_date: '2024-09-06T03:12:33.000Z',
      project_id: 56,
      goals: '',
      status: 'closed',
      backlogs: [],
    },
    {
      id: 1,
      name: 'TestSprint 1',
      duration: 2,
      start_date: '2024-08-23T03:12:33.000Z',
      end_date: '2024-09-06T03:12:33.000Z',
      project_id: 56,
      goals: '',
      status: 'closed',
      backlogs: [],
    },
  ],
  unassignedBacklogs: [],
};

const handlers = [
  // Handles POST on /project/list
  rest.post(`${BASE_URL}/project/list`, (req, res, ctx) => res(ctx.status(200), ctx.body(JSON.stringify({
    data: [MSW_PROJECT],
    totalCount: 1
  })))),

  // Handles GET on /project/:id
  rest.get(`${BASE_URL}/project/:id`, (req, res, ctx) =>
    res(ctx.status(200), ctx.body(JSON.stringify(MSW_PROJECT_BY_ID))),
  ),

  // Handles POST on /course/list
  rest.post(`${BASE_URL}/course/list`, (req, res, ctx) => res(ctx.status(200), ctx.body(JSON.stringify({
    data: [MSW_COURSE],
    totalCounut: 1
  })))),

  // Handles GET to NUSMODS
  rest.get(NUSMODS_URL, (req, res, ctx) => res(ctx.status(200), ctx.body(JSON.stringify([NUSMODS_MODULE])))),

  // Handles POST on /project
  rest.post(`${BASE_URL}/project/`, (req, res, ctx) => res(ctx.status(200), ctx.body(JSON.stringify({})))),

  // Handles POST on /course
  rest.post(`${BASE_URL}/course/`, (req, res, ctx) => res(ctx.status(200), ctx.body(JSON.stringify({})))),

  // Handles POST on /course
  rest.post(`${BASE_URL}/course/project`, (req, res, ctx) => res(ctx.status(200), ctx.body(JSON.stringify({})))),

  rest.post(`${BASE_URL}/course/:courseId/milestone`, (req, res, ctx) =>
    res(ctx.status(200), ctx.body(JSON.stringify({}))),
  ),

  // Handles post on announcement route
  rest.post(`${BASE_URL}/course/:courseId/announcement`, (req, res, ctx) =>
    res(ctx.status(200), ctx.body(JSON.stringify({}))),
  ),

  // Course roles
  rest.get(`${BASE_URL}/role/courseUserRoles/:id`, (req, res, ctx) =>
    res(ctx.status(200), ctx.body(JSON.stringify(MSW_COURSE_ROLES))),
  ),

  // Mock sprint data of project
  rest.get(`${BASE_URL}/sprint/listSprints/:id`, (req, res, ctx) =>
    res(ctx.status(200), ctx.body(JSON.stringify(MSW_SPRINT_WITH_BACKLOGS))),
  ),
];

export default handlers;
