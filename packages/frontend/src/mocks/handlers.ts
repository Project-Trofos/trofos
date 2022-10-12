/* eslint-disable import/no-extraneous-dependencies */
import { rest } from 'msw';

const BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || 'http://localhost:3001';
const NUSMODS_URL = 'https://api.nusmods.com/v2/2022-2023/moduleList.json';

const COURSE = {
  id: 'CS3203',
  cname: 'Software Engineering Project',
  course_year: '2022',
  course_sem: '1',
  description: null,
  public: false,
  created_at: '2022-09-14T03:33:34.960Z',
};

const PROJECT = {
  id: 1,
  pname: 'project1',
  pkey: null,
  description: 'project1_description',
  course_id: 'CS3203',
  course_year: '2022',
  course_sem: '1',
  public: false,
  created_at: '2022-09-15T01:58:01.735Z',
  course: COURSE,
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
  rest.get(`${BASE_URL}/course/`, (req, res, ctx) => res(ctx.status(200), ctx.body(JSON.stringify([COURSE])))),

  // Handles GET to NUSMODS
  rest.get(NUSMODS_URL, (req, res, ctx) => res(ctx.status(200), ctx.body(JSON.stringify([NUSMODS_MODULE])))),

  // Handles POST on /project
  rest.post(`${BASE_URL}/project/`, (req, res, ctx) => res(ctx.status(200), ctx.body(JSON.stringify({})))),

  // Handles POST on /course
  rest.post(`${BASE_URL}/course/`, (req, res, ctx) => res(ctx.status(200), ctx.body(JSON.stringify({})))),

  // Handles POST on /course
  rest.post(`${BASE_URL}/course/project`, (req, res, ctx) => res(ctx.status(200), ctx.body(JSON.stringify({})))),
];

export default handlers;
