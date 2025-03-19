import express from 'express';
import { processUserGuideQuery } from '../services/ai.service';
import { assertUserIdIsValid, BadRequestError, getDefaultErrorRes } from '../helpers/error';
import { StatusCodes } from 'http-status-codes';
import recommenderService from '../services/recommender.service';

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
    const user = res.locals.userSession.user_email;
    const userId = res.locals.userSession.user_id;
    assertUserIdIsValid(userId);

    const response = await recommenderService.recommendUserGuideSections(Number(userId), user);

    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

export default {
  answerUserGuideQuery,
  getUserGuideRecommendations,
};
