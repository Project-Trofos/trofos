import { Announcement } from '@prisma/client';

export const announcementData: Announcement[] = [
  {
    id: 1,
    course_id: 1,
    user_id: 1,
    title: 'announcement 1',
    content: 'announcement 1 content',
    created_at: new Date(),
    updated_at: null,
  },
  {
    id: 2,
    course_id: 1,
    user_id: 1,
    title: 'announcement 2',
    content: 'announcement 2 content',
    created_at: new Date(),
    updated_at: new Date(),
  },
];
