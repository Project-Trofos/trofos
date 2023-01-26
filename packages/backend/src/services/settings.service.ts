import { Settings } from '@prisma/client';
import prisma from '../models/prismaClient';

async function get(): Promise<Settings> {
  const settings = await prisma.settings.findFirstOrThrow();

  return settings;
}

async function update(settings: Settings): Promise<Settings> {
  return prisma.$transaction<Settings>(async (tx) => {
    await tx.settings.deleteMany();

    const updatedSettings = await tx.settings.create({
      data: {
        current_sem: settings.current_sem,
        current_year: settings.current_year,
      },
    });

    return updatedSettings;
  });
}

export default {
  get,
  update,
};
