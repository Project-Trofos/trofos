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

  describe('createInvite', () => {
    it('should create an invite without conflicting with an existing project link', async () => {
      prismaMock.invite.upsert.mockResolvedValueOnce(validInviteData);
      const result = await invite.createInvite(
        validInviteData.project_id,
        validInviteData.unique_token,
      );

      expect(prismaMock.invite.upsert).toHaveBeenCalledWith({
        where: {
          project_id: validInviteData.project_id,
        },
        create: {
          project_id: validInviteData.project_id,
          unique_token: validInviteData.unique_token,
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
      );
      expect(result).toEqual(updatedInviteData);
    });
  });

});
