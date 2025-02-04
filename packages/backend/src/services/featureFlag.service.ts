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

export default {
  checkFeatureFlagActive,
  getAllFeatureFlags
};
