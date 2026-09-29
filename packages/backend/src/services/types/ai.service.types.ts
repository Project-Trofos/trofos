export type UserGuideQueryResponse = {
  answer: string;
  links: Array<string>;
};

export type CourseAutofillResponse = {
  courseName?: string;
  courseCode?: string;
  courseYear?: number;
  courseSem?: number;
};

export type SprintAutofillResponse = {
  name?: string;
  duration?: number;
  startDate?: string;
  goals?: string;
};
