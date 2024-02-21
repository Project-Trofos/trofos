import { Backlog } from '@prisma/client';
import StatusCodes from 'http-status-codes';
import express from 'express';
import backlogService from '../services/backlog.service';
import { BadRequestError, getDefaultErrorRes } from '../helpers/error';
import { sendToProject } from '../notifications/NotificationHandler';
import { BacklogFields } from '../helpers/types/backlog.service.types';

const newBacklog = async (req: express.Request, res: express.Response) => {
  try {
    const backlog: Backlog = await backlogService.newBacklog(req.body);
    const { projectId, summary, priority }: BacklogFields = req.body;
    sendToProject(projectId, `Backlog added: ${summary}, priority: ${priority}`)
    return res.status(StatusCodes.OK).json(backlog);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const listBacklogsByProjectId = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      throw new BadRequestError('projectId cannot be empty');
    }
    const backlogs: Backlog[] = await backlogService.listBacklogsByProjectId(Number(projectId));
    return res.status(StatusCodes.OK).json(backlogs);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const listBacklogs = async (req: express.Request, res: express.Response) => {
  try {
    const backlogs: Backlog[] = await backlogService.listBacklogs(res.locals.policyConstraint);
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
    const { projectId, backlogId, fieldToUpdate } = req.body;
    if (!projectId || !backlogId) {
      throw new BadRequestError('projectId or backlogId cannot be empty');
    }
    const backlog: Backlog = await backlogService.updateBacklog(req.body);
    sendToProject(projectId, `Backlog ${backlogId} updated, fields updated: ${Object.keys(fieldToUpdate)}`)

    return res.status(StatusCodes.OK).json(backlog);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const deleteBacklog = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId, backlogId } = req.params;
    if (!projectId || !backlogId) {
      throw new BadRequestError('projectId or backlogId cannot be empty');
    }
    const backlog: Backlog = await backlogService.deleteBacklog(Number(projectId), Number(backlogId));
    sendToProject(Number(projectId), `Backlog ${backlogId} deleted`)

    return res.status(StatusCodes.OK).json(backlog);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

export default {
  newBacklog,
  listBacklogsByProjectId,
  listBacklogs,
  getBacklog,
  updateBacklog,
  deleteBacklog,
};
