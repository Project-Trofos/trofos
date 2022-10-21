export type SprintFields = {
  projectId: number;
  name: string;
  dates?: string[] | null;
  duration: number;
  goals?: string;
  status?: 'upcoming' | 'current' | 'completed';
};
