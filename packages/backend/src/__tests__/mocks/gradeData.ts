export const mockMilestoneData = {
  id: 1,
  name: 'Milestone 1',
  course_id: 1,
  start_date: new Date('2022-1-1'),
  deadline: new Date('2022-2-1'),
  max_marks: 100,
  created_at: new Date('2022-1-1'),
};

export const mockGradeData = [
  {
    id: 1,
    project_id: 1,
    milestone_id: 1,
    sprint_id: null,
    score: 80,
    comment: 'Good work',
    status: 'DRAFT' as const,
    grader_id: 1,
    created_at: new Date('2022-1-1'),
    updated_at: new Date('2022-1-1'),
    milestone: mockMilestoneData,
  },
];

export const mockGradeAuditLogData = {
  id: 1,
  project_id: 1,
  milestone_id: 1,
  sprint_id: null,
  score: 80,
  assigned_ta_id: null,
  action: 'MILESTONE_GRADE_UPSERTED' as const,
  comment: 'Good work',
  status: 'DRAFT' as const,
  actor_id: 1,
  created_at: new Date('2022-1-1'),
};

export const mockSprintGradeData = {
  id: 2,
  project_id: 1,
  milestone_id: null,
  sprint_id: 1,
  score: 40,
  comment: 'Good sprint',
  status: 'DRAFT' as const,
  grader_id: 1,
  created_at: new Date('2022-1-1'),
  updated_at: new Date('2022-1-1'),
};
