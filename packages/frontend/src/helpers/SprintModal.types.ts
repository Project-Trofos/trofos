import type { Dayjs } from "dayjs";

export interface SprintFormFields extends FormData {
  projectId: number;
  name: string;
  duration: number;
  dates?: string[];
  startDate?: string;
  goals?: string;
}

export interface SprintUpdatePayload extends Omit<SprintFormFields, 'projectId'> {
  sprintId: number;
}

export type AutoSprintTypes = { 
  name: string;
  dates: Dayjs[] | undefined;
  duration: number
}
