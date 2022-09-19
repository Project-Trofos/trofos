/* eslint-disable import/prefer-default-export */
import { PrismaClient } from '@prisma/client';

async function createCourseSeed(prisma: PrismaClient) {

  const courses = await prisma.course.createMany({
    data: [
      {
        id: 'course1_id',
        cname: 'course1',
        description: 'course1_description',
      },
      {
        id: 'course2_id',
        cname: 'course2',
        description: 'course2_description',
      },
      {
        id: 'course3_id',
        cname: 'course3',
        description: 'course3_description',
      },
    ],
  });

  console.log('created courses %s', courses);
}

export {
  createCourseSeed,
};
