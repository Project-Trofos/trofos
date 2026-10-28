import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { Feature, UserSession } from '@prisma/client';
import { checkFeatureFlagInCode } from '../middleware/feature_flag.middleware';
import { assertCourseIdIsValid, assertMaxMarksIsValid, getDefaultErrorRes } from '../helpers/error';
import {
  assertDateIsBefore,
  assertDateIsValid,
  assertMilestoneIdIsValid,
  assertMilestoneNameIsValid,
} from '../helpers/error/assertions';
import milestoneService from '../services/milestone.service';
import { MilestoneRequestBody } from './requestTypes';

async function get(req: express.Request, res: express.Response) {
  try {
    const { milestoneId } = req.params;

    assertMilestoneIdIsValid(milestoneId);

    const result = await milestoneService.get(Number(milestoneId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function list(req: express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;
    const { policyConstraint } = res.locals;

    assertCourseIdIsValid(courseId);

    const result = await milestoneService.list(policyConstraint, Number(courseId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function create(req: express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;
    const body = req.body as MilestoneRequestBody;

    assertCourseIdIsValid(courseId);
    assertDateIsValid(body.milestoneDeadline);
    assertDateIsValid(body.milestoneStartDate);
    assertDateIsBefore(new Date(body.milestoneStartDate), new Date(body.milestoneDeadline));
    assertMilestoneNameIsValid(body.milestoneName);

    const result = await milestoneService.create(
      Number(courseId),
      new Date(body.milestoneStartDate),
      new Date(body.milestoneDeadline),
      body.milestoneName,
    );

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function update(req: express.Request, res: express.Response) {
  try {
    const { milestoneId } = req.params;
    const body = req.body as Omit<MilestoneRequestBody, 'courseId'>;

    assertMilestoneIdIsValid(milestoneId);

    if (body.milestoneStartDate) {
      assertDateIsValid(body.milestoneStartDate);
    }

    if (body.milestoneDeadline) {
      assertDateIsValid(body.milestoneDeadline);
    }

    // max_marks (and its grade-reset side effects) only apply when manual grading is enabled
    const isManualGradingEnabled = await checkFeatureFlagInCode(Feature.manual_grading);
    const milestoneMaxMarks =
      isManualGradingEnabled && body.milestoneMaxMarks !== undefined ? Number(body.milestoneMaxMarks) : undefined;
    if (milestoneMaxMarks !== undefined) {
      assertMaxMarksIsValid(milestoneMaxMarks);
    }
    const confirm = req.query.confirm === 'true';
    const { userSession } = res.locals as { userSession: UserSession };

    const result = await milestoneService.update(
      Number(milestoneId),
      body.milestoneStartDate ? new Date(body.milestoneStartDate) : undefined,
      body.milestoneDeadline ? new Date(body.milestoneDeadline) : undefined,
      body.milestoneName,
      milestoneMaxMarks,
      confirm,
      userSession.user_id,
    );

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function remove(req: express.Request, res: express.Response) {
  try {
    const { milestoneId } = req.params;

    assertMilestoneIdIsValid(milestoneId);
    // With manual grading off, skip the grade-deletion confirmation and delete as before
    const isManualGradingEnabled = await checkFeatureFlagInCode(Feature.manual_grading);
    const confirm = !isManualGradingEnabled || req.query.confirm === 'true';

    const result = await milestoneService.remove(Number(milestoneId), confirm);

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

export default {
  get,
  list,
  create,
  update,
  remove,
};
