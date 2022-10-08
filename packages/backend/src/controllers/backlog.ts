import { Backlog } from '@prisma/client';
import StatusCodes from 'http-status-codes';
import express from 'express';
import backlogService from '../services/backlog.service';

const newBacklog = async (req: express.Request, res: express.Response) => {
  try {
    const backlog: Backlog = await backlogService.newBacklog(req.body);
    return res.status(StatusCodes.OK).json(backlog);
  } catch (error: any) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const listBacklogs = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      throw new Error('projectId cannot be empty');
    }
    const backlogs: Backlog[] = await backlogService.listBacklogs(Number(projectId));
    return res.status(StatusCodes.OK).json(backlogs);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getBacklog = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId, backlogId } = req.params;
    if (!projectId || !backlogId) {
      throw new Error('projectId or backlogId cannot be empty');
    }
    const backlog: Backlog | null = await backlogService.getBacklog(Number(projectId), Number(backlogId));
    if (backlog === null) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Backlog not found' });
    }
    return res.status(StatusCodes.OK).json(backlog);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const updateBacklog = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId, backlogId } = req.body;
    if (!projectId || !backlogId) {
      throw new Error('projectId or backlogId cannot be empty');
    }
    const backlog: Backlog = await backlogService.updateBacklog(req.body);
    return res.status(StatusCodes.OK).json(backlog);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const deleteBacklog = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId, backlogId } = req.params;
    if (!projectId || !backlogId) {
      throw new Error('projectId or backlogId cannot be empty');
    }
    const backlog: Backlog = await backlogService.deleteBacklog(Number(projectId), Number(backlogId));
    return res.status(StatusCodes.OK).json(backlog);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export default {
  newBacklog,
  listBacklogs,
  getBacklog,
  updateBacklog,
  deleteBacklog,
};
