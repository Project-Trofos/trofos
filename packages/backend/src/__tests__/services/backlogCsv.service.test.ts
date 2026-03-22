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

    it('should return an error if sprint does not exist', () => {
      const dataRow = ImportBacklogDataCsvBuilder(
        'Test Story', 'story', 'Nonexistent Sprint', '', '', '', '', '', '',
      );
      const result: unknown = backlogCsvService.validateImportBacklogData(
        dataRow, sprintMap, epicMap, memberEmailMap, validateImportBacklogDataCallback,
      );
      expect((result as CallbackReturnTest).isValid).toEqual(false);
      expect((result as CallbackReturnTest).reason).toContain(INVALID_SPRINT);
    });

    it('should return an error if epic does not exist', () => {
      const dataRow = ImportBacklogDataCsvBuilder(
        'Test Story', 'story', '', 'Nonexistent Epic', '', '', '', '', '',
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
        '', 'invalid', 'Bad Sprint', '', 'invalid', '-1', '', '', '',
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
      expect(reason).toContain(INVALID_SPRINT);
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
  });
});
