import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, getDefaultErrorRes } from '../helpers/error';
import project from '../services/project.service';

type RequestBody = {
  name?: string;
  key?: string;
  isPublic?: boolean;
  description?: string;
};

async function getAll(req: express.Request, res: express.Response) {
  try {
    const { option } = req.body;

    if (option && !['all', 'past', 'current'].includes(option)) {
      throw new BadRequestError('Please provide a correct option.');
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
    const { name, key, isPublic, description } = req.body as RequestBody;

    if (!name) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide project name!' });
    }

    const result = await project.create(name, key, isPublic, description);
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function update(req: express.Request, res: express.Response) {
  try {
    const { name, isPublic, description } = req.body as RequestBody;
    const { projectId } = req.params;

    if (!name && !isPublic && !description) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide valid changes!' });
    }

    const result = await project.update(Number(projectId), name, isPublic, description);
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

    if (!projectId || !userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide valid input!' });
    }

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

    if (!projectId || !userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide valid input!' });
    }

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
