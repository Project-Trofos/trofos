export type ProjectRequestBody = {
  projectName: string;
  projectKey?: string;
  isPublic?: boolean;
  description?: string;
};

export type ProjectIdRequestBody = {
  projectId: string;
};

export type OptionRequestBody = {
  option: 'all' | 'past' | 'current';
};

export type UserRequestBody = {
  userId: string;
};

export type CourseRequestBody = {
  courseId: string;
  courseName: string;
  courseYear: string;
  courseSem: string;
  isPublic?: boolean;
  description?: string;
};

export type AddProjectAndCourseRequestBody = {
  courseId?: string;
  courseYear?: string;
  courseSem?: string;
  courseName?: string;
  projectName?: string;
  projectKey?: string;
  isProjectPublic?: boolean;
  isCoursePublic?: boolean;
  projectDescription?: string;
  courseDescription?: string;
};