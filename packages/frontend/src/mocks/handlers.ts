/* eslint-disable import/no-extraneous-dependencies */
import { rest } from 'msw';
import { Sprint } from '../api/sprint';
import { BacklogHistory, BacklogHistoryType, CourseData, ProjectData } from '../api/types';

const BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || 'http://localhost:3001';
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
  courseRoles: [],
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
  users: [],
};

const handlers = [
  // Handles GET on /project
  rest.get(`${BASE_URL}/project/`, (req, res, ctx) => res(ctx.status(200), ctx.body(JSON.stringify([MSW_PROJECT])))),

  // Handles GET on /course
  rest.get(`${BASE_URL}/course/`, (req, res, ctx) => res(ctx.status(200), ctx.body(JSON.stringify([MSW_COURSE])))),

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
];

export default handlers;
