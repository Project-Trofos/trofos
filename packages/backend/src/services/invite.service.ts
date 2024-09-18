import { Invite } from '@prisma/client';
import prisma from '../models/prismaClient';

async function getInvite(project_id: number, email: string): Promise<Invite | null> {
  const invite = await prisma.invite.findUnique({
    where: {
      project_id_email: {
        project_id: project_id,
        email: email,
      },
    },
  });

  return invite;
}

async function getInviteByToken(token: string): Promise<Invite> {
  const invite = await prisma.invite.findFirstOrThrow({
    where: {
      unique_token: token,
    },
  });

  return invite;
}

async function getInviteByProjectId(
  project_id: number,
): Promise<Pick<Invite, 'project_id' | 'email' | 'expiry_date'>[]> {
  const invites = await prisma.invite.findMany({
    where: {
      project_id: project_id,
    },
    select: {
      project_id: true,
      email: true,
      expiry_date: true,
    },
  });

  return invites;
}

async function createInvite(project_id: number, email: string, unique_token: string): Promise<Invite> {
  const invite = await prisma.invite.create({
    data: {
      project_id: project_id,
      email: email,
      unique_token: unique_token,
    },
  });

  return invite;
}

async function updateInvite(project_id: number, email: string, unique_token: string): Promise<Invite> {
  const new_expiry = new Date();
  new_expiry.setDate(new_expiry.getDate() + 7);

  const invite = await prisma.invite.update({
    data: {
      unique_token: unique_token,
      expiry_date: new_expiry,
    },
    where: {
      project_id_email: {
        project_id: project_id,
        email: email,
      },
    },
  });

  return invite;
}

async function deleteInvite(project_id: number, email: string): Promise<Invite> {
  const invite = await prisma.invite.delete({
    where: {
      project_id_email: {
        project_id: project_id,
        email: email,
      },
    },
  });

  return invite;
}

export default { getInvite, getInviteByToken, getInviteByProjectId, createInvite, updateInvite, deleteInvite };
