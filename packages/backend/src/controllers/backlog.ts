import { Backlog, Epic } from '@prisma/client';
import StatusCodes from 'http-status-codes';
import express from 'express';
import backlogService from '../services/backlog.service';
import { BadRequestError, getDefaultErrorRes, assertProjectIdIsValid, assertEpicNameIsValid } from '../helpers/error';
import { sendToProject } from '../notifications/NotificationHandler';
import { BacklogFields } from '../helpers/types/backlog.service.types';

const newBacklog = async (req: express.Request, res: express.Response) => {
  try {
    const backlog: Backlog = await backlogService.newBacklog(req.body);
    const { projectId, summary, priority }: BacklogFields = req.body;
    sendToProject(projectId, `Backlog added: ${summary}, priority: ${priority}`);
    return res.status(StatusCodes.OK).json(backlog);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const listBacklogsByProjectId = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      throw new BadRequestError('projectId cannot be empty');
    }
    const backlogs: Backlog[] = await backlogService.listBacklogsByProjectId(Number(projectId));
    return res.status(StatusCodes.OK).json(backlogs);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const listBacklogs = async (req: express.Request, res: express.Response) => {
  try {
    const backlogs: Backlog[] = await backlogService.listBacklogs(res.locals.policyConstraint);
    return res.status(StatusCodes.OK).json(backlogs);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const getBacklog = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId, backlogId } = req.params;
    if (!projectId || !backlogId) {
      throw new BadRequestError('projectId or backlogId cannot be empty');
    }
    const backlog: Backlog | null = await backlogService.getBacklog(Number(projectId), Number(backlogId));
    if (backlog === null) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Backlog not found' });
    }
    return res.status(StatusCodes.OK).json(backlog);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const updateBacklog = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId, backlogId, fieldToUpdate } = req.body;
    if (!projectId || !backlogId) {
      throw new BadRequestError('projectId or backlogId cannot be empty');
    }
    const backlog: Backlog = await backlogService.updateBacklog(req.body);
    sendToProject(projectId, `Backlog ${backlogId} updated, fields updated: ${Object.keys(fieldToUpdate)}`);

    return res.status(StatusCodes.OK).json(backlog);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const deleteBacklog = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId, backlogId } = req.params;
    if (!projectId || !backlogId) {
      throw new BadRequestError('projectId or backlogId cannot be empty');
    }
    const backlog: Backlog = await backlogService.deleteBacklog(Number(projectId), Number(backlogId));
    sendToProject(Number(projectId), `Backlog ${backlogId} deleted`);

    return res.status(StatusCodes.OK).json(backlog);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const createEpic = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId, name, description } = req.body;
    assertProjectIdIsValid(projectId);
    assertEpicNameIsValid(name);

    const epic: Epic = await backlogService.createEpic(Number(projectId), name, description);
    sendToProject(Number(projectId), `Epic created: ${name}`);
    return res.status(StatusCodes.OK).json(epic);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const getBacklogsForEpic = async (req: express.Request, res: express.Response) => {
  try {
    const { epicId } = req.params;
    if (!epicId) {
      throw new BadRequestError('epicId cannot be empty');
    }
    const backlogs: Backlog[] = await backlogService.getBacklogsForEpic(Number(epicId));
    return res.status(StatusCodes.OK).json(backlogs);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const getEpicsForProject = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      throw new BadRequestError('projectId cannot be empty');
    }
    const epics: Epic[] = await backlogService.getEpicsForProject(Number(projectId));
    return res.status(StatusCodes.OK).json(epics);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const getEpicById = async (req: express.Request, res: express.Response) => {
  try {
    const { epicId } = req.params;
    if (!epicId) {
      throw new BadRequestError('epicId cannot be empty');
    }
    const epic: Epic | null = await backlogService.getEpicById(Number(epicId));
    return res.status(StatusCodes.OK).json(epic);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const addBacklogToEpic = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId, backlogId, epicId } = req.body;
    if (!projectId || !backlogId || !epicId) {
      throw new BadRequestError('projectId or backlogId or epicId cannot be empty');
    }
    const epic: Epic | null = await backlogService.getEpicById(Number(epicId));
    if (!epic || epic.project_id !== Number(projectId)) {
      throw new BadRequestError('Adding backlog to an epic of different project is not allowed');
    }
    const backlog: Backlog = await backlogService.addBacklogToEpic(
      Number(projectId),
      Number(epicId),
      Number(backlogId),
    );
    return res.status(StatusCodes.OK).json(backlog);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const removeBacklogFromEpic = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId, backlogId, epicId } = req.body;
    if (!projectId || !backlogId || !epicId) {
      throw new BadRequestError('projectId or backlogId or epicId cannot be empty');
    }
    const epic: Epic | null = await backlogService.getEpicById(epicId);
    if (!epic || epic.project_id !== Number(projectId)) {
      throw new BadRequestError('Removing backlog from an epic of different project is not allowed');
    }
    const backlog: Backlog = await backlogService.removeBacklogFromEpic(
      Number(projectId),
      Number(epicId),
      Number(backlogId),
    );
    return res.status(StatusCodes.OK).json(backlog);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const deleteEpic = async (req: express.Request, res: express.Response) => {
  try {
    const { epicId } = req.params;
    if (!epicId) {
      throw new BadRequestError('epicId cannot be empty');
    }
    const epic: Epic = await backlogService.deleteEpic(Number(epicId));
    sendToProject(Number(epic.project_id), `Epic ${epic.name} deleted`);

    return res.status(StatusCodes.OK).json(epic);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

// const TROFOS_SESSIONCOOKIE_NAME = 'trofos_sessioncookie';
// async function validateIssueSubmission(req: express.Request, res: express.Response, next: express.NextFunction) {
//   const { projectId, assignedToProjectId } = req.body;

//   if (!projectId || !assignedToProjectId) {
//     return res.status(StatusCodes.BAD_REQUEST).send('Missing projectId or assignedToProjectId.');
//   }

//   const sessionId = req.cookies[TROFOS_SESSIONCOOKIE_NAME];

//   if (sessionId === undefined) {
//     return res.status(StatusCodes.UNAUTHORIZED).send();
//   }

//   const assignedGroups = issueService.getAssignedGroups(projectId);

//   if (!assignedGroups.includes(assignedToProjectId)) {
//     return res.status(StatusCodes.FORBIDDEN).send('Unauthorized to report issues to this group.');
//   }
//   next();
// }

export default {
  newBacklog,
  listBacklogsByProjectId,
  listBacklogs,
  getBacklog,
  updateBacklog,
  deleteBacklog,
  createEpic,
  getBacklogsForEpic,
  getEpicsForProject,
  getEpicById,
  addBacklogToEpic,
  removeBacklogFromEpic,
  deleteEpic,
};
