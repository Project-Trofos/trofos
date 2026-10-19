import { prismaMock } from '../../models/mock/mockPrismaClient';
import gradeConstraint from '../../policies/constraints/grade.constraint';
import gradeService from '../../services/grade.service';
import { BadRequestError } from '../../helpers/error';
import { mockGradeAuditLogData, mockGradeData, mockMilestoneData } from '../mocks/gradeData';

describe('grade.service tests', () => {
  const policyConstraint = gradeConstraint.gradePolicyConstraint(1, true);

  describe('listByCourse', () => {
    it('should return all grades for a course', async () => {
      prismaMock.grade.findMany.mockResolvedValueOnce(mockGradeData as any);
      await expect(gradeService.listByCourse(1, policyConstraint)).resolves.toEqual(mockGradeData);
    });
  });

  describe('listByProject', () => {
    it('should return all grades for a project', async () => {
      prismaMock.grade.findMany.mockResolvedValueOnce(mockGradeData as any);
      await expect(gradeService.listByProject(1, policyConstraint)).resolves.toEqual(mockGradeData);
    });
  });

  describe('upsertMilestoneGrade', () => {
    it('should reject when milestone belongs to a different course than the project', async () => {
      prismaMock.project.findUniqueOrThrow.mockResolvedValueOnce({ id: 1, course_id: 1 } as any);
      prismaMock.milestone.findUniqueOrThrow.mockResolvedValueOnce({ ...mockMilestoneData, course_id: 2 } as any);

      await expect(
        gradeService.upsertMilestoneGrade(1, 1, 1, { score: 50 }),
      ).rejects.toThrow(BadRequestError);
    });

    it('should reject a score above the milestone max_marks', async () => {
      prismaMock.project.findUniqueOrThrow.mockResolvedValueOnce({ id: 1, course_id: 1 } as any);
      prismaMock.milestone.findUniqueOrThrow.mockResolvedValueOnce(mockMilestoneData as any);

      await expect(
        gradeService.upsertMilestoneGrade(1, 1, 1, { score: 150 }),
      ).rejects.toThrow(BadRequestError);
    });

    it('should reject a negative score', async () => {
      prismaMock.project.findUniqueOrThrow.mockResolvedValueOnce({ id: 1, course_id: 1 } as any);
      prismaMock.milestone.findUniqueOrThrow.mockResolvedValueOnce(mockMilestoneData as any);

      await expect(
        gradeService.upsertMilestoneGrade(1, 1, 1, { score: -5 }),
      ).rejects.toThrow(BadRequestError);
    });

    it('should upsert the grade and force status back to DRAFT', async () => {
      prismaMock.project.findUniqueOrThrow.mockResolvedValueOnce({ id: 1, course_id: 1 } as any);
      prismaMock.milestone.findUniqueOrThrow.mockResolvedValueOnce(mockMilestoneData as any);
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      const upserted = { ...mockGradeData[0], score: 90 };
      prismaMock.grade.upsert.mockResolvedValueOnce(upserted as any);

      const result = await gradeService.upsertMilestoneGrade(1, 1, 1, { score: 90, comment: 'great' });
      expect(result).toEqual(upserted);
      expect(prismaMock.grade.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ status: 'DRAFT' }),
          update: expect.objectContaining({ status: 'DRAFT' }),
        }),
      );
    });

    it('should write a GradeAuditLog row with action MILESTONE_GRADE_UPSERTED using the resulting score/comment', async () => {
      prismaMock.project.findUniqueOrThrow.mockResolvedValueOnce({ id: 1, course_id: 1 } as any);
      prismaMock.milestone.findUniqueOrThrow.mockResolvedValueOnce(mockMilestoneData as any);
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      const upserted = { ...mockGradeData[0], score: 90, comment: 'great' };
      prismaMock.grade.upsert.mockResolvedValueOnce(upserted as any);

      await gradeService.upsertMilestoneGrade(1, 1, 7, { score: 90, comment: 'great' });

      expect(prismaMock.gradeAuditLog.create).toHaveBeenCalledWith({
        data: {
          project_id: 1,
          milestone_id: 1,
          action: 'MILESTONE_GRADE_UPSERTED',
          score: 90,
          comment: 'great',
          status: 'DRAFT',
          actor_id: 7,
        },
      });
    });
  });

  describe('publish/unpublish grade', () => {
    it('should publish a grade', async () => {
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      const published = { ...mockGradeData[0], status: 'PUBLISHED' as const };
      prismaMock.grade.update.mockResolvedValueOnce(published as any);
      await expect(gradeService.publishGrade(1, 7)).resolves.toEqual(published);
    });

    it('should write a GradeAuditLog row with action MILESTONE_GRADE_PUBLISHED using the updated grade snapshot', async () => {
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      const published = { ...mockGradeData[0], status: 'PUBLISHED' as const };
      prismaMock.grade.update.mockResolvedValueOnce(published as any);

      await gradeService.publishGrade(1, 7);

      expect(prismaMock.gradeAuditLog.create).toHaveBeenCalledWith({
        data: {
          project_id: published.project_id,
          milestone_id: published.milestone_id,
          action: 'MILESTONE_GRADE_PUBLISHED',
          score: published.score,
          comment: published.comment,
          status: 'PUBLISHED',
          actor_id: 7,
        },
      });
    });

    it('should unpublish a grade', async () => {
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      prismaMock.grade.update.mockResolvedValueOnce(mockGradeData[0] as any);
      await expect(gradeService.unpublishGrade(1, 7)).resolves.toEqual(mockGradeData[0]);
    });

    it('should write a GradeAuditLog row with action MILESTONE_GRADE_UNPUBLISHED using the updated grade snapshot', async () => {
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      prismaMock.grade.update.mockResolvedValueOnce(mockGradeData[0] as any);

      await gradeService.unpublishGrade(1, 7);

      expect(prismaMock.gradeAuditLog.create).toHaveBeenCalledWith({
        data: {
          project_id: mockGradeData[0].project_id,
          milestone_id: mockGradeData[0].milestone_id,
          action: 'MILESTONE_GRADE_UNPUBLISHED',
          score: mockGradeData[0].score,
          comment: mockGradeData[0].comment,
          status: mockGradeData[0].status,
          actor_id: 7,
        },
      });
    });
  });

  describe('assignTaForMilestone', () => {
    it('should upsert the assigned TA on the milestone grade, creating the row if needed', async () => {
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      const assigned = { ...mockGradeData[0], score: null, comment: null, grader_id: 7 };
      prismaMock.grade.upsert.mockResolvedValueOnce(assigned as any);
      await expect(gradeService.assignTaForMilestone(1, 1, 7, 7)).resolves.toEqual(assigned);
      expect(prismaMock.grade.upsert).toHaveBeenCalledWith({
        where: { project_id_milestone_id: { project_id: 1, milestone_id: 1 } },
        create: { project_id: 1, milestone_id: 1, grader_id: 7 },
        update: { grader_id: 7 },
      });
    });

    it('should write a GradeAuditLog row with action TA_ASSIGNED and the new assigned_ta_id, with no status/score set', async () => {
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      const assigned = { ...mockGradeData[0], score: null, comment: null, grader_id: 7 };
      prismaMock.grade.upsert.mockResolvedValueOnce(assigned as any);

      await gradeService.assignTaForMilestone(1, 1, 7, 9);

      expect(prismaMock.gradeAuditLog.create).toHaveBeenCalledWith({
        data: {
          project_id: 1,
          milestone_id: 1,
          action: 'TA_ASSIGNED',
          assigned_ta_id: 7,
          actor_id: 9,
        },
      });
    });

    it('should allow clearing the assigned TA', async () => {
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      const cleared = { ...mockGradeData[0], grader_id: null };
      prismaMock.grade.upsert.mockResolvedValueOnce(cleared as any);
      await expect(gradeService.assignTaForMilestone(1, 1, null, 9)).resolves.toEqual(cleared);
    });

    it('should write a GradeAuditLog row with assigned_ta_id null when un-assigning', async () => {
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      const cleared = { ...mockGradeData[0], grader_id: null };
      prismaMock.grade.upsert.mockResolvedValueOnce(cleared as any);

      await gradeService.assignTaForMilestone(1, 1, null, 9);

      expect(prismaMock.gradeAuditLog.create).toHaveBeenCalledWith({
        data: {
          project_id: 1,
          milestone_id: 1,
          action: 'TA_ASSIGNED',
          assigned_ta_id: null,
          actor_id: 9,
        },
      });
    });
  });

  describe('getGradeHistory', () => {
    it('should return all audit log rows for a project ordered by created_at desc, including only safe actor fields', async () => {
      prismaMock.gradeAuditLog.findMany.mockResolvedValueOnce([mockGradeAuditLogData] as any);

      await expect(gradeService.getGradeHistory(1)).resolves.toEqual([mockGradeAuditLogData]);

      expect(prismaMock.gradeAuditLog.findMany).toHaveBeenCalledWith({
        where: { project_id: 1 },
        orderBy: { created_at: 'desc' },
        include: { actor: { select: { user_id: true, user_display_name: true, user_email: true } } },
      });
    });
  });
});
