import { Action, Prisma, ProjectGrade, ProjectGradeStatus, UserSession } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import gradingService from '../../services/grading.service';
import roleService from '../../services/role.service';
import { UserRoleActionsForCourse } from '../../services/types/role.service.types';
import { BadRequestError, NotAuthorizedError } from '../../helpers/error';
import { ADMIN_ROLE_ID, FACULTY_ROLE_ID } from '../../helpers/constants';

const roleServiceGetUserRoleActionsForCourseSpy = jest.spyOn(roleService, 'getUserRoleActionsForCourse');

describe('grading.service tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const courseId = 1;
  const projectId = 10;
  const taUserId = 100;
  const otherFacultyUserId = 200;

  const gradeMock: ProjectGrade = {
    id: 1,
    project_id: projectId,
    assigned_ta_id: taUserId,
    marks: null,
    comments: null,
    status: ProjectGradeStatus.draft,
    updated_at: new Date(),
    created_at: new Date(),
  };

  const adminSession: UserSession = {
    session_id: 's1',
    user_email: 'admin@test.com',
    user_role_id: ADMIN_ROLE_ID,
    user_id: 1,
    user_is_admin: true,
    session_expiry: new Date(),
  };

  const assignedTaSession: UserSession = {
    session_id: 's2',
    user_email: 'ta@test.com',
    user_role_id: FACULTY_ROLE_ID,
    user_id: taUserId,
    user_is_admin: false,
    session_expiry: new Date(),
  };

  const otherFacultySession: UserSession = {
    session_id: 's3',
    user_email: 'faculty@test.com',
    user_role_id: FACULTY_ROLE_ID,
    user_id: otherFacultyUserId,
    user_is_admin: false,
    session_expiry: new Date(),
  };

  const facultyWithoutManagerActions = {
    role: { actions: [{ role_id: FACULTY_ROLE_ID, action: Action.read_grade }] },
  } as UserRoleActionsForCourse;

  const facultyWithManagerActions = {
    role: { actions: [{ role_id: FACULTY_ROLE_ID, action: Action.update_course }] },
  } as UserRoleActionsForCourse;

  describe('list', () => {
    it('should backfill missing grade rows and return grades for the course', async () => {
      prismaMock.project.findMany.mockResolvedValueOnce([{ id: projectId } as never]);
      prismaMock.projectGrade.createMany.mockResolvedValueOnce({ count: 1 });
      prismaMock.projectGrade.findMany.mockResolvedValueOnce([gradeMock]);

      const result = await gradingService.list(courseId);

      expect(prismaMock.projectGrade.createMany).toHaveBeenCalledWith({
        data: [{ project_id: projectId }],
        skipDuplicates: true,
      });
      expect(result).toEqual([gradeMock]);
    });
  });

  describe('update', () => {
    it('allows the assigned TA to edit their own project', async () => {
      prismaMock.projectGrade.findFirstOrThrow.mockResolvedValueOnce(gradeMock);
      prismaMock.projectGrade.update.mockResolvedValueOnce({ ...gradeMock, marks: new Prisma.Decimal(80) });

      const result = await gradingService.update(courseId, projectId, { marks: 80 }, assignedTaSession);

      expect(result.marks?.toNumber()).toEqual(80);
    });

    it('rejects a non-admin, non-assigned faculty member from editing the project', async () => {
      prismaMock.projectGrade.findFirstOrThrow.mockResolvedValueOnce(gradeMock);
      roleServiceGetUserRoleActionsForCourseSpy.mockResolvedValueOnce(facultyWithoutManagerActions);

      await expect(
        gradingService.update(courseId, projectId, { marks: 80 }, otherFacultySession),
      ).rejects.toThrow(NotAuthorizedError);
    });

    it('allows a course admin/instructor to edit any project', async () => {
      prismaMock.projectGrade.findFirstOrThrow.mockResolvedValueOnce(gradeMock);
      prismaMock.projectGrade.update.mockResolvedValueOnce({ ...gradeMock, marks: new Prisma.Decimal(90) });

      const result = await gradingService.update(courseId, projectId, { marks: 90 }, adminSession);

      expect(result.marks?.toNumber()).toEqual(90);
    });

    it('allows a faculty member with update_course action to edit any project', async () => {
      prismaMock.projectGrade.findFirstOrThrow.mockResolvedValueOnce(gradeMock);
      roleServiceGetUserRoleActionsForCourseSpy.mockResolvedValueOnce(facultyWithManagerActions);
      prismaMock.projectGrade.update.mockResolvedValueOnce({ ...gradeMock, marks: new Prisma.Decimal(70) });

      const result = await gradingService.update(courseId, projectId, { marks: 70 }, otherFacultySession);

      expect(result.marks?.toNumber()).toEqual(70);
    });

    it('rejects a TA trying to reassign the grader for their own project', async () => {
      prismaMock.projectGrade.findFirstOrThrow.mockResolvedValueOnce(gradeMock);
      roleServiceGetUserRoleActionsForCourseSpy.mockResolvedValueOnce(facultyWithoutManagerActions);

      await expect(
        gradingService.update(courseId, projectId, { assignedTaId: otherFacultyUserId }, assignedTaSession),
      ).rejects.toThrow(NotAuthorizedError);
    });

    it('rejects transitioning directly to published', async () => {
      prismaMock.projectGrade.findFirstOrThrow.mockResolvedValueOnce(gradeMock);

      await expect(
        gradingService.update(courseId, projectId, { status: ProjectGradeStatus.published }, assignedTaSession),
      ).rejects.toThrow(BadRequestError);
    });

    it('rejects the assigned TA from editing a grade that has already been published', async () => {
      const publishedGrade = { ...gradeMock, status: ProjectGradeStatus.published };
      prismaMock.projectGrade.findFirstOrThrow.mockResolvedValueOnce(publishedGrade);

      await expect(
        gradingService.update(courseId, projectId, { marks: 50 }, assignedTaSession),
      ).rejects.toThrow(NotAuthorizedError);
    });

    it('rejects a course admin from amending a grade that has already been published', async () => {
      const publishedGrade = { ...gradeMock, status: ProjectGradeStatus.published };
      prismaMock.projectGrade.findFirstOrThrow.mockResolvedValueOnce(publishedGrade);

      await expect(
        gradingService.update(courseId, projectId, { marks: 60 }, adminSession),
      ).rejects.toThrow(NotAuthorizedError);
    });
  });

  describe('publishAll', () => {
    it('allows a course admin to publish all grades', async () => {
      prismaMock.projectGrade.updateMany.mockResolvedValueOnce({ count: 3 });

      const result = await gradingService.publishAll(courseId, adminSession);

      expect(result).toEqual({ count: 3 });
      expect(prismaMock.projectGrade.updateMany).toHaveBeenCalledWith({
        where: {
          project: { course_id: courseId },
          status: { in: [ProjectGradeStatus.draft, ProjectGradeStatus.submitted] },
        },
        data: { status: ProjectGradeStatus.published },
      });
    });

    it('rejects a TA from bulk publishing', async () => {
      roleServiceGetUserRoleActionsForCourseSpy.mockResolvedValueOnce(facultyWithoutManagerActions);

      await expect(gradingService.publishAll(courseId, assignedTaSession)).rejects.toThrow(NotAuthorizedError);
    });
  });
});
