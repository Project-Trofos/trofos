import express from 'express';
import featureFlagService from '../services/featureFlag.service';
import { FeatureFlag } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { getDefaultErrorRes } from '../helpers/error';

const getAllFeatureFlags = async (req: express.Request, res: express.Response) => {
  try {
    const featureFlags: FeatureFlag[] = await featureFlagService.getAllFeatureFlags();
    return res.status(StatusCodes.OK).json(featureFlags);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

export default {
  getAllFeatureFlags
};
