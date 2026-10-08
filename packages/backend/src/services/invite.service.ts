import { Invite, Prisma } from '@prisma/client';
import prisma from '../models/prismaClient';

type InviteWithMetadata = Prisma.InviteGetPayload<{
  include: {
    inviter: { select: { user_display_name: true } };
    project: { include: { course: { select: { cname: true; shadow_course: true } } } };
  };
}>;

async function getInviteByToken(token: string): Promise<Invite | null> {
  const invite = await prisma.invite.findUnique({
    where: {
      unique_token: token,
    },
  });

  return invite;
}

async function getInviteByProjectId(project_id: number): Promise<Invite | null> {
  return prisma.invite.findUnique({
    where: {
      project_id,
    },
  });
}

async function getInviteMetadataByToken(token: string): Promise<InviteWithMetadata | null> {
  return prisma.invite.findUnique({
    where: {
      unique_token: token,
    },
    include: {
      inviter: {
        select: {
          user_display_name: true,
        },
      },
      project: {
        include: {
          course: {
            select: {
              cname: true,
              shadow_course: true,
            },
          },
        },
      },
    },
  });
}

async function createInvite(project_id: number, unique_token: string, inviter_id: number): Promise<Invite> {
  const invite = await prisma.invite.upsert({
    where: {
      project_id,
    },
    create: {
      project_id,
      unique_token,
      inviter_id,
    },
    update: {},
  });

  return invite;
}

async function updateInvite(project_id: number, unique_token: string, inviter_id: number): Promise<Invite> {
  const newExpiry = new Date();
  newExpiry.setDate(newExpiry.getDate() + 7);

  const invite = await prisma.invite.update({
    data: {
      unique_token,
      inviter_id,
      expiry_date: newExpiry,
    },
    where: {
      project_id,
    },
  });

  return invite;
}

export default { getInviteByToken, getInviteByProjectId, getInviteMetadataByToken, createInvite, updateInvite };
