import { UserSession } from '@prisma/client';
import StatusCodes from 'http-status-codes';
import express from 'express';
import { getDefaultErrorRes } from '../helpers/error';
import feedbackService from '../services/feedback.service';
import { assertInputIsNotEmpty, assertSprintIdIsValid, assertUserSessionIsValid } from '../helpers/error/assertions';

const create = async (req: express.Request, res: express.Response) => {
  try {
    const { content, sprintId } = req.body;

    const userSession = res.locals.userSession as UserSession | undefined;

    assertUserSessionIsValid(userSession);
    assertSprintIdIsValid(sprintId);
    assertInputIsNotEmpty(content, 'content');

    const feedback = await feedbackService.create({
      content,
      sprintId: Number(sprintId),
      userId: userSession.user_id,
    });
    return res.status(StatusCodes.OK).json(feedback);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const list = async (req: express.Request, res: express.Response) => {
  try {
    const feedbacks = await feedbackService.list(res.locals.policyConstraint);
    return res.status(StatusCodes.OK).json(feedbacks);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const listBySprintId = async (req: express.Request, res: express.Response) => {
  try {
    const { sprintId } = req.params;
    assertSprintIdIsValid(sprintId);

    const feedbacks = await feedbackService.listBySprintId(Number(sprintId));
    return res.status(StatusCodes.OK).json(feedbacks);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const update = async (req: express.Request, res: express.Response) => {
  try {
    const { feedbackId } = req.params;
    const { content } = req.body;

    assertInputIsNotEmpty(feedbackId, 'feedbackId');
    assertInputIsNotEmpty(content, 'content');

    const feedback = await feedbackService.update(Number(feedbackId), { content });
    return res.status(StatusCodes.OK).json(feedback);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const remove = async (req: express.Request, res: express.Response) => {
  try {
    const { feedbackId } = req.params;
    assertInputIsNotEmpty(feedbackId, 'feedbackId');

    const feedback = await feedbackService.remove(Number(feedbackId));
    return res.status(StatusCodes.OK).json(feedback);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

export default {
  create,
  listBySprintId,
  list,
  update,
  remove,
};
