import { Feature } from '@prisma/client';
import prisma from '../models/prismaClient';

/**
 * Syncs the ENABLE_NUS_SSO environment variable to the sso_login feature flag in the database.
 * Called once on backend startup.
 */
export async function syncFeatureFlags(): Promise<void> {
  const enableSSO = process.env.ENABLE_NUS_SSO?.toLowerCase() === 'true';

  try {
    await prisma.featureFlag.upsert({
      where: { feature_name: Feature.sso_login },
      update: { active: enableSSO },
      create: { feature_name: Feature.sso_login, active: enableSSO },
    });

    console.log(`SSO feature flag set to ${enableSSO}`);
  } catch (error) {
    console.error('Failed to sync feature flags:', error);
  }
}
