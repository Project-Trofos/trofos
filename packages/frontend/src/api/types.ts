export type Project = {
  id: number;
  pname: string;
  pkey: string | null;
  description: string | null;
  course_id: string | null;
  course_year: number | null;
  course_sem: number | null;
  public: boolean;
  created_at: string;
  course?: Course;
};

export type Course = {
  id: string;
  year: number;
  sem: number;
  cname: string;
  description: string | null;
  public: boolean;
  created_at: string;
};

export type User = {
  user_email : string,
  user_id : number,
  projects : Project[],
  courses: Course[],
  // TODO: Create a role type once we have a role API
  roles: any[]
}

export type CreateUserRequest = {
  userEmail: string,
  newPassword: string
}

export type Action = {
  action : string
}

export type ActionOnRole = {
  id : number,
  action : string
}

export type ActionsOnRoles = {
  id : number,
  role_name : string,
  actions : Action[]
}
