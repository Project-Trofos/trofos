/* eslint-disable import/prefer-default-export */
import { PrismaClient } from '@prisma/client';

async function createProjectSeed(prisma: PrismaClient) {
  const projects = await prisma.project.createMany({
    data: [
      {
        id: 901,
        pname: 'project1',
        course_id: 1,
        description: 'project1_description',
      },
      {
        id: 902,
        pname: 'project2',
        course_id: 2,
        description: 'project2_description',
      },
    ],
  });

  const backlogStatusCount = await prisma.backlogStatus.createMany({
    data: [
      { project_id: 901, name: 'To do', type: 'todo', order: 1 },
      { project_id: 901, name: 'In progress', type: 'in_progress', order: 1 },
      { project_id: 901, name: 'Done', type: 'done', order: 1 },
      { project_id: 902, name: 'To do', type: 'todo', order: 1 },
      { project_id: 902, name: 'In progress', type: 'in_progress', order: 1 },
      { project_id: 902, name: 'Done', type: 'done', order: 1 },
    ],
  });

  console.log('created projects %s', projects);
  console.log('created default backlog status %s', backlogStatusCount);

  const project3 = await prisma.project.create({
    data: {
      id: 904,
      pname: 'project3',
      description: 'project3_description',
      backlogStatuses: {
        createMany: {
          data: [
            { name: 'To do', type: 'todo', order: 1 },
            { name: 'In progress', type: 'in_progress', order: 1 },
            { name: 'Done', type: 'done', order: 1 },
          ],
        },
      },
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
