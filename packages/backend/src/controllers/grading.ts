import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { ProjectGradeStatus } from '@prisma/client';
import {
  assertCourseIdIsValid,
  assertProjectIdIsValid,
  assertMarksIsValid,
  assertGradeStatusIsValid,
  getDefaultErrorRes,
} from '../helpers/error';
import gradingService from '../services/grading.service';
import { GradingRequestBody } from './requestTypes';

async function list(req: express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;

    assertCourseIdIsValid(courseId);

    const result = await gradingService.list(Number(courseId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function update(req: express.Request, res: express.Response) {
  try {
    const { courseId, projectId } = req.params;
    const body = req.body as GradingRequestBody;
    const { userSession } = res.locals;

    assertCourseIdIsValid(courseId);
    assertProjectIdIsValid(projectId);

    if (body.marks !== undefined) {
      assertMarksIsValid(body.marks);
    }
    if (body.status !== undefined) {
      assertGradeStatusIsValid(body.status);
    }

    const result = await gradingService.update(
      Number(courseId),
      Number(projectId),
      {
        assignedTaId: body.assignedTaId,
        marks: body.marks,
        comments: body.comments,
        status: body.status as ProjectGradeStatus | undefined,
      },
      userSession,
    );

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function publishAll(req: express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;
    const { userSession } = res.locals;

    assertCourseIdIsValid(courseId);

    const result = await gradingService.publishAll(Number(courseId), userSession);

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

export default {
  list,
  update,
  publishAll,
};
