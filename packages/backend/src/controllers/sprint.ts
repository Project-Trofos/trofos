import { Backlog, Sprint } from '@prisma/client';
import StatusCodes from 'http-status-codes';
import express from 'express';
import sprintService from '../services/sprint.service';
import backlogService from '../services/backlog.service';
import { assertProjectIdIsValid, getDefaultErrorRes } from '../helpers/error';
import {
  assertSprintDatesAreValid,
  assertSprintDurationIsValid,
  assertSprintIdIsValid,
} from '../helpers/error/assertions';

const newSprint = async (req: express.Request, res: express.Response) => {
  try {
    const { dates, duration } = req.body;
    assertSprintDurationIsValid(duration);
    assertSprintDatesAreValid(dates);
    const sprint: Sprint = await sprintService.newSprint(req.body);
    return res.status(StatusCodes.OK).json(sprint);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const listSprints = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId } = req.params;
    assertProjectIdIsValid(projectId);
    const sprints: Sprint[] = await sprintService.listSprints(Number(projectId));
    const unassignedBacklogs: Backlog[] = await backlogService.listUnassignedBacklogs(Number(projectId));
    return res.status(StatusCodes.OK).json({ sprints, unassignedBacklogs });
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const listActiveSprint = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId } = req.params;
    assertProjectIdIsValid(projectId);
    const sprint: Sprint | null = await sprintService.listActiveSprint(Number(projectId));
    return res.status(StatusCodes.OK).json(sprint);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const updateSprint = async (req: express.Request, res: express.Response) => {
  try {
    const { sprintId, dates, duration, status } = req.body;
    assertSprintIdIsValid(sprintId);
    assertSprintDurationIsValid(duration);
    assertSprintDatesAreValid(dates);
    const sprint: Sprint = await (status
      ? sprintService.updateSprintStatus(req.body)
      : sprintService.updateSprint(req.body));
    return res.status(StatusCodes.OK).json(sprint);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const deleteSprint = async (req: express.Request, res: express.Response) => {
  try {
    const { sprintId } = req.params;
    assertSprintIdIsValid(sprintId);
    const sprint: Sprint = await sprintService.deleteSprint(Number(sprintId));
    return res.status(StatusCodes.OK).json(sprint);
  } catch (error: any) {
    return getDefaultErrorRes(error, res);
  }
};

export default {
  newSprint,
  listSprints,
  listActiveSprint,
  updateSprint,
  deleteSprint,
};
