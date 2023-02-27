import express from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import { UserSession } from '@prisma/client';
import course from '../services/course.service';
import settings from '../services/settings.service';
import {
  assertCourseIdIsValid,
  assertCourseNameIsValid,
  assertCourseSemIsNumber,
  assertCourseYearIsNumber,
  assertProjectIdIsValid,
  assertUserIdIsValid,
  assertInputIsNotEmpty,
  assertFileIsCorrectType,
  getDefaultErrorRes,
} from '../helpers/error';
import {
  assertCourseCodeIsValid,
  assertGetAllOptionIsValid,
  assertProjectNameIsValid,
  assertUserSessionIsValid,
} from '../helpers/error/assertions';
import {
  AddProjectAndCourseRequestBody,
  BulkCreateProjectBody,
  CourseRequestBody,
  OptionRequestBody,
  ProjectIdRequestBody,
  UserRequestBody,
} from './requestTypes';
import numberOrUndefined from '../helpers/common';
import csvService from '../services/csv.service';

async function getAll(req: express.Request, res: express.Response) {
  try {
    const body = req.body as OptionRequestBody;

    // If option is provided, it must be one of the following
    assertGetAllOptionIsValid(body.option);

    // Default to all
    const setting = await settings.get();
    const result = await course.getAll(res.locals.policyConstraint, setting, body.option ?? 'all');

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function get(req: express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;

    const result = await course.getById(Number(courseId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function create(req: express.Request, res: express.Response) {
  try {
    const body = req.body as CourseRequestBody;
    const userSession = res.locals.userSession as UserSession | undefined;

    assertUserSessionIsValid(userSession);
    assertCourseYearIsNumber(body.courseStartYear);
    assertCourseSemIsNumber(body.courseStartSem);
    assertCourseYearIsNumber(body.courseEndYear);
    assertCourseSemIsNumber(body.courseEndSem);
    assertCourseNameIsValid(body.courseName);

    const result = await course.create(
      userSession.user_id,
      body.courseName,
      Number(body.courseStartYear),
      Number(body.courseStartSem),
      numberOrUndefined(body.courseEndYear),
      numberOrUndefined(body.courseEndSem),
      body.courseCode,
      body.isPublic,
      body.description,
    );
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function bulkCreate(req: express.Request, res: express.Response) {
  try {
    const body = req.body as BulkCreateProjectBody;

    assertCourseIdIsValid(body.courseId);

    body.projects.forEach((p) => {
      assertProjectNameIsValid(p.projectName);
      p.users.forEach((u) => assertUserIdIsValid(u.userId));
    });

    const result = await course.bulkCreate(body as Required<BulkCreateProjectBody>);

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function update(req: express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;
    const body = req.body as Partial<Omit<CourseRequestBody, 'courseId'>>;

    assertCourseIdIsValid(courseId);

    if (Object.keys(body).length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide fields to update!' });
    }

    const result = await course.update(
      Number(courseId),
      body.courseCode,
      numberOrUndefined(body.courseStartYear),
      numberOrUndefined(body.courseStartSem),
      numberOrUndefined(body.courseEndYear),
      numberOrUndefined(body.courseEndSem),
      body.courseName,
      body.isPublic,
      body.description,
    );
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function remove(req: express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;

    assertCourseIdIsValid(courseId);

    const result = await course.remove(Number(courseId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function getUsers(req: express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;

    assertCourseIdIsValid(courseId);

    const result = await course.getUsers(res.locals.policyConstraint, Number(courseId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function addUser(req: express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;
    const body = req.body as UserRequestBody;

    assertCourseIdIsValid(courseId);
    assertUserIdIsValid(body.userId);

    const result = await course.addUser(Number(courseId), Number(body.userId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function removeUser(req: express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;
    const body = req.body as UserRequestBody;

    assertCourseIdIsValid(courseId);
    assertUserIdIsValid(body.userId);

    const result = await course.removeUser(Number(courseId), Number(body.userId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function getProjects(req: express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;

    assertCourseIdIsValid(courseId);

    const result = await course.getProjects(res.locals.policyConstraint, Number(courseId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function addProject(req: express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;
    const body = req.body as ProjectIdRequestBody;

    assertCourseIdIsValid(courseId);
    assertProjectIdIsValid(body.projectId);

    const result = await course.addProject(Number(courseId), Number(body.projectId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function removeProject(req: express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;
    const body = req.body as ProjectIdRequestBody;

    assertCourseIdIsValid(courseId);
    assertProjectIdIsValid(body.projectId);

    const result = await course.removeProject(Number(courseId), Number(body.projectId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function addProjectAndCourse(req: express.Request, res: express.Response) {
  try {
    const body = req.body as AddProjectAndCourseRequestBody;
    const userSession = res.locals.userSession as UserSession | undefined;

    assertUserSessionIsValid(userSession);
    assertCourseCodeIsValid(body.courseCode);
    assertCourseYearIsNumber(body.courseYear);
    assertCourseSemIsNumber(body.courseSem);
    assertProjectNameIsValid(body.projectName);
    assertCourseNameIsValid(body.courseName);

    const result = await course.addProjectAndCourse(
      userSession.user_id,
      body.courseCode,
      Number(body.courseYear),
      Number(body.courseSem),
      body.courseName,
      body.projectName,
      body.projectKey,
      body.isCoursePublic,
      body.isProjectPublic,
      body.projectDescription,
      body.courseDescription,
    );

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function importCsv(req: express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;

    assertInputIsNotEmpty(req.file, 'Csv file');
    assertFileIsCorrectType(req.file.mimetype, 'csv');
    assertCourseIdIsValid(courseId);

    const result = await csvService.importCourseData(req.file.path, Number(courseId));
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  } finally {
    if (req.file?.path) {
      fs.unlinkSync(req.file.path);
    }
  }
}

export default {
  getAll,
  get,
  create,
  bulkCreate,
  update,
  remove,
  getUsers,
  addUser,
  removeUser,
  getProjects,
  addProject,
  removeProject,
  addProjectAndCourse,
  importCsv,
};
