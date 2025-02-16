import { Backlog, Sprint, Retrospective, RetrospectiveVote, UserSession } from '@prisma/client';
import StatusCodes from 'http-status-codes';
import express from 'express';
import sprintService from '../services/sprint.service';
import backlogService from '../services/backlog.service';
import { assertProjectIdIsValid, getDefaultErrorRes } from '../helpers/error';
import {
  assertRetroIdIsValid,
  assertRetrospectiveContentIsValid,
  assertRetrospectiveTypeIsValid,
  assertRetrospectiveVoteTypeIsValid,
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
    const sprints: Omit<Sprint, 'notes'>[] = await sprintService.listSprints(res.locals.policyConstraint);
    return res.status(StatusCodes.OK).json(sprints);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const listSprintsByProjectId = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId } = req.params;
    assertProjectIdIsValid(projectId);
    const sprints: Omit<Sprint, 'notes'>[] = await sprintService.listSprintsByProjectId(Number(projectId));
    const unassignedBacklogs: Backlog[] = await backlogService.listUnassignedBacklogs(Number(projectId));
    return res.status(StatusCodes.OK).json({ sprints, unassignedBacklogs });
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const getSprintNotes = async (req: express.Request, res: express.Response) => {
  try {
    const { sprintId } = req.params;
    assertSprintIdIsValid(sprintId);
    const notes: Pick<Sprint, 'notes'> = await sprintService.getSprintNotes(Number(sprintId));
    return res.status(StatusCodes.OK).json(notes);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const listActiveSprint = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId } = req.params;
    assertProjectIdIsValid(projectId);
    const sprint: Omit<Sprint, 'notes'> | null = await sprintService.listActiveSprint(Number(projectId));
    return res.status(StatusCodes.OK).json(sprint);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const updateSprint = async (req: express.Request, res: express.Response) => {
  try {
    const { sprintId, dates, duration, status } = req.body;
    const user = res.locals.userSession as UserSession | undefined;
    assertSprintIdIsValid(sprintId);
    assertSprintDurationIsValid(duration);
    assertSprintDatesAreValid(dates);
    const sprint: Sprint = await (status
      ? sprintService.updateSprintStatus(req.body, user?.user_email || '')
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
    assertRetrospectiveContentIsValid(content);
    assertRetrospectiveTypeIsValid(type);
    const retrospective: Retrospective = await sprintService.addRetrospective(Number(sprintId), content, type);
    return res.status(StatusCodes.OK).json(retrospective);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const deleteRetrospective = async (req: express.Request, res: express.Response) => {
  try {
    const { retroId } = req.params;
    assertRetroIdIsValid(retroId);
    const retrospective: Retrospective = await sprintService.deleteRetrospective(Number(retroId));
    return res.status(StatusCodes.OK).json(retrospective);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const getRetrospectives = async (req: express.Request, res: express.Response) => {
  try {
    const { sprintId, type } = req.params;
    assertSprintIdIsValid(sprintId);
    if (type !== undefined) assertRetrospectiveTypeIsValid(type);

    const userSession = res.locals.userSession as UserSession | undefined;
    assertUserSessionIsValid(userSession);

    const retrospectives: Retrospective[] = await sprintService.getRetrospectives(
      Number(sprintId),
      userSession.user_id,
      type,
    );
    return res.status(StatusCodes.OK).json(retrospectives);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const addRetrospectiveVote = async (req: express.Request, res: express.Response) => {
  try {
    const { retroId, type } = req.body;
    assertRetroIdIsValid(retroId);
    assertRetrospectiveVoteTypeIsValid(type);

    const userSession = res.locals.userSession as UserSession | undefined;
    assertUserSessionIsValid(userSession);

    const retrospectiveVote: RetrospectiveVote = await sprintService.addRetrospectiveVote(
      Number(retroId),
      userSession.user_id,
      type,
    );
    return res.status(StatusCodes.OK).json(retrospectiveVote);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const updateRetrospectiveVote = async (req: express.Request, res: express.Response) => {
  try {
    const { retroId, type } = req.body;
    assertRetroIdIsValid(retroId);
    assertRetrospectiveVoteTypeIsValid(type);

    const userSession = res.locals.userSession as UserSession | undefined;
    assertUserSessionIsValid(userSession);

    const retrospectiveVote: RetrospectiveVote = await sprintService.updateRetrospectiveVote(
      Number(retroId),
      userSession.user_id,
      type,
    );
    return res.status(StatusCodes.OK).json(retrospectiveVote);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const deleteRetrospectiveVote = async (req: express.Request, res: express.Response) => {
  try {
    const { retroId } = req.params;
    assertRetroIdIsValid(retroId);

    const userSession = res.locals.userSession as UserSession | undefined;
    assertUserSessionIsValid(userSession);

    const retrospectiveVote: RetrospectiveVote = await sprintService.deleteRetrospectiveVote(
      Number(retroId),
      userSession.user_id,
    );
    return res.status(StatusCodes.OK).json(retrospectiveVote);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const authLiveNotes = async (req: express.Request, res: express.Response) => {
  return res.status(StatusCodes.OK).json({});
};

export default {
  newSprint,
  listSprints,
  listSprintsByProjectId,
  listActiveSprint,
  getSprintNotes,
  updateSprint,
  deleteSprint,
  addRetrospective,
  deleteRetrospective,
  getRetrospectives,
  addRetrospectiveVote,
  updateRetrospectiveVote,
  deleteRetrospectiveVote,
  authLiveNotes,
};
