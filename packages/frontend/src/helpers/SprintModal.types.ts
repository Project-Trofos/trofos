import type { Dayjs } from 'dayjs';

export interface SprintFormFields extends FormData {
  projectId: number;
  name: string;
  duration: number;
  dates?: string[] | null;
  startDate?: string;
  goals?: string;
}

export type SprintUpdatePayload = Partial<SprintFormFields> & {
  sprintId: number;
};

export type AutoSprintTypes = {
  name: string;
  dates: Dayjs[] | undefined;
  duration: number;
};
