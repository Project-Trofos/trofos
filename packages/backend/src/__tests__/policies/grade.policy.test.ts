import { UserSession } from '@prisma/client';
import { createRequest } from 'node-mocks-http';
import gradePolicy from '../../policies/grade.policy';
import gradeConstraint from '../../policies/constraints/grade.constraint';

const spies = {
  canManageGrade: jest.spyOn(gradeConstraint, 'canManageGrade'),
  canAssignTa: jest.spyOn(gradeConstraint, 'canAssignTa'),
  canEditGradeValue: jest.spyOn(gradeConstraint, 'canEditGradeValue'),
  canAssignTaForSprint: jest.spyOn(gradeConstraint, 'canAssignTaForSprint'),
  canEditSprintGradeValue: jest.spyOn(gradeConstraint, 'canEditSprintGradeValue'),
  canBulkSetSprintMaxMarks: jest.spyOn(gradeConstraint, 'canBulkSetSprintMaxMarks'),
};

describe('grade.policy tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('applyGradePolicy', () => {
    it('should return a valid outcome if the user request has no parameters', async () => {
      const mockReq = createRequest();
      const userSessionObject = { user_id: 1, user_is_admin: false } as UserSession;
      const policyOutcome = await gradePolicy.applyGradePolicy(mockReq, userSessionObject);
      expect(policyOutcome.isPolicyValid).toEqual(true);
      expect(policyOutcome.policyConstraint).not.toBeNull();
    });

    it('should return a valid outcome for a projectId-only listing route (no record to check against)', async () => {
      const mockReq = createRequest();
      mockReq.params = { projectId: '1' };
      const userSessionObject = { user_id: 1, user_is_admin: false } as UserSession;
      const policyOutcome = await gradePolicy.applyGradePolicy(mockReq, userSessionObject);
      expect(policyOutcome.isPolicyValid).toEqual(true);
      expect(spies.canAssignTa).not.toHaveBeenCalled();
      expect(spies.canEditGradeValue).not.toHaveBeenCalled();
    });

    it('should defer to canManageGrade when gradeId is present', async () => {
      spies.canManageGrade.mockResolvedValueOnce(true);
      const mockReq = createRequest();
      mockReq.params = { gradeId: '1' };
      const userSessionObject = { user_id: 1, user_is_admin: false } as UserSession;
      const policyOutcome = await gradePolicy.applyGradePolicy(mockReq, userSessionObject);
      expect(spies.canManageGrade).toHaveBeenCalledWith(1, 1, false);
      expect(spies.canEditGradeValue).not.toHaveBeenCalled();
      expect(policyOutcome.isPolicyValid).toEqual(true);
    });

    it('should defer to canEditGradeValue when projectId and milestoneId are present (grade value upsert)', async () => {
      spies.canEditGradeValue.mockResolvedValueOnce(true);
      const mockReq = createRequest();
      mockReq.params = { projectId: '1', milestoneId: '2' };
      const userSessionObject = { user_id: 1, user_is_admin: false } as UserSession;
      const policyOutcome = await gradePolicy.applyGradePolicy(mockReq, userSessionObject);
      expect(spies.canEditGradeValue).toHaveBeenCalledWith(1, 1, 2, false);
      expect(spies.canAssignTa).not.toHaveBeenCalled();
      expect(policyOutcome.isPolicyValid).toEqual(true);
    });

    it('should defer to canAssignTa when projectId and milestoneId are present and the route is assign-ta', async () => {
      spies.canAssignTa.mockResolvedValueOnce(true);
      const mockReq = createRequest({ url: '/api/project/1/milestone/2/grade/assign-ta' });
      mockReq.params = { projectId: '1', milestoneId: '2' };
      const userSessionObject = { user_id: 1, user_is_admin: false } as UserSession;
      const policyOutcome = await gradePolicy.applyGradePolicy(mockReq, userSessionObject);
      expect(spies.canAssignTa).toHaveBeenCalledWith(1, 1, false);
      expect(spies.canEditGradeValue).not.toHaveBeenCalled();
      expect(policyOutcome.isPolicyValid).toEqual(true);
    });

    it('should defer to canEditSprintGradeValue when projectId and sprintId are present (grade value upsert)', async () => {
      spies.canEditSprintGradeValue.mockResolvedValueOnce(true);
      const mockReq = createRequest();
      mockReq.params = { projectId: '1', sprintId: '2' };
      const userSessionObject = { user_id: 1, user_is_admin: false } as UserSession;
      const policyOutcome = await gradePolicy.applyGradePolicy(mockReq, userSessionObject);
      expect(spies.canEditSprintGradeValue).toHaveBeenCalledWith(1, 1, 2, false);
      expect(spies.canAssignTaForSprint).not.toHaveBeenCalled();
      expect(policyOutcome.isPolicyValid).toEqual(true);
    });

    it('should defer to canAssignTaForSprint when projectId and sprintId are present and the route is assign-ta', async () => {
      spies.canAssignTaForSprint.mockResolvedValueOnce(true);
      const mockReq = createRequest({ url: '/api/project/1/sprint/2/grade/assign-ta' });
      mockReq.params = { projectId: '1', sprintId: '2' };
      const userSessionObject = { user_id: 1, user_is_admin: false } as UserSession;
      const policyOutcome = await gradePolicy.applyGradePolicy(mockReq, userSessionObject);
      expect(spies.canAssignTaForSprint).toHaveBeenCalledWith(1, 1, false);
      expect(spies.canEditSprintGradeValue).not.toHaveBeenCalled();
      expect(policyOutcome.isPolicyValid).toEqual(true);
    });

    it('should defer to canBulkSetSprintMaxMarks for the course-level bulk max-marks route', async () => {
      spies.canBulkSetSprintMaxMarks.mockResolvedValueOnce(true);
      const mockReq = createRequest({ url: '/api/course/1/sprint/grade/max-marks' });
      mockReq.params = { courseId: '1' };
      const userSessionObject = { user_id: 1, user_is_admin: false } as UserSession;
      const policyOutcome = await gradePolicy.applyGradePolicy(mockReq, userSessionObject);
      expect(spies.canBulkSetSprintMaxMarks).toHaveBeenCalledWith(1, 1, false);
      expect(policyOutcome.isPolicyValid).toEqual(true);
    });
  });
});
