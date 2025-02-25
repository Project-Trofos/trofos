import express from 'express';
import { Feature } from '@prisma/client';
import featureFlagService from '../services/featureFlag.service';
import { StatusCodes } from 'http-status-codes';

const checkFeatureFlag = (feature: Feature) =>
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const isActive = await featureFlagService.checkFeatureFlagActive(feature);
    if (!isActive) {
      return res.status(StatusCodes.FORBIDDEN).send('Feature is disabled.');
    }
    return next();
  };

const checkFeatureFlagInCode = (feature: Feature) => {
  return featureFlagService.checkFeatureFlagActive(feature);
};

export {
  checkFeatureFlag,
  checkFeatureFlagInCode,
};
