import { Milestone } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import milestoneService from '../../services/milestone.service';

import coursePolicy from '../../policies/constraints/course.constraint';
import { BadRequestError } from '../../helpers/error';

describe('milestone.service tests', () => {
  const milestoneMock: Milestone[] = [
    {
      id: 1,
      name: 'Milestone 1',
      start_date: new Date(),
      deadline: new Date(),
      created_at: new Date(),
      course_id: 1,
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
  });
});
