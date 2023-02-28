import StatusCodes from 'http-status-codes';
import express from 'express';
import { assertProjectIdIsValid, getDefaultErrorRes } from '../helpers/error';
import backlogHistoryService from '../services/backlogHistory.service';
import { assertSprintIdIsValid } from '../helpers/error/assertions';

const getBacklogHistory = async (req: express.Request, res: express.Response) => {
  try {
    const history = await backlogHistoryService.getBacklogHistory(res.locals.policyConstraint);

    return res.status(StatusCodes.OK).json(history);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const getProjectBacklogHistory = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId } = req.params;

    assertProjectIdIsValid(projectId);

    const history = await backlogHistoryService.getProjectBacklogHistory(Number(projectId));

    return res.status(StatusCodes.OK).json(history);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const getSprintBacklogHistory = async (req: express.Request, res: express.Response) => {
  try {
    const { sprintId } = req.params;

    assertSprintIdIsValid(sprintId);

    const history = await backlogHistoryService.getSprintBacklogHistory(Number(sprintId));

    return res.status(StatusCodes.OK).json(history);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

export default {
  getBacklogHistory,
  getProjectBacklogHistory,
  getSprintBacklogHistory,
};
