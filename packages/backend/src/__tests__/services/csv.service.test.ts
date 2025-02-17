import { prisma, Project, ProjectAssignment } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import csvService from '../../services/csv.service';
import {
  ImportProjectAssignmentsCsv,
  INVALID_EMAIL,
  INVALID_PROJECT_NAME,
  INVALID_PROPERTIES,
  INVALID_ROLE,
  INVALID_TEAM_NAME,
  MESSAGE_SPACE,
} from '../../services/types/csv.service.types';
import {
  ImportCourseDataCsvBuilder,
  validateImportCourseDataCallback,
  CallbackReturnTest,
  groupDetailsMap,
  userDetailsMap,
  userGroupingMap,
  studentOne,
  projectOne,
  facultyOne,
  projectTwo,
  studentTwo,
  projectOnePrismaCreateMock,
  studentOnePrismaUserUpsertMock,
  projectTwoPrismaCreateMock,
  studentTwoPrismaUserUpsertMock,
  facultyOnePrismaUserUpsertMock,
} from '../mocks/csvData';

beforeEach(() => {
  userDetailsMap.clear();
  groupDetailsMap.clear();
  userGroupingMap.clear();
});

describe('csv.service.tests', () => {
  describe('validateImportCourseData', () => {
    it('should return an error message if the email is invalid', async () => {
      const dataRow = ImportCourseDataCsvBuilder(
        'testUser',
        'invalidEmail',
        'p/w',
        'student',
        'testTeam',
        'testProject',
      );
      const expectedErrorMessage = INVALID_EMAIL;
      const result: unknown = csvService.validateImportCourseData(dataRow, validateImportCourseDataCallback);
      expect((result as CallbackReturnTest).isValid).toEqual(false);
      expect((result as CallbackReturnTest).reason).toEqual(expectedErrorMessage);
    });

    it('should return an error message if the role is invalid', async () => {
      const dataRow = ImportCourseDataCsvBuilder(
        'testUser',
        'testUser@test.com',
        'p/w',
        'invalidRole',
        'testTeam',
        'testProject',
      );
      const expectedErrorMessage = INVALID_ROLE;
      const result: unknown = csvService.validateImportCourseData(dataRow, validateImportCourseDataCallback);
      expect((result as CallbackReturnTest).isValid).toEqual(false);
      expect((result as CallbackReturnTest).reason).toEqual(expectedErrorMessage);
    });

    it('should return an error message if the team name is invalid', async () => {
      const dataRow = ImportCourseDataCsvBuilder('testUser', 'testUser@test.com', 'p/w', 'student', '', 'testProject');
      const expectedErrorMessage = INVALID_TEAM_NAME;
      const result: unknown = csvService.validateImportCourseData(dataRow, validateImportCourseDataCallback);
      expect((result as CallbackReturnTest).isValid).toEqual(false);
      expect((result as CallbackReturnTest).reason).toEqual(expectedErrorMessage);
    });

    it('should return an error message if multiple fields are invalid', async () => {
      const dataRow = ImportCourseDataCsvBuilder('testUser', 'invalidEmail', 'p/w', 'student', '', 'testProject');
      const expectedErrorMessage = INVALID_EMAIL + MESSAGE_SPACE + INVALID_TEAM_NAME;
      const result: unknown = csvService.validateImportCourseData(dataRow, validateImportCourseDataCallback);
      expect((result as CallbackReturnTest).isValid).toEqual(false);
      expect((result as CallbackReturnTest).reason).toEqual(expectedErrorMessage);
    });

    it('should return true if the row is valid', async () => {
      const dataRow = ImportCourseDataCsvBuilder('testUser', 'testEmail@test.com', 'p/w', 'faculty', '', 'testProject');
      const result: unknown = csvService.validateImportCourseData(dataRow, validateImportCourseDataCallback);
      expect((result as CallbackReturnTest).isValid).toEqual(true);
      expect((result as CallbackReturnTest).reason).toEqual(undefined);
    });
  });

  describe('transformImportCourseData', () => {
    it('should not use teamName as projectName when projectName is specified', () => {
      const dataRow = ImportCourseDataCsvBuilder(
        'testUser',
        'testUser@test.com',
        'p/w',
        'student',
        'testTeam',
        'testProject',
      );
      csvService.transformImportCourseData(dataRow, 1, userDetailsMap, groupDetailsMap, userGroupingMap);
      expect(groupDetailsMap.get('testTeam')?.projectName).toEqual('testProject');
    });

    it('should use teamName as projectName when projectName is not specified', () => {
      const dataRow = ImportCourseDataCsvBuilder('testUser', 'testUser@test.com', 'p/w', 'student', 'testTeam', '');
      csvService.transformImportCourseData(dataRow, 1, userDetailsMap, groupDetailsMap, userGroupingMap);
      expect(groupDetailsMap.get('testTeam')?.projectName).toEqual('testTeam');
    });

    it('should not set groupDetails and userGrouping when teamName is not specified', () => {
      const dataRow = ImportCourseDataCsvBuilder('testUser', 'testUser@test.com', 'p/w', 'student', '', '');
      csvService.transformImportCourseData(dataRow, 1, userDetailsMap, groupDetailsMap, userGroupingMap);
      expect(groupDetailsMap.get('testTeam')).toEqual(undefined);
      expect(userGroupingMap.get('testUser@test.com')).toEqual(undefined);
    });

    it("should hash user's password when password is specified", () => {
      const dataRow = ImportCourseDataCsvBuilder(
        'testUser',
        'testUser@test.com',
        'p/w',
        'student',
        'testTeam',
        'testProject',
      );
      csvService.transformImportCourseData(dataRow, 1, userDetailsMap, groupDetailsMap, userGroupingMap);
      expect(userDetailsMap.get('testUser@test.com')?.password).not.toEqual(undefined);
    });

    it("should set user's password as undefined when password is not specified", () => {
      const dataRow = ImportCourseDataCsvBuilder(
        'testUser',
        'testUser@test.com',
        '',
        'student',
        'testTeam',
        'testProject',
      );
      csvService.transformImportCourseData(dataRow, 1, userDetailsMap, groupDetailsMap, userGroupingMap);
      expect(userDetailsMap.get('testUser@test.com')?.password).toEqual(undefined);
    });

    it('should throw an error if the role supplied is invalid', () => {
      const dataRow = ImportCourseDataCsvBuilder(
        'testUser',
        'testUser@test.com',
        'p/w',
        'invalidRole',
        'testTeam',
        'testProject',
      );
      const expectedError = new Error(INVALID_ROLE);
      expect(() => {
        csvService.transformImportCourseData(dataRow, 1, userDetailsMap, groupDetailsMap, userGroupingMap);
      }).toThrow(expectedError);
    });

    it('should return the correct mappings when a single user-group mapping is provided', () => {
      const dataRow = ImportCourseDataCsvBuilder(
        'testUser',
        'testUser@test.com',
        '',
        'student',
        'testTeam',
        'testProject',
      );
      csvService.transformImportCourseData(dataRow, 1, userDetailsMap, groupDetailsMap, userGroupingMap);
      expect(userGroupingMap.get('testUser@test.com')).toEqual('testTeam');
    });

    it('should return the correct mappings when two different user-group mappings are provided', () => {
      const dataRowOne = ImportCourseDataCsvBuilder(
        'testUserOne',
        'testUserOne@test.com',
        '',
        'student',
        'testTeam1',
        'testProject1',
      );
      const dataRowTwo = ImportCourseDataCsvBuilder(
        'testUserTwo',
        'testUserTwo@test.com',
        '',
        'student',
        'testTeam2',
        'testProject2',
      );
      csvService.transformImportCourseData(dataRowOne, 1, userDetailsMap, groupDetailsMap, userGroupingMap);
      csvService.transformImportCourseData(dataRowTwo, 1, userDetailsMap, groupDetailsMap, userGroupingMap);
      expect(userGroupingMap.get('testUserOne@test.com')).toEqual('testTeam1');
      expect(userGroupingMap.get('testUserTwo@test.com')).toEqual('testTeam2');
    });

    it('should return the correct mappings when two users map to the same group', () => {
      const dataRowOne = ImportCourseDataCsvBuilder(
        'testUserOne',
        'testUserOne@test.com',
        '',
        'student',
        'testTeam1',
        'testProject1',
      );
      const dataRowTwo = ImportCourseDataCsvBuilder(
        'testUserTwo',
        'testUserTwo@test.com',
        '',
        'student',
        'testTeam1',
        'testProject1',
      );
      csvService.transformImportCourseData(dataRowOne, 1, userDetailsMap, groupDetailsMap, userGroupingMap);
      csvService.transformImportCourseData(dataRowTwo, 1, userDetailsMap, groupDetailsMap, userGroupingMap);
      expect(userGroupingMap.get('testUserOne@test.com')).toEqual('testTeam1');
      expect(userGroupingMap.get('testUserTwo@test.com')).toEqual('testTeam1');
    });
  });

  describe('processImportCourseData', () => {
    it('should create a project and add a user to it when there is a single user-group mapping', async () => {
      userDetailsMap.set(studentOne.email, studentOne);
      groupDetailsMap.set(projectOne.teamName, projectOne);
      userGroupingMap.set(studentOne.email, projectOne.teamName);

      prismaMock.project.create.mockResolvedValueOnce(projectOnePrismaCreateMock);
      prismaMock.user.upsert.mockResolvedValueOnce(studentOnePrismaUserUpsertMock);
      prismaMock.usersOnProjects.create.mockResolvedValueOnce({
        project_id: projectOne.projectId as number,
        user_id: studentOne.id as number,
        created_at: new Date(Date.now()),
      });
      prismaMock.$transaction.mockResolvedValueOnce(true);
      await expect(
        csvService.processImportCourseData(1, userDetailsMap, groupDetailsMap, userGroupingMap),
      ).resolves.toEqual(true);
    });

    it('should create two projects and add users to them when there are two user-group mappings', async () => {
      userDetailsMap.set(studentOne.email, studentOne);
      userDetailsMap.set(studentTwo.email, studentTwo);
      groupDetailsMap.set(projectOne.teamName, projectOne);
      groupDetailsMap.set(projectTwo.teamName, projectTwo);
      userGroupingMap.set(studentOne.email, projectOne.teamName);
      userGroupingMap.set(studentTwo.email, projectTwo.teamName);
      prismaMock.project.create.mockResolvedValueOnce(projectOnePrismaCreateMock);
      prismaMock.project.create.mockResolvedValueOnce(projectTwoPrismaCreateMock);
      prismaMock.user.upsert.mockResolvedValueOnce(studentOnePrismaUserUpsertMock);
      prismaMock.user.upsert.mockResolvedValueOnce(studentTwoPrismaUserUpsertMock);
      prismaMock.usersOnProjects.create.mockResolvedValueOnce({
        project_id: projectOne.projectId as number,
        user_id: studentOne.id as number,
        created_at: new Date(Date.now()),
      });
      prismaMock.usersOnProjects.create.mockResolvedValueOnce({
        project_id: projectTwo.projectId as number,
        user_id: studentTwo.id as number,
        created_at: new Date(Date.now()),
      });
      prismaMock.$transaction.mockResolvedValueOnce(true);
      await expect(
        csvService.processImportCourseData(1, userDetailsMap, groupDetailsMap, userGroupingMap),
      ).resolves.toEqual(true);
    });

    it('should add a user to a course when they are non students', async () => {
      userDetailsMap.set(facultyOne.email, facultyOne);
      prismaMock.user.upsert.mockResolvedValueOnce(facultyOnePrismaUserUpsertMock);
      prismaMock.$transaction.mockResolvedValueOnce(true);
      await expect(
        csvService.processImportCourseData(1, userDetailsMap, groupDetailsMap, userGroupingMap),
      ).resolves.toEqual(true);
    });
  });

  describe('validateProjectAssignmentData', () => {
    const projectGroups = new Map<string, Project[]>([
      ['Project A', [{ id: 1, pname: 'Project A', course_id: 1 } as Project]],
      ['Project B', [{ id: 2, pname: 'Project B', course_id: 1 } as Project]],
    ]);

    it('should return true when the data is valid', () => {
      const validdata: ImportProjectAssignmentsCsv = {
        sourceProjectGroup: 'Project A',
        targetProjectGroup: 'Project B',
      };
      const result: unknown = csvService.validateProjectAssignmentData(
        validdata,
        projectGroups,
        validateImportCourseDataCallback,
      );
      expect((result as CallbackReturnTest).isValid).toEqual(true);
      expect((result as CallbackReturnTest).reason).toEqual(undefined);
    });

    it('should fail validation when properties are missing', () => {
      const invalidData = { sourceProjectGroup: 'Project A' };
      const result: unknown = csvService.validateProjectAssignmentData(
        invalidData as ImportProjectAssignmentsCsv,
        projectGroups,
        validateImportCourseDataCallback,
      );
      expect((result as CallbackReturnTest).isValid).toEqual(false);
      expect((result as CallbackReturnTest).reason).toContain(INVALID_PROPERTIES);
    });

    it('should fail validation when there are additional properties', () => {
      const invalidData = {
        sourceProjectGroup: 'Project A',
        targetProjectGroup: 'Project B',
        additionalProperty: 'test',
      };
      const result: unknown = csvService.validateProjectAssignmentData(
        invalidData as ImportProjectAssignmentsCsv,
        projectGroups,
        validateImportCourseDataCallback,
      );
      expect((result as CallbackReturnTest).isValid).toEqual(false);
      expect((result as CallbackReturnTest).reason).toContain(INVALID_PROPERTIES);
    });

    it('should fail validation when project names are empty', () => {
      const invalidData: ImportProjectAssignmentsCsv = { sourceProjectGroup: '', targetProjectGroup: '' };
      const result: unknown = csvService.validateProjectAssignmentData(
        invalidData,
        projectGroups,
        validateImportCourseDataCallback,
      );
      expect((result as CallbackReturnTest).isValid).toEqual(false);
      expect((result as CallbackReturnTest).reason).toContain(INVALID_PROJECT_NAME);
    });

    it('should fail validation when project names are invalid', () => {
      const invalidData: ImportProjectAssignmentsCsv = {
        sourceProjectGroup: 'Project A',
        targetProjectGroup: 'Invalid Project',
      };
      const result: unknown = csvService.validateProjectAssignmentData(
        invalidData,
        projectGroups,
        validateImportCourseDataCallback,
      );
      expect((result as CallbackReturnTest).isValid).toEqual(false);
      expect((result as CallbackReturnTest).reason).toContain(`Invalid assignment: Source or target project not found`);
    });

    it('should fail validation when projects have duplicate names', () => {
      const duplicateProjectGroups = new Map<string, Project[]>([
        [
          'Project A',
          (projectGroups.get('Project A') as Project[]).concat({ id: 3, pname: 'Project A', course_id: 1 } as Project),
        ],
        ['Project B', projectGroups.get('Project B') as Project[]],
      ]);

      const invalidData: ImportProjectAssignmentsCsv = {
        sourceProjectGroup: 'Project A',
        targetProjectGroup: 'Project B',
      };
      const result: unknown = csvService.validateProjectAssignmentData(
        invalidData,
        duplicateProjectGroups,
        validateImportCourseDataCallback,
      );
      expect((result as CallbackReturnTest).isValid).toEqual(false);
      expect((result as CallbackReturnTest).reason).toContain(
        `Duplicate project name: ${invalidData.sourceProjectGroup}`,
      );
    });
  });

  describe('processImportProjectAssignments', () => {
    const assignments: Pick<ProjectAssignment, 'sourceProjectId' | 'targetProjectId'>[] = [
      { sourceProjectId: 1, targetProjectId: 2 },
      { sourceProjectId: 2, targetProjectId: 3 },
    ];

    it('should create project assignments', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
        return Promise.resolve();
      });

      prismaMock.projectAssignment.upsert.mockResolvedValue({} as any);

      await expect(csvService.processImportProjectAssignments(assignments)).resolves.toBeUndefined();

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.projectAssignment.upsert).toHaveBeenCalledTimes(assignments.length);

      assignments.forEach((assignment, index) => {
        expect(prismaMock.projectAssignment.upsert).toHaveBeenNthCalledWith(index + 1, {
          where: {
            sourceProjectId_targetProjectId: {
              sourceProjectId: assignment.sourceProjectId,
              targetProjectId: assignment.targetProjectId,
            },
          },
          update: {},
          create: assignment,
        });
      });
    });
  });
});
