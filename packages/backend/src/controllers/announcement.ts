import { UserSession } from '@prisma/client';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { assertCourseIdIsValid, getDefaultErrorRes } from '../helpers/error';
import {
  assertAnnouncementIdIsValid,
  assertFieldIsDefined,
  assertUserSessionIsValid,
} from '../helpers/error/assertions';
import announcementService from '../services/announcement.service';
import { AnnouncementRequestBody } from './requestTypes';

async function get(req: express.Request, res: express.Response) {
  try {
    const { announcementId } = req.params;

    assertAnnouncementIdIsValid(announcementId);

    const result = await announcementService.get(Number(announcementId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function list(req: express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;
    const { policyConstraint } = res.locals;

    assertCourseIdIsValid(courseId);

    const result = await announcementService.list(policyConstraint, Number(courseId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function create(req: express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;
    const body = req.body as AnnouncementRequestBody;
    const userSession = res.locals.userSession as UserSession | undefined;

    assertCourseIdIsValid(courseId);
    assertFieldIsDefined(body.announcementTitle, 'announcementTitle');
    assertFieldIsDefined(body.announcementContent, 'announcementContent');
    assertUserSessionIsValid(userSession);

    const result = await announcementService.create(
      Number(userSession.user_id),
      Number(courseId),
      body.announcementTitle,
      body.announcementContent,
    );

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function update(req: express.Request, res: express.Response) {
  try {
    const { announcementId } = req.params;
    const body = req.body as Omit<AnnouncementRequestBody, 'courseId'>;

    assertAnnouncementIdIsValid(announcementId);

    const result = await announcementService.update(Number(announcementId), {
      title: body.announcementTitle,
      content: body.announcementContent,
    });

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function remove(req: express.Request, res: express.Response) {
  try {
    const { announcementId } = req.params;

    assertAnnouncementIdIsValid(announcementId);

    const result = await announcementService.remove(Number(announcementId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

export default {
  get,
  list,
  create,
  update,
  remove,
};
