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

type RequestBody = {
  courseId?: string;
  courseName?: string;
  courseYear?: string;
  courseSem?: string;
  isPublic?: boolean;
  description?: string;
};

async function getAll(req: express.Request, res: express.Response) {
  try {
    const { option } = req.body;

    // If option is provided, it must be one of the following
    if (option && !['all', 'past', 'current'].includes(option)) {
      throw new BadRequestError('Please provide a correct option. option can only be all, past, or current.');
    }

    // Default to all
    const result = await course.getAll(option ?? 'all');

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
    const { courseId, courseYear, courseSem, courseName, isPublic, description } = req.body as RequestBody;

    assertCourseYearIsNumber(courseYear);
    assertCourseSemIsNumber(courseSem);
    assertCourseNameIsValid(courseName);

    const result = await course.create(
      courseName,
      Number(courseYear),
      Number(courseSem),
      courseId,
      isPublic,
      description,
    );
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function update(req: express.Request, res: express.Response) {
  try {
    const { courseName, isPublic, description } = req.body as RequestBody;
    const { courseId, courseYear, courseSem } = req.params;

    assertCourseIdIsValid(courseId);
    assertCourseYearIsNumber(courseYear);
    assertCourseSemIsNumber(courseSem);

    if (!courseName && !isPublic && !description) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide valid changes!' });
    }

    const result = await course.update(
      courseId,
      Number(courseYear),
      Number(courseSem),
      courseName,
      isPublic,
      description,
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

    const result = await course.getUsers(courseId, Number(courseYear), Number(courseSem));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function addUser(req: express.Request, res: express.Response) {
  try {
    const { courseId, courseYear, courseSem } = req.params;
    const { userId }: { userId?: string } = req.body;

    assertCourseIdIsValid(courseId);
    assertCourseYearIsNumber(courseYear);
    assertCourseSemIsNumber(courseSem);
    assertUserIdIsValid(userId);

    const result = await course.addUser(courseId, Number(courseYear), Number(courseSem), Number(userId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function removeUser(req: express.Request, res: express.Response) {
  try {
    const { courseId, courseYear, courseSem } = req.params;
    const { userId }: { userId?: string } = req.body;

    assertCourseIdIsValid(courseId);
    assertCourseYearIsNumber(courseYear);
    assertCourseSemIsNumber(courseSem);
    assertUserIdIsValid(userId);

    const result = await course.removeUser(courseId, Number(courseYear), Number(courseSem), Number(userId));

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

    const result = await course.getProjects(courseId, Number(courseYear), Number(courseSem));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function addProject(req: express.Request, res: express.Response) {
  try {
    const { courseId, courseYear, courseSem } = req.params;
    const { projectId }: { projectId?: string } = req.body;

    assertCourseIdIsValid(courseId);
    assertCourseYearIsNumber(courseYear);
    assertCourseSemIsNumber(courseSem);
    assertProjectIdIsValid(projectId);

    const result = await course.addProject(courseId, Number(courseYear), Number(courseSem), Number(projectId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function removeProject(req: express.Request, res: express.Response) {
  try {
    const { courseId, courseYear, courseSem } = req.params;
    const { projectId }: { projectId?: string } = req.body;

    assertCourseIdIsValid(courseId);
    assertCourseYearIsNumber(courseYear);
    assertCourseSemIsNumber(courseSem);
    assertProjectIdIsValid(projectId);

    const result = await course.removeProject(courseId, Number(courseYear), Number(courseSem), Number(projectId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function addProjectAndCourse(req: express.Request, res: express.Response) {
  type RequestBodyLocal = {
    courseId?: string;
    courseYear?: string;
    courseSem?: string;
    courseName?: string;
    projectName?: string;
    projectKey?: string;
    isProjectPublic?: boolean;
    isCoursePublic?: boolean;
    projectDescription?: string;
  };

  try {
    const {
      courseId,
      courseYear,
      courseSem,
      courseName,
      projectName,
      projectKey,
      projectDescription,
      isCoursePublic,
      isProjectPublic,
    }: RequestBodyLocal = req.body;

    assertCourseIdIsValid(courseId);
    assertCourseYearIsNumber(courseYear);
    assertCourseSemIsNumber(courseSem);
    assertProjectNameIsValid(projectName);
    assertCourseNameIsValid(courseName);

    const result = await course.addProjectAndCourse(
      courseId,
      Number(courseYear),
      Number(courseSem),
      courseName,
      projectName,
      projectKey,
      isCoursePublic,
      isProjectPublic,
      projectDescription,
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
