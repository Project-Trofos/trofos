import { Backlog } from '@prisma/client';
import StatusCodes from 'http-status-codes';
import express from 'express';
import backlogService from '../services/backlog.service';

const newBacklog = async (req : express.Request, res: express.Response) => {
  try {
    const backlog: Backlog = await backlogService.createBacklog(req.body);

    if (!backlog) {
      throw new Error('Failed to create new DB record');
    }

    return res.status(StatusCodes.OK).json(backlog);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export default {
  newBacklog,
};
