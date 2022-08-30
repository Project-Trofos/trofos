import express from 'express';
import { StatusCodes } from 'http-status-codes';
import course from '../services/course.service';


type RequestBody = {
  name?: string;
  isPublic?: boolean;
  description?: string;
};


async function getAll(req : express.Request, res: express.Response) {
  try {
    const result = await course.getAll();

    return res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}


async function get(req : express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;

    const result = await course.getById(Number(courseId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}


async function create(req : express.Request, res: express.Response) {
  try {
    const { name, isPublic, description } = req.body as RequestBody;

    if (!name) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide course name!' });
    }

    const result = await course.create(name, isPublic, description);
    return res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}


async function update(req : express.Request, res: express.Response) {
  try {
    const { name, isPublic, description } = req.body as RequestBody;
    const { courseId } = req.params;

    if (!name && !isPublic && !description) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide valid changes!' });
    }

    const result = await course.update(Number(courseId), name, isPublic, description);
    return res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}


async function remove(req : express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;

    const result = await course.remove(Number(courseId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}


async function getUsers(req : express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;

    const result = await course.getUsers(Number(courseId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}


async function addUser(req : express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;
    const { userId }: { userId?: string } = req.body;

    if (!courseId || !userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide valid input!' });
    }

    const result = await course.addUser(Number(courseId), Number(userId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}


async function removeUser(req : express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;
    const { userId }: { userId?: string } = req.body;

    if (!courseId || !userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide valid input!' });
    }

    const result = await course.removeUser(Number(courseId), Number(userId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}



async function getProjects(req : express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;

    const result = await course.getProjects(Number(courseId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}


async function addProject(req : express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;
    const { projectId }: { projectId?: string } = req.body;

    if (!courseId || !projectId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide valid input!' });
    }

    const result = await course.addProject(Number(courseId), Number(projectId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}


async function removeProject(req : express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;
    const { projectId }: { projectId?: string } = req.body;

    if (!courseId || !projectId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide valid input!' });
    }

    const result = await course.removeProject(Number(courseId), Number(projectId));

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
  getProjects,
  addProject,
  removeProject,
};