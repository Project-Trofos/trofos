import { UserSession } from '@prisma/client';
import { createRequest } from 'node-mocks-http';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import projectOwnerPolicy from '../../policies/projectOwner.policy';
import { projectsData, projectOwnerId } from '../mocks/projectData';

describe('projectOwner.policy tests', () => {
  const userSession = {
    user_id: projectOwnerId,
    user_is_admin: false,
  } as UserSession;

  it('allows the project owner regardless of their role', async () => {
    const project = projectsData[0];
    const request = createRequest({ params: { projectId: String(project.id) } });
    prismaMock.project.findFirst.mockResolvedValueOnce(project);

    const result = await projectOwnerPolicy.applyProjectOwnerPolicy(request, userSession);

    expect(prismaMock.project.findFirst).toHaveBeenCalledWith({
      where: {
        id: project.id,
        owner_id: userSession.user_id,
      },
    });
    expect(result.isPolicyValid).toBe(true);
  });

  it('rejects a user who does not own the project', async () => {
    const project = projectsData[0];
    const request = createRequest({ params: { projectId: String(project.id) } });
    prismaMock.project.findFirst.mockResolvedValueOnce(null);

    const result = await projectOwnerPolicy.applyProjectOwnerPolicy(request, {
      ...userSession,
      user_id: projectOwnerId + 1,
    });

    expect(result.isPolicyValid).toBe(false);
  });
});
