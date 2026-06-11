import express from 'express';
import { processUserGuideQuery } from '../services/ai.service';
import { parseWorkItemFromNaturalLanguage } from '../services/aiItemCreation.service';
import { assertUserIdIsValid, BadRequestError, getDefaultErrorRes } from '../helpers/error';
import { StatusCodes } from 'http-status-codes';
import recommenderService from '../services/recommender.service';
import { ParseWorkItemRequest, WorkItemType } from '../services/types/aiItemCreation.service.types';

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

const VALID_ITEM_TYPES: WorkItemType[] = ['backlog', 'epic', 'sprint'];

const parseWorkItem = async (req: express.Request, res: express.Response) => {
  try {
    const { itemType, message, projectId, context } = req.body as ParseWorkItemRequest;
    if (!itemType || !VALID_ITEM_TYPES.includes(itemType)) {
      throw new BadRequestError('itemType must be backlog, epic, or sprint');
    }
    if (!message?.trim()) {
      throw new BadRequestError('message cannot be empty');
    }
    if (!projectId || Number.isNaN(Number(projectId))) {
      throw new BadRequestError('projectId is required');
    }

    const user = res.locals.userSession.user_email;
    const response = await parseWorkItemFromNaturalLanguage(
      { itemType, message, projectId: Number(projectId), context },
      user,
    );
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

export default {
  answerUserGuideQuery,
  getUserGuideRecommendations,
  parseWorkItem,
};
