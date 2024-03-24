import StatusCodes from 'http-status-codes';
import express from 'express';
import { assertProjectIdIsValid, getDefaultErrorRes } from '../helpers/error';
import standupService from '../services/standup.service';
import { assertIdIsValidNumber } from '../helpers/error/assertions';

async function createStandUp(req: express.Request, res: express.Response) {
  try {
    const { project_id, date } = req.body;
    assertProjectIdIsValid(project_id);
    const result = await standupService.newStandUp({ project_id: Number(project_id), date });
    return res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function getStandUpHeaders(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;

    assertProjectIdIsValid(projectId);

    const result = await standupService.listStandUpsByProjectId(Number(projectId));
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function updateStandUp(req: express.Request, res: express.Response) {
  try {
    // TODO: validate request
    const result = await standupService.updateStandUp(req.body);
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function deleteStandUp(req: express.Request, res: express.Response) {
  try {
    const { standUpId } = req.params;
    assertIdIsValidNumber(req.params.standUpId, 'Stand Up ID');
    await standupService.deleteStandUp(Number(standUpId));
    return res.status(StatusCodes.OK).send({ message: 'Stand Up deleted!' });
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function addStandUpNote(req: express.Request, res: express.Response) {
  try {
    // TODO: validate request
    const result = await standupService.addStandUpNote(req.body);
    return res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function getStandUp(req: express.Request, res: express.Response) {
  try {
    assertIdIsValidNumber(req.params.standUpId, 'Stand Up ID');
    const result = await standupService.getStandUp(Number(req.params.standUpId));
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function getStandUps(req: express.Request, res: express.Response) {
  try {
    assertIdIsValidNumber(req.params.projectId, 'Project ID');
    const result = await standupService.getStandUps(Number(req.params.projectId));
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function deleteStandUpNote(req: express.Request, res: express.Response) {
  try {
    assertIdIsValidNumber(req.params.noteId, 'Stand Up Note ID');
    await standupService.deleteStandUpNote(Number(req.params.noteId));
    return res.status(StatusCodes.OK).send({ message: 'Stand Up Note deleted!' });
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

export default {
  createStandUp,
  getStandUpHeaders,
  updateStandUp,
  deleteStandUp,
  addStandUpNote,
  getStandUp,
  getStandUps,
  deleteStandUpNote,
};
