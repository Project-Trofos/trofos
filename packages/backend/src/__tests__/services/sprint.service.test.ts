import { Sprint } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import sprintService from '../../services/sprint.service';
import { SprintFields } from '../../helpers/types/sprint.service.types';

describe('sprint.service tests', () => {
  describe('create sprint', () => {
    it('should create and return sprint when called with valid fields', async () => {
      const mockReturnedSprint: Sprint = {
        id: 1,
        name: 'Sprint 1',
        duration: 1,
        start_date: new Date('2022-10-09 07:03:56'),
        end_date: new Date('2022-10-16 07:03:56'),
        project_id: 123,
        goals: 'Some test goals',
      };

      const sprint: SprintFields = {
        name: 'Sprint 1',
        duration: 1,
        dates: ['2022-10-09 07:03:56', '2022-10-16 07:03:56'],
        projectId: 123,
        goals: 'Some test goals',
      };
      prismaMock.sprint.create.mockResolvedValue(mockReturnedSprint);
      await expect(sprintService.newSprint(sprint)).resolves.toEqual(mockReturnedSprint);
    });

    it('should create and return sprint when optional fields are omitted', async () => {
      const mockReturnedSprint: Sprint = {
        id: 1,
        name: 'Sprint 1',
        duration: 1,
        start_date: null,
        end_date: null,
        project_id: 123,
        goals: null,
      };

      const sprint: SprintFields = {
        name: 'Sprint 1',
        duration: 1,
        projectId: 123,
      };
      prismaMock.sprint.create.mockResolvedValue(mockReturnedSprint);
      await expect(sprintService.newSprint(sprint)).resolves.toEqual(mockReturnedSprint);
    });
  });

  describe('get sprints', () => {
    it('should return sprints when called with valid project id', async () => {
      const mockReturnedSprints: Sprint[] = [
        {
          id: 1,
          name: 'Sprint 1',
          duration: 1,
          start_date: new Date('2022-10-09 07:03:56'),
          end_date: new Date('2022-10-16 07:03:56'),
          project_id: 123,
          goals: 'Some test goals',
        },
        {
          id: 2,
          name: 'Sprint 2',
          duration: 1,
          start_date: new Date('2022-10-16 07:03:56'),
          end_date: new Date('2022-10-23 07:03:56'),
          project_id: 123,
          goals: 'Some test goals',
        },
      ];
      const projectId = 123;
      prismaMock.sprint.findMany.mockResolvedValueOnce(mockReturnedSprints);
      await expect(sprintService.listSprints(projectId)).resolves.toEqual(mockReturnedSprints);
    });
  });

  describe('update sprint', () => {
    it('should update and return sprint', async () => {
      const mockReturnedSprint: Sprint = {
        id: 1,
        name: 'Sprint 1',
        duration: 2,
        start_date: new Date('2022-10-09 07:03:56'),
        end_date: new Date('2022-10-23 07:03:56'),
        project_id: 123,
        goals: 'Updated goals',
      };

      const sprintToUpdate: Omit<SprintFields, 'projectId'> & { sprintId: number } = {
        sprintId: 1,
        duration: 2,
        name: 'Sprint 1',
        dates: ['2022-10-09 07:03:56', '2022-10-23 07:03:56'],
        goals: 'Updated goals',
      };
      prismaMock.sprint.update.mockResolvedValue(mockReturnedSprint);
      await expect(sprintService.updateSprint(sprintToUpdate)).resolves.toEqual(mockReturnedSprint);
    });

    it('should update and return sprint with null dates if dates are not present', async () => {
      const mockReturnedSprint: Sprint = {
        id: 1,
        name: 'Sprint 1',
        duration: 2,
        start_date: null,
        end_date: null,
        project_id: 123,
        goals: 'Updated goals',
      };

      const sprintToUpdate: Omit<SprintFields, 'projectId'> & { sprintId: number } = {
        sprintId: 1,
        duration: 2,
        name: 'Sprint 1',
        dates: undefined,
        goals: 'Updated goals',
      };
      prismaMock.sprint.update.mockResolvedValue(mockReturnedSprint);
      await expect(sprintService.updateSprint(sprintToUpdate)).resolves.toEqual(mockReturnedSprint);
    });
  });

  describe('delete sprint', () => {
    it('should return single sprint that got deleted', async () => {
      const mockReturnedSprint: Sprint = {
        id: 1,
        name: 'Sprint 1',
        duration: 1,
        start_date: new Date('2022-10-09 07:03:56'),
        end_date: new Date('2022-10-16 07:03:56'),
        project_id: 123,
        goals: 'Some test goals',
      };
      const mockSprintId = 1;
      prismaMock.sprint.delete.mockResolvedValue(mockReturnedSprint);
      await expect(sprintService.deleteSprint(mockSprintId)).resolves.toEqual(mockReturnedSprint);
    });
  });
});
