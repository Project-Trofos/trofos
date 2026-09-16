import { prismaMock } from '../../models/mock/mockPrismaClient';
import { updatedInviteData, validInviteData } from '../mocks/inviteData';
import invite from '../../services/invite.service';

describe('invite.service tests', () => {
  describe('getInviteByProjectId', () => {
    it('should return invite if exists', async () => {
      prismaMock.invite.findUnique.mockResolvedValueOnce(validInviteData);

      const result = await invite.getInviteByProjectId(validInviteData.project_id);
      expect(result).toEqual(validInviteData);
    });

    it('should return null if not exists', async () => {
      prismaMock.invite.findUnique.mockResolvedValueOnce(null);

      const result = await invite.getInviteByProjectId(validInviteData.project_id);
      expect(result).toEqual(null);
    });
  });

  describe('getInviteByToken', () => {
    it('should return invite if exists', async () => {
      prismaMock.invite.findUnique.mockResolvedValueOnce(validInviteData);

      const result = await invite.getInviteByToken(validInviteData.unique_token);
      expect(result).toEqual(validInviteData);
    });

    it('should return null if not exists', async () => {
      const invalidToken = 'invalidToken';
      prismaMock.invite.findUnique.mockResolvedValueOnce(null);

      await expect(invite.getInviteByToken(invalidToken)).resolves.toBeNull();
    });
  });

  describe('getInviteMetadataByToken', () => {
    it('should return the inviter, project and course metadata', async () => {
      const metadata = {
        ...validInviteData,
        inviter: { user_display_name: 'Alex Tan' },
        project: {
          pname: 'Test project',
          course: { cname: 'Test course', shadow_course: false },
        },
      };
      prismaMock.invite.findUnique.mockResolvedValueOnce(metadata);

      const result = await invite.getInviteMetadataByToken(validInviteData.unique_token);

      expect(prismaMock.invite.findUnique).toHaveBeenCalledWith({
        where: { unique_token: validInviteData.unique_token },
        include: {
          inviter: { select: { user_display_name: true } },
          project: {
            include: {
              course: { select: { cname: true, shadow_course: true } },
            },
          },
        },
      });
      expect(result).toEqual(metadata);
    });
  });

  describe('createInvite', () => {
    it('should create an invite without conflicting with an existing project link', async () => {
      prismaMock.invite.upsert.mockResolvedValueOnce(validInviteData);
      const result = await invite.createInvite(
        validInviteData.project_id,
        validInviteData.unique_token,
        validInviteData.inviter_id,
      );

      expect(prismaMock.invite.upsert).toHaveBeenCalledWith({
        where: {
          project_id: validInviteData.project_id,
        },
        create: {
          project_id: validInviteData.project_id,
          unique_token: validInviteData.unique_token,
          inviter_id: validInviteData.inviter_id,
        },
        update: {},
      });
      expect(result).toEqual(validInviteData);
    });
  });

  describe('updateInvite', () => {
    it('should return updated invite', async () => {
      prismaMock.invite.update.mockResolvedValueOnce(updatedInviteData);
      const result = await invite.updateInvite(
        validInviteData.project_id,
        updatedInviteData.unique_token,
        updatedInviteData.inviter_id,
      );
      expect(result).toEqual(updatedInviteData);
    });
  });
});
