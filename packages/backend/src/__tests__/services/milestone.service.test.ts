import { Milestone } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import { HAS_GRADE_CONTENT } from '../../helpers/gradeFilters';
import milestoneService from '../../services/milestone.service';

import coursePolicy from '../../policies/constraints/course.constraint';
import { BadRequestError, ConflictError } from '../../helpers/error';

describe('milestone.service tests', () => {
  const milestoneMock: Milestone[] = [
    {
      id: 1,
      name: 'Milestone 1',
      start_date: new Date(),
      deadline: new Date(),
      created_at: new Date(),
      course_id: 1,
      max_marks: 100,
    },
  ];

  const coursePolicyConstraint = coursePolicy.coursePolicyConstraint(1, true);

  describe('get', () => {
    it('should return correct milestone', async () => {
      const milestone = milestoneMock[0];
      prismaMock.milestone.findUniqueOrThrow.mockResolvedValueOnce(milestone);

      const result = await milestoneService.get(milestone.id);
      expect(result).toEqual<Milestone>(milestone);
    });
  });

  describe('list', () => {
    it('should return correct milestones', async () => {
      prismaMock.milestone.findMany.mockResolvedValueOnce(milestoneMock);

      const result = await milestoneService.list(coursePolicyConstraint, 1);
      expect(result).toEqual<Milestone[]>(milestoneMock);
    });
  });

  describe('create', () => {
    it('should return created milestone', async () => {
      const milestone = milestoneMock[0];
      prismaMock.milestone.create.mockResolvedValueOnce(milestone);

      const result = await milestoneService.create(
        milestone.course_id,
        milestone.start_date,
        milestone.deadline,
        milestone.name,
      );
      expect(result).toEqual<Milestone>(milestone);
    });
  });

  describe('update', () => {
    it('should return updated milestone', async () => {
      const milestone = milestoneMock[0];
      const newName = 'new milestone name';
      const updatedMilestone: Milestone = {
        ...milestone,
        name: newName,
      };
      prismaMock.milestone.findUniqueOrThrow.mockResolvedValueOnce(milestone);
      prismaMock.milestone.update.mockResolvedValueOnce(updatedMilestone);

      const result = await milestoneService.update(milestone.course_id, undefined, undefined, newName);
      expect(result).toEqual<Milestone>(updatedMilestone);
    });

    it('should throw bad request error if updated deadline is before start date', async () => {
      const milestone = milestoneMock[0];

      // Deadline is before start date
      const newDeadline = new Date(milestone.start_date);
      newDeadline.setDate(newDeadline.getDate() - 1);

      const updatedMilestone: Milestone = {
        ...milestone,
        deadline: newDeadline,
      };
      prismaMock.milestone.findUniqueOrThrow.mockResolvedValueOnce(milestone);
      prismaMock.milestone.update.mockResolvedValueOnce(updatedMilestone);

      const result = milestoneService.update(milestone.course_id, undefined, newDeadline, undefined);
      expect(result).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError when changing max_marks while any grade for the milestone is published', async () => {
      const milestone = milestoneMock[0];
      prismaMock.milestone.findUniqueOrThrow.mockResolvedValueOnce(milestone);
      prismaMock.grade.count.mockResolvedValueOnce(1);
      prismaMock.grade.findMany.mockResolvedValueOnce([{ project_id: 1, id: 1 } as any]);

      const result = milestoneService.update(milestone.id, undefined, undefined, undefined, 50, false, 7);
      await expect(result).rejects.toThrow(BadRequestError);
    });

    it('should throw ConflictError when changing max_marks would reset existing grades without confirm', async () => {
      const milestone = milestoneMock[0];
      prismaMock.milestone.findUniqueOrThrow.mockResolvedValueOnce(milestone);
      prismaMock.grade.count.mockResolvedValueOnce(0);
      prismaMock.grade.findMany.mockResolvedValueOnce([{ project_id: 1, id: 1 } as any]);

      const result = milestoneService.update(milestone.id, undefined, undefined, undefined, 50, false, 7);
      await expect(result).rejects.toThrow(ConflictError);
    });

    it('should not require confirm when changing max_marks and there are no existing grades for the milestone', async () => {
      const milestone = milestoneMock[0];
      const updatedMilestone: Milestone = { ...milestone, max_marks: 50 };
      prismaMock.milestone.findUniqueOrThrow.mockResolvedValueOnce(milestone);
      prismaMock.grade.count.mockResolvedValueOnce(0);
      prismaMock.grade.findMany.mockResolvedValueOnce([]);
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      prismaMock.milestone.update.mockResolvedValueOnce(updatedMilestone);

      const result = await milestoneService.update(milestone.id, undefined, undefined, undefined, 50, false, 7);
      expect(result).toEqual<Milestone>(updatedMilestone);
      expect(prismaMock.grade.updateMany).not.toHaveBeenCalled();
    });

    it('should reset all grades (score/comment to null) for the milestone when confirm is true', async () => {
      const milestone = milestoneMock[0];
      const updatedMilestone: Milestone = { ...milestone, max_marks: 50 };
      prismaMock.milestone.findUniqueOrThrow.mockResolvedValueOnce(milestone);
      prismaMock.grade.count.mockResolvedValueOnce(0);
      prismaMock.grade.findMany.mockResolvedValueOnce([
        { project_id: 1, id: 1 } as any,
        { project_id: 2, id: 2 } as any,
      ]);
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      prismaMock.grade.updateMany.mockResolvedValueOnce({ count: 2 });
      prismaMock.milestone.update.mockResolvedValueOnce(updatedMilestone);

      const result = await milestoneService.update(milestone.id, undefined, undefined, undefined, 50, true, 7);

      expect(result).toEqual<Milestone>(updatedMilestone);
      expect(prismaMock.grade.findMany).toHaveBeenCalledWith({
        where: { milestone_id: milestone.id, ...HAS_GRADE_CONTENT },
        select: { project_id: true, id: true },
      });
      expect(prismaMock.grade.updateMany).toHaveBeenCalledWith({
        where: { milestone_id: milestone.id, ...HAS_GRADE_CONTENT },
        data: { score: null, comment: null },
      });
      expect(prismaMock.gradeAuditLog.createMany).toHaveBeenCalledWith({
        data: [
          {
            project_id: 1,
            milestone_id: milestone.id,
            action: 'MILESTONE_MAX_MARKS_UPDATED',
            score: null,
            comment: null,
            status: 'DRAFT',
            actor_id: 7,
          },
          {
            project_id: 2,
            milestone_id: milestone.id,
            action: 'MILESTONE_MAX_MARKS_UPDATED',
            score: null,
            comment: null,
            status: 'DRAFT',
            actor_id: 7,
          },
        ],
      });
    });

    it('should not reset grades or require confirm when max_marks is unchanged', async () => {
      const milestone = milestoneMock[0];
      const updatedMilestone: Milestone = { ...milestone, name: 'renamed' };
      prismaMock.milestone.findUniqueOrThrow.mockResolvedValueOnce(milestone);
      prismaMock.milestone.update.mockResolvedValueOnce(updatedMilestone);

      const result = await milestoneService.update(
        milestone.id,
        undefined,
        undefined,
        'renamed',
        milestone.max_marks,
        false,
        7,
      );

      expect(result).toEqual<Milestone>(updatedMilestone);
      expect(prismaMock.grade.count).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should throw ConflictError when milestone has grades and confirm is not set', async () => {
      prismaMock.grade.count.mockResolvedValueOnce(2).mockResolvedValueOnce(1);

      const result = milestoneService.remove(1, false);
      await expect(result).rejects.toThrow(ConflictError);
    });

    it('should delete the milestone when confirm is true', async () => {
      const milestone = milestoneMock[0];
      prismaMock.grade.count.mockResolvedValueOnce(2).mockResolvedValueOnce(1);
      prismaMock.milestone.delete.mockResolvedValueOnce(milestone);

      const result = await milestoneService.remove(1, true);
      expect(result).toEqual<Milestone>(milestone);
    });

    it('should delete the milestone directly when it has no grades', async () => {
      const milestone = milestoneMock[0];
      prismaMock.grade.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
      prismaMock.milestone.delete.mockResolvedValueOnce(milestone);

      const result = await milestoneService.remove(1, false);
      expect(result).toEqual<Milestone>(milestone);
    });
  });
});
