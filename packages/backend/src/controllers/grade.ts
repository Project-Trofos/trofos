import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserSession } from '@prisma/client';
import { assertCourseIdIsValid, assertProjectIdIsValid, assertGradeIdIsValid, getDefaultErrorRes } from '../helpers/error';
import { assertMilestoneIdIsValid } from '../helpers/error/assertions';
import gradeService from '../services/grade.service';
import { GradeRequestBody, AssignTaRequestBody } from './requestTypes';

async function listByCourse(req: express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;
    assertCourseIdIsValid(courseId);

    const grades = await gradeService.listByCourse(Number(courseId), res.locals.policyConstraint);
    return res.status(StatusCodes.OK).json({ grades });
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function listByProject(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;
    assertProjectIdIsValid(projectId);

    const grades = await gradeService.listByProject(Number(projectId), res.locals.policyConstraint);
    return res.status(StatusCodes.OK).json({ grades });
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function upsertMilestoneGrade(req: express.Request, res: express.Response) {
  try {
    const { projectId, milestoneId } = req.params;
    const body = req.body as GradeRequestBody;
    const { userSession } = res.locals as { userSession: UserSession };

    assertProjectIdIsValid(projectId);
    assertMilestoneIdIsValid(milestoneId);

    const result = await gradeService.upsertMilestoneGrade(Number(projectId), Number(milestoneId), userSession.user_id, {
      score: body.score,
      comment: body.comment,
    });
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function publishGrade(req: express.Request, res: express.Response) {
  try {
    const { gradeId } = req.params;
    const { userSession } = res.locals as { userSession: UserSession };
    assertGradeIdIsValid(gradeId);

    const result = await gradeService.publishGrade(Number(gradeId), userSession.user_id);
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function unpublishGrade(req: express.Request, res: express.Response) {
  try {
    const { gradeId } = req.params;
    const { userSession } = res.locals as { userSession: UserSession };
    assertGradeIdIsValid(gradeId);

    const result = await gradeService.unpublishGrade(Number(gradeId), userSession.user_id);
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function assignTa(req: express.Request, res: express.Response) {
  try {
    const { projectId, milestoneId } = req.params;
    const body = req.body as AssignTaRequestBody;
    const { userSession } = res.locals as { userSession: UserSession };

    assertProjectIdIsValid(projectId);
    assertMilestoneIdIsValid(milestoneId);

    const result = await gradeService.assignTaForMilestone(
      Number(projectId),
      Number(milestoneId),
      body.assignedTaId ?? null,
      userSession.user_id,
    );
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function getGradeHistory(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;
    assertProjectIdIsValid(projectId);

    const result = await gradeService.getGradeHistory(Number(projectId));
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

export default {
  listByCourse,
  listByProject,
  upsertMilestoneGrade,
  publishGrade,
  unpublishGrade,
  assignTa,
  getGradeHistory,
};
