import express from 'express';
import { StatusCodes } from 'http-status-codes';
import project from '../services/project.service';


type RequestBody = {
  name?: string;
  key?: string;
  isPublic?: boolean;
  description?: string;
};


async function getAll(req : express.Request, res: express.Response) {
  try {
    const result = await project.getAll();

    return res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}


async function get(req : express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;

    const result = await project.getById(Number(projectId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}


async function create(req : express.Request, res: express.Response) {
  try {
    const { name, key, isPublic, description } = req.body as RequestBody;

    if (!name) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide project name!' });
    }

    const result = await project.create(name, key, isPublic, description);
    return res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}


async function update(req : express.Request, res: express.Response) {
  try {
    const { name, isPublic, description } = req.body as RequestBody;
    const { projectId } = req.params;

    if (!name && !isPublic && !description) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide valid changes!' });
    }

    const result = await project.update(Number(projectId), name, isPublic, description);
    return res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}


async function remove(req : express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;

    const result = await project.remove(Number(projectId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}


async function getUsers(req : express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;

    const result = await project.getUsers(Number(projectId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}


async function addUser(req : express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;
    const { userId }: { userId?: string } = req.body;

    if (!projectId || !userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide valid input!' });
    }

    const result = await project.addUser(Number(projectId), Number(userId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}


async function removeUser(req : express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;
    const { userId }: { userId?: string } = req.body;

    if (!projectId || !userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide valid input!' });
    }

    const result = await project.removeUser(Number(projectId), Number(userId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
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