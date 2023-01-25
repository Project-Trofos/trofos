import { UserSession } from '@prisma/client';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { assertProjectIdIsValid, assertUserIdIsValid, getDefaultErrorRes } from '../helpers/error';
import {
  assertGetAllOptionIsValid,
  assertProjectNameIsValid,
  assertStatusNameIsValid,
  assertUserSessionIsValid,
} from '../helpers/error/assertions';
import { sortBacklogStatus } from '../helpers/sortBacklogStatus';
import project from '../services/project.service';
import settings from '../services/settings.service';
import { OptionRequestBody, ProjectRequestBody, UserRequestBody } from './requestTypes';

async function getAll(req: express.Request<unknown, Record<string, unknown>>, res: express.Response) {
  try {
    const body = req.body as OptionRequestBody;

    assertGetAllOptionIsValid(body.option);

    // default to all
    const setting = await settings.get();
    const result = await project.getAll(res.locals.policyConstraint, setting, body.option ?? 'all');

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function get(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;

    assertProjectIdIsValid(projectId);

    const result = await project.getById(Number(projectId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function create(req: express.Request, res: express.Response) {
  try {
    const body = req.body as ProjectRequestBody;
    const userSession = res.locals.userSession as UserSession | undefined;

    assertUserSessionIsValid(userSession);
    assertProjectNameIsValid(body.projectName);

    const result = await project.create(
      userSession.user_id,
      body.projectName,
      body.projectKey,
      body.isPublic,
      body.description,
    );
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function update(req: express.Request, res: express.Response) {
  try {
    const body = req.body as Partial<Pick<ProjectRequestBody, 'description' | 'projectName' | 'isPublic'>>;
    const { projectId } = req.params;

    assertProjectIdIsValid(projectId);

    if (!body.projectName && !body.isPublic && !body.description) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide valid changes!' });
    }

    const result = await project.update(Number(projectId), body.projectName, body.isPublic, body.description);
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function remove(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;

    assertProjectIdIsValid(projectId);

    const result = await project.remove(Number(projectId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function getUsers(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;

    assertProjectIdIsValid(projectId);

    const result = await project.getUsers(res.locals.policyConstraint, Number(projectId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function addUser(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;
    const body = req.body as UserRequestBody;

    assertProjectIdIsValid(projectId);
    assertUserIdIsValid(body.userId);

    const result = await project.addUser(Number(projectId), Number(body.userId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function removeUser(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;
    const body = req.body as UserRequestBody;

    assertProjectIdIsValid(projectId);
    assertUserIdIsValid(body.userId);

    const result = await project.removeUser(Number(projectId), Number(body.userId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function createBacklogStatus(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;
    const { name } = req.body;

    assertProjectIdIsValid(projectId);
    assertStatusNameIsValid(name);

    const result = await project.createBacklogStatus(Number(projectId), name);

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function getBacklogStatus(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;

    assertProjectIdIsValid(projectId);

    const result = await project.getBacklogStatus(Number(projectId));
    const sortedResult = sortBacklogStatus(result);

    return res.status(StatusCodes.OK).json(sortedResult);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function updateBacklogStatus(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;
    const { currentName, updatedName, updatedStatuses } = req.body;

    assertProjectIdIsValid(projectId);

    let result;

    if (updatedStatuses) {
      result = await project.updateBacklogStatusOrder(Number(projectId), updatedStatuses);
    } else {
      assertStatusNameIsValid(currentName);
      assertStatusNameIsValid(updatedName);
      result = await project.updateBacklogStatus(Number(projectId), currentName, updatedName);
    }

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function deleteBacklogStatus(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;
    const { name } = req.body;

    assertProjectIdIsValid(projectId);
    assertStatusNameIsValid(name);

    const result = await project.deleteBacklogStatus(Number(projectId), name);

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

export default {
  getAll,
  get,
  create,
  update,
  remove,
  getUsers,
  addUser,
  removeUser,
  createBacklogStatus,
  getBacklogStatus,
  updateBacklogStatus,
  deleteBacklogStatus,
};
