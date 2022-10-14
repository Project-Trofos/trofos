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

export type ProjectData = Project & {
  course: Course | null;
  users: UserData[];
  sprints: {
    id: number;
    name: string;
  }[];
};

export type UserData = {
  user: {
    user_id: number;
    user_email: string;
  };
};

export type CourseData = Course & {
  users: UserData[];
};
