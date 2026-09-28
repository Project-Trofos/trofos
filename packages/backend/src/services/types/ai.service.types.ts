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
