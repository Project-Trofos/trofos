import { Grade, Project } from '@prisma/client';
import { prismaMock } from '../../../models/mock/mockPrismaClient';
import gradeConstraint from '../../../policies/constraints/grade.constraint';
import { FACULTY_ROLE_ID } from '../../../helpers/constants';

describe('grade.constraint tests', () => {
  describe('canManageGrade', () => {
    it('should return true if the user is an admin', async () => {
      await expect(gradeConstraint.canManageGrade(1, 1, true)).resolves.toEqual(true);
    });

    it('should return true if the user has a course role for the grade project (FACULTY, including TAs)', async () => {
      const testGrade = {} as Grade;
      prismaMock.grade.findMany.mockResolvedValueOnce([testGrade]);
      await expect(gradeConstraint.canManageGrade(1, 1, false)).resolves.toEqual(true);
    });

    it('should return false if the user has no course role for the grade project', async () => {
      prismaMock.grade.findMany.mockResolvedValueOnce([]);
      await expect(gradeConstraint.canManageGrade(1, 1, false)).resolves.toEqual(false);
    });

    it("should only query for a FACULTY course role, so a student's own grades are not 'manage'-accessible", async () => {
      prismaMock.grade.findMany.mockResolvedValueOnce([{} as Grade]);
      await gradeConstraint.canManageGrade(1, 1, false);
      const queryArg = prismaMock.grade.findMany.mock.calls[0][0] as any;
      expect(queryArg.where.AND[0].OR).toContainEqual(
        expect.objectContaining({
          project: expect.objectContaining({
            course: expect.objectContaining({
              courseRoles: { some: { user_id: 1, role_id: FACULTY_ROLE_ID } },
            }),
          }),
        }),
      );
    });
  });

  describe('canAssignTa', () => {
    it('should return true if the user is an admin', async () => {
      await expect(gradeConstraint.canAssignTa(1, 1, true)).resolves.toEqual(true);
    });

    it('should return true if the user has a FACULTY course role for the project', async () => {
      const testProject = {} as Project;
      prismaMock.project.findMany.mockResolvedValueOnce([testProject]);
      await expect(gradeConstraint.canAssignTa(1, 1, false)).resolves.toEqual(true);
    });

    it('should return false if the user has no course role for the project', async () => {
      prismaMock.project.findMany.mockResolvedValueOnce([]);
      await expect(gradeConstraint.canAssignTa(1, 1, false)).resolves.toEqual(false);
    });

    it('should only query for a FACULTY course role, excluding STUDENT role holders', async () => {
      prismaMock.project.findMany.mockResolvedValueOnce([{} as Project]);
      await gradeConstraint.canAssignTa(1, 1, false);
      expect(prismaMock.project.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              course: {
                courseRoles: {
                  some: { user_id: 1, role_id: FACULTY_ROLE_ID },
                },
              },
            },
            { id: 1 },
          ],
        },
      });
    });
  });

  describe('canEditGradeValue', () => {
    it('should return true if the user is an admin', async () => {
      await expect(gradeConstraint.canEditGradeValue(1, 1, 1, true)).resolves.toEqual(true);
    });

    it("should return true if the user is the milestone grade's assigned TA (grader_id)", async () => {
      const testGrade = { grader_id: 1 } as Grade;
      prismaMock.grade.findUnique.mockResolvedValueOnce(testGrade);
      await expect(gradeConstraint.canEditGradeValue(1, 1, 1, false)).resolves.toEqual(true);
    });

    it("should return false if the user is not the milestone grade's assigned TA", async () => {
      const testGrade = { grader_id: 2 } as Grade;
      prismaMock.grade.findUnique.mockResolvedValueOnce(testGrade);
      await expect(gradeConstraint.canEditGradeValue(1, 1, 1, false)).resolves.toEqual(false);
    });

    it('should return false if the milestone has no assigned TA yet', async () => {
      const testGrade = { grader_id: null } as Grade;
      prismaMock.grade.findUnique.mockResolvedValueOnce(testGrade);
      await expect(gradeConstraint.canEditGradeValue(1, 1, 1, false)).resolves.toEqual(false);
    });

    it('should return false if the project+milestone has no Grade record yet', async () => {
      prismaMock.grade.findUnique.mockResolvedValueOnce(null);
      await expect(gradeConstraint.canEditGradeValue(1, 1, 1, false)).resolves.toEqual(false);
    });

    it('should query by the (project_id, milestone_id) composite key', async () => {
      prismaMock.grade.findUnique.mockResolvedValueOnce({ grader_id: 1 } as Grade);
      await gradeConstraint.canEditGradeValue(1, 5, 9, false);
      expect(prismaMock.grade.findUnique).toHaveBeenCalledWith({
        where: { project_id_milestone_id: { project_id: 5, milestone_id: 9 } },
      });
    });
  });

  describe('canAssignTaForSprint', () => {
    it('should return true if the user is an admin', async () => {
      await expect(gradeConstraint.canAssignTaForSprint(1, 1, true)).resolves.toEqual(true);
    });

    it('should return true if the user has a FACULTY course role for the project', async () => {
      const testProject = {} as Project;
      prismaMock.project.findMany.mockResolvedValueOnce([testProject]);
      await expect(gradeConstraint.canAssignTaForSprint(1, 1, false)).resolves.toEqual(true);
    });

    it('should return false if the user has no course role for the project', async () => {
      prismaMock.project.findMany.mockResolvedValueOnce([]);
      await expect(gradeConstraint.canAssignTaForSprint(1, 1, false)).resolves.toEqual(false);
    });
  });

  describe('canEditSprintGradeValue', () => {
    it('should return true if the user is an admin', async () => {
      await expect(gradeConstraint.canEditSprintGradeValue(1, 1, 1, true)).resolves.toEqual(true);
    });

    it("should return true if the user is the sprint grade's assigned TA (grader_id)", async () => {
      const testGrade = { grader_id: 1 } as Grade;
      prismaMock.grade.findUnique.mockResolvedValueOnce(testGrade);
      await expect(gradeConstraint.canEditSprintGradeValue(1, 1, 1, false)).resolves.toEqual(true);
    });

    it("should return false if the user is not the sprint grade's assigned TA", async () => {
      const testGrade = { grader_id: 2 } as Grade;
      prismaMock.grade.findUnique.mockResolvedValueOnce(testGrade);
      await expect(gradeConstraint.canEditSprintGradeValue(1, 1, 1, false)).resolves.toEqual(false);
    });

    it('should return false if the project+sprint has no Grade record yet', async () => {
      prismaMock.grade.findUnique.mockResolvedValueOnce(null);
      await expect(gradeConstraint.canEditSprintGradeValue(1, 1, 1, false)).resolves.toEqual(false);
    });

    it('should query by the (project_id, sprint_id) composite key', async () => {
      prismaMock.grade.findUnique.mockResolvedValueOnce({ grader_id: 1 } as Grade);
      await gradeConstraint.canEditSprintGradeValue(1, 5, 9, false);
      expect(prismaMock.grade.findUnique).toHaveBeenCalledWith({
        where: { project_id_sprint_id: { project_id: 5, sprint_id: 9 } },
      });
    });
  });

  describe('canBulkSetSprintMaxMarks', () => {
    it('should return true if the user is an admin', async () => {
      await expect(gradeConstraint.canBulkSetSprintMaxMarks(1, 1, true)).resolves.toEqual(true);
    });

    it('should return true if the user has a FACULTY course role for the course', async () => {
      prismaMock.usersOnRolesOnCourses.findMany.mockResolvedValueOnce([{} as any]);
      await expect(gradeConstraint.canBulkSetSprintMaxMarks(1, 1, false)).resolves.toEqual(true);
    });

    it('should return false if the user has no FACULTY course role for the course', async () => {
      prismaMock.usersOnRolesOnCourses.findMany.mockResolvedValueOnce([]);
      await expect(gradeConstraint.canBulkSetSprintMaxMarks(1, 1, false)).resolves.toEqual(false);
    });

    it('should query for a FACULTY course role scoped to the given course', async () => {
      prismaMock.usersOnRolesOnCourses.findMany.mockResolvedValueOnce([{} as any]);
      await gradeConstraint.canBulkSetSprintMaxMarks(1, 5, false);
      expect(prismaMock.usersOnRolesOnCourses.findMany).toHaveBeenCalledWith({
        where: { user_id: 1, course_id: 5, role_id: FACULTY_ROLE_ID },
      });
    });
  });
});
