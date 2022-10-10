import { Sprint } from '@prisma/client';
import StatusCodes from 'http-status-codes';
import express from 'express';
import sprintService from '../services/sprint.service';

const newSprint = async (req: express.Request, res: express.Response) => {
  try {
    const { dates, duration } = req.body;
    if (duration < 0 || duration > 4) {
      throw new Error('Duration is invalid');
    }
    if (dates && dates.length !== 2) {
      throw new Error('Either both start and end dates must be present or leave both dates empty');
    }
    const sprint: Sprint = await sprintService.newSprint(req.body);
    return res.status(StatusCodes.OK).json(sprint);
  } catch (error: any) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const listSprints = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      throw new Error('projectId cannot be empty');
    }
    const sprints: Sprint[] = await sprintService.listSprints(Number(projectId));
    return res.status(StatusCodes.OK).json(sprints);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const updateSprint = async (req: express.Request, res: express.Response) => {
  try {
    const { sprintId, dates, duration } = req.body;
    if (!sprintId) {
      throw new Error('sprintId cannot be empty');
    }
    if (duration < 0 || duration > 4) {
      throw new Error('Duration is invalid');
    }
    if (dates && dates.length !== 2) {
      throw new Error('Either both start and end dates must be present or leave both dates empty');
    }
    const sprint: Sprint = await sprintService.updateSprint(req.body);
    return res.status(StatusCodes.OK).json(sprint);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const deleteSprint = async (req: express.Request, res: express.Response) => {
  try {
    const { sprintId } = req.params;
    if (!sprintId) {
      throw new Error('sprintId cannot be empty');
    }
    const sprint: Sprint = await sprintService.deleteSprint(Number(sprintId));
    return res.status(StatusCodes.OK).json(sprint);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export default {
  newSprint,
  listSprints,
  updateSprint,
  deleteSprint,
};
