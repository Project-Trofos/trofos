import { prismaMock } from '../../models/mock/mockPrismaClient';
import backlogCsvService from '../../services/backlogCsv.service';
import {
  INVALID_ASSIGNEE,
  INVALID_EPIC,
  INVALID_POINTS,
  INVALID_PRIORITY,
  INVALID_REPORTER,
  INVALID_SPRINT,
  INVALID_SUMMARY,
  INVALID_TYPE,
} from '../../services/types/backlogCsv.service.types';
import {
  ImportBacklogDataCsvBuilder,
  validateImportBacklogDataCallback,
  CallbackReturnTest,
  sprintMap,
  epicMap,
  memberEmailMap,
} from '../mocks/backlogCsvData';

describe('backlogCsv.service.tests', () => {
  describe('validateImportBacklogData', () => {
    it('should return true when all fields are valid', () => {
      const dataRow = ImportBacklogDataCsvBuilder(
        'Test Story', 'story', 'Sprint 1', 'Epic 1', 'high', '5', 'user1@test.com', 'user2@test.com', 'description',
      );
      const result: unknown = backlogCsvService.validateImportBacklogData(
        dataRow, sprintMap, epicMap, memberEmailMap, validateImportBacklogDataCallback,
      );
      expect((result as CallbackReturnTest).isValid).toEqual(true);
      expect((result as CallbackReturnTest).reason).toEqual(undefined);
    });

    it('should return true when optional fields are empty', () => {
      const dataRow = ImportBacklogDataCsvBuilder(
        'Test Story', 'story', '', '', '', '', '', '', '',
      );
      const result: unknown = backlogCsvService.validateImportBacklogData(
        dataRow, sprintMap, epicMap, memberEmailMap, validateImportBacklogDataCallback,
      );
      expect((result as CallbackReturnTest).isValid).toEqual(true);
      expect((result as CallbackReturnTest).reason).toEqual(undefined);
    });

    it('should return an error if summary is empty', () => {
      const dataRow = ImportBacklogDataCsvBuilder(
        '', 'story', '', '', '', '', '', '', '',
      );
      const result: unknown = backlogCsvService.validateImportBacklogData(
        dataRow, sprintMap, epicMap, memberEmailMap, validateImportBacklogDataCallback,
      );
      expect((result as CallbackReturnTest).isValid).toEqual(false);
      expect((result as CallbackReturnTest).reason).toContain(INVALID_SUMMARY);
    });

    it('should return an error if type is invalid', () => {
      const dataRow = ImportBacklogDataCsvBuilder(
        'Test Story', 'invalid', '', '', '', '', '', '', '',
      );
      const result: unknown = backlogCsvService.validateImportBacklogData(
        dataRow, sprintMap, epicMap, memberEmailMap, validateImportBacklogDataCallback,
      );
      expect((result as CallbackReturnTest).isValid).toEqual(false);
      expect((result as CallbackReturnTest).reason).toContain(INVALID_TYPE);
    });

    it('should accept valid types case-insensitively', () => {
      const dataRow = ImportBacklogDataCsvBuilder(
        'Test Story', 'Story', '', '', '', '', '', '', '',
      );
      const result: unknown = backlogCsvService.validateImportBacklogData(
        dataRow, sprintMap, epicMap, memberEmailMap, validateImportBacklogDataCallback,
      );
      expect((result as CallbackReturnTest).isValid).toEqual(true);
    });

    it('should return an error if priority is invalid', () => {
      const dataRow = ImportBacklogDataCsvBuilder(
        'Test Story', 'story', '', '', 'invalid', '', '', '', '',
      );
      const result: unknown = backlogCsvService.validateImportBacklogData(
        dataRow, sprintMap, epicMap, memberEmailMap, validateImportBacklogDataCallback,
      );
      expect((result as CallbackReturnTest).isValid).toEqual(false);
      expect((result as CallbackReturnTest).reason).toContain(INVALID_PRIORITY);
    });

    it('should return an error if points is not a positive integer', () => {
      const dataRow = ImportBacklogDataCsvBuilder(
        'Test Story', 'story', '', '', '', '-1', '', '', '',
      );
      const result: unknown = backlogCsvService.validateImportBacklogData(
        dataRow, sprintMap, epicMap, memberEmailMap, validateImportBacklogDataCallback,
      );
      expect((result as CallbackReturnTest).isValid).toEqual(false);
      expect((result as CallbackReturnTest).reason).toContain(INVALID_POINTS);
    });

    it('should return an error if points is a decimal', () => {
      const dataRow = ImportBacklogDataCsvBuilder(
        'Test Story', 'story', '', '', '', '2.5', '', '', '',
      );
      const result: unknown = backlogCsvService.validateImportBacklogData(
        dataRow, sprintMap, epicMap, memberEmailMap, validateImportBacklogDataCallback,
      );
      expect((result as CallbackReturnTest).isValid).toEqual(false);
      expect((result as CallbackReturnTest).reason).toContain(INVALID_POINTS);
    });

    it('should accept unknown sprint names (auto-created during import)', () => {
      const dataRow = ImportBacklogDataCsvBuilder(
        'Test Story', 'story', 'New Sprint', '', '', '', '', '', '',
      );
      const result: unknown = backlogCsvService.validateImportBacklogData(
        dataRow, sprintMap, epicMap, memberEmailMap, validateImportBacklogDataCallback,
      );
      expect((result as CallbackReturnTest).isValid).toEqual(true);
    });

    it('should accept unknown epic names (auto-created during import)', () => {
      const dataRow = ImportBacklogDataCsvBuilder(
        'Test Story', 'story', '', 'New Epic', '', '', '', '', '',
      );
      const result: unknown = backlogCsvService.validateImportBacklogData(
        dataRow, sprintMap, epicMap, memberEmailMap, validateImportBacklogDataCallback,
      );
      expect((result as CallbackReturnTest).isValid).toEqual(true);
    });

    it('should reject placeholder sprint name', () => {
      const dataRow = ImportBacklogDataCsvBuilder(
        'Test Story', 'story', '<Enter New Sprint Name>', '', '', '', '', '', '',
      );
      const result: unknown = backlogCsvService.validateImportBacklogData(
        dataRow, sprintMap, epicMap, memberEmailMap, validateImportBacklogDataCallback,
      );
      expect((result as CallbackReturnTest).isValid).toEqual(false);
      expect((result as CallbackReturnTest).reason).toContain(INVALID_SPRINT);
    });

    it('should reject placeholder epic name', () => {
      const dataRow = ImportBacklogDataCsvBuilder(
        'Test Story', 'story', '', '<Enter New Epic Name>', '', '', '', '', '',
      );
      const result: unknown = backlogCsvService.validateImportBacklogData(
        dataRow, sprintMap, epicMap, memberEmailMap, validateImportBacklogDataCallback,
      );
      expect((result as CallbackReturnTest).isValid).toEqual(false);
      expect((result as CallbackReturnTest).reason).toContain(INVALID_EPIC);
    });

    it('should return an error if reporter is not a project member', () => {
      const dataRow = ImportBacklogDataCsvBuilder(
        'Test Story', 'story', '', '', '', '', 'unknown@test.com', '', '',
      );
      const result: unknown = backlogCsvService.validateImportBacklogData(
        dataRow, sprintMap, epicMap, memberEmailMap, validateImportBacklogDataCallback,
      );
      expect((result as CallbackReturnTest).isValid).toEqual(false);
      expect((result as CallbackReturnTest).reason).toContain(INVALID_REPORTER);
    });

    it('should return an error if assignee is not a project member', () => {
      const dataRow = ImportBacklogDataCsvBuilder(
        'Test Story', 'story', '', '', '', '', '', 'unknown@test.com', '',
      );
      const result: unknown = backlogCsvService.validateImportBacklogData(
        dataRow, sprintMap, epicMap, memberEmailMap, validateImportBacklogDataCallback,
      );
      expect((result as CallbackReturnTest).isValid).toEqual(false);
      expect((result as CallbackReturnTest).reason).toContain(INVALID_ASSIGNEE);
    });

    it('should return multiple errors when multiple fields are invalid', () => {
      const dataRow = ImportBacklogDataCsvBuilder(
        '', 'invalid', '', '', 'invalid', '-1', '', '', '',
      );
      const result: unknown = backlogCsvService.validateImportBacklogData(
        dataRow, sprintMap, epicMap, memberEmailMap, validateImportBacklogDataCallback,
      );
      expect((result as CallbackReturnTest).isValid).toEqual(false);
      const reason = (result as CallbackReturnTest).reason!;
      expect(reason).toContain(INVALID_SUMMARY);
      expect(reason).toContain(INVALID_TYPE);
      expect(reason).toContain(INVALID_PRIORITY);
      expect(reason).toContain(INVALID_POINTS);
    });
  });

  describe('processImportBacklogData', () => {
    it('should process rows within a transaction', async () => {
      const rows = [
        ImportBacklogDataCsvBuilder('Story 1', 'story', 'Sprint 1', '', 'high', '5', '', '', 'desc'),
      ];

      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
        return Promise.resolve();
      });

      prismaMock.project.findUniqueOrThrow.mockResolvedValueOnce({
        backlog_counter: 0,
      } as any);

      prismaMock.backlogStatus.findFirst.mockResolvedValueOnce({
        name: 'To do',
      } as any);

      prismaMock.backlog.create.mockResolvedValueOnce({} as any);
      prismaMock.backlogHistory.create.mockResolvedValueOnce({} as any);
      prismaMock.project.update.mockResolvedValueOnce({} as any);

      await expect(
        backlogCsvService.processImportBacklogData(1, 1, rows, sprintMap, epicMap, memberEmailMap),
      ).resolves.toBeUndefined();

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.backlog.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.backlogHistory.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.project.update).toHaveBeenCalledTimes(1);
    });

    it('should process multiple rows and increment backlog counter', async () => {
      const rows = [
        ImportBacklogDataCsvBuilder('Story 1', 'story', '', '', '', '', '', '', ''),
        ImportBacklogDataCsvBuilder('Story 2', 'task', '', '', '', '', '', '', ''),
        ImportBacklogDataCsvBuilder('Story 3', 'bug', '', '', '', '', '', '', ''),
      ];

      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
        return Promise.resolve();
      });

      prismaMock.project.findUniqueOrThrow.mockResolvedValueOnce({
        backlog_counter: 5,
      } as any);

      prismaMock.backlogStatus.findFirst.mockResolvedValueOnce({
        name: 'To do',
      } as any);

      prismaMock.backlog.create.mockResolvedValue({} as any);
      prismaMock.backlogHistory.create.mockResolvedValue({} as any);
      prismaMock.project.update.mockResolvedValueOnce({} as any);

      await expect(
        backlogCsvService.processImportBacklogData(1, 1, rows, sprintMap, epicMap, memberEmailMap),
      ).resolves.toBeUndefined();

      expect(prismaMock.backlog.create).toHaveBeenCalledTimes(3);
      expect(prismaMock.backlogHistory.create).toHaveBeenCalledTimes(3);
      expect(prismaMock.project.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { backlog_counter: 8 },
      });
    });

    it('should auto-create sprint if not found in sprintMap', async () => {
      const rows = [
        ImportBacklogDataCsvBuilder('Story 1', 'story', 'New Sprint', '', '', '', '', '', ''),
      ];

      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
        return Promise.resolve();
      });

      prismaMock.project.findUniqueOrThrow.mockResolvedValueOnce({
        backlog_counter: 0,
      } as any);

      prismaMock.backlogStatus.findFirst.mockResolvedValueOnce({
        name: 'To do',
      } as any);

      prismaMock.sprint.create.mockResolvedValueOnce({
        id: 99,
        name: 'New Sprint',
        project_id: 1,
      } as any);

      prismaMock.backlog.create.mockResolvedValueOnce({} as any);
      prismaMock.backlogHistory.create.mockResolvedValueOnce({} as any);
      prismaMock.project.update.mockResolvedValueOnce({} as any);

      await expect(
        backlogCsvService.processImportBacklogData(1, 1, rows, new Map(), epicMap, memberEmailMap),
      ).resolves.toBeUndefined();

      expect(prismaMock.sprint.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.sprint.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'New Sprint', project_id: 1 }),
        }),
      );
    });

    it('should auto-create epic if not found in epicMap', async () => {
      const rows = [
        ImportBacklogDataCsvBuilder('Story 1', 'story', '', 'New Epic', '', '', '', '', ''),
      ];

      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
        return Promise.resolve();
      });

      prismaMock.project.findUniqueOrThrow.mockResolvedValueOnce({
        backlog_counter: 0,
      } as any);

      prismaMock.backlogStatus.findFirst.mockResolvedValueOnce({
        name: 'To do',
      } as any);

      prismaMock.epic.create.mockResolvedValueOnce({
        epic_id: 99,
        name: 'New Epic',
        project_id: 1,
      } as any);

      prismaMock.backlog.create.mockResolvedValueOnce({} as any);
      prismaMock.backlogHistory.create.mockResolvedValueOnce({} as any);
      prismaMock.project.update.mockResolvedValueOnce({} as any);

      await expect(
        backlogCsvService.processImportBacklogData(1, 1, rows, sprintMap, new Map(), memberEmailMap),
      ).resolves.toBeUndefined();

      expect(prismaMock.epic.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.epic.create).toHaveBeenCalledWith({
        data: { name: 'New Epic', project_id: 1 },
      });
    });

    it('should reuse auto-created sprint for subsequent rows', async () => {
      const rows = [
        ImportBacklogDataCsvBuilder('Story 1', 'story', 'Brand New Sprint', '', '', '', '', '', ''),
        ImportBacklogDataCsvBuilder('Story 2', 'task', 'Brand New Sprint', '', '', '', '', '', ''),
      ];

      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
        return Promise.resolve();
      });

      prismaMock.project.findUniqueOrThrow.mockResolvedValueOnce({
        backlog_counter: 0,
      } as any);

      prismaMock.backlogStatus.findFirst.mockResolvedValueOnce({
        name: 'To do',
      } as any);

      prismaMock.sprint.create.mockResolvedValueOnce({
        id: 50,
        name: 'Brand New Sprint',
        project_id: 1,
      } as any);

      prismaMock.backlog.create.mockResolvedValue({} as any);
      prismaMock.backlogHistory.create.mockResolvedValue({} as any);
      prismaMock.project.update.mockResolvedValueOnce({} as any);

      await expect(
        backlogCsvService.processImportBacklogData(1, 1, rows, new Map(), epicMap, memberEmailMap),
      ).resolves.toBeUndefined();

      // Sprint should only be created once, reused for second row
      expect(prismaMock.sprint.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.backlog.create).toHaveBeenCalledTimes(2);
    });
  });
});
