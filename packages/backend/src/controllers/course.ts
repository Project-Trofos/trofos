import express from 'express';
import { StatusCodes } from 'http-status-codes';
import course from '../services/course.service';
import {
  assertCourseIdIsValid,
  assertCourseNameIsValid,
  assertCourseSemIsNumber,
  assertCourseYearIsNumber,
  assertProjectIdIsValid,
  assertUserIdIsValid,
  BadRequestError,
  getDefaultErrorRes,
} from '../helpers/error';
import { assertProjectNameIsValid } from '../helpers/error/assertions';
import {
  AddProjectAndCourseRequestBody,
  CourseRequestBody,
  OptionRequestBody,
  ProjectIdRequestBody,
  UserRequestBody,
} from './requestTypes';

async function getAll(req: express.Request, res: express.Response) {
  try {
    const body = req.body as OptionRequestBody;

    // If option is provided, it must be one of the following
    if (body.option && !['all', 'past', 'current'].includes(body.option)) {
      throw new BadRequestError('Please provide a correct option. option can only be all, past, or current.');
    }

    // Default to all
    const result = await course.getAll(res.locals.policyConstraint, body.option ?? 'all');

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function get(req: express.Request, res: express.Response) {
  try {
    const { courseId, courseYear, courseSem } = req.params;

    assertCourseYearIsNumber(courseYear);
    assertCourseSemIsNumber(courseSem);

    const result = await course.getByPk(courseId, Number(courseYear), Number(courseSem));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function create(req: express.Request, res: express.Response) {
  try {
    const body = req.body as CourseRequestBody;

    assertCourseYearIsNumber(body.courseYear);
    assertCourseSemIsNumber(body.courseSem);
    assertCourseNameIsValid(body.courseName);

    const result = await course.create(
      body.courseName,
      Number(body.courseYear),
      Number(body.courseSem),
      body.courseId,
      body.isPublic,
      body.description,
    );
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function update(req: express.Request, res: express.Response) {
  try {
    const { courseId, courseYear, courseSem } = req.params;
    const body = req.body as Partial<Pick<CourseRequestBody, 'courseName' | 'isPublic' | 'description'>>;

    assertCourseIdIsValid(courseId);
    assertCourseYearIsNumber(courseYear);
    assertCourseSemIsNumber(courseSem);

    if (!body.courseName && !body.isPublic && !body.description) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide valid changes!' });
    }

    const result = await course.update(
      courseId,
      Number(courseYear),
      Number(courseSem),
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
    const { courseId, courseYear, courseSem } = req.params;

    assertCourseIdIsValid(courseId);
    assertCourseYearIsNumber(courseYear);
    assertCourseSemIsNumber(courseSem);

    const result = await course.remove(courseId, Number(courseYear), Number(courseSem));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function getUsers(req: express.Request, res: express.Response) {
  try {
    const { courseId, courseYear, courseSem } = req.params;

    assertCourseIdIsValid(courseId);
    assertCourseYearIsNumber(courseYear);
    assertCourseSemIsNumber(courseSem);

    const result = await course.getUsers(res.locals.policyConstraint, courseId, Number(courseYear), Number(courseSem));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function addUser(req: express.Request, res: express.Response) {
  try {
    const { courseId, courseYear, courseSem } = req.params;
    const body = req.body as UserRequestBody;

    assertCourseIdIsValid(courseId);
    assertCourseYearIsNumber(courseYear);
    assertCourseSemIsNumber(courseSem);
    assertUserIdIsValid(body.userId);

    const result = await course.addUser(courseId, Number(courseYear), Number(courseSem), Number(body.userId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function removeUser(req: express.Request, res: express.Response) {
  try {
    const { courseId, courseYear, courseSem } = req.params;
    const body = req.body as UserRequestBody;

    assertCourseIdIsValid(courseId);
    assertCourseYearIsNumber(courseYear);
    assertCourseSemIsNumber(courseSem);
    assertUserIdIsValid(body.userId);

    const result = await course.removeUser(courseId, Number(courseYear), Number(courseSem), Number(body.userId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function getProjects(req: express.Request, res: express.Response) {
  try {
    const { courseId, courseYear, courseSem } = req.params;

    assertCourseIdIsValid(courseId);
    assertCourseYearIsNumber(courseYear);
    assertCourseSemIsNumber(courseSem);

    const result = await course.getProjects(
      res.locals.policyConstraint,
      courseId,
      Number(courseYear),
      Number(courseSem),
    );

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function addProject(req: express.Request, res: express.Response) {
  try {
    const { courseId, courseYear, courseSem } = req.params;
    const body = req.body as ProjectIdRequestBody;

    assertCourseIdIsValid(courseId);
    assertCourseYearIsNumber(courseYear);
    assertCourseSemIsNumber(courseSem);
    assertProjectIdIsValid(body.projectId);

    const result = await course.addProject(courseId, Number(courseYear), Number(courseSem), Number(body.projectId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function removeProject(req: express.Request, res: express.Response) {
  try {
    const { courseId, courseYear, courseSem } = req.params;
    const body = req.body as ProjectIdRequestBody;

    assertCourseIdIsValid(courseId);
    assertCourseYearIsNumber(courseYear);
    assertCourseSemIsNumber(courseSem);
    assertProjectIdIsValid(body.projectId);

    const result = await course.removeProject(courseId, Number(courseYear), Number(courseSem), Number(body.projectId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function addProjectAndCourse(req: express.Request, res: express.Response) {
  try {
    const body = req.body as AddProjectAndCourseRequestBody;

    assertCourseIdIsValid(body.courseId);
    assertCourseYearIsNumber(body.courseYear);
    assertCourseSemIsNumber(body.courseSem);
    assertProjectNameIsValid(body.projectName);
    assertCourseNameIsValid(body.courseName);

    const result = await course.addProjectAndCourse(
      body.courseId,
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

export default {
  getAll,
  get,
  create,
  update,
  remove,
  getUsers,
  addUser,
  removeUser,
  getProjects,
  addProject,
  removeProject,
  addProjectAndCourse,
};
