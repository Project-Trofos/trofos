import { Project, ProjectAssignment } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import projectAssignmentService from '../../services/projectAssignment.service';

describe('projectAssignment.service tests', () => {
  describe('create', () => {
    it('should create a project assignment if both projects exist and belong to the same course', async () => {
      const sourceProjectId = 1;
      const targetProjectId = 2;
      const courseId = 101;

      prismaMock.$transaction.mockResolvedValueOnce([
        {
          id: sourceProjectId,
          course_id: courseId,
        } as Project,
        {
          id: targetProjectId,
          course_id: courseId,
        } as Project,
      ]);

      const mockAssignment: ProjectAssignment = {
        id: 10,
        sourceProjectId,
        targetProjectId,
      };

      prismaMock.projectAssignment.create.mockResolvedValueOnce(mockAssignment);

      const result = await projectAssignmentService.create(sourceProjectId, targetProjectId);

      expect(result).toEqual(mockAssignment);
      expect(prismaMock.project.findUnique).toHaveBeenCalledTimes(2);
      expect(prismaMock.projectAssignment.create).toHaveBeenCalledWith({
        data: {
          sourceProjectId,
          targetProjectId,
        },
      });
    });

    it('should throw an error if one or both projects do not exist', async () => {
      const sourceProjectId = 1;
      const targetProjectId = 2;
      const courseId = 101;

      prismaMock.$transaction.mockResolvedValueOnce([
        null as unknown as Project,
        { id: targetProjectId, course_id: courseId } as Project,
      ]);

      await expect(projectAssignmentService.create(sourceProjectId, targetProjectId)).rejects.toThrowError(
        'One or both projects do not exist.',
      );
      expect(prismaMock.projectAssignment.create).not.toHaveBeenCalled();
    });

    it('should throw an error if the projects do not belong to the same course', async () => {
      const sourceProjectId = 1;
      const targetProjectId = 2;
      const courseId = 101;
      const courseId2 = 102;

      prismaMock.$transaction.mockResolvedValueOnce([
        { id: sourceProjectId, course_id: courseId } as Project,
        { id: targetProjectId, course_id: courseId2 } as Project,
      ]);

      await expect(projectAssignmentService.create(sourceProjectId, targetProjectId)).rejects.toThrowError(
        'Projects must belong to the same course.',
      );
      expect(prismaMock.projectAssignment.create).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a project assignment if it exists', async () => {
      const sourceProjectId = 1;
      const projectAssignmentId = 2;

      const mockAssignment: ProjectAssignment = {
        id: projectAssignmentId,
        sourceProjectId,
        targetProjectId: 3,
      };

      prismaMock.projectAssignment.findUnique.mockResolvedValueOnce(mockAssignment);
      prismaMock.projectAssignment.delete.mockResolvedValueOnce(mockAssignment);

      const result = await projectAssignmentService.remove(sourceProjectId, projectAssignmentId);

      expect(result).toEqual(mockAssignment);
      expect(prismaMock.projectAssignment.findUnique).toHaveBeenCalledWith({
        where: { id: projectAssignmentId },
      });
      expect(prismaMock.projectAssignment.delete).toHaveBeenCalledWith({
        where: { id: projectAssignmentId },
      });
    });

    it('should throw an error if the project assignment does not exist', async () => {
      const sourceProjectId = 1;
      const projectAssignmentId = 2;

      prismaMock.projectAssignment.findUnique.mockResolvedValueOnce(null);

      await expect(projectAssignmentService.remove(sourceProjectId, projectAssignmentId)).rejects.toThrowError(
        'Assigned project does not exist.',
      );
      expect(prismaMock.projectAssignment.delete).not.toHaveBeenCalled();
    });

    it('should throw an error if the source project ID does not match', async () => {
      const sourceProjectId = 1;
      const projectAssignmentId = 2;

      const mockAssignment: ProjectAssignment = {
        id: projectAssignmentId,
        sourceProjectId: 3,
        targetProjectId: 4,
      };

      prismaMock.projectAssignment.findUnique.mockResolvedValueOnce(mockAssignment);

      await expect(projectAssignmentService.remove(sourceProjectId, projectAssignmentId)).rejects.toThrowError(
        'Unauthorized: Project ID does not match.',
      );
      expect(prismaMock.projectAssignment.delete).not.toHaveBeenCalled();
    });
  });

  describe('getAssignedProjects', () => {
    it('should return assigned projects for a given project ID', async () => {
      const projectId = 1;
      const mockProjectAssignment: ProjectAssignment[] = [
        {
          id: 10,
          sourceProjectId: 1,
          targetProjectId: 2,
        },
      ];

      prismaMock.projectAssignment.findMany.mockResolvedValueOnce(mockProjectAssignment);

      const result = await projectAssignmentService.getAssignedProjects(projectId);

      expect(result).toEqual(mockProjectAssignment);
      expect(prismaMock.projectAssignment.findMany).toHaveBeenCalledWith({
        where: { sourceProjectId: projectId },
        select: { id: true, targetProject: true },
      });
    });

    it('should return an empty array if no assigned projects exists', async () => {
      const projectId = 1;

      prismaMock.projectAssignment.findMany.mockResolvedValueOnce([]);

      const result = await projectAssignmentService.getAssignedProjects(projectId);

      expect(result).toEqual([]);
      expect(prismaMock.projectAssignment.findMany).toHaveBeenCalledWith({
        where: { sourceProjectId: projectId },
        select: { id: true, targetProject: true },
      });
    });
  });
});
