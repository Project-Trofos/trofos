/* eslint-disable import/no-extraneous-dependencies */
import { rest } from 'msw';

const BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || 'http://localhost:3001';
const NUSMODS_URL = 'https://api.nusmods.com/v2/2022-2023/moduleList.json';

export const MSW_COURSE = {
  id: 1,
  code: 'CS3203',
  cname: 'Software Engineering Project',
  startYear: '2022',
  endYear: '2022',
  startSem: '1',
  endSem: '1',
  description: null,
  milestones: [
    {
      id: 1,
      name: 'Milestone 1',
      course_id: 1,
      start_date: '2023-01-09T16:00:00.000Z',
      deadline: '2022-12-31T16:00:00.000Z',
      created_at: '2022-12-18T17:06:07.072Z',
    },
    {
      id: 2,
      name: 'Milestone 2',
      course_id: 1,
      start_date: '2023-01-19T16:00:00.000Z',
      deadline: '2023-01-10T16:00:00.000Z',
      created_at: '2022-12-18T17:06:07.072Z',
    },
    {
      id: 3,
      name: 'Milestone 3',
      course_id: 1,
      start_date: '2023-01-30T16:00:00.000Z',
      deadline: '2023-01-20T16:00:00.000Z',
      created_at: '2022-12-18T17:06:07.072Z',
    },
  ],
  public: false,
  created_at: '2022-09-14T03:33:34.960Z',
};

const PROJECT = {
  id: 1,
  pname: 'project1',
  pkey: null,
  description: 'project1_description',
  course_id: '1',
  public: false,
  created_at: '2022-09-15T01:58:01.735Z',
  course: MSW_COURSE,
};

const NUSMODS_MODULE = {
  moduleCode: 'EL1101E',
  title: 'The Nature of Language',
  semesters: [1, 2],
};

const handlers = [
  // Handles GET on /project
  rest.get(`${BASE_URL}/project/`, (req, res, ctx) => res(ctx.status(200), ctx.body(JSON.stringify([PROJECT])))),

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
];

export default handlers;
