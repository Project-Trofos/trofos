import StatusCodes from 'http-status-codes';
import express from 'express';
import apiKeyService from '../services/apiKey.service';
import { getDefaultErrorRes } from '../helpers/error';

const generateApiKey = async (req: express.Request, res: express.Response) => {
  try {
    // Get user id from session info
    const userId = res.locals.userSession.user_id;
    const userApiKeyWithUnhashedKey = await apiKeyService.generateApiKey(userId);
    return res.status(StatusCodes.OK).json(userApiKeyWithUnhashedKey);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const getApiKeyRecordForUser = async (req: express.Request, res: express.Response) => {
  try {
    // Get user id from session info
    const userId = res.locals.userSession.user_id;
    const userApiKey = await apiKeyService.getApiKeyRecordForUser(userId);
    // Do not return the hashed API key
    if (userApiKey !== null) {
      userApiKey.api_key = '';
    }
    return res.status(StatusCodes.OK).json(userApiKey);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

export default {
  generateApiKey,
  getApiKeyRecordForUser,
};
