import StatusCodes from 'http-status-codes';
import { createRequest, createResponse } from 'node-mocks-http';
import issueController from '../../controllers/issue';
import issueService from '../../services/issue.service';
import { mockIssueBacklog, mockIssueData, mockIssueFields } from '../mocks/issueData';
import { Backlog, Issue, IssueStatusType } from '@prisma/client';

const issueServiceSpies = {
  newIssue: jest.spyOn(issueService, 'newIssue'),
  getAssignedIssuesByProjectId: jest.spyOn(issueService, 'getAssignedIssuesByProjectId'),
  getReportedIssuesByProjectId: jest.spyOn(issueService, 'getReportedIssuesByProjectId'),
  getIssue: jest.spyOn(issueService, 'getIssue'),
  updateIssue: jest.spyOn(issueService, 'updateIssue'),
  deleteIssue: jest.spyOn(issueService, 'deleteIssue'),
  createBacklogFromIssue: jest.spyOn(issueService, 'createBacklogFromIssue'),
};

describe('issueController tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create new issue', () => {
    const mockIssue = mockIssueFields;
    const expectedIssue: Issue = mockIssueData;
    const mockRequest = createRequest({ body: mockIssue });
    const mockResponse = createResponse();

    it('should return new issue and status 200 when successfully created', async () => {
      issueServiceSpies.newIssue.mockResolvedValueOnce(expectedIssue);
      await issueController.newIssue(mockRequest, mockResponse);
      expect(issueServiceSpies.newIssue).toHaveBeenCalledWith(mockIssue);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedIssue));
    });
  });

  describe('get assigned issues by project ID', () => {
    const mockProjectId = 2;
    const mockRequest = createRequest({ params: { projectId: mockProjectId } });
    const mockResponse = createResponse();
    const expectedIssues: Issue[] = [mockIssueData];

    it('should return assigned issues and status 200', async () => {
      issueServiceSpies.getAssignedIssuesByProjectId.mockResolvedValueOnce(expectedIssues);
      await issueController.getAssignedIssuesByProjectId(mockRequest, mockResponse);
      expect(issueServiceSpies.getAssignedIssuesByProjectId).toHaveBeenCalledWith(mockProjectId);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedIssues));
    });

    it('should throw an error and return status 400 when projectId is missing', async () => {
      const mockMissingProjectIdRequest = createRequest({
        params: { projectId: undefined },
      });
      await issueController.getAssignedIssuesByProjectId(mockMissingProjectIdRequest, mockResponse);
      expect(issueServiceSpies.getAssignedIssuesByProjectId).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('get reported issues by project ID', () => {
    const mockProjectId = 1;
    const mockRequest = createRequest({ params: { projectId: mockProjectId } });
    const mockResponse = createResponse();
    const expectedIssues: Issue[] = [mockIssueData];

    it('should return reported issues and status 200', async () => {
      issueServiceSpies.getReportedIssuesByProjectId.mockResolvedValueOnce(expectedIssues);
      await issueController.getReportedIssuesByProjectId(mockRequest, mockResponse);
      expect(issueServiceSpies.getReportedIssuesByProjectId).toHaveBeenCalledWith(mockProjectId);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedIssues));
    });

    it('should throw an error and return status 400 when projectId is missing', async () => {
      const mockMissingProjectIdRequest = createRequest({
        params: { projectId: undefined },
      });
      await issueController.getReportedIssuesByProjectId(mockMissingProjectIdRequest, mockResponse);
      expect(issueServiceSpies.getReportedIssuesByProjectId).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('get issue by ID', () => {
    const mockIssueId = 1;
    const mockRequest = createRequest({ params: { issueId: mockIssueId } });
    const mockResponse = createResponse();
    const expectedIssue: Issue = mockIssueData;

    it('should return issue and status 200', async () => {
      issueServiceSpies.getIssue.mockResolvedValueOnce(expectedIssue);
      await issueController.getIssue(mockRequest, mockResponse);
      expect(issueServiceSpies.getIssue).toHaveBeenCalledWith(mockIssueId);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedIssue));
    });

    it('should throw an error and return status 400 when issueId is missing', async () => {
      const mockMissingIssueIdRequest = createRequest({ params: { issueId: undefined } });
      await issueController.getIssue(mockMissingIssueIdRequest, mockResponse);
      expect(issueServiceSpies.getIssue).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('update issue', () => {
    const mockIssueId = 1;
    const mockUpdateData = { status: IssueStatusType.valid };
    const mockRequest = createRequest({ params: { issueId: mockIssueId }, body: mockUpdateData });
    const mockResponse = createResponse();
    const expectedIssue: Issue = { ...mockIssueData, status: IssueStatusType.valid };

    it('should return updated issue and status 200', async () => {
      issueServiceSpies.updateIssue.mockResolvedValueOnce(expectedIssue);
      await issueController.updateIssue(mockRequest, mockResponse);
      expect(issueServiceSpies.updateIssue).toHaveBeenCalledWith({
        issueId: mockIssueId,
        fieldToUpdate: mockUpdateData,
      });
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedIssue));
    });

    it('should throw an error and return status 400 when issueId is missing', async () => {
      const mockMissingIssueIdRequest = createRequest({ params: { issueId: undefined } });
      await issueController.updateIssue(mockMissingIssueIdRequest, mockResponse);
      expect(issueServiceSpies.updateIssue).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('delete issue', () => {
    const mockIssueId = 1;
    const mockRequest = createRequest({ params: { issueId: mockIssueId } });
    const mockResponse = createResponse();
    const expectedIssue: Issue = mockIssueData;

    it('should return deleted issue and status 200', async () => {
      issueServiceSpies.deleteIssue.mockResolvedValueOnce(expectedIssue);
      await issueController.deleteIssue(mockRequest, mockResponse);
      expect(issueServiceSpies.deleteIssue).toHaveBeenCalledWith(mockIssueId);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedIssue));
    });

    it('should throw an error and return status 400 when issueId is missing', async () => {
      const mockMissingIssueIdRequest = createRequest({ params: { issueId: undefined } });
      await issueController.deleteIssue(mockMissingIssueIdRequest, mockResponse);
      expect(issueServiceSpies.deleteIssue).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('create backlog from issue', () => {
    const mockIssueId = 1;
    const mockRequest = createRequest({ params: { issueId: mockIssueId }, body: mockIssueFields });
    const mockResponse = createResponse();
    const expectedBacklog: Backlog = mockIssueBacklog;

    it('should return issue backlog and status 200', async () => {
      issueServiceSpies.createBacklogFromIssue.mockResolvedValueOnce(expectedBacklog);
      await issueController.createBacklog(mockRequest, mockResponse);
      expect(issueServiceSpies.createBacklogFromIssue).toHaveBeenCalledWith(mockIssueId, mockIssueFields);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedBacklog));
    });

    it('should throw an error and return status 400 when issueId is missing', async () => {
      const mockMissingIssueIdRequest = createRequest({ params: { issueId: undefined } });
      await issueController.createBacklog(mockMissingIssueIdRequest, mockResponse);
      expect(issueServiceSpies.createBacklogFromIssue).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });
});
