import { Feature, FeatureFlag } from '@prisma/client';
import prisma from '../models/prismaClient';

const checkFeatureFlagActive = async (feature: Feature): Promise<Boolean> => {
  const flag = await prisma.featureFlag.findUnique({
    where: { feature_name: feature },
    select: { active: true }
  });

  return flag ? flag.active : false;
}

const getAllFeatureFlags = async (): Promise<FeatureFlag[]> => {
  const featureFlags = await prisma.featureFlag.findMany();
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
