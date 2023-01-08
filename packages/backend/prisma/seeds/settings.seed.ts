/* eslint-disable import/prefer-default-export */
import { PrismaClient } from '@prisma/client';
import { CURRENT_YEAR, CURRENT_SEM } from '../../src/helpers/currentTime';

async function createSettingsSeed(prisma: PrismaClient) {
  const settings = await prisma.settings.create({
    data: {
      current_year: CURRENT_YEAR,
      current_sem: CURRENT_SEM,
    },
  });
  console.log('created settings %s', settings);
}

export { createSettingsSeed };
