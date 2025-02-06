import express from 'express';
import featureFlagService from '../services/featureFlag.service';
import { Feature, FeatureFlag } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { getDefaultErrorRes } from '../helpers/error';
import { ToggleFeatureFlagRequestBody } from './requestTypes';

const getAllFeatureFlags = async (req: express.Request, res: express.Response) => {
  try {
    const featureFlags: FeatureFlag[] = await featureFlagService.getAllFeatureFlags();
    return res.status(StatusCodes.OK).json(featureFlags);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

function isFeature(value: any): value is Feature {
  return Object.values(Feature).includes(value);
}

const toggleFeatureFlag = async (req: express.Request, res: express.Response) => {
  try {
    const { featureName, active }: ToggleFeatureFlagRequestBody = req.body;

    if (!isFeature(featureName)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid feature name" });
    }

    const featureFlag = await featureFlagService.toggleFeatureFlag(featureName, active);
    return res.status(StatusCodes.OK).json(featureFlag);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};
export default {
  getAllFeatureFlags,
  toggleFeatureFlag,
};
