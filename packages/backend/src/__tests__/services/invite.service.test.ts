import { prismaMock } from '../../models/mock/mockPrismaClient';
import { mockInviteInfoFromProjId, updatedInviteData, validInviteData } from '../mocks/inviteData';
import invite from '../../services/invite.service';

describe('invite.service tests', () => {
  describe('getInvite', () => {
    it('should return invite if exists', async () => {
      prismaMock.invite.findUnique.mockResolvedValueOnce(validInviteData);

      const result = await invite.getInvite(validInviteData.project_id, validInviteData.email);
      expect(result).toEqual(validInviteData);
    });

    it('should return null if not exists', async () => {
      prismaMock.invite.findUnique.mockResolvedValueOnce(null);

      const result = await invite.getInvite(validInviteData.project_id, validInviteData.email);
      expect(result).toEqual(null);
    });
  });

  describe('getInviteByToken', () => {
    it('should return invite if exists', async () => {
      prismaMock.invite.findFirstOrThrow.mockResolvedValueOnce(validInviteData);

      const result = await invite.getInviteByToken(validInviteData.unique_token);
      expect(result).toEqual(validInviteData);
    });

    it('should throw if not exists', async () => {
      const invalidToken = 'invalidToken';
      prismaMock.invite.findFirstOrThrow.mockRejectedValue(Error());

      await expect(invite.getInviteByToken(invalidToken)).rejects.toThrow(Error);
    });
  });

  describe('getInviteByProjectId', () => {
    it('should return all invites of a project', async () => {
      const mockWithEmptyToken = mockInviteInfoFromProjId.map((x) => ({
        ...x,
        unique_token: '',
      }));

      prismaMock.invite.findMany.mockResolvedValueOnce(mockWithEmptyToken);

      const result = await invite.getInviteByProjectId(mockWithEmptyToken[0].project_id);
      expect(result).toEqual(mockWithEmptyToken);
    });
  });

  describe('createInvite', () => {
    it('should return created invite', async () => {
      prismaMock.invite.create.mockResolvedValueOnce(validInviteData);
      const result = await invite.createInvite(
        validInviteData.project_id,
        validInviteData.email,
        validInviteData.unique_token,
      );
      expect(result).toEqual(validInviteData);
    });
  });

  describe('updateInvite', () => {
    it('should return updated invite', async () => {
      prismaMock.invite.update.mockResolvedValueOnce(updatedInviteData);
      const result = await invite.updateInvite(
        validInviteData.project_id,
        validInviteData.email,
        updatedInviteData.unique_token,
      );
      expect(result).toEqual(updatedInviteData);
    });
  });

  describe('deleteInvite', () => {
    it('should return deleted invite', async () => {
      const deletedInvite = validInviteData;

      prismaMock.invite.delete.mockResolvedValueOnce(deletedInvite);
      const result = await invite.deleteInvite(deletedInvite.project_id, deletedInvite.email);
      expect(result).toEqual(deletedInvite);
    });
  });
});
