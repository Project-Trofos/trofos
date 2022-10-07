/* eslint-disable import/prefer-default-export */
import { PrismaClient } from '@prisma/client';
import { CURRENT_SEM, CURRENT_YEAR } from '../../src/helpers/currentTime';

async function createProjectSeed(prisma: PrismaClient) {
  const projects = await prisma.project.createMany({
    data: [
      {
        id: 901,
        pname: 'project1',
        course_id: 'course1_id',
        course_year: CURRENT_YEAR,
        course_sem: CURRENT_SEM,
        description: 'project1_description',
      },
      {
        id: 902,
        pname: 'project2',
        course_id: 'course2_id',
        course_year: CURRENT_YEAR,
        course_sem: CURRENT_SEM,
        description: 'project2_description',
      },
    ],
  });

  console.log('created projects %s', projects);

  const project3 = await prisma.project.create({
    data: {
      id: 904,
      pname: 'project3',
      description: 'project3_description',
    },
  });

  console.log('created project %s', project3);

  const usersOnProject = await prisma.usersOnProjects.createMany({
    data: [
      {
        project_id: 901,
        user_id: 1,
      },
      {
        project_id: 904,
        user_id: 2,
      },
    ],
  });

  console.log('created usersOnProject %s', usersOnProject);
}

export { createProjectSeed };
