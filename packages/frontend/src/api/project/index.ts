export type Project = {
  id: number;
  pname: string;
  pkey: string | null,
  description: string | null;
  course_id: number | null,
  public: boolean,
  created_at: string,
};