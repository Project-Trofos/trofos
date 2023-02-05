import { Retrospective, RetrospectiveType, RetrospectiveVote, RetrospectiveVoteType, Sprint } from '@prisma/client';
import { SprintFields } from '../../helpers/types/sprint.service.types';

export const mockSprintData: Sprint = {
  id: 1,
  name: 'Sprint 1',
  duration: 1,
  start_date: new Date('2022-10-09 07:03:56'),
  end_date: new Date('2022-10-16 07:03:56'),
  project_id: 123,
  goals: 'Some test goals',
  status: 'upcoming',
};

export const mockSprintFields: SprintFields = {
  name: 'Sprint 1',
  duration: 1,
  dates: ['2022-10-09 07:03:56', '2022-10-16 07:03:56'],
  projectId: 123,
  goals: 'Some test goals',
};

export const mockSprintToUpdate: Omit<SprintFields, 'projectId'> & { sprintId: number } = {
  sprintId: 1,
  duration: 2,
  name: 'Sprint 1',
  dates: ['2022-10-09 07:03:56', '2022-10-23 07:03:56'],
  goals: 'Updated goals',
};

export const mockRetrospectiveData: Retrospective = {
  id: 1,
  sprint_id: 1,
  content: 'Test retrospective',
  type: RetrospectiveType.positive,
  score: 1,
};

export const mockRetrospectiveFields = {
  sprintId: 1,
  content: 'Test retrospective',
  type: RetrospectiveType.positive,
};

export const mockRetrospectiveVoteData: RetrospectiveVote = {
  retro_id: 1,
  user_id: 1,
  type: RetrospectiveVoteType.up,
};

export const mockRetrospectiveVoteFields = {
  retroId: 1,
  userId: 1,
  type: RetrospectiveVoteType.up,
};
