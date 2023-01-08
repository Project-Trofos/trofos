import { BulkCreateProjectBody } from '../../controllers/requestTypes';
import coursesData from './courseData';
import { projectsData } from './projectData';

const mockBulkCreateBody: Required<BulkCreateProjectBody> = {
  courseId: coursesData[0].id.toString(),
  projects: [
    {
      projectName: projectsData[0].pname,
      projectKey: projectsData[0].pkey || undefined,
      description: projectsData[0].description || undefined,
      isPublic: projectsData[0].public,
      users: [],
    },
  ],
};

export default mockBulkCreateBody;
