import { PrismaClient } from '@prisma/client';
import StatusCodes from 'http-status-codes';
import express from 'express';
import backlogService from '../services/backlog.service';

const newBacklog = async (req : express.Request, res: express.Response, prisma : PrismaClient) => {
  try {
    const isSuccessful = await backlogService.createBacklog(req.body, prisma);

    if (!isSuccessful) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
    }

    return res.status(StatusCodes.OK).send();
  } catch (e) {
    console.error(e);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }

};

export default {
  newBacklog,
};
