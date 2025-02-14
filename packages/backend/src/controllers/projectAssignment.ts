import express from 'express';
import { assertProjectIdIsValid, BadRequestError } from '../helpers/error';
import projectAssignmentservice from '../services/projectAssignment.service';
import { StatusCodes } from 'http-status-codes';
import { getDefaultErrorRes } from '../helpers/error';
import { assertIdIsValidNumber } from '../helpers/error/assertions';

async function create(req: express.Request, res: express.Response) {
  try {
    const { projectId: sourceProjectId } = req.params;
    const { targetProjectId } = req.body;
    assertProjectIdIsValid(sourceProjectId);
    assertProjectIdIsValid(targetProjectId);

    if (sourceProjectId === targetProjectId) {
      throw new BadRequestError('Projects cannot be the same.');
    }

    const projectAssignment = await projectAssignmentservice.create(Number(sourceProjectId), Number(targetProjectId));
    return res.status(StatusCodes.OK).json(projectAssignment);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function remove(req: express.Request, res: express.Response) {
  try {
    const { projectId, projectAssignmentId } = req.params;
    const sourceProjectId = Number(projectId);

    assertProjectIdIsValid(sourceProjectId);
    assertIdIsValidNumber(projectAssignmentId, 'Assigned Project ID');

    const projectAssignment = await projectAssignmentservice.remove(sourceProjectId, Number(projectAssignmentId));
    return res.status(StatusCodes.OK).json(projectAssignment);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function getAssignedProjects(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;
    assertProjectIdIsValid(projectId);

    const assignedProjects = await projectAssignmentservice.getAssignedProjects(Number(projectId));
    return res.status(StatusCodes.OK).json(assignedProjects);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

export default { create, remove, getAssignedProjects };
