import { Course } from '@prisma/client';

// Mock data for courses
const coursesData: Course[] = [
  { id: '1', year: 2022, sem: 1, cname: 'c1', created_at: new Date(Date.now()), description: 'd1', public: false },
  { id: '2', year: 2022, sem: 1, cname: 'c2', created_at: new Date(Date.now()), description: 'd2', public: true },
  { id: '3', year: 1999, sem: 2, cname: 'c3', created_at: new Date(Date.now()), description: 'd3', public: false },
];

export default coursesData;
