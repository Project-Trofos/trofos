export type Backlog = {
  id: number;
  summary: string;
  type: 'story' | 'task' | 'bug';
  priority: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
  reporter_id: number;
  assignee_id: number;
  sprint_id: number;
  points: number;
  description: string;
  project_id: number;
};
