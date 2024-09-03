import { UserApiKey } from '@prisma/client';
import StatusCodes from 'http-status-codes';
import express from 'express';
import apiKeyService from '../services/apiKey.service';
import { getDefaultErrorRes } from '../helpers/error';

const generateApiKey = async (req: express.Request, res: express.Response) => {
  try {
    // Get user id from session info
    const userId = 1;
    const userApiKey: UserApiKey = await apiKeyService.generateApiKey(userId);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

export default {
  generateApiKey
};
