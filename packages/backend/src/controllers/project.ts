import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { assertProjectIdIsValid, assertUserIdIsValid, BadRequestError, getDefaultErrorRes } from '../helpers/error';
import { assertProjectNameIsValid } from '../helpers/error/assertions';
import project from '../services/project.service';
import { OptionRequestBody, ProjectRequestBody, UserRequestBody } from './requestTypes';
import { canManageProject } from '../policies/project.policy'
import { NotAuthorizedError } from '../helpers/error/errorTypes'

async function getAll(req: express.Request<unknown, Record<string, unknown>>, res: express.Response) {
  try {
    const body = req.body as OptionRequestBody;

    if (body.option && !['all', 'past', 'current'].includes(body.option)) {
      throw new BadRequestError('Please provide a correct option. option can only be all, past, or current.');
    }

    // default to all
    const result = await project.getAll(res.locals.sessionInformation.user_id, body.option ?? 'all');

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function get(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;

    if (!canManageProject(res.locals.sessionInformation.user_id, Number(projectId))) throw new NotAuthorizedError()

    const result = await project.getById(Number(projectId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function create(req: express.Request, res: express.Response) {
  try {
    const body = req.body as ProjectRequestBody;

    assertProjectNameIsValid(body.projectName);

    const result = await project.create(body.projectName, body.projectKey, body.isPublic, body.description);
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function update(req: express.Request, res: express.Response) {
  try {
    const body = req.body as ProjectRequestBody;
    const { projectId } = req.params;

    if (!canManageProject(res.locals.sessionInformation.user_id, Number(projectId))) throw new NotAuthorizedError()

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

    if (!canManageProject(res.locals.sessionInformation.user_id, Number(projectId))) throw new NotAuthorizedError()

    const result = await project.remove(Number(projectId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function getUsers(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;

    const result = await project.getUsers(res.locals.sessionInformation.user_id, Number(projectId));

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

    if (!canManageProject(res.locals.sessionInformation.user_id, Number(projectId))) throw new NotAuthorizedError()

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

    if (!canManageProject(res.locals.sessionInformation.user_id, Number(projectId))) throw new NotAuthorizedError()

    const result = await project.removeUser(Number(projectId), Number(body.userId));

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
};
