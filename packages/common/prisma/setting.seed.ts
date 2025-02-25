/* eslint-disable import/prefer-default-export */
import { PrismaClient } from '@prisma/client';
import { CURRENT_YEAR, CURRENT_SEM } from './currentTime';

async function createSettingsTableSeed(prisma: PrismaClient) {
  const settings = await prisma.settings.create({
    data: {
      current_year: CURRENT_YEAR,
      current_sem: CURRENT_SEM,
    },
  });

  console.log('created settings table seed %s', settings);
}

export { createSettingsTableSeed };
