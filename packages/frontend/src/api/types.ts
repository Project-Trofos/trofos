export type Project = {
  id: number;
  pname: string;
  pkey: string | null;
  description: string | null;
  course_id: number | null;
  public: boolean;
  created_at: string;
  course?: Course;
  is_archive: boolean | null;
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
  is_archive: boolean | null;
};

export type User = {
  user_email: string;
  user_display_name: string;
  user_id: number;
  projects: Project[];
  courses: CourseRoles[];
  basicRoles: BasicRoles[];
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

export type RegisterUser = {
  userEmail: string;
  newPassword: string;
  userDisplayName: string;
};

export type UserCourseRoleRequest = {
  id: number;
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
  telegramChannelLink: string;
  owner_id: number | null;
};

export type UserData = {
  user: Pick<User, 'user_id' | 'user_email' | 'user_display_name' | 'courses'>;
};

export type ScrumBoardUserData = {
  user: {
    user_id: number | null;
    user_display_name: string;
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

// CourseData type returned by BE api. We perform transformResponse to convert the data into type CourseData
export type CourseDataResponse = Omit<CourseData, 'users'> & {
  courseRoles: UserData[];
};

export type CourseData = Course & {
  milestones: Milestone[];
  announcements: Announcement[];
  users: UserData[];
};

export type UserOnRolesOnCourse = {
  id: number;
  user_id: number;
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
      user_display_name: string;
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

export type BacklogPriority = 'very_high' | 'high' | 'medium' | 'low' | 'very_low' | null;

export type Backlog = {
  backlog_id: number;
  summary: string;
  type: 'story' | 'task' | 'bug';
  priority: BacklogPriority;
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
      user_display_name: string;
    };
  } | null;
  epic_id?: number | null;
  epic?: Epic | null;
};

export type Epic = {
  epic_id: number;
  project_id: number;
  name: string;
  description: string | null;
};

export type DefaultBacklog = {
  backlog_id?: number;
  summary?: string;
  type?: 'story' | 'task' | 'bug';
  priority?: BacklogPriority;
  reporter_id?: number;
  assignee_id?: number | null;
  sprint_id?: number | null;
  points?: number | null;
  description?: string | null;
  project_id?: number;
  status?: BacklogStatus | string;
  assignee?: {
    created_at: string;
    project_id: number;
    user_id: number;
    user: {
      user_email: string;
      user_display_name: string;
    };
  } | null;
  epic_id?: number | null;
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
  userId: number;
  newRoleId: number;
};

export type ProjectGitLink = {
  project_id: number;
  repo: string;
};

export type ProjectGitLinkData = {
  projectId: number;
  repoLink: string;
};

export type ProjectUserSettings = {
  project_id: number;
  user_id: number;
  email_notification: boolean;
};

export type Settings = {
  current_year: number;
  current_sem: number;
};

export type RetrospectiveVote = {
  id: number;
  retro_id: number;
  user_id: number;
  type: RetrospectiveVoteType;
};

export type Retrospective = {
  id: number;
  sprint_id: number;
  content: string;
  type: RetrospectiveType;
  score: number;
  votes: RetrospectiveVote[];
  is_action_taken: boolean;
};

export enum RetrospectiveType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  ACTION = 'action',
}

export enum RetrospectiveVoteType {
  UP = 'up',
  DOWN = 'down',
}

export type CourseImportCsvPayload = {
  courseId: number;
  payload: FormData;
};

export type Feedback = {
  id: number;
  user_id?: number;
  user: {
    user_email: string;
    user_display_name: string;
  };
  sprint_id: number;
  content: string;
  created_at: string;
  updated_at?: string;
};

export type OAuth2Payload = {
  code: string;
  state: string;
  callbackUrl: string;
};

export type Invite = {
  project_id: number;
  email: string;
  expiry_date: Date;
};

export type UserApiKey = {
  id: number;
  user_id: number;
  api_key: string;
  created_at: string;
  last_used: string | null;
  active: boolean;
};

export type UserGuideQueryResponse = {
  answer: string;
  links: Array<string>;
};

export type FeatureFlag = {
  feature_name: string;
  active: boolean;
};

export type ProjectAssignment = {
  id: number;
  targetProjectId: number;
  sourceProjectId: number;
};
