import { Feature, FeatureFlag } from '@prisma/client';
import prisma from '../models/prismaClient';

const checkFeatureFlagActive = async (feature: Feature): Promise<Boolean> => {
  if (feature === Feature.sso_login && process.env.SSO_ENABLED !== undefined) {
    return process.env.SSO_ENABLED === 'true';
  }

  const flag = await prisma.featureFlag.findUnique({
    where: { feature_name: feature },
    select: { active: true }
  });

  return flag ? flag.active : false;
}

const getAllFeatureFlags = async (): Promise<FeatureFlag[]> => {
  const featureFlags = await prisma.featureFlag.findMany();

  if (process.env.SSO_ENABLED !== undefined) {
    const ssoFlag = featureFlags.find((flag) => flag.feature_name === Feature.sso_login);
    if (ssoFlag) {
      ssoFlag.active = process.env.SSO_ENABLED === 'true';
    }
  }

  return featureFlags;
}

const toggleFeatureFlag = async (featureName: Feature, active: boolean): Promise<FeatureFlag> => {
  const featureFlag = await prisma.featureFlag.update({
    where: { feature_name: featureName },
    data: { active }
  });

  return featureFlag;
}

export default {
  checkFeatureFlagActive,
  getAllFeatureFlags,
  toggleFeatureFlag,
};
