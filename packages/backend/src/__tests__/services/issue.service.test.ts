import { Prisma, ProjectAssignment } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import issueService from '../../services/issue.service';
import { IssueFields } from '../../helpers/types/issue.service.types';
import {
  mockIssueBacklog,
  mockIssueData,
  mockIssueFields,
  mockBacklogFields,
  mockSelfAssignedIssueFields,
  mockSelfAssignedIssueData,
} from '../mocks/issueData';
import backlogService from '../../services/backlog.service';
import projectAssignmentService from '../../services/projectAssignment.service';

const serviceSpies = {
  newBacklog: jest.spyOn(backlogService, 'newBacklog'),
  isProjectAssigned: jest.spyOn(projectAssignmentService, 'isProjectAssigned'),
};

describe('issue.service tests', () => {
  describe('newIssue', () => {
    it('should create and return a new issue', async () => {
      const issueFields: IssueFields = mockIssueFields;
      const projectAssignment: ProjectAssignment = {
        id: 1,
        sourceProjectId: issueFields.assignerProjectId,
        targetProjectId: issueFields.assigneeProjectId,
      };

      serviceSpies.isProjectAssigned.mockResolvedValueOnce(true);

      const mockTransactionClient = {
        issue: {
          create: jest.fn().mockResolvedValueOnce(mockIssueData),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(mockTransactionClient as unknown as Prisma.TransactionClient);
      });

      await expect(issueService.newIssue(issueFields)).resolves.toEqual(mockIssueData);
    });

    it('should create and return a self assigned issue', async () => {
      const issueFields: IssueFields = mockSelfAssignedIssueFields;
      const projectAssignment: ProjectAssignment = {
        id: 1,
        sourceProjectId: issueFields.assignerProjectId,
        targetProjectId: issueFields.assigneeProjectId,
      };

      serviceSpies.isProjectAssigned.mockResolvedValueOnce(false);

      const mockTransactionClient = {
        issue: {
          create: jest.fn().mockResolvedValueOnce(mockSelfAssignedIssueData),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(mockTransactionClient as unknown as Prisma.TransactionClient);
      });

      await expect(issueService.newIssue(issueFields)).resolves.toEqual(mockSelfAssignedIssueData);
    });

    it('should throw an error if assignee project is not assigned to the assigner project', async () => {
      const issueFields: IssueFields = mockIssueFields;
      const projectAssignment: ProjectAssignment = {
        id: 1,
        sourceProjectId: issueFields.assignerProjectId,
        targetProjectId: issueFields.assigneeProjectId,
      };

      serviceSpies.isProjectAssigned.mockResolvedValueOnce(false);

      await expect(issueService.newIssue(issueFields)).rejects.toThrowError();
      expect(prismaMock.issue.create).not.toHaveBeenCalled();
    });
  });

  describe('getAssignedIssuesByProjectId', () => {
    it('should return issues assigned to a project', async () => {
      const projectId: number = 2;
      prismaMock.issue.findMany.mockResolvedValueOnce([mockIssueData]);

      await expect(issueService.getAssignedIssuesByProjectId(projectId)).resolves.toEqual([mockIssueData]);
    });
  });

  describe('getReportedIssuesByProjectId', () => {
    it('should return issues reported by a project', async () => {
      const projectId: number = 1;
      prismaMock.issue.findMany.mockResolvedValueOnce([mockIssueData]);

      await expect(issueService.getReportedIssuesByProjectId(projectId)).resolves.toEqual([mockIssueData]);
    });
  });

  describe('getIssue', () => {
    it('should return a specific issue by ID', async () => {
      const issueId: number = 1;
      prismaMock.issue.findUniqueOrThrow.mockResolvedValueOnce(mockIssueData);

      await expect(issueService.getIssue(issueId)).resolves.toEqual(mockIssueData);
    });
  });

  describe('updateIssue', () => {
    it('should update and return the issue', async () => {
      const issueId: number = 1;
      const fieldToUpdate: Partial<IssueFields> = { title: 'Updated Issue' };
      const issueToUpdate = { issueId, fieldToUpdate };
      const updatedIssue = { ...mockIssueData, title: 'Updated Issue' };

      const mockTransactionClient = {
        issue: {
          findUniqueOrThrow: jest.fn().mockResolvedValueOnce(mockIssueData),
          update: jest.fn().mockResolvedValueOnce(updatedIssue),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(mockTransactionClient as unknown as Prisma.TransactionClient);
      });

      await expect(issueService.updateIssue(issueToUpdate)).resolves.toEqual(updatedIssue);
    });
  });

  describe('deleteIssue', () => {
    it('should delete and return the issue', async () => {
      const issueId: number = 1;

      const mockTransactionClient = {
        issue: {
          findUniqueOrThrow: jest.fn().mockResolvedValueOnce(mockIssueData),
          delete: jest.fn().mockResolvedValueOnce(mockIssueData),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(mockTransactionClient as unknown as Prisma.TransactionClient);
      });

      await expect(issueService.deleteIssue(issueId)).resolves.toEqual(mockIssueData);
    });
  });

  describe('createBacklogFromIssue', () => {
    it('should create and link a backlog to an issue', async () => {
      const issueId: number = 1;
      const mockTransactionClient = {
        issue: {
          findUniqueOrThrow: jest.fn().mockResolvedValueOnce(mockIssueData),
          update: jest.fn().mockResolvedValueOnce(mockIssueData),
        },
      };
      serviceSpies.newBacklog.mockResolvedValueOnce(mockIssueBacklog);

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(mockTransactionClient as unknown as Prisma.TransactionClient);
      });

      await expect(issueService.createBacklogFromIssue(issueId, mockBacklogFields)).resolves.toEqual(mockIssueBacklog);
    });
  });
});
