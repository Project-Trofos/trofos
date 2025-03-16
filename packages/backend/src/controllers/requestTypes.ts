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
  option: 'all' | 'past' | 'current' | 'future';
};

export type PaginatedRequestBody = {
  pageIndex?: number;
  pageSize?: number;
  ids?: number[];
  keyword?: string;
  sortBy?: string;
}

export type UserEmailRequestBody = {
  userEmail: string;
};

export type UserIdRequestBody = {
  userId: string;
};

export type CourseRequestBody = {
  courseId: string;
  courseCode: string;
  courseName: string;
  courseStartYear: string;
  courseStartSem: string;
  courseEndYear: string;
  courseEndSem: string;
  isPublic?: boolean;
  description?: string;
};

export type AddProjectAndCourseRequestBody = {
  courseId?: string;
  courseCode?: string;
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

export type BulkCreateProjectBody = {
  courseId?: string;
  projects: (ProjectRequestBody & { users: UserIdRequestBody[] })[];
};

export type MilestoneRequestBody = {
  courseId?: string;
  milestoneName?: string;
  milestoneStartDate?: string;
  milestoneDeadline?: string;
};

export type AnnouncementRequestBody = {
  courseId?: string;
  announcementTitle?: string;
  announcementContent?: string;
};

export type ToggleFeatureFlagRequestBody = {
  featureName: String;
  active: boolean;
};
