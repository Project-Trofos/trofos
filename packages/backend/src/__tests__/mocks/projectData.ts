import { Project } from '@prisma/client';

// Mock data for projects
export const projectsData: Project[] = [
  {
    id: 1,
    pname: 'c1',
    created_at: new Date(Date.now()),
    course_id: 5,
    pkey: null,
    description: 'd1',
    public: false,
    backlog_counter: 0,
  },
  {
    id: 2,
    pname: 'c2',
    created_at: new Date(Date.now()),
    course_id: 6,
    pkey: null,
    description: 'd2',
    public: false,
    backlog_counter: 0,
  },
  {
    id: 3,
    pname: 'c3',
    created_at: new Date(Date.now()),
    course_id: 3,
    pkey: null,
    description: 'd3',
    public: false,
    backlog_counter: 0,
  },
  {
    id: 4,
    pname: 'c4',
    created_at: new Date(Date.now()),
    course_id: 4,
    pkey: null,
    description: 'd4',
    public: false,
    backlog_counter: 0,
  },
];

export const mockBacklogReturnedProject: Project = {
  id: 1,
  pname: 'c1',
  created_at: new Date(Date.now()),
  course_id: 5,
  pkey: 'TEST',
  description: 'd1',
  public: false,
  backlog_counter: 1,
};
