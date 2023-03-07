export type SprintFields = {
  projectId: number;
  name: string;
  dates?: string[] | null;
  duration: number;
  goals?: string;
  notes?: string;
  status?: 'upcoming' | 'current' | 'completed' | 'closed';
};
