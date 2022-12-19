export type Project = {
  id: number;
  pname: string;
  pkey: string | null;
  description: string | null;
  course_id: number | null;
  public: boolean;
  created_at: string;
  course?: Course;
};

export type Course = {
  id: number;
  code: string;
  startYear: number;
  startSem: number;
  endYear: number;
  endSem: number;
  cname: string;
  description: string | null;
  public: boolean;
  created_at: string;
};

export type User = {
  user_email: string;
  user_id: number;
  projects: Project[];
  courses: Course[];
  // TODO: Create a role type once we established how they're used in the FE
  roles: any[];
};

export type CreateUserRequest = {
  userEmail: string;
  newPassword: string;
};

export type Action = {
  action: string;
};

export type ActionOnRole = {
  id: number;
  action: string;
};

export type ActionsOnRoles = {
  id: number;
  role_name: string;
  actions: Action[];
};
export type ProjectData = Project & {
  course: Course | null;
  users: UserData[];
  sprints: {
    id: number;
    name: string;
  }[];
  backlogStatuses: Omit<BacklogStatusData, 'project_id'>[];
};

export type UserData = {
  user: {
    user_id: number;
    user_email: string;
  };
};

export type Milestone = {
  id: number;
  name: string;
  start_date: string;
  deadline: string;
  course_id: number;
  created_at: string;
};

export type CourseData = Course & {
  users: UserData[];
  milestones: Milestone[];
};

export type BacklogStatusData = {
  name: string;
  type: 'todo' | 'in_progress' | 'done';
  project_id: number;
  order: number;
};
