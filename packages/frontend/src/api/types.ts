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
  shadow_course: boolean;
};

export type User = {
  user_email: string;
  user_id: number;
  projects: Project[];
  courses: Course[];
  basicRoles: BasicRoles[];
  courseRoles: CourseRoles[];
};

export type BasicRoles = {
  user_email: string;
  role_id: number;
};

export type CourseRoles = {
  id: number;
  user_email: string;
  role_id: number;
  course_id: number;
};

export type CreateUserRequest = {
  userEmail: string;
  newPassword: string;
};

export type UserCourseRoleRequest = {
  id: number;
  userEmail: string;
  userRole: number;
  userId: number;
};

export type Role = {
  role_name: string;
  id: number;
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
    courseRoles: CourseRoles[];
  };
};

export type ScrumBoardUserData = {
  user: {
    user_id: number | null;
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

export type Announcement = {
  id: number;
  title: string;
  content: string;
  user_id: number;
  created_at: string;
  updated_at?: string;
};

export type CourseData = Course & {
  milestones: Milestone[];
  announcements: Announcement[];
  users: UserData[];
};

export type UserOnRolesOnCourse = {
  id: number;
  user_email: string;
  role_id: number;
  course_id: number;
  role: {
    id: number;
    role_name: string;
  };
};

export type BacklogStatusData = {
  name: string;
  type: 'todo' | 'in_progress' | 'done';
  project_id: number;
  order: number;
};

export type Comment = {
  comment_id: number;
  backlog_id: number;
  project_id: number;
  commenter_id: number;
  content: string;
  created_at: string;
  updated_at: string | null;
  commenter: {
    created_at: string;
    project_id: string;
    user: {
      user_id: number;
      user_email: string;
    };
  };
};

export type CommentFieldsType = {
  projectId: number;
  backlogId: number;
  commenterId: number;
  content: string;
};

export enum BacklogStatus {
  TODO = 'To do',
  DONE = 'Done',
}

export type Backlog = {
  backlog_id: number;
  summary: string;
  type: 'story' | 'task' | 'bug';
  priority: 'very_high' | 'high' | 'medium' | 'low' | 'very_low' | null;
  reporter_id: number;
  assignee_id: number | null;
  sprint_id: number | null;
  points: number | null;
  description: string | null;
  project_id: number;
  status: BacklogStatus | string;
  assignee: {
    created_at: string;
    project_id: number;
    user_id: number;
    user: {
      user_email: string;
    };
  };
};

export type BacklogUpdatePayload = {
  projectId: number;
  backlogId: number;
  srcSprintId?: number | null;
  fieldToUpdate: Partial<Backlog>;
};

export enum BacklogHistoryType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export type BacklogHistory = {
  history_type: BacklogHistoryType;
  date: string;
} & Omit<Backlog, 'assignee' | 'summary' | 'description'>;

export type UpdateUserRolePayload = {
  userEmail: string;
  newRoleId: number;
};

export type Settings = {
  current_year: number;
  current_sem: number;
};
