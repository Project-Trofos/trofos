import { Project } from '@prisma/client';

// Mock data for projects
const projectsData: Project[] = [
  {
    id: 1,
    pname: 'c1',
    created_at: new Date(Date.now()),
    course_id: null,
    course_sem: null,
    course_year: null,
    pkey: null,
    description: 'd1',
    public: false,
  },
  {
    id: 2,
    pname: 'c2',
    created_at: new Date(Date.now()),
    course_id: null,
    course_sem: null,
    course_year: null,
    pkey: null,
    description: 'd2',
    public: false,
  },
  {
    id: 3,
    pname: 'c3',
    created_at: new Date(Date.now()),
    course_id: null,
    course_sem: null,
    course_year: null,
    pkey: null,
    description: 'd3',
    public: false,
  },
];

export default projectsData;
