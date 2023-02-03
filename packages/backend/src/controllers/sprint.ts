import { Backlog, Sprint, SprintRetrospective, SprintRetrospectiveVote, UserSession } from '@prisma/client';
import StatusCodes from 'http-status-codes';
import express from 'express';
import sprintService from '../services/sprint.service';
import backlogService from '../services/backlog.service';
import { assertProjectIdIsValid, getDefaultErrorRes } from '../helpers/error';
import {
  assertSprintDatesAreValid,
  assertSprintDurationIsValid,
  assertSprintIdIsValid,
  assertUserSessionIsValid,
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
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const addRetrospective = async (req: express.Request, res: express.Response) => {
  try {
    const { sprintId, content, type } = req.body;
    assertSprintIdIsValid(sprintId);
    const retrospective: SprintRetrospective = await sprintService.addRetrospective(Number(sprintId), content, type);
    return res.status(StatusCodes.OK).json(retrospective);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

const getRetrospectives = async (req: express.Request, res: express.Response) => {
  try {
    const { sprintId } = req.params;
    assertSprintIdIsValid(sprintId);
    const retrospectives: SprintRetrospective[] = await sprintService.getRetrospectives(Number(sprintId));
    return res.status(StatusCodes.OK).json(retrospectives);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

const addRetrospectiveVote = async (req: express.Request, res: express.Response) => {
  try {
    const { retroId, type } = req.body;
    const userSession = res.locals.userSession as UserSession | undefined;
    assertUserSessionIsValid(userSession);
    const retrospectiveVote: SprintRetrospectiveVote = await sprintService.addRetrospectiveVote(Number(retroId), userSession.user_id, type);
    return res.status(StatusCodes.OK).json(retrospectiveVote);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

const updateRetrospectiveVote = async (req: express.Request, res: express.Response) => {
  try {
    const { retroId, type } = req.body;
    const userSession = res.locals.userSession as UserSession | undefined;
    assertUserSessionIsValid(userSession);
    const retrospectiveVote: SprintRetrospectiveVote = await sprintService.updateRetrospectiveVote(Number(retroId), userSession.user_id, type);
    return res.status(StatusCodes.OK).json(retrospectiveVote);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

const deleteRetrospectiveVote = async (req: express.Request, res: express.Response) => {
  try {
    const { retroId } = req.params;
    const userSession = res.locals.userSession as UserSession | undefined;
    assertUserSessionIsValid(userSession);
    const retrospectiveVote: SprintRetrospectiveVote = await sprintService.deleteRetrospectiveVote(Number(retroId), userSession.user_id);
    return res.status(StatusCodes.OK).json(retrospectiveVote);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

export default {
  newSprint,
  listSprints,
  listActiveSprint,
  updateSprint,
  deleteSprint,
  addRetrospective,
  getRetrospectives,
  addRetrospectiveVote,
  updateRetrospectiveVote,
  deleteRetrospectiveVote,
};
