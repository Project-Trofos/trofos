import coursesData from './courseData';
import { projectsData } from './projectData';

const mockBulkCreateBody = {
  courseId: coursesData[0].id,
  courseName: coursesData[0].cname,
  courseSem: coursesData[0].sem.toString(),
  courseYear: coursesData[0].year.toString(),
  isPublic: coursesData[0].public.toString(),
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
