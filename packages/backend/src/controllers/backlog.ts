import { Backlog } from '@prisma/client';
import StatusCodes from 'http-status-codes';
import express from 'express';
import backlogService from '../services/backlog.service';

const newBacklog = async (req: express.Request, res: express.Response) => {
  try {
    const backlog: Backlog = await backlogService.createBacklog(req.body);
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
    const backlogs: Backlog[] = await backlogService.getBacklogs(Number(projectId));
    return res.status(StatusCodes.OK).json(backlogs);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const listBacklogs = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      throw new Error('projectId cannot be empty');
    }
    const backlogs: Backlog[] = await backlogService.getBacklogs(Number(projectId));
    return res.status(StatusCodes.OK).json(backlogs);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export default {
  newBacklog,
  listBacklogs,
};
