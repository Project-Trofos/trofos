import { Prisma, User, UserApiKey, UsersOnRoles } from "@prisma/client";
import prisma from "../models/prismaClient";
import { randomUUID, createHash } from "crypto";
import { ApiKeyAuth } from "./types/apiKey.service.types";
import { ADMIN_ROLE_ID } from "../helpers/constants";

async function generateApiKey(userId: number): Promise<UserApiKey> {
  const newApiKey = randomUUID();
  // Generate and hash with salt an API key
  const apiKeyHash = hashApiKey(newApiKey);

  const { api_key, ...newUserApiKeyWithoutApiKey } = await prisma.$transaction<UserApiKey>(async (tx: Prisma.TransactionClient) => {
    // Check if existing API key exists
    const existingApiKey = await tx.userApiKey.findFirst({
      where: {
        user_id: userId,
      },
    });

    // If an API key exists, update it
    if (existingApiKey) {
      return await tx.userApiKey.update({
        where: {
          user_id: userId,
        },
        data: {
          api_key: apiKeyHash,
          created_at: new Date(),
          last_used: null,
          active: true,
        },
      });
    }
    // Else, create a new API key
    return await tx.userApiKey.create({
      data: {
        user_id: userId,
        api_key: apiKeyHash,
        created_at: new Date(),
        last_used: null,
        active: true,
      },
    });
  });

  return {
    ...newUserApiKeyWithoutApiKey,
    api_key: newApiKey,
  };
}

async function getApiKeyRecordForUser(userId: number): Promise<UserApiKey | null> {
  // api_key and user is currently one to one
  return prisma.userApiKey.findFirst({
    where: {
      user_id: userId,
    },
  });
};

async function authenticateApiKey(apiKey: string): Promise<ApiKeyAuth> {
  const hashedApiKey = hashApiKey(apiKey);
  return await prisma.$transaction(async (prisma) => {
    return authenticateApiKeyWithinTransaction(prisma, hashedApiKey);
  });
}

async function authenticateApiKeyWithinTransaction(prisma: Prisma.TransactionClient, hashedApiKey: string): Promise<ApiKeyAuth> {
  const userApiKey = await prisma.userApiKey.findFirst({ where: { api_key: hashedApiKey } });
  if (!userApiKey || !userApiKey.active) {
    return { isValidUser: false };
  }
  const userRole = await prisma.usersOnRoles.findFirst({ where: { user_id: userApiKey.user_id } });
  if (!userRole) {
    return { isValidUser: false };
  }
  const user = await prisma.user.findUnique({ where: { user_id: userApiKey.user_id } });
  if (!user) {
    return { isValidUser: false };
  }

  await prisma.userApiKey.update({ where: { user_id: userApiKey.user_id }, data: { last_used: new Date() } });

  return {
    isValidUser: true,
    user_id: userApiKey.user_id,
    role_id: userRole.role_id,
    user_is_admin: userRole.role_id === ADMIN_ROLE_ID,
    user_email: user?.user_email as string,
  };
}

const hashApiKey = (apiKey: string): string => {
  return createHash('sha256').update(apiKey).digest('hex');
};

export default {
  generateApiKey,
  getApiKeyRecordForUser,
  authenticateApiKey,
  authenticateApiKeyWithinTransaction,
};
