import { Sprint } from '@prisma/client';
import StatusCodes from 'http-status-codes';
import express from 'express';
import sprintService from '../services/sprint.service';
import { BadRequestError, getDefaultErrorRes } from '../helpers/error';

const newSprint = async (req: express.Request, res: express.Response) => {
  try {
    const { dates, duration } = req.body;
    if (duration < 0 || duration > 4) {
      throw new BadRequestError('Duration is invalid');
    }
    if (dates && dates.length !== 2) {
      throw new BadRequestError('Either both start and end dates must be present or leave both dates empty');
    }
    const sprint: Sprint = await sprintService.newSprint(req.body);
    return res.status(StatusCodes.OK).json(sprint);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const listSprints = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      throw new BadRequestError('projectId cannot be empty');
    }
    const sprints: Sprint[] = await sprintService.listSprints(Number(projectId));
    return res.status(StatusCodes.OK).json(sprints);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const updateSprint = async (req: express.Request, res: express.Response) => {
  try {
    const { sprintId, dates, duration } = req.body;
    if (!sprintId) {
      throw new BadRequestError('sprintId cannot be empty');
    }
    if (duration && (duration < 0 || duration > 4)) {
      throw new BadRequestError('Duration is invalid');
    }
    if (dates && dates.length !== 2) {
      throw new BadRequestError('Either both start and end dates must be present or leave both dates empty');
    }
    const sprint: Sprint = await sprintService.updateSprint(req.body);
    return res.status(StatusCodes.OK).json(sprint);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const deleteSprint = async (req: express.Request, res: express.Response) => {
  try {
    const { sprintId } = req.params;
    if (!sprintId) {
      throw new BadRequestError('sprintId cannot be empty');
    }
    const sprint: Sprint = await sprintService.deleteSprint(Number(sprintId));
    return res.status(StatusCodes.OK).json(sprint);
  } catch (error: any) {
    return getDefaultErrorRes(error, res);
  }
};

export default {
  newSprint,
  listSprints,
  updateSprint,
  deleteSprint,
};
