import { Course } from '@prisma/client';

// Mock data for courses
const coursesData: Course[] = [
  {
    id: 1,
    code: '1',
    startYear: 2022,
    startSem: 1,
    endYear: 2022,
    endSem: 1,
    cname: 'c1',
    created_at: new Date(Date.now()),
    description: 'd1',
    public: false,
    shadow_course : false
  },
  {
    id: 2,
    code: '2',
    startYear: 2022,
    startSem: 1,
    endYear: 2022,
    endSem: 1,
    cname: 'c2',
    created_at: new Date(Date.now()),
    description: 'd2',
    public: true,
    shadow_course : false
  },
  {
    id: 3,
    code: '3',
    startYear: 1999,
    startSem: 2,
    endYear: 1999,
    endSem: 2,
    cname: 'c3',
    created_at: new Date(Date.now()),
    description: 'd3',
    public: false,
    shadow_course : false
  },
  {
    id: 4,
    code: '4',
    startYear: 2024,
    startSem: 2,
    endYear: 2024,
    endSem: 2,
    cname: 'c4',
    created_at: new Date(Date.now()),
    description: 'd4',
    public: false,
    shadow_course: false
  },
  {
    id: 5,
    code: '5',
    startYear: 2024,
    startSem: 2,
    endYear: 2024,
    endSem: 2,
    cname: 'c5',
    created_at: new Date(Date.now()),
    description: 'd5',
    public: false,
    shadow_course: true
  },
  {
    id: 6,
    code: '6',
    startYear: 2024,
    startSem: 2,
    endYear: 2024,
    endSem: 2,
    cname: 'c6',
    created_at: new Date(Date.now()),
    description: 'd6',
    public: false,
    shadow_course: true
  }
];

export default coursesData;
