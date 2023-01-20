import { Announcement } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import announcementService from '../../services/announcement.service';

import coursePolicy from '../../policies/constraints/course.constraint';

describe('milestone.service tests', () => {
  const announcementMock: Announcement[] = [
    {
      id: 1,
      course_id: 1,
      user_id: 1,
      title: 'announcement title',
      content: 'announcement content',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const coursePolicyConstraint = coursePolicy.coursePolicyConstraint(1, true);

  describe('get', () => {
    it('should return correct announcement', async () => {
      const announcement = announcementMock[0];
      prismaMock.announcement.findUniqueOrThrow.mockResolvedValueOnce(announcement);

      const result = await announcementService.get(announcement.id);
      expect(result).toEqual<Announcement>(announcement);
    });
  });

  describe('list', () => {
    it('should return correct announcement', async () => {
      prismaMock.announcement.findMany.mockResolvedValueOnce(announcementMock);

      const result = await announcementService.list(coursePolicyConstraint, 1);
      expect(result).toEqual<Announcement[]>(announcementMock);
    });
  });

  describe('create', () => {
    it('should return created announcement', async () => {
      const announcement = announcementMock[0];
      prismaMock.announcement.create.mockResolvedValueOnce(announcement);

      const result = await announcementService.create(
        announcement.user_id ?? 1,
        announcement.course_id,
        announcement.title,
        announcement.content,
      );
      expect(result).toEqual<Announcement>(announcement);
    });
  });

  describe('update', () => {
    it('should return updated announcement', async () => {
      const announcement = announcementMock[0];
      const newTitle = 'new announcement title';
      const updatedAnnouncement: Announcement = {
        ...announcement,
        title: newTitle,
      };
      prismaMock.announcement.findUniqueOrThrow.mockResolvedValueOnce(announcement);
      prismaMock.announcement.update.mockResolvedValueOnce(updatedAnnouncement);

      const result = await announcementService.update(announcement.course_id, {
        title: newTitle,
      });
      expect(result).toEqual<Announcement>(updatedAnnouncement);
    });
  });
});
