import { prismaMock } from '../../models/mock/mockPrismaClient';
import gradeConstraint from '../../policies/constraints/grade.constraint';
import { HAS_GRADE_CONTENT } from '../../helpers/gradeFilters';
import gradeService from '../../services/grade.service';
import { BadRequestError, ConflictError } from '../../helpers/error';
import { mockGradeAuditLogData, mockGradeData, mockMilestoneData, mockSprintGradeData } from '../mocks/gradeData';
import { mockSprintData } from '../mocks/sprintData';

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

  describe('upsertSprintGrade', () => {
    it('should reject when the sprint does not belong to the given project', async () => {
      prismaMock.project.findUniqueOrThrow.mockResolvedValueOnce({ id: 1 } as any);
      prismaMock.sprint.findUniqueOrThrow.mockResolvedValueOnce({ ...mockSprintData, project_id: 2, max_marks: 50 } as any);

      await expect(
        gradeService.upsertSprintGrade(1, 1, 1, { score: 10 }),
      ).rejects.toThrow(BadRequestError);
    });

    it('should reject grading a sprint that has no max_marks set yet', async () => {
      prismaMock.project.findUniqueOrThrow.mockResolvedValueOnce({ id: 1 } as any);
      prismaMock.sprint.findUniqueOrThrow.mockResolvedValueOnce({ ...mockSprintData, project_id: 1, max_marks: null } as any);

      await expect(
        gradeService.upsertSprintGrade(1, 1, 1, { score: 10 }),
      ).rejects.toThrow(BadRequestError);
    });

    it('should reject a score above the sprint max_marks', async () => {
      prismaMock.project.findUniqueOrThrow.mockResolvedValueOnce({ id: 1 } as any);
      prismaMock.sprint.findUniqueOrThrow.mockResolvedValueOnce({ ...mockSprintData, project_id: 1, max_marks: 50 } as any);

      await expect(
        gradeService.upsertSprintGrade(1, 1, 1, { score: 150 }),
      ).rejects.toThrow(BadRequestError);
    });

    it('should upsert the sprint grade and force status back to DRAFT', async () => {
      prismaMock.project.findUniqueOrThrow.mockResolvedValueOnce({ id: 1 } as any);
      prismaMock.sprint.findUniqueOrThrow.mockResolvedValueOnce({ ...mockSprintData, project_id: 1, max_marks: 50 } as any);
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      const upserted = { ...mockSprintGradeData, score: 40 };
      prismaMock.grade.upsert.mockResolvedValueOnce(upserted as any);

      const result = await gradeService.upsertSprintGrade(1, 1, 1, { score: 40, comment: 'good sprint' });
      expect(result).toEqual(upserted);
      expect(prismaMock.grade.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { project_id_sprint_id: { project_id: 1, sprint_id: 1 } },
          create: expect.objectContaining({ status: 'DRAFT' }),
          update: expect.objectContaining({ status: 'DRAFT' }),
        }),
      );
    });

    it('should write a GradeAuditLog row with action SPRINT_GRADE_UPSERTED using the resulting score/comment', async () => {
      prismaMock.project.findUniqueOrThrow.mockResolvedValueOnce({ id: 1 } as any);
      prismaMock.sprint.findUniqueOrThrow.mockResolvedValueOnce({ ...mockSprintData, project_id: 1, max_marks: 50 } as any);
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      const upserted = { ...mockSprintGradeData, score: 40, comment: 'good sprint' };
      prismaMock.grade.upsert.mockResolvedValueOnce(upserted as any);

      await gradeService.upsertSprintGrade(1, 1, 7, { score: 40, comment: 'good sprint' });

      expect(prismaMock.gradeAuditLog.create).toHaveBeenCalledWith({
        data: {
          project_id: 1,
          sprint_id: 1,
          action: 'SPRINT_GRADE_UPSERTED',
          score: 40,
          comment: 'good sprint',
          status: 'DRAFT',
          actor_id: 7,
        },
      });
    });
  });

  describe('publish/unpublish grade', () => {
    it('should reject publishing a grade that has not been scored yet', async () => {
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      prismaMock.grade.findUniqueOrThrow.mockResolvedValueOnce({ ...mockGradeData[0], score: null } as any);

      await expect(gradeService.publishGrade(1, 7)).rejects.toThrow(BadRequestError);
      expect(prismaMock.grade.update).not.toHaveBeenCalled();
    });

    it('should publish a grade', async () => {
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      prismaMock.grade.findUniqueOrThrow.mockResolvedValueOnce(mockGradeData[0] as any);
      const published = { ...mockGradeData[0], status: 'PUBLISHED' as const };
      prismaMock.grade.update.mockResolvedValueOnce(published as any);
      await expect(gradeService.publishGrade(1, 7)).resolves.toEqual(published);
    });

    it('should write a GradeAuditLog row with action MILESTONE_GRADE_PUBLISHED using the updated grade snapshot', async () => {
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      prismaMock.grade.findUniqueOrThrow.mockResolvedValueOnce(mockGradeData[0] as any);
      const published = { ...mockGradeData[0], status: 'PUBLISHED' as const };
      prismaMock.grade.update.mockResolvedValueOnce(published as any);

      await gradeService.publishGrade(1, 7);

      expect(prismaMock.gradeAuditLog.create).toHaveBeenCalledWith({
        data: {
          project_id: published.project_id,
          milestone_id: published.milestone_id,
          sprint_id: published.sprint_id,
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
          sprint_id: mockGradeData[0].sprint_id,
          action: 'MILESTONE_GRADE_UNPUBLISHED',
          score: mockGradeData[0].score,
          comment: mockGradeData[0].comment,
          status: mockGradeData[0].status,
          actor_id: 7,
        },
      });
    });
  });

  describe('publish/unpublish grade (sprint grade)', () => {
    it('should reject publishing a sprint grade that has not been scored yet', async () => {
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      prismaMock.grade.findUniqueOrThrow.mockResolvedValueOnce({ ...mockSprintGradeData, score: null } as any);

      await expect(gradeService.publishGrade(2, 7)).rejects.toThrow(BadRequestError);
      expect(prismaMock.grade.update).not.toHaveBeenCalled();
    });

    it('should write a GradeAuditLog row with action SPRINT_GRADE_PUBLISHED when the grade targets a sprint', async () => {
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      prismaMock.grade.findUniqueOrThrow.mockResolvedValueOnce(mockSprintGradeData as any);
      const published = { ...mockSprintGradeData, status: 'PUBLISHED' as const };
      prismaMock.grade.update.mockResolvedValueOnce(published as any);

      await gradeService.publishGrade(2, 7);

      expect(prismaMock.gradeAuditLog.create).toHaveBeenCalledWith({
        data: {
          project_id: published.project_id,
          milestone_id: published.milestone_id,
          sprint_id: published.sprint_id,
          action: 'SPRINT_GRADE_PUBLISHED',
          score: published.score,
          comment: published.comment,
          status: 'PUBLISHED',
          actor_id: 7,
        },
      });
    });

    it('should write a GradeAuditLog row with action SPRINT_GRADE_UNPUBLISHED when the grade targets a sprint', async () => {
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      prismaMock.grade.update.mockResolvedValueOnce(mockSprintGradeData as any);

      await gradeService.unpublishGrade(2, 7);

      expect(prismaMock.gradeAuditLog.create).toHaveBeenCalledWith({
        data: {
          project_id: mockSprintGradeData.project_id,
          milestone_id: mockSprintGradeData.milestone_id,
          sprint_id: mockSprintGradeData.sprint_id,
          action: 'SPRINT_GRADE_UNPUBLISHED',
          score: mockSprintGradeData.score,
          comment: mockSprintGradeData.comment,
          status: mockSprintGradeData.status,
          actor_id: 7,
        },
      });
    });
  });

  describe('assignTaForSprint', () => {
    it('should upsert the assigned TA on the sprint grade, creating the row if needed', async () => {
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      const assigned = { ...mockSprintGradeData, score: null, comment: null, grader_id: 7 };
      prismaMock.grade.upsert.mockResolvedValueOnce(assigned as any);
      await expect(gradeService.assignTaForSprint(1, 1, 7, 7)).resolves.toEqual(assigned);
      expect(prismaMock.grade.upsert).toHaveBeenCalledWith({
        where: { project_id_sprint_id: { project_id: 1, sprint_id: 1 } },
        create: { project_id: 1, sprint_id: 1, grader_id: 7 },
        update: { grader_id: 7 },
      });
    });

    it('should write a GradeAuditLog row with action SPRINT_TA_ASSIGNED and the new assigned_ta_id', async () => {
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      const assigned = { ...mockSprintGradeData, score: null, comment: null, grader_id: 7 };
      prismaMock.grade.upsert.mockResolvedValueOnce(assigned as any);

      await gradeService.assignTaForSprint(1, 1, 7, 9);

      expect(prismaMock.gradeAuditLog.create).toHaveBeenCalledWith({
        data: {
          project_id: 1,
          sprint_id: 1,
          action: 'SPRINT_TA_ASSIGNED',
          assigned_ta_id: 7,
          actor_id: 9,
        },
      });
    });

    it('should allow clearing the assigned TA', async () => {
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      const cleared = { ...mockSprintGradeData, grader_id: null };
      prismaMock.grade.upsert.mockResolvedValueOnce(cleared as any);
      await expect(gradeService.assignTaForSprint(1, 1, null, 9)).resolves.toEqual(cleared);
    });
  });

  describe('bulkSetSprintMaxMarks', () => {
    it('should reject maxMarks that are negative', async () => {
      await expect(
        gradeService.bulkSetSprintMaxMarks(1, [1], -10, false, 9),
      ).rejects.toThrow(BadRequestError);
    });

    it('should reject when a sprint id could not be found', async () => {
      prismaMock.sprint.findMany.mockResolvedValueOnce([]);

      await expect(
        gradeService.bulkSetSprintMaxMarks(1, [1], 50, false, 9),
      ).rejects.toThrow(BadRequestError);
    });

    it('should reject when a sprint belongs to a different course', async () => {
      prismaMock.sprint.findMany.mockResolvedValueOnce([
        { ...mockSprintData, id: 1, project: { id: 1, course_id: 2 } },
      ] as any);

      await expect(
        gradeService.bulkSetSprintMaxMarks(1, [1], 50, false, 9),
      ).rejects.toThrow(BadRequestError);
    });

    it('should reject when any selected sprint has a published grade', async () => {
      prismaMock.sprint.findMany.mockResolvedValueOnce([
        { ...mockSprintData, id: 1, project: { id: 1, course_id: 1 } },
      ] as any);
      prismaMock.grade.count.mockResolvedValueOnce(1);
      prismaMock.grade.findMany.mockResolvedValueOnce([]);

      await expect(
        gradeService.bulkSetSprintMaxMarks(1, [1], 50, false, 9),
      ).rejects.toThrow(BadRequestError);
    });

    it('should raise a ConflictError when existing grades would be reset and confirm is not set', async () => {
      prismaMock.sprint.findMany.mockResolvedValueOnce([
        { ...mockSprintData, id: 1, project: { id: 1, course_id: 1 } },
      ] as any);
      prismaMock.grade.count.mockResolvedValueOnce(0);
      prismaMock.grade.findMany.mockResolvedValueOnce([{ project_id: 1, sprint_id: 1 }] as any);

      await expect(
        gradeService.bulkSetSprintMaxMarks(1, [1], 50, false, 9),
      ).rejects.toThrow(ConflictError);
    });

    it('should wipe affected grades, write audit logs, and update max_marks when confirm is set', async () => {
      prismaMock.sprint.findMany.mockResolvedValueOnce([
        { ...mockSprintData, id: 1, project: { id: 1, course_id: 1 } },
        { ...mockSprintData, id: 2, project: { id: 2, course_id: 1 } },
      ] as any);
      prismaMock.grade.count.mockResolvedValueOnce(0);
      prismaMock.grade.findMany.mockResolvedValueOnce([
        { project_id: 1, sprint_id: 1 },
        { project_id: 2, sprint_id: 2 },
      ] as any);
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));

      const result = await gradeService.bulkSetSprintMaxMarks(1, [1, 2], 50, true, 9);

      expect(result).toEqual({ updatedCount: 2 });
      expect(prismaMock.grade.findMany).toHaveBeenCalledWith({
        where: { sprint_id: { in: [1, 2] }, ...HAS_GRADE_CONTENT },
        select: { project_id: true, sprint_id: true },
      });
      expect(prismaMock.grade.updateMany).toHaveBeenCalledWith({
        where: { sprint_id: { in: [1, 2] }, ...HAS_GRADE_CONTENT },
        data: { score: null, comment: null },
      });
      expect(prismaMock.gradeAuditLog.createMany).toHaveBeenCalledWith({
        data: [
          {
            project_id: 1,
            sprint_id: 1,
            action: 'SPRINT_MAX_MARKS_UPDATED',
            score: null,
            comment: null,
            status: 'DRAFT',
            actor_id: 9,
          },
          {
            project_id: 2,
            sprint_id: 2,
            action: 'SPRINT_MAX_MARKS_UPDATED',
            score: null,
            comment: null,
            status: 'DRAFT',
            actor_id: 9,
          },
        ],
      });
      expect(prismaMock.sprint.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2] } },
        data: { max_marks: 50 },
      });
    });

    it('should update max_marks directly with no audit logs when there are no existing grades to reset', async () => {
      prismaMock.sprint.findMany.mockResolvedValueOnce([
        { ...mockSprintData, id: 1, project: { id: 1, course_id: 1 } },
      ] as any);
      prismaMock.grade.count.mockResolvedValueOnce(0);
      prismaMock.grade.findMany.mockResolvedValueOnce([]);
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));

      const result = await gradeService.bulkSetSprintMaxMarks(1, [1], 50, false, 9);

      expect(result).toEqual({ updatedCount: 1 });
      expect(prismaMock.grade.updateMany).not.toHaveBeenCalled();
      expect(prismaMock.gradeAuditLog.createMany).not.toHaveBeenCalled();
      expect(prismaMock.sprint.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [1] } },
        data: { max_marks: 50 },
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
