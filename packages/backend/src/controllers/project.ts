import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { assertProjectIdIsValid, assertUserIdIsValid, BadRequestError, getDefaultErrorRes } from '../helpers/error';
import { assertProjectNameIsValid } from '../helpers/error/assertions';
import project from '../services/project.service';

type RequestBody = {
  projectName?: string;
  projectKey?: string;
  isPublic?: boolean;
  description?: string;
};

async function getAll(req: express.Request, res: express.Response) {
  try {
    const { option } = req.body;

    if (option && !['all', 'past', 'current'].includes(option)) {
      throw new BadRequestError('Please provide a correct option. option can only be all, past, or current.');
    }

    // default to all
    const result = await project.getAll(option ?? 'all');

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function get(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;

    const result = await project.getById(Number(projectId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function create(req: express.Request, res: express.Response) {
  try {
    const { projectName, projectKey, isPublic, description } = req.body as RequestBody;

    assertProjectNameIsValid(projectName);

    const result = await project.create(projectName, projectKey, isPublic, description);
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function update(req: express.Request, res: express.Response) {
  try {
    const { projectName, isPublic, description } = req.body as RequestBody;
    const { projectId } = req.params;

    if (!projectName && !isPublic && !description) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide valid changes!' });
    }

    const result = await project.update(Number(projectId), projectName, isPublic, description);
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function remove(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;

    const result = await project.remove(Number(projectId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function getUsers(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;

    const result = await project.getUsers(Number(projectId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function addUser(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;
    const { userId }: { userId?: string } = req.body;

    assertProjectIdIsValid(projectId);
    assertUserIdIsValid(userId);

    const result = await project.addUser(Number(projectId), Number(userId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function removeUser(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;
    const { userId }: { userId?: string } = req.body;

    assertProjectIdIsValid(projectId);
    assertUserIdIsValid(userId);

    const result = await project.removeUser(Number(projectId), Number(userId));

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
