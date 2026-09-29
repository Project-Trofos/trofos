import express from 'express';
import { extractCourseDetails, extractSprintDetails, processUserGuideQuery } from '../services/ai.service';
import { assertUserIdIsValid, BadRequestError, getDefaultErrorRes } from '../helpers/error';
import { StatusCodes } from 'http-status-codes';
import recommenderService from '../services/recommender.service';

const MAX_AUTOFILL_TEXT_LENGTH = 5000;

const answerUserGuideQuery = async (req: express.Request, res: express.Response) => {
  try {
    const { query, isEnableMemory } = req.body;
    if (!query) {
      throw new BadRequestError('query cannot be empty');
    }
    const user = res.locals.userSession.user_email;
    const response = await processUserGuideQuery(query, user, isEnableMemory || false);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const getUserGuideRecommendations = async (req: express.Request, res: express.Response) => {
  try {
    const userId = res.locals.userSession.user_id;
    const userRoleId = res.locals.userSession.user_role_id;
    assertUserIdIsValid(userId);

    const response = await recommenderService.generateRecommendations(Number(userId), Number(userRoleId));

    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const autofillCourse = async (req: express.Request, res: express.Response) => {
  try {
    const { text } = req.body;
    if (typeof text !== 'string' || text.trim().length === 0) {
      throw new BadRequestError('text cannot be empty');
    }
    if (text.length > MAX_AUTOFILL_TEXT_LENGTH) {
      throw new BadRequestError(`text must be at most ${MAX_AUTOFILL_TEXT_LENGTH} characters long`);
    }
    const user = res.locals.userSession.user_email;
    const response = await extractCourseDetails(text, user);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const autofillSprint = async (req: express.Request, res: express.Response) => {
  try {
    const { text } = req.body;
    if (typeof text !== 'string' || text.trim().length === 0) {
      throw new BadRequestError('text cannot be empty');
    }
    if (text.length > MAX_AUTOFILL_TEXT_LENGTH) {
      throw new BadRequestError(`text must be at most ${MAX_AUTOFILL_TEXT_LENGTH} characters long`);
    }
    const user = res.locals.userSession.user_email;
    const response = await extractSprintDetails(text, user);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

export default {
  answerUserGuideQuery,
  autofillCourse,
  autofillSprint,
  getUserGuideRecommendations,
};
