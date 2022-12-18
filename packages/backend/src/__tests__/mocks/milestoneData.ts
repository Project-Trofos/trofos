import { Milestone } from '@prisma/client';

export const milestoneData: Milestone[] = [
  {
    course_id: 1,
    id: 1,
    name: 'Milestone 1',
    deadline: new Date(),
    start_date: new Date(),
    created_at: new Date(),
  },
  {
    course_id: 1,
    id: 2,
    name: 'Milestone 2',
    deadline: new Date(),
    start_date: new Date(),
    created_at: new Date(),
  },
];
