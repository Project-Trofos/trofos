import { Backlog, UserSession } from '@prisma/client';
import StatusCodes from 'http-status-codes';
import express from 'express';
import backlogService from '../services/backlog.service';
import { BadRequestError, getDefaultErrorRes } from '../helpers/error';
import { assertUserSessionIsValid } from '../helpers/error/assertions';

const newBacklog = async (req: express.Request, res: express.Response) => {
  try {
    const userSession = res.locals.userSession as UserSession | undefined;
    assertUserSessionIsValid(userSession);

    const backlog: Backlog = await backlogService.newBacklog(req.body, userSession.user_id);
    return res.status(StatusCodes.OK).json(backlog);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const listBacklogs = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      throw new BadRequestError('projectId cannot be empty');
    }
    const backlogs: Backlog[] = await backlogService.listBacklogs(Number(projectId));
    return res.status(StatusCodes.OK).json(backlogs);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const getBacklog = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId, backlogId } = req.params;
    if (!projectId || !backlogId) {
      throw new BadRequestError('projectId or backlogId cannot be empty');
    }
    const backlog: Backlog | null = await backlogService.getBacklog(Number(projectId), Number(backlogId));
    if (backlog === null) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Backlog not found' });
    }
    return res.status(StatusCodes.OK).json(backlog);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const updateBacklog = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId, backlogId } = req.body;

    const userSession = res.locals.userSession as UserSession | undefined;
    assertUserSessionIsValid(userSession);

    if (!projectId || !backlogId) {
      throw new BadRequestError('projectId or backlogId cannot be empty');
    }

    const backlog: Backlog = await backlogService.updateBacklog(req.body, userSession.user_id);
    return res.status(StatusCodes.OK).json(backlog);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const deleteBacklog = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId, backlogId } = req.params;

    const userSession = res.locals.userSession as UserSession | undefined;
    assertUserSessionIsValid(userSession);

    if (!projectId || !backlogId) {
      throw new BadRequestError('projectId or backlogId cannot be empty');
    }

    const backlog: Backlog = await backlogService.deleteBacklog(
      Number(projectId),
      Number(backlogId),
      userSession.user_id,
    );
    return res.status(StatusCodes.OK).json(backlog);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

export default {
  newBacklog,
  listBacklogs,
  getBacklog,
  updateBacklog,
  deleteBacklog,
};
