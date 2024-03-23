import { StandUp, StandUpNote } from '@prisma/client';
import prisma from '../models/prismaClient';

async function newStandUp(standUpFields: Omit<StandUp, 'id'>): Promise<StandUp> {
  const { project_id, date } = standUpFields;

  const standUp = prisma.standUp.create({
    data: {
      project: {
        connect: { id: project_id },
      },
      date,
    },
  });

  return standUp;
}

async function listStandUpsByProjectId(projectId: number): Promise<StandUp[]> {
  const standUps = await prisma.standUp.findMany({
    where: {
      project_id: projectId,
    },
  });
  return standUps;
}

async function updateStandUp(standUpToUpdate: Omit<StandUp, 'project_id'>): Promise<StandUp> {
  const { id, date } = standUpToUpdate;
  const updatedStandUp = await prisma.standUp.update({
    where: {
      id: id,
    },
    data: {
      date,
    },
  });

  return updatedStandUp;
}

async function deleteStandUp(standUpId: number): Promise<StandUp> {
  const standUp = await prisma.standUp.delete({
    where: {
      id: standUpId,
    },
  });

  return standUp;
}

async function addStandUpNote(note: Omit<StandUpNote, 'id'>): Promise<StandUpNote> {
  const { stand_up_id, column_id, user_id, content } = note;
  const standUpNote = await prisma.standUpNote.create({
    data: {
      stand_up: {
        connect: {
          id: stand_up_id,
        },
      },
      content,
      column_id,
      user_id,
    },
  });

  return standUpNote;
}

async function getStandUp(standUpId: number): Promise<StandUp | null> {
  const standUp = await prisma.standUp.findUnique({
    where: {
      id: standUpId,
    },
    include: { notes: true },
  });
  return standUp;
}

async function getStandUps(projectId: number): Promise<StandUp[] | null> {
  const standUps = await prisma.standUp.findMany({
    where: {
      project_id: projectId,
    },
    include: { notes: true },
  });
  return standUps;
}

async function deleteStandUpNote(noteId: number): Promise<StandUpNote> {
  const standUpNote = await prisma.standUpNote.delete({
    where: {
      id: noteId,
    },
  });
  return standUpNote;
}

export default {
  newStandUp,
  listStandUpsByProjectId,
  updateStandUp,
  deleteStandUp,
  addStandUpNote,
  getStandUp,
  getStandUps,
  deleteStandUpNote,
};
