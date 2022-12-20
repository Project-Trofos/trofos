import { Milestone } from '@prisma/client';

export const milestoneData: Milestone[] = [
  {
    course_id: 1,
    id: 1,
    name: 'Milestone 1',
    deadline: new Date(2023, 1, 15),
    start_date: new Date(2023, 1, 11),
    created_at: new Date(),
  },
  {
    course_id: 1,
    id: 2,
    name: 'Milestone 2',
    deadline: new Date(2023, 2, 15),
    start_date: new Date(2023, 2, 11),
    created_at: new Date(),
  },
];
